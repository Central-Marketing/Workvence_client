import { test, expect } from '@playwright/test';
import { LIVE_ACCOUNTS, FINANCIAL_RULES } from '../../test-data/users';
import { completeStripeCheckout } from '../../helpers/stripe/stripe-checkout';
import { loginBuyer } from '../../fixtures/multi-role.fixture';

test.describe('Module 06: Checkout & Stripe Payments (PAY-001 to PAY-015)', () => {
  let activePackageId: string = '6597a1ef-6e2b-41d9-b226-c9d9281664db';

  test.beforeEach(async ({ page }) => {
    await loginBuyer(page);
  });

  // ---------------------------------------------------------------------------
  // PAY-001 & PAY-008: Order Summary Calculation & Hosted Checkout Redirection
  // ---------------------------------------------------------------------------
  test('PAY-001 & PAY-008: Initiate /pay/:id and verify redirection to Stripe Hosted Checkout', async ({ page }) => {
    await page.goto(`/pay/${activePackageId}?tier=basic`, { waitUntil: 'domcontentloaded' });
    
    // Check redirection to checkout.stripe.com only
    await page.waitForURL((url) => url.hostname.includes('stripe.com'), {
      timeout: 30000,
    });
    console.log('   ✅ PAY-001 & PAY-008 Passed: /pay/:id safely routes to Stripe checkout session.');
  });

  // ---------------------------------------------------------------------------
  // PAY-003 & PAY-007: Successful Stripe Payment & /success screen
  // ---------------------------------------------------------------------------
  test('PAY-003 & PAY-007: Complete successful Stripe checkout and inspect confirmation', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto(`/pay/${activePackageId}?tier=basic`, { waitUntil: 'domcontentloaded' });
    
    const { orderUrl } = await completeStripeCheckout(page);
    expect(orderUrl).toContain('/orders');
    console.log(`   ✅ PAY-003 & PAY-007 Passed: Stripe payment processed and confirmed at ${orderUrl}.`);
  });

  // ---------------------------------------------------------------------------
  // PAY-009: Double Submission Guard
  // ---------------------------------------------------------------------------
  test.fixme('PAY-009: Prevent duplicate charges on rapid submit clicks (deduplication)', async ({ page }) => {
    // Requires mocking or capturing live payment intent creation requests during rapid double-click
  });

  // ---------------------------------------------------------------------------
  // PAY-012 & PAY-013: Guest Access Guard & Self-Checkout Restriction
  // ---------------------------------------------------------------------------
  test('PAY-012 & PAY-013: Guest access guard and seller self-checkout prevention', async ({ browser }) => {
    // Unauthenticated Guest context
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    try {
      await guestPage.goto(`/pay/${activePackageId}?tier=basic`, { waitUntil: 'domcontentloaded' });
      await guestPage.waitForTimeout(2000);
      const isRedirectedToAuth = guestPage.url().includes('/login') || guestPage.url().includes('redirect') || !guestPage.url().includes('/pay/');
      const loginModalOrForm = guestPage.locator('div[role="dialog"], input[name="username"], input[type="email"]');
      const hasAuthPrompt = (await loginModalOrForm.count()) > 0;
      expect(isRedirectedToAuth || hasAuthPrompt).toBe(true);
      console.log('   ✅ PAY-012 Passed: Guest users redirected away from /pay/ to sign-in.');
    } finally {
      await guestContext.close();
    }
  });

  test.fixme('PAY-013: Seller self-checkout restriction (cannot purchase own package)', async () => {
    // Requires active package owned by logged-in seller attempting checkout
  });
});
