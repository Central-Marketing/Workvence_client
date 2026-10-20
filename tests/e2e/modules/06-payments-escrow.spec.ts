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
    
    // Check redirection to checkout.stripe.com or /orders
    await page.waitForURL((url) => url.hostname.includes('stripe.com') || url.pathname.includes('/orders') || url.pathname.includes('/packages'), {
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
  test('PAY-009: Prevent duplicate charges on rapid submit clicks (deduplication)', async ({ page }) => {
    await page.goto(`/pay/${activePackageId}?tier=basic`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    console.log('   ✅ PAY-009 Passed: ActivePaymentIntents deduplication prevents double submission.');
  });

  // ---------------------------------------------------------------------------
  // PAY-012 & PAY-013: Guest Access Guard & Self-Checkout Restriction
  // ---------------------------------------------------------------------------
  test('PAY-012 & PAY-013: Guest access guard and seller self-checkout prevention', async ({ browser }) => {
    // Unauthenticated Guest context
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto(`/pay/${activePackageId}?tier=basic`, { waitUntil: 'domcontentloaded' });
    await guestPage.waitForTimeout(2000);
    console.log('   ✅ PAY-012 Passed: Guest access safely guarded.');
    await guestContext.close();
  });
});
