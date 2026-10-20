import * as fs from 'fs';
import * as path from 'path';
import { test as base, BrowserContext, Page, expect } from '@playwright/test';
import { PageMonitor } from '../helpers/assertions/network';
import { auditPageAuthenticity } from '../helpers/assertions/authenticity';
import { LIVE_ACCOUNTS, TARGET_URLS } from '../test-data/users';

export const AUTH_DIR = path.resolve(process.cwd(), 'test-results/.auth');
export const BUYER_AUTH_FILE = path.join(AUTH_DIR, 'buyer.json');
export const SELLER_AUTH_FILE = path.join(AUTH_DIR, 'seller.json');
export const ADMIN_AUTH_FILE = path.join(AUTH_DIR, 'admin.json');
export const SUBADMIN_AUTH_FILE = path.join(AUTH_DIR, 'subadmin.json');

export async function loginBuyer(page: Page) {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  await page.goto(`${TARGET_URLS.marketplace}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // If already authenticated, the "Sign in" button is not present
  const signInBtn = page.locator('button:has-text("Sign in")').first();
  const isLoggedOut = await signInBtn.isVisible().catch(() => false);

  if (!isLoggedOut) {
    await page.context().storageState({ path: BUYER_AUTH_FILE });
    return;
  }

  // Click "Sign in" to open modal
  const emailField = page.locator('input[data-testid="modal-login-email-input"]').first();
  for (let i = 0; i < 3; i++) {
    await signInBtn.click();
    const opened = await emailField.isVisible({ timeout: 2000 }).catch(() => false);
    if (opened) break;
    await page.waitForTimeout(1000);
  }
  await emailField.waitFor({ state: 'visible', timeout: 15000 });
  await emailField.fill(LIVE_ACCOUNTS.buyer.email);

  const passwordField = page.locator('input[data-testid="modal-login-password-input"]').first();
  await passwordField.fill(LIVE_ACCOUNTS.buyer.password);

  const submitBtn = page.locator('button[data-testid="modal-login-submit-btn"]').first();
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/auth/login') && res.request().method() === 'POST', { timeout: 25000 }).catch(() => null),
    submitBtn.click(),
  ]);

  await page.waitForTimeout(2000);
  await page.context().storageState({ path: BUYER_AUTH_FILE });
}

export async function loginSeller(page: Page) {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  await page.goto(`${TARGET_URLS.marketplace}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // If already authenticated, the "Sign in" button is not present
  const signInBtn = page.locator('button:has-text("Sign in")').first();
  const isLoggedOut = await signInBtn.isVisible().catch(() => false);

  if (!isLoggedOut) {
    await page.context().storageState({ path: SELLER_AUTH_FILE });
    return;
  }

  // Click "Sign in" to open modal
  const emailField = page.locator('input[data-testid="modal-login-email-input"]').first();
  for (let i = 0; i < 3; i++) {
    await signInBtn.click();
    const opened = await emailField.isVisible({ timeout: 2000 }).catch(() => false);
    if (opened) break;
    await page.waitForTimeout(1000);
  }
  await emailField.waitFor({ state: 'visible', timeout: 15000 });
  await emailField.fill(LIVE_ACCOUNTS.seller.email);

  const passwordField = page.locator('input[data-testid="modal-login-password-input"]').first();
  await passwordField.fill(LIVE_ACCOUNTS.seller.password);

  const submitBtn = page.locator('button[data-testid="modal-login-submit-btn"]').first();
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/auth/login') && res.request().method() === 'POST', { timeout: 25000 }).catch(() => null),
    submitBtn.click(),
  ]);

  await page.waitForTimeout(2000);
  await page.context().storageState({ path: SELLER_AUTH_FILE });
}

export async function loginAdmin(page: Page) {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  await page.goto(`${TARGET_URLS.admin}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // If already on admin dashboard, save state and return
  if (page.url().includes('/admin') && !page.url().includes('/login')) {
    await page.context().storageState({ path: ADMIN_AUTH_FILE });
    return;
  }

  // Otherwise on /login, proceed with login form
  const emailInput = page.locator('input#email, input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await emailInput.fill(LIVE_ACCOUNTS.admin.email);

  const passwordInput = page.locator('input#password, input[type="password"]').first();
  await passwordInput.fill(LIVE_ACCOUNTS.admin.password);

  await Promise.all([
    page.waitForResponse((res) => (res.url().includes('/auth/login') || res.url().includes('/login')) && res.request().method() === 'POST', { timeout: 25000 }).catch(() => null),
    page.locator('button[type="submit"]').first().click(),
  ]);

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
}

export async function loginSubAdmin(page: Page, credentials: { email: string; password: string }) {
  await page.goto(`${TARGET_URLS.admin}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const emailInput = page.locator('input#email, input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await emailInput.fill(credentials.email);

  const passwordInput = page.locator('input#password, input[type="password"]').first();
  await passwordInput.fill(credentials.password);

  await Promise.all([
    page.waitForResponse((res) => (res.url().includes('/auth/login') || res.url().includes('/login')) && res.request().method() === 'POST', { timeout: 25000 }).catch(() => null),
    page.locator('button[type="submit"]').first().click(),
  ]);

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 25000 });
  await page.waitForTimeout(1500);
}

export interface MultiRoleFixtures {
  buyerContext: BrowserContext;
  sellerContext: BrowserContext;
  adminContext: BrowserContext;
  subAdminContext: BrowserContext;
  buyerPage: Page;
  sellerPage: Page;
  adminPage: Page;
  subAdminPage: Page;
  buyerMonitor: PageMonitor;
  sellerMonitor: PageMonitor;
  adminMonitor: PageMonitor;
  auditPage: (page: Page, contextName?: string) => Promise<void>;
}

export const test = base.extend<MultiRoleFixtures>({
  buyerContext: async ({ browser }, use) => {
    const storageState = fs.existsSync(BUYER_AUTH_FILE) ? BUYER_AUTH_FILE : undefined;
    const context = await browser.newContext({
      baseURL: TARGET_URLS.marketplace,
      storageState,
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WorkvenceE2EBuyer/2.0',
    });
    await use(context);
    await context.close();
  },

  sellerContext: async ({ browser }, use) => {
    const storageState = fs.existsSync(SELLER_AUTH_FILE) ? SELLER_AUTH_FILE : undefined;
    const context = await browser.newContext({
      baseURL: TARGET_URLS.marketplace,
      storageState,
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WorkvenceE2ESeller/2.0',
    });
    await use(context);
    await context.close();
  },

  adminContext: async ({ browser }, use) => {
    const storageState = fs.existsSync(ADMIN_AUTH_FILE) ? ADMIN_AUTH_FILE : undefined;
    const context = await browser.newContext({
      baseURL: TARGET_URLS.admin,
      storageState,
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WorkvenceE2EAdmin/2.0',
    });
    await use(context);
    await context.close();
  },

  subAdminContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      baseURL: TARGET_URLS.admin,
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WorkvenceE2ESubAdmin/2.0',
    });
    await use(context);
    await context.close();
  },

  buyerPage: async ({ buyerContext }, use) => {
    const page = await buyerContext.newPage();
    await use(page);
    await page.close();
  },

  sellerPage: async ({ sellerContext }, use) => {
    const page = await sellerContext.newPage();
    await use(page);
    await page.close();
  },

  adminPage: async ({ adminContext }, use) => {
    const page = await adminContext.newPage();
    await use(page);
    await page.close();
  },

  subAdminPage: async ({ subAdminContext }, use) => {
    const page = await subAdminContext.newPage();
    await use(page);
    await page.close();
  },

  buyerMonitor: async ({ buyerPage }, use) => {
    const monitor = new PageMonitor(buyerPage);
    await use(monitor);
  },

  sellerMonitor: async ({ sellerPage }, use) => {
    const monitor = new PageMonitor(sellerPage);
    await use(monitor);
  },

  adminMonitor: async ({ adminPage }, use) => {
    const monitor = new PageMonitor(adminPage);
    await use(monitor);
  },

  auditPage: async ({}, use) => {
    await use(async (page: Page, contextName?: string) => {
      const result = await auditPageAuthenticity(page);
      if (!result.passed) {
        console.warn(`[AUDIT WARNING] ${contextName || page.url()}: Found ${result.violations.length} potential layout/content flags`);
      }
    });
  },
});

export { expect };
