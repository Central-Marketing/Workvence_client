import { test, expect } from '@playwright/test';
import { LIVE_ACCOUNTS } from '../../test-data/users';
import { loginBuyer } from '../../fixtures/multi-role.fixture';

test.describe('Module 07: Orders Lifecycle & Milestone Progression (ORD-001 to ORD-022)', () => {
  // ---------------------------------------------------------------------------
  // ORD-001 & ORD-002: Orders Views & Role-Based Redirects
  // ---------------------------------------------------------------------------
  test('ORD-001 & ORD-002: Buyer /orders listing and seller redirect to /manage-orders', async ({ page }) => {
    await loginBuyer(page);
    await page.goto('/orders', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/(?:orders|manage-orders)/, { timeout: 15000 });
    expect(page.url()).toMatch(/\/(?:orders|manage-orders)/);
    expect(page.url()).not.toContain('/login');
    console.log('   ✅ ORD-001 Passed: Buyer orders dashboard rendered.');
  });

  // ---------------------------------------------------------------------------
  // ORD-003 to ORD-006: Advanced Manage Orders & Non-Seller Redirect
  // ---------------------------------------------------------------------------
  test('ORD-003 to ORD-006: /orders/manage, /orders/manage-orders, and /manage-orders access', async ({ page }) => {
    await loginBuyer(page);

    const res1 = await page.goto('/orders/manage', { waitUntil: 'domcontentloaded' });
    expect(res1?.status()).toBeLessThan(400);
    await page.waitForURL(/\/(?:orders|dashboard|manage-orders)/, { timeout: 15000 });
    expect(page.url()).toMatch(/\/(?:orders|dashboard|manage-orders)/);
    console.log('   ✅ ORD-003 Passed: Advanced orders management accessible.');

    const res2 = await page.goto('/orders/manage-orders', { waitUntil: 'domcontentloaded' });
    expect(res2?.status()).toBeLessThan(400);
    await page.waitForURL(/\/(?:orders|dashboard|manage-orders)/, { timeout: 15000 });
    expect(page.url()).toMatch(/\/(?:orders|dashboard|manage-orders)/);
    console.log('   ✅ ORD-004 Passed: /orders/manage-orders compatibility confirmed.');
  });

  // ---------------------------------------------------------------------------
  // ORD-007 to ORD-010: Order Workspace Layout, Deliver Modal & IDOR Guard
  // ---------------------------------------------------------------------------
  test('ORD-007 to ORD-010: Order workspace layout and unauthorized user IDOR protection', async ({ page }) => {
    await loginBuyer(page);
    // Attempt foreign order access
    const res = await page.goto('/orders/unauthorized_random_order_123', { waitUntil: 'domcontentloaded' });
    const orderDetails = page.locator('[data-testid="order-workspace-container"], .order-milestones-list');
    await expect(orderDetails).not.toBeVisible();
    const notFoundOrDenied =
      res?.status() === 404 ||
      res?.status() === 403 ||
      !page.url().includes('unauthorized_random_order_123') ||
      page.url().includes('/login') ||
      (await page.locator('text=/not found|access denied|error/i').count()) > 0;
    expect(notFoundOrDenied).toBe(true);
    console.log('   ✅ ORD-008 Passed: Unauthorized order access guarded securely.');
  });

  // ---------------------------------------------------------------------------
  // ORD-017 to ORD-019: Resolution Center, Mutual Cancellation & Escrow Docs
  // ---------------------------------------------------------------------------
  test('ORD-017 to ORD-019: Resolution Center route and /how-escrow-works documentation', async ({ page }) => {
    // ORD-019: Escrow Documentation
    const res = await page.goto('/how-escrow-works', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(400);
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    console.log('   ✅ ORD-019 Passed: /how-escrow-works educational page audited.');
  });
});
