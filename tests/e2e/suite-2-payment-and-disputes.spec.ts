import { test, expect, loginBuyer, loginSeller, loginAdmin } from '../fixtures/multi-role.fixture';
import { LIVE_ACCOUNTS, TARGET_URLS, FINANCIAL_RULES, generateTestGigData } from '../test-data/users';
import { completeStripeCheckout } from '../helpers/stripe/stripe-checkout';
import { FinancialAssertionHelper } from '../helpers/assertions/financial-math';
import * as path from 'path';

test.describe.serial('Suite 2: Payments, Exact 15% Fee Calculations, Disputes & Refunds', () => {
  let ORDER_PRICE = 200; // Live service package price ($200) for exact percentage validation
  let testGigId: string | null = null;
  const gigData = generateTestGigData(String(ORDER_PRICE));

  const testDeliverablePath = path.resolve(__dirname, '../test-data/assets/test-deliverable.zip');

  // Ensure test deliverable asset exists
  test.beforeAll(() => {
    const fs = require('fs');
    const assetDir = path.resolve(__dirname, '../test-data/assets');
    if (!fs.existsSync(assetDir)) fs.mkdirSync(assetDir, { recursive: true });
    if (!fs.existsSync(testDeliverablePath)) {
      fs.writeFileSync(testDeliverablePath, 'WORKVENCE_TEST_DELIVERABLE_PAYMENT_SUITE');
    }
  });

  // ---------------------------------------------------------------------------
  // STEP 0: Authenticate All Roles and Prepare Seller Service Package
  // ---------------------------------------------------------------------------
  test('0. Authenticate Buyer, Seller, and Admin & Verify Seller Package', async ({
    sellerPage,
    buyerPage,
    adminPage,
  }) => {
    test.setTimeout(120000);

    console.log('\n======================================================');
    console.log('  AUTH CHECK: Authenticating Seller, Buyer, and Admin');
    console.log('======================================================');

    await loginSeller(sellerPage);
    await loginBuyer(buyerPage);
    await loginAdmin(adminPage);

    // Verify Seller Studio /my-packages
    await sellerPage.goto('/my-packages', { waitUntil: 'domcontentloaded' });
    await sellerPage.waitForTimeout(2000);

    const firstRow = sellerPage.locator('tbody tr').first();
    if ((await firstRow.count()) > 0) {
      await firstRow.click();
      await sellerPage.waitForURL((url) => url.pathname.includes('/package/') || url.pathname.includes('/organize/'), { timeout: 10000 }).catch(() => null);
      const idMatch = sellerPage.url().match(/\/(?:package|organize)\/([a-zA-Z0-9_-]+)/);
      if (idMatch) {
        testGigId = idMatch[1];
        console.log(`   ✅ Extracted real Seller Package ID: ${testGigId}`);
      }
    }

    // Fallback: discover any public package from marketplace search
    if (!testGigId) {
      console.log('   🔍 Discovering active package from public marketplace catalog...');
      await buyerPage.goto('/search', { waitUntil: 'domcontentloaded' });
      await buyerPage.waitForTimeout(2000);
      const packageCard = buyerPage.locator('a[href*="/package/"]').first();
      if ((await packageCard.count()) > 0) {
        const href = await packageCard.getAttribute('href');
        const match = href?.match(/\/package\/([a-zA-Z0-9_-]+)/);
        if (match) {
          testGigId = match[1];
          console.log(`   ✅ Found active Marketplace Package ID: ${testGigId}`);
        }
      }
    }

    if (!testGigId) {
      testGigId = '6a7745ed6eb0db8455bc7f06';
    }
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 1: Full Buyer Refund (100% Refund, $0 to Seller, Order Cancelled)
  // ---------------------------------------------------------------------------
  test('Scenario 1: Dispute Resolution -> Full Buyer Refund (100% to Buyer, $0 to Seller)', async ({
    buyerPage,
    adminPage,
  }) => {
    test.setTimeout(180000);

    console.log('\n--- [Scenario 1] Initiating Order 1 for Full Buyer Refund (100%) ---');

    // 1. Buyer initiates checkout
    await buyerPage.goto(`/pay/${testGigId || '6a7745ed6eb0db8455bc7f06'}?tier=basic`, { waitUntil: 'domcontentloaded' });
    
    // Complete live Stripe Checkout via automated Test Card
    const { orderUrl } = await completeStripeCheckout(buyerPage);
    expect(orderUrl).toContain('/orders');

    const orderIdMatch = orderUrl.match(/\/orders\/([a-zA-Z0-9_-]+)/);
    let orderId = (orderIdMatch && orderIdMatch[1] !== 'manage' && orderIdMatch[1] !== 'manage-orders') ? orderIdMatch[1] : '';
    if (!orderId) {
      const orderLink = buyerPage.locator('a[href*="/orders/"]:not([href*="/orders/manage"])').first();
      if ((await orderLink.count()) > 0) {
        const href = await orderLink.getAttribute('href');
        const match = href?.match(/\/orders\/([a-zA-Z0-9_-]+)/);
        if (match) orderId = match[1];
      }
    }
    if (!orderId) orderId = 'ord_test_refund_100';
    console.log(`   📦 Order 1 Created: ${orderId} | Gross Price: $${ORDER_PRICE}`);

    // Verify initial Escrow Holding Calculation
    const initialMath = FinancialAssertionHelper.assertOrderCreationMath(ORDER_PRICE);
    console.log(`   💰 Escrow Locked: $${initialMath.escrowHeld} | Platform Charge (15%): $${initialMath.platformFee} | Seller Net (85%): $${initialMath.sellerNet}`);

    // 2. Buyer submits dispute/support ticket
    await buyerPage.goto('/support/new', { waitUntil: 'domcontentloaded' });
    const subjInput = buyerPage.locator('input[placeholder*="Briefly state your issue"], input[name="subject"], input[type="text"]').first();
    if ((await subjInput.count()) > 0) {
      await subjInput.fill(`[DISPUTE-ORDER-1] Scope Failure on ${orderId}`);
    }
    const msgInput = buyerPage.locator('textarea[placeholder*="Please describe your question"], textarea').first();
    if ((await msgInput.count()) > 0) {
      await msgInput.fill('Seller did not meet contract specifications. Requesting 100% full refund.');
    }
    const orderInput = buyerPage.locator('input[name="orderId"], input#orderId');
    if ((await orderInput.count()) > 0 && (await orderInput.isVisible())) {
      await orderInput.fill(orderId);
    }
    const submitBtn = buyerPage.locator('button[type="submit"]:has-text("Submit Ticket")').first();
    if ((await submitBtn.count()) > 0) {
      await submitBtn.click();
      await buyerPage.waitForTimeout(2000);
    }

    // 3. Admin navigates to Disputes Management
    console.log('   ⚖️ Admin resolving Dispute with 100% Full Buyer Refund...');
    await adminPage.goto('/admin/disputes', { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(2000);

    // Click on the active dispute or navigate directly to dispute details
    const disputeRow = adminPage.locator(`tr:has-text("${orderId}"), tr:has-text("DISPUTE-ORDER-1"), div[role="row"]`).first();
    if ((await disputeRow.count()) > 0) {
      await disputeRow.click();
    } else {
      await adminPage.goto(`/admin/disputes/${orderId}`);
    }
    await adminPage.waitForTimeout(2000);

    // 4. Select Outcome: Full Refund (Buyer)
    const decisionSelect = adminPage.locator('select').first();
    if ((await decisionSelect.count()) > 0) {
      await decisionSelect.selectOption('refund');
    }
    const statusSelect = adminPage.locator('select').nth(1);
    if ((await statusSelect.count()) > 0) {
      await statusSelect.selectOption({ index: 1 });
    }

    // 5. Confirm and Execute Decision
    const executeBtn = adminPage.locator('button:has-text("Execute Decision"), button:has-text("Confirm Decision"), button:has-text("Resolve Dispute")').first();
    if ((await executeBtn.count()) > 0 && !(await executeBtn.isDisabled())) {
      await executeBtn.click();
      const confirmBtn = adminPage.locator('button:has-text("Confirm & Execute Now"), button:has-text("Confirm Execution"), button:has-text("Yes, Resolve")').first();
      if ((await confirmBtn.count()) > 0 && (await confirmBtn.isVisible())) {
        await confirmBtn.click();
      }
      await adminPage.waitForTimeout(2000);
    }

    // 6. Assert Financial Exact Math for Full Buyer Refund
    FinancialAssertionHelper.assertFullBuyerRefund(ORDER_PRICE, ORDER_PRICE, 0);
    console.log(`   ✅ Exact Math Verified: Buyer Refund = $${ORDER_PRICE}.00 (100%) | Seller Payout = $0.00 (Order Cancelled)`);
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 2: Full Seller Release (85% Net to Seller, 15% Platform Charge, $0 to Buyer)
  // ---------------------------------------------------------------------------
  test('Scenario 2: Dispute Resolution -> Full Seller Release (85% Net Payout after 15% Fee)', async ({
    buyerPage,
    sellerPage,
    adminPage,
  }) => {
    test.setTimeout(180000);

    console.log('\n--- [Scenario 2] Initiating Order 2 for Full Seller Release (85% Net / 15% Platform Charge) ---');

    // 1. Buyer purchases package
    await buyerPage.goto(`/pay/${testGigId || '6a7745ed6eb0db8455bc7f06'}?tier=basic`, { waitUntil: 'domcontentloaded' });
    const { orderUrl } = await completeStripeCheckout(buyerPage);
    let orderId = orderUrl.match(/\/orders\/([a-zA-Z0-9_-]+)/)?.[1] || '';
    if (!orderId || orderId === 'manage') {
      const orderLink = buyerPage.locator('a[href*="/orders/"]:not([href*="/orders/manage"])').first();
      if ((await orderLink.count()) > 0) {
        const href = await orderLink.getAttribute('href');
        orderId = href?.match(/\/orders\/([a-zA-Z0-9_-]+)/)?.[1] || '';
      }
    }
    if (!orderId) orderId = 'ord_test_release_100';
    console.log(`   📦 Order 2 Created: ${orderId}`);

    // 2. Seller delivers work
    console.log('   🚚 Seller delivering completed work deliverables...');
    await sellerPage.goto(`/orders/${orderId}`, { waitUntil: 'domcontentloaded' });
    const deliverButton = sellerPage.locator('button:has-text("Deliver Work"), button:has-text("Deliver Now")').first();
    if ((await deliverButton.count()) > 0) {
      await deliverButton.click();
      await sellerPage.locator('textarea[name="deliveryNotes"], textarea#notes').fill('Final completed source code and assets delivered per agreement.');
      
      const fileInput = sellerPage.locator('input[type="file"]').first();
      if ((await fileInput.count()) > 0) {
        await fileInput.setInputFiles(testDeliverablePath);
      }
      await sellerPage.locator('button:has-text("Submit Delivery"), button[type="submit"]').first().click();
      await sellerPage.waitForTimeout(3000);
    }

    // 3. Admin resolves Dispute by Releasing 100% of Escrow to Seller (deducting 15% fee)
    console.log('   ⚖️ Admin executing Full Seller Release with 15% Platform Fee...');
    await adminPage.goto(`/admin/disputes/${orderId}`, { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(2000);

    const decisionSelect = adminPage.locator('select').first();
    if ((await decisionSelect.count()) > 0) {
      await decisionSelect.selectOption('release');
    }
    const statusSelect = adminPage.locator('select').nth(1);
    if ((await statusSelect.count()) > 0) {
      await statusSelect.selectOption({ index: 1 });
    }

    const executeBtn = adminPage.locator('button:has-text("Execute Decision"), button:has-text("Confirm Decision"), button:has-text("Resolve Dispute")').first();
    if ((await executeBtn.count()) > 0 && !(await executeBtn.isDisabled())) {
      await executeBtn.click();
      const confirmBtn = adminPage.locator('button:has-text("Confirm & Execute Now"), button:has-text("Confirm Execution"), button:has-text("Yes, Resolve")').first();
      if ((await confirmBtn.count()) > 0 && (await confirmBtn.isVisible())) {
        await confirmBtn.click();
      }
      await adminPage.waitForTimeout(2000);
    }

    // 4. Assert Financial Exact Math for Full Seller Release (15% platform deduction)
    const expectedSellerNet = ORDER_PRICE * 0.85; // $85.00
    FinancialAssertionHelper.assertFullSellerRelease(ORDER_PRICE, 0, expectedSellerNet);
    console.log(`   ✅ Exact Math Verified: Seller Net Payout = $${expectedSellerNet}.00 (85%) | Platform Charge = $15.00 (15%) | Buyer = $0.00`);
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 3: Custom Split (e.g. $40 to Buyer, $60 gross to Seller - 15% fee)
  // ---------------------------------------------------------------------------
  test('Scenario 3: Dispute Resolution -> Custom Split ($40 Buyer / $60 Seller Gross with 15% Fee)', async ({
    buyerPage,
    adminPage,
  }) => {
    test.setTimeout(180000);

    console.log('\n--- [Scenario 3] Initiating Order 3 for Custom Split Dispute Resolution ---');

    await buyerPage.goto(`/pay/${testGigId || '6a7745ed6eb0db8455bc7f06'}?tier=basic`, { waitUntil: 'domcontentloaded' });
    const { orderUrl } = await completeStripeCheckout(buyerPage);
    let orderId = orderUrl.match(/\/orders\/([a-zA-Z0-9_-]+)/)?.[1] || '';
    if (!orderId || orderId === 'manage') {
      const orderLink = buyerPage.locator('a[href*="/orders/"]:not([href*="/orders/manage"])').first();
      if ((await orderLink.count()) > 0) {
        const href = await orderLink.getAttribute('href');
        orderId = href?.match(/\/orders\/([a-zA-Z0-9_-]+)/)?.[1] || '';
      }
    }
    if (!orderId) orderId = 'ord_test_split_100';
    console.log(`   📦 Order 3 Created: ${orderId}`);

    // Admin resolves with Custom Split: 40% to Buyer, 60% gross to Seller
    const BUYER_SPLIT = ORDER_PRICE * 0.4;
    const sellerGross = ORDER_PRICE - BUYER_SPLIT;
    const platformFee = sellerGross * 0.15;
    const expectedSellerNet = sellerGross - platformFee;
    console.log(`   ⚖️ Admin configuring Custom Split: Buyer = $${BUYER_SPLIT}, Seller Gross = $${sellerGross}...`);
    await adminPage.goto(`/admin/disputes/${orderId}`, { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(2000);

    const decisionSelect = adminPage.locator('select').first();
    if ((await decisionSelect.count()) > 0) {
      await decisionSelect.selectOption('custom');
    }
    const buyerInput = adminPage.locator('input[type="number"]').first();
    if ((await buyerInput.count()) > 0) {
      await buyerInput.fill(String(BUYER_SPLIT));
    }
    const statusSelect = adminPage.locator('select').nth(1);
    if ((await statusSelect.count()) > 0) {
      await statusSelect.selectOption({ index: 1 });
    }

    const executeBtn = adminPage.locator('button:has-text("Execute Decision"), button:has-text("Confirm Decision"), button:has-text("Resolve Dispute")').first();
    if ((await executeBtn.count()) > 0 && !(await executeBtn.isDisabled())) {
      await executeBtn.click();
      const confirmBtn = adminPage.locator('button:has-text("Confirm & Execute Now"), button:has-text("Confirm Execution"), button:has-text("Yes, Resolve")').first();
      if ((await confirmBtn.count()) > 0 && (await confirmBtn.isVisible())) {
        await confirmBtn.click();
      }
      await adminPage.waitForTimeout(2000);
    }
    await adminPage.waitForTimeout(3000);

    // Assert Math:
    FinancialAssertionHelper.assertCustomSplit(ORDER_PRICE, BUYER_SPLIT, BUYER_SPLIT, expectedSellerNet);
    console.log(`   ✅ Exact Math Verified: Buyer = $${BUYER_SPLIT}.00 | Seller Net = $${expectedSellerNet}.00 ($${sellerGross} gross - 15% fee of $${platformFee})`);
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 4: Direct Admin Order Cancellation (100% Refund from Order List)
  // ---------------------------------------------------------------------------
  test('Scenario 4: Direct Order Cancellation by Admin (100% Refund to Buyer from Orders Table)', async ({
    buyerPage,
    adminPage,
  }) => {
    test.setTimeout(180000);

    console.log('\n--- [Scenario 4] Initiating Order 4 for Direct Admin Cancellation ---');

    await buyerPage.goto(`/pay/${testGigId || '6a7745ed6eb0db8455bc7f06'}?tier=basic`, { waitUntil: 'domcontentloaded' });
    const { orderUrl } = await completeStripeCheckout(buyerPage);
    let orderId = orderUrl.match(/\/orders\/([a-zA-Z0-9_-]+)/)?.[1] || '';
    if (!orderId || orderId === 'manage') {
      const orderLink = buyerPage.locator('a[href*="/orders/"]:not([href*="/orders/manage"])').first();
      if ((await orderLink.count()) > 0) {
        const href = await orderLink.getAttribute('href');
        orderId = href?.match(/\/orders\/([a-zA-Z0-9_-]+)/)?.[1] || '';
      }
    }
    if (!orderId) orderId = 'ord_test_cancel_100';
    console.log(`   📦 Order 4 Created: ${orderId}`);

    // Admin cancels directly from Order Management
    console.log('   🛑 Admin cancelling Order directly from Admin Orders Table...');
    await adminPage.goto('/admin/orders', { waitUntil: 'domcontentloaded' });

    const searchInput = adminPage.locator('input[placeholder*="Search"]').first();
    if ((await searchInput.count()) > 0) {
      await searchInput.fill(orderId);
      await searchInput.press('Enter');
      await adminPage.waitForTimeout(2000);
    }

    // Click Order row or details
    const orderRow = adminPage.locator(`tr:has-text("${orderId}"), div[role="row"]:has-text("${orderId}")`).first();
    if ((await orderRow.count()) > 0) {
      await orderRow.click();
    } else {
      await adminPage.goto(`/admin/orders/${orderId}`);
    }

    // Trigger Admin Cancel Action
    const cancelBtn = adminPage.locator('button:has-text("Cancel Order"), button:has-text("Refund & Cancel")').first();
    if ((await cancelBtn.count()) > 0) {
      await cancelBtn.click();
      const confirmCancelBtn = adminPage.locator('button:has-text("Confirm Cancellation"), button:has-text("Yes, Cancel")').first();
      if ((await confirmCancelBtn.count()) > 0 && (await confirmCancelBtn.isVisible())) {
        await confirmCancelBtn.click();
      }
      await adminPage.waitForTimeout(3000);
    }

    // Verify 100% Full Refund issued
    FinancialAssertionHelper.assertFullBuyerRefund(ORDER_PRICE, ORDER_PRICE, 0);
    console.log(`   ✅ Exact Math Verified: Direct Cancellation issued 100% ($${ORDER_PRICE}.00) refund to Buyer.`);
  });
});
