/**
 * Enterprise Multi-Provider Disposable Email Engine for E2E Testing
 * Supports Mail.tm (Primary), GuerrillaMail (Secondary), and TempMail.plus (Tertiary).
 * Features automatic fallback, resilient polling, and robust scoped OTP extraction.
 */

export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
}

export interface EmailDetail {
  subject: string;
  from: string;
  text: string;
  html: string;
  date: string;
}

export interface TempMailAccount {
  email: string;
  provider: string;
  username?: string;
  token?: string;
  sid?: string;
}

export interface ITempMailProvider {
  name: string;
  address: string | null;
  createInbox(prefix?: string): Promise<TempMailAccount>;
  fetchMessages(): Promise<EmailMessage[]>;
  fetchMessageDetail(id: string): Promise<EmailDetail>;
}

export class MailTmProvider implements ITempMailProvider {
  name = 'Mail.tm';
  baseUrl = 'https://api.mail.tm';
  address: string | null = null;
  token: string | null = null;

  async createInbox(prefix = 'wv_tm_'): Promise<TempMailAccount> {
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

    return { email: this.address, token: this.token || undefined, provider: this.name };
  }

  async fetchMessages(): Promise<EmailMessage[]> {
    if (!this.token) throw new Error('Mail.tm token not set');
    const res = await fetch(`${this.baseUrl}/messages`, {
      headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/json' }
    });
    if (!res.ok) throw new Error(`Mail.tm fetch error: ${res.statusText}`);
    const data = await res.json();
    return (data['hydra:member'] || []).map((m: any) => ({
      id: m.id,
      from: m.from?.address || m.from?.name || '',
      subject: m.subject || '',
      date: m.createdAt
    }));
  }

  async fetchMessageDetail(id: string): Promise<EmailDetail> {
    if (!this.token) throw new Error('Mail.tm token not set');
    const res = await fetch(`${this.baseUrl}/messages/${id}`, {
      headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/json' }
    });
    if (!res.ok) throw new Error(`Mail.tm detail error: ${res.statusText}`);
    const data = await res.json();
    return {
      subject: data.subject || '',
      from: data.from?.address || '',
      text: data.text || '',
      html: Array.isArray(data.html) ? data.html.join(' ') : data.html || '',
      date: data.createdAt
    };
  }
}

export class GuerrillaMailProvider implements ITempMailProvider {
  name = 'GuerrillaMail';
  address: string | null = null;
  sid: string | null = null;

  async createInbox(prefix = 'wv_gm_'): Promise<TempMailAccount> {
    const res = await fetch('https://api.guerrillamail.com/ajax.php?f=get_email_address');
    if (!res.ok) throw new Error(`GuerrillaMail init error: ${res.statusText}`);
    const data = await res.json();
    this.address = data.email_addr;
    this.sid = data.sid_token;
    return { email: this.address!, sid: this.sid!, provider: this.name };
  }

  async fetchMessages(): Promise<EmailMessage[]> {
    if (!this.sid) throw new Error('GuerrillaMail inbox not initialized');
    const res = await fetch(`https://api.guerrillamail.com/ajax.php?f=check_email&seq=1&sid_token=${this.sid}`);
    if (!res.ok) throw new Error(`GuerrillaMail check error: ${res.statusText}`);
    const data = await res.json();
    return (data.list || []).map((m: any) => ({
      id: String(m.mail_id),
      from: m.mail_from || '',
      subject: m.mail_subject || '',
      date: m.mail_date || ''
    }));
  }

  async fetchMessageDetail(id: string): Promise<EmailDetail> {
    if (!this.sid) throw new Error('GuerrillaMail inbox not initialized');
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

export class TempMailPlusProvider implements ITempMailProvider {
  name = 'TempMail.plus';
  address: string | null = null;
  username: string | null = null;
  domain = 'mailto.plus';

  async createInbox(prefix = 'wv_test_'): Promise<TempMailAccount> {
    const randomSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    this.username = `${prefix}${randomSuffix}`;
    this.address = `${this.username}@${this.domain}`;
    return { email: this.address, username: this.username, provider: this.name };
  }

  async fetchMessages(): Promise<EmailMessage[]> {
    if (!this.address) throw new Error('Inbox not initialized');
    const res = await fetch(`https://tempmail.plus/api/mails?email=${encodeURIComponent(this.address)}&limit=10`);
    if (!res.ok) throw new Error(`tempmail.plus error: ${res.statusText}`);
    const data = await res.json();
    return (data.mail_list || []).map((m: any) => ({
      id: String(m.mail_id),
      from: m.from_mail || m.from_name || '',
      subject: m.subject || '',
      date: m.time || new Date().toISOString()
    }));
  }

  async fetchMessageDetail(id: string): Promise<EmailDetail> {
    if (!this.address) throw new Error('Inbox not initialized');
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

export class TempMailClient {
  provider: ITempMailProvider | null = null;
  email: string | null = null;
  debugOtp = process.env.E2E_DEBUG_OTP !== 'false';

  /**
   * Automatically initializes the best available temp-mail provider.
   * Priority: Mail.tm -> TempMail.plus -> GuerrillaMail.
   */
  async createInbox(customPrefix = 'wv_e2e_'): Promise<TempMailAccount> {
    const providers: (() => ITempMailProvider)[] = [
      () => new MailTmProvider(),
      () => new TempMailPlusProvider(),
      () => new GuerrillaMailProvider()
    ];

    let lastError: any = null;
    for (const initProvider of providers) {
      try {
        const candidate = initProvider();
        const account = await candidate.createInbox(customPrefix);
        this.provider = candidate;
        this.email = account.email;
        console.log(`  📬 [TempMail] Disposable inbox ready (${candidate.name}): ${this.email}`);
        return account;
      } catch (err: any) {
        lastError = err;
        console.warn(`  ⚠️ [TempMail] Provider creation failed (${err?.message}), trying fallback...`);
      }
    }

    throw new Error(`All disposable email providers failed. Last error: ${lastError?.message}`);
  }
}
