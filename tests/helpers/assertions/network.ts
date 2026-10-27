import { Page, Request, Response } from '@playwright/test';

export interface NetworkErrorRecord {
  url: string;
  status: number;
  method: string;
  postData?: string;
  type: 'HTTP_5XX' | 'UNEXPECTED_4XX' | 'NETWORK_FAILURE';
}

export interface ConsoleErrorRecord {
  text: string;
  location?: string;
  timestamp: string;
}

export class PageMonitor {
  networkErrors: NetworkErrorRecord[] = [];
  consoleErrors: ConsoleErrorRecord[] = [];
  page: Page;

  // Allowlist for expected errors (e.g. 401 when token expired/logging out, favicon, analytics)
  private allowlistUrls = [
    '/favicon.ico',
    'google-analytics.com',
    'analytics',
    'doubleclick.net',
    'clarity.ms'
  ];

  constructor(page: Page) {
    this.page = page;
    this.attachListeners();
  }

  private attachListeners() {
    // 1. Monitor console.error
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore noise like React hydration warnings in third-party extensions
        if (!text.includes('Download the React DevTools') && !text.includes('Failed to load resource: net::ERR_BLOCKED_BY_CLIENT')) {
          this.consoleErrors.push({
            text,
            location: msg.location()?.url,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // 2. Monitor page errors (uncaught exceptions)
    this.page.on('pageerror', (err) => {
      this.consoleErrors.push({
        text: `Uncaught Exception: ${err.message}`,
        location: err.stack,
        timestamp: new Date().toISOString()
      });
    });

    // 3. Monitor failed network requests
    this.page.on('response', (res: Response) => {
      const status = res.status();
      const url = res.url();

      if (this.isAllowlisted(url)) return;

      if (status >= 500) {
        this.networkErrors.push({
          url,
          status,
          method: res.request().method(),
          type: 'HTTP_5XX'
        });
      } else if (status === 404 && url.includes('/api/')) {
        this.networkErrors.push({
          url,
          status,
          method: res.request().method(),
          type: 'UNEXPECTED_4XX'
        });
      }
    });

    this.page.on('requestfailed', (req: Request) => {
      const url = req.url();
      if (this.isAllowlisted(url)) return;

      this.networkErrors.push({
        url,
        status: 0,
        method: req.method(),
        type: 'NETWORK_FAILURE'
      });
    });
  }

  private isAllowlisted(url: string): boolean {
    return this.allowlistUrls.some((pattern) => url.includes(pattern));
  }

  getErrors() {
    return {
      networkErrors: this.networkErrors,
      consoleErrors: this.consoleErrors,
      hasFatalErrors: this.networkErrors.some((e) => e.type === 'HTTP_5XX') || this.consoleErrors.length > 0
    };
  }

  clear() {
    this.networkErrors = [];
    this.consoleErrors = [];
  }
}
