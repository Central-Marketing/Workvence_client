import { Page, expect } from '@playwright/test';

export interface StripePaymentDetails {
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  cardholderName?: string;
  postalCode?: string;
}

/**
 * Automates the live Stripe Test Mode Checkout page when redirected from Workvence /pay/:id
 */
export async function completeStripeCheckout(
  page: Page,
  details: StripePaymentDetails = {}
): Promise<{ orderUrl: string }> {
  const cardNumber = details.cardNumber || '4242 4242 4242 4242';
  const cardExpiry = details.cardExpiry || '12/34';
  const cardCvc = details.cardCvc || '123';
  const cardholderName = details.cardholderName || 'Workvence E2E Buyer';
  const postalCode = details.postalCode || '90210';

  console.log('   💳 Waiting for redirection to Stripe Hosted Checkout...');
  await page.waitForURL((url) => url.hostname.includes('stripe.com') || url.pathname.includes('/orders') || url.pathname.includes('/success') || url.pathname.includes('/packages'), {
    timeout: 30000,
  });

  // If already redirected back directly (e.g. mock or test webhook fast response)
  if (!page.url().includes('stripe.com')) {
    console.log(`   ✅ Direct redirect to marketplace order: ${page.url()}`);
    return { orderUrl: page.url() };
  }

  console.log(`   🌐 Landed on Stripe Checkout: ${page.url()}`);
  await page.waitForLoadState('domcontentloaded');

  // Fill Stripe Card Element or Hosted Fields
  try {
    // 1. Email (Stripe contact info)
    const emailInput = page.locator('input#email, input[name="email"], input[type="email"], input[autocomplete="email"], input[placeholder*="email" i]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    const buyerEmail = process.env.BUYER_EMAIL || 'buyer@example.com';
    await emailInput.fill(buyerEmail);
    const emailVal = await emailInput.inputValue();
    if (!emailVal) {
      await emailInput.focus();
      await page.keyboard.type(buyerEmail, { delay: 30 });
    }
    await emailInput.press('Tab').catch(() => null);

    // 2. Card Number
    const cardInput = page.locator('input#cardNumber, input[name="cardNumber"], input[autocomplete="cc-number"]').first();
    await cardInput.waitFor({ state: 'visible', timeout: 15000 });
    await cardInput.fill(cardNumber);

    // 3. Card Expiry
    const expInput = page.locator('input#cardExpiry, input[name="cardExpiry"], input[autocomplete="cc-exp"]').first();
    await expInput.fill(cardExpiry);

    // 4. Card CVC
    const cvcInput = page.locator('input#cardCvc, input[name="cardCvc"], input[autocomplete="cc-csc"]').first();
    await cvcInput.fill(cardCvc);

    // 5. Billing Name
    const nameInput = page.locator('input#billingName, input[name="billingName"], input[autocomplete="cc-name"]').first();
    if ((await nameInput.count()) > 0 && (await nameInput.isVisible())) {
      await nameInput.fill(cardholderName);
    }

    // 6. ZIP / Postal Code (if requested by Stripe)
    const zipInput = page.locator('input#billingPostalCode, input[name="billingPostalCode"], input[autocomplete="postal-code"]').first();
    if ((await zipInput.count()) > 0 && (await zipInput.isVisible())) {
      await zipInput.fill(postalCode);
    }

    // 7. Click Pay Button
    console.log('   🚀 Submitting Stripe Payment...');
    const payButton = page.locator('button.SubmitButton, button[type="submit"], button:has-text("Pay")').first();
    await payButton.waitFor({ state: 'visible', timeout: 10000 });
    await payButton.click();

    // 8. Wait for Stripe to redirect back to Workvence
    console.log('   ⏳ Waiting for Stripe confirmation and redirect back to Workvence...');
    await page.waitForURL((url) => !url.hostname.includes('stripe.com'), { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');

    if (page.url().includes('/success')) {
      console.log('   ⏳ On /success page, awaiting redirect to /orders...');
      await page.waitForURL((url) => url.pathname.includes('/orders'), { timeout: 20000 }).catch(async () => {
        await page.goto('/orders', { waitUntil: 'domcontentloaded' });
      });
    }

    console.log(`   🎉 Successfully redirected back to: ${page.url()}`);
    return { orderUrl: page.url() };
  } catch (error) {
    console.error('   ❌ Stripe checkout interaction failed:', error);
    throw error;
  }
}
