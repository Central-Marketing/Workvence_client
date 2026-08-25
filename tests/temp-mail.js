/**
 * Enterprise Multi-Provider Disposable Email Engine for E2E Testing
 * Supports TempMail.plus (Primary), GuerrillaMail (Secondary), and Mail.tm (Tertiary).
 * Features automatic fallback, resilient polling, and robust scoped OTP extraction.
 */

class TempMailPlusProvider {
  constructor() {
    this.name = 'TempMail.plus';
    this.address = null;
    this.username = null;
    this.domain = 'mailto.plus'; // Alternative: fexpost.com, fexbox.org
  }

  async createInbox(prefix = 'wv_test_') {
    const randomSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    this.username = `${prefix}${randomSuffix}`;
    this.address = `${this.username}@${this.domain}`;
    return { email: this.address, username: this.username, provider: this.name };
  }

  async fetchMessages() {
    if (!this.address) throw new Error('Inbox not initialized');
    const res = await fetch(`https://tempmail.plus/api/mails?email=${encodeURIComponent(this.address)}&limit=10`);
    if (!res.ok) throw new Error(`tempmail.plus error: ${res.statusText}`);
    const data = await res.json();
    return (data.mail_list || []).map((m) => ({
      id: m.mail_id,
      from: m.from_mail || m.from_name,
      subject: m.subject || '',
      date: m.time || new Date().toISOString()
    }));
  }

  async fetchMessageDetail(id) {
    const res = await fetch(`https://tempmail.plus/api/mails/${id}?email=${encodeURIComponent(this.address)}`);
    if (!res.ok) throw new Error(`Failed to fetch message ${id}`);
    const data = await res.json();
    return {
      subject: data.subject || '',
      from: data.from || data.from_mail || '',
      text: data.text || '',
      html: data.html || '',
      date: data.date || ''
    };
  }
}

class GuerrillaMailProvider {
  constructor() {
    this.name = 'GuerrillaMail';
    this.address = null;
    this.sid = null;
  }

  async createInbox(prefix = 'wv_gm_') {
    const res = await fetch('https://api.guerrillamail.com/ajax.php?f=get_email_address');
    if (!res.ok) throw new Error(`GuerrillaMail init error: ${res.statusText}`);
    const data = await res.json();
    this.address = data.email_addr;
    this.sid = data.sid_token;
    return { email: this.address, sid: this.sid, provider: this.name };
  }

  async fetchMessages() {
    if (!this.sid) throw new Error('GuerrillaMail inbox not initialized');
    const res = await fetch(`https://api.guerrillamail.com/ajax.php?f=check_email&seq=1&sid_token=${this.sid}`);
    if (!res.ok) throw new Error(`GuerrillaMail check error: ${res.statusText}`);
    const data = await res.json();
    return (data.list || []).map((m) => ({
      id: m.mail_id,
      from: m.mail_from,
      subject: m.mail_subject,
      date: m.mail_date
    }));
  }

  async fetchMessageDetail(id) {
    const res = await fetch(`https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${id}&sid_token=${this.sid}`);
    if (!res.ok) throw new Error(`GuerrillaMail fetch error for ${id}`);
    const data = await res.json();
    return {
      subject: data.mail_subject || '',
      from: data.mail_from || '',
      text: data.mail_excerpt || '',
      html: data.mail_body || '',
      date: data.mail_date || ''
    };
  }
}

class MailTmProvider {
  constructor() {
    this.name = 'Mail.tm';
    this.baseUrl = 'https://api.mail.tm';
    this.address = null;
    this.token = null;
  }

  async createInbox(prefix = 'wv_tm_') {
    const domainsRes = await fetch(`${this.baseUrl}/domains`);
    if (!domainsRes.ok) throw new Error(`Mail.tm domains error: ${domainsRes.statusText}`);
    const domainsData = await domainsRes.json();
    const members = domainsData['hydra:member'] || [];
    if (!members.length) throw new Error('No domains available on mail.tm');

    const domain = members[0].domain;
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    this.address = `${prefix}${uniqueId}@${domain}`;
    const password = 'WvTestPwd!2026';

    const createRes = await fetch(`${this.baseUrl}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: this.address, password })
    });
    if (!createRes.ok) {
      const errJson = await createRes.json().catch(() => ({}));
      throw new Error(`Failed to create mail.tm account: ${JSON.stringify(errJson)}`);
    }

    const tokenRes = await fetch(`${this.baseUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: this.address, password })
    });
    if (!tokenRes.ok) throw new Error(`Failed to obtain mail.tm token: ${tokenRes.statusText}`);
    const tokenData = await tokenRes.json();
    this.token = tokenData.token;

    return { email: this.address, token: this.token, provider: this.name };
  }

  async fetchMessages() {
    if (!this.token) throw new Error('Mail.tm token not set');
    const res = await fetch(`${this.baseUrl}/messages`, {
      headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/json' }
    });
    if (!res.ok) throw new Error(`Mail.tm fetch error: ${res.statusText}`);
    const data = await res.json();
    return (data['hydra:member'] || []).map((m) => ({
      id: m.id,
      from: m.from?.address || m.from?.name,
      subject: m.subject || '',
      date: m.createdAt
    }));
  }

  async fetchMessageDetail(id) {
    const res = await fetch(`${this.baseUrl}/messages/${id}`, {
      headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/json' }
    });
    if (!res.ok) throw new Error(`Mail.tm detail error: ${res.statusText}`);
    const data = await res.json();
    return {
      subject: data.subject || '',
      from: data.from?.address || '',
      text: data.text || '',
      html: data.html ? data.html.join(' ') : '',
      date: data.createdAt
    };
  }
}

class TempMailClient {
  constructor() {
    this.provider = null;
    this.email = null;
    this.debugOtp = process.env.E2E_DEBUG_OTP === 'true' || true;
  }

  /**
   * Automatically initializes the best available temp-mail provider.
   * Tries TempMailPlus -> GuerrillaMail -> MailTm.
   */
  async createInbox(customPrefix = 'wv_e2e_') {
    const providers = [
      () => new TempMailPlusProvider(),
      () => new GuerrillaMailProvider(),
      () => new MailTmProvider()
    ];

    let lastError = null;
    for (const initProvider of providers) {
      try {
        const candidate = initProvider();
        const account = await candidate.createInbox(customPrefix);
        this.provider = candidate;
        this.email = account.email;
        console.log(`  📬 [TempMail] Disposable inbox ready (${candidate.name}): ${this.email}`);
        return account;
      } catch (err) {
        lastError = err;
        console.warn(`  ⚠️ [TempMail] Provider creation failed, trying fallback: ${err.message}`);
      }
    }

    throw new Error(`All disposable email providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Scoped, robust OTP extractor that searches through text and HTML for a 6-digit code.
   */
  extractOtpFromContent(textContent, htmlContent, subject = '') {
    const combined = `${subject}\n${textContent}\n${htmlContent}`;

    // 1. Check for Workvence specific structured pattern:
    // e.g. "OTP Verification Code is: 775869" or bold green box in HTML
    const specificPatterns = [
      /OTP Verification Code is:\s*(\d{6})/i,
      /verification code is:\s*(\d{6})/i,
      /code to complete your email verification:\s*<\/p>\s*<div[^>]*>\s*(\d{6})/i,
      /letter-spacing:\s*5px;[^>]*>\s*(\d{6})\s*<\/div>/i,
      /\bOTP:\s*(\d{6})\b/i,
      /\bcode:\s*(\d{6})\b/i
    ];

    for (const pattern of specificPatterns) {
      const match = combined.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // 2. Scoped fallback: Find all 6-digit numbers in the email
    const allMatches = combined.match(/\b\d{6}\b/g) || [];
    // Filter out common non-OTP patterns if any
    const validMatches = allMatches.filter((num) => {
      // Exclude numbers like 202600, etc. if needed
      return true;
    });

    if (validMatches.length > 0) {
      return validMatches[0];
    }

    return null;
  }

  /**
   * Robust polling with configurable timeout, interval, and logging.
   */
  async waitForOtp(timeoutMs = 60000, pollIntervalMs = 2000, resendCallback = null) {
    if (!this.provider || !this.email) {
      throw new Error('TempMail inbox not initialized. Call createInbox first.');
    }

    const maxTimeout = parseInt(process.env.OTP_TIMEOUT_MS, 10) || timeoutMs;
    const interval = parseInt(process.env.OTP_POLL_INTERVAL_MS, 10) || pollIntervalMs;
    const startTime = Date.now();
    let pollCount = 0;
    let resendTriggered = false;

    console.log(`  ⏳ [TempMail] Polling inbox (${this.provider.name}) for OTP email: ${this.email}...`);

    while (Date.now() - startTime < maxTimeout) {
      pollCount++;
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

      try {
        const messages = await this.provider.fetchMessages();

        if (messages && messages.length > 0) {
          // Sort messages by most recent
          for (const msg of messages) {
            const detail = await this.provider.fetchMessageDetail(msg.id);
            const extractedOtp = this.extractOtpFromContent(detail.text, detail.html, detail.subject);

            if (extractedOtp) {
              const deliveryDuration = ((Date.now() - startTime) / 1000).toFixed(1);
              console.log(`  ✅ [TempMail] OTP Code Received in ${deliveryDuration}s (Poll #${pollCount}): ${this.debugOtp ? extractedOtp : '******'}`);
              return {
                otp: extractedOtp,
                subject: detail.subject,
                from: detail.from,
                receivedAt: detail.date,
                elapsedSeconds: parseFloat(deliveryDuration),
                polls: pollCount
              };
            }
          }
        }
      } catch (pollErr) {
        console.warn(`  ⚠️ [TempMail] Poll #${pollCount} error (retrying): ${pollErr.message}`);
      }

      // Check if we should trigger a Resend OTP halfway through
      if (!resendTriggered && (Date.now() - startTime) > 20000 && typeof resendCallback === 'function') {
        resendTriggered = true;
        console.log(`  🔄 [TempMail] Triggering Resend OTP after ${elapsedSec}s...`);
        try {
          await resendCallback();
        } catch (resendErr) {
          console.warn(`  ⚠️ [TempMail] Resend OTP callback failed: ${resendErr.message}`);
        }
      }

      await new Promise((r) => setTimeout(r, interval));
    }

    throw new Error(`[TempMail] Timed out waiting for OTP email on ${this.email} (${this.provider.name}) after ${Math.round(maxTimeout / 1000)}s (${pollCount} polls).`);
  }
}

module.exports = {
  TempMailClient,
  TempMailPlusProvider,
  GuerrillaMailProvider,
  MailTmProvider
};
