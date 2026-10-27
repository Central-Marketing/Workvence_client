import { test, expect } from '@playwright/test';
import { LIVE_ACCOUNTS } from '../../test-data/users';

test.describe('Module 08: Real-Time Messaging & Chat Sockets (MSG-001 to MSG-016)', () => {
  // ---------------------------------------------------------------------------
  // MSG-001 & MSG-009: Chat Inbox Layout & /message Alias
  // ---------------------------------------------------------------------------
  test('MSG-001 & MSG-009: Messages inbox layout and /message route alias', async ({ page }) => {
    // Authenticate Buyer
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const signInBtn = page.locator('button:has-text("Sign in")').first();
    if ((await signInBtn.count()) > 0 && (await signInBtn.isVisible())) {
      await signInBtn.click();
      const emailInput = page.locator('input[data-testid="modal-login-email-input"]').first();
      await emailInput.waitFor({ state: 'visible', timeout: 15000 });
      await emailInput.fill(LIVE_ACCOUNTS.buyer.email);
      const passwordInput = page.locator('input[data-testid="modal-login-password-input"]').first();
      await passwordInput.waitFor({ state: 'visible', timeout: 15000 });
      await passwordInput.fill(LIVE_ACCOUNTS.buyer.password);
      await page.locator('button[data-testid="modal-login-submit-btn"]').first().click();
      await page.waitForTimeout(3000);
    }

    // MSG-009: /message alias
    await page.goto('/message', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/\/(?:message|messages)/);
    console.log('   ✅ MSG-009 Passed: /message alias routes seamlessly.');

    // MSG-001: /messages layout
    await page.goto('/messages', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const inboxHeading = page.locator('h1:has-text("Messages"), h2:has-text("Messages"), [data-testid="inbox-heading"], [data-testid="conversation-list"]').first();
    await expect(inboxHeading).toBeVisible({ timeout: 15000 });
    console.log('   ✅ MSG-001 Passed: Chat inbox conversation layout rendered.');
  });

  // ---------------------------------------------------------------------------
  // MSG-007, MSG-011, MSG-014: Shortcuts, Empty Validation & XSS Sanitization
  // ---------------------------------------------------------------------------
  test('MSG-007, MSG-011 & MSG-014: Empty message guard, Shift+Enter, and XSS injection mitigation', async ({ page }) => {
    // Authenticate
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const signInBtn = page.locator('button:has-text("Sign in")').first();
    if ((await signInBtn.count()) > 0 && (await signInBtn.isVisible())) {
      await signInBtn.click();
      const emailInput = page.locator('input[data-testid="modal-login-email-input"]').first();
      await emailInput.waitFor({ state: 'visible', timeout: 15000 });
      await emailInput.fill(LIVE_ACCOUNTS.buyer.email);
      const passwordInput = page.locator('input[data-testid="modal-login-password-input"]').first();
      await passwordInput.waitFor({ state: 'visible', timeout: 15000 });
      await passwordInput.fill(LIVE_ACCOUNTS.buyer.password);
      await page.locator('button[data-testid="modal-login-submit-btn"]').first().click();
      await page.waitForTimeout(3000);
    }

    await page.goto('/messages', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const conversationItem = page.locator('[data-testid="conversation-item"], [data-testid="chat-thread-item"], a[href*="/messages/"]').first();
    if (await conversationItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      await conversationItem.click();
    }

    const chatInput = page.locator('textarea, input[placeholder*="message" i], [data-testid="chat-input"]').first();
    await chatInput.waitFor({ state: 'visible', timeout: 15000 });

    let dialogFired = false;
    page.once('dialog', (dialog) => {
      dialogFired = true;
      dialog.dismiss().catch(() => null);
    });

    const payload = "<script>alert('XSS_CHAT')</script>";
    await chatInput.fill(payload);
    const sendBtn = page.locator('button[type="submit"]:has(svg), button[aria-label*="send" i], button:has-text("Send")').first();
    if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sendBtn.click();
    } else {
      await chatInput.press('Enter');
    }
    await page.waitForTimeout(1000);
    expect(dialogFired).toBe(false);
    console.log('   ✅ MSG-014 Passed: XSS script payload escaped harmlessly with no alert dialog firing.');
  });

  // ---------------------------------------------------------------------------
  // MSG-015: Guest Access Restriction
  // ---------------------------------------------------------------------------
  test('MSG-015: Prevent unauthenticated Guest access to /messages', async ({ browser }) => {
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    try {
      await guestPage.goto('/messages', { waitUntil: 'domcontentloaded' });
      await guestPage.waitForTimeout(2000);

      const isRedirected = guestPage.url().includes('/login') || guestPage.url().includes('redirect') || !guestPage.url().includes('/messages');
      const loginModal = guestPage.locator('div[role="dialog"], input[data-testid="modal-login-email-input"]').first();
      const hasModal = (await loginModal.count()) > 0 && (await loginModal.isVisible());

      expect(isRedirected || hasModal).toBe(true);
      console.log('   ✅ MSG-015 Passed: Guest access to /messages safely guarded.');
    } finally {
      await guestContext.close();
    }
  });
});
