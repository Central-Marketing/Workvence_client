/**
 * Automated Disposable Email Client for Playwright Testing
 * Uses the mail.tm REST API to generate temporary inboxes and retrieve OTP codes.
 */

class TempMailClient {
  constructor() {
    this.baseUrl = 'https://api.mail.tm';
    this.address = null;
    this.password = null;
    this.token = null;
    this.accountId = null;
  }

  async createInbox(customUsernamePrefix = 'workvence_test_') {
    try {
      // 1. Fetch available domain
      const domainsRes = await fetch(`${this.baseUrl}/domains`);
      if (!domainsRes.ok) {
        throw new Error(`Failed to get mail.tm domains: ${domainsRes.statusText}`);
      }
      const domainsData = await domainsRes.json();
      const domainMembers = domainsData['hydra:member'] || [];
      if (domainMembers.length === 0) {
        throw new Error('No domains available on mail.tm');
      }

      const domain = domainMembers[0].domain;
      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      this.address = `${customUsernamePrefix}${uniqueId}@${domain}`;
      this.password = 'WvTestPwd!2026';

      // 2. Create Mail.tm Account
      const createRes = await fetch(`${this.baseUrl}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: this.address,
          password: this.password
        })
      });

      if (!createRes.ok) {
        const errJson = await createRes.json().catch(() => ({}));
        throw new Error(`Failed to create mail.tm account: ${JSON.stringify(errJson)}`);
      }

      const createData = await createRes.json();
      this.accountId = createData.id;

      // 3. Obtain Bearer Auth Token
      const tokenRes = await fetch(`${this.baseUrl}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: this.address,
          password: this.password
        })
      });

      if (!tokenRes.ok) {
        throw new Error(`Failed to obtain mail.tm token: ${tokenRes.statusText}`);
      }

      const tokenData = await tokenRes.json();
      this.token = tokenData.token;

      return {
        email: this.address,
        password: this.password,
        id: this.accountId
      };
    } catch (err) {
      console.error('[TempMail] Error creating disposable inbox:', err.message);
      throw err;
    }
  }

  async waitForOtp(timeoutMs = 60000, pollIntervalMs = 3000) {
    if (!this.token) {
      throw new Error('TempMail inbox not initialized. Call createInbox first.');
    }

    const startTime = Date.now();
    console.log(`[TempMail] Polling inbox for verification email (${this.address})...`);

    while (Date.now() - startTime < timeoutMs) {
      try {
        const msgListRes = await fetch(`${this.baseUrl}/messages`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/json'
          }
        });

        if (msgListRes.ok) {
          const listData = await msgListRes.json();
          const messages = listData['hydra:member'] || [];

          if (messages.length > 0) {
            // Find message from Workvence or latest message
            const targetMsg = messages[0];
            const msgDetailRes = await fetch(`${this.baseUrl}/messages/${targetMsg.id}`, {
              headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/json'
              }
            });

            if (msgDetailRes.ok) {
              const fullMsg = await msgDetailRes.json();
              const textContent = (fullMsg.text || '') + ' ' + (fullMsg.html ? fullMsg.html.join(' ') : '') + ' ' + (fullMsg.subject || '');
              
              // Extract 6-digit OTP
              const otpMatch = textContent.match(/\b\d{6}\b/);
              if (otpMatch) {
                const otp = otpMatch[0];
                console.log(`[TempMail] Successfully extracted OTP: ${otp}`);
                return {
                  otp,
                  subject: fullMsg.subject,
                  from: fullMsg.from?.address,
                  receivedAt: fullMsg.createdAt
                };
              }
            }
          }
        }
      } catch (pollErr) {
        console.warn(`[TempMail] Polling error (will retry): ${pollErr.message}`);
      }

      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }

    throw new Error(`[TempMail] Timed out waiting for OTP email after ${Math.round(timeoutMs / 1000)}s`);
  }
}

module.exports = { TempMailClient };
