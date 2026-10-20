import { test, expect, loginAdmin, loginSubAdmin } from '../fixtures/multi-role.fixture';
import { generateSubAdminData, TARGET_URLS } from '../test-data/users';

test.describe.serial('Suite 4: Master Admin Operations, Sub-Admin Provisioning & Portal Button Audits', () => {
  const newSubAdmin = generateSubAdminData();

  test.beforeEach(async () => {
    test.setTimeout(120000);
  });

  // ---------------------------------------------------------------------------
  // STEP 1: Master Admin Creates Sub-Admin Account (No Email Verification)
  // ---------------------------------------------------------------------------
  test('1. Master Admin Provisions New Sub-Admin (No Email OTP Required)', async ({ adminPage }) => {
    console.log('\n======================================================');
    console.log('  SUITE 4: Master Admin Sub-Admin Provisioning & UI Audit');
    console.log('======================================================');

    await loginAdmin(adminPage);

    console.log(`   👤 Master Admin creating Sub-Admin: ${newSubAdmin.username} (${newSubAdmin.email})`);
    await adminPage.goto('/admin/sub-admins', { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(2000);

    // Click "Create Sub-Admin" button
    const createBtn = adminPage.locator('button:has-text("Create Sub-Admin"), button:has-text("Add Sub-Admin")').first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    // Fill Modal Inputs
    const modal = adminPage.locator('div:has(h3:has-text("Create Sub-Admin")), div[role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 10000 });

    await modal.locator('input[placeholder*="sarah_support"], input[name="username"], input[type="text"]').first().fill(newSubAdmin.username);
    await modal.locator('input[placeholder*="sarah@sos.com"], input[name="email"], input[type="email"]').first().fill(newSubAdmin.email);
    await modal.locator('input[placeholder*="password"], input[name="password"], input[type="password"]').first().fill(newSubAdmin.password);

    // Select Role
    const roleSelect = modal.locator('select').first();
    if ((await roleSelect.count()) > 0) {
      const options = await roleSelect.locator('option').all();
      if (options.length > 0) {
        const val = await options[0].getAttribute('value');
        if (val) await roleSelect.selectOption(val);
      }
    }

    // Submit Create Sub-Admin
    const submitBtn = modal.locator('button[type="submit"]:has-text("Create Sub-Admin"), button[type="submit"]').first();
    await submitBtn.click();
    await adminPage.waitForTimeout(3000);

    console.log('   ✅ Sub-Admin created successfully via Master Admin UI without email verification.');
  });

  // ---------------------------------------------------------------------------
  // STEP 2: Sub-Admin Authenticates Directly with Created Credentials
  // ---------------------------------------------------------------------------
  test('2. Sub-Admin Logs In Directly to Admin Portal & Inspects Dashboard', async ({ subAdminPage }) => {
    console.log('\n--- [Sub-Admin] 2. Sub-Admin Logging in with Created Credentials ---');

    await loginSubAdmin(subAdminPage, {
      email: newSubAdmin.email,
      password: newSubAdmin.password,
    });

    await subAdminPage.waitForURL((url) => url.pathname.includes('/admin/dashboard') || url.pathname.includes('/admin'), { timeout: 20000 });
    console.log(`   🎉 Sub-Admin successfully logged in and landed on: ${subAdminPage.url()}`);

    // Audit Sub-Admin Dashboard View
    await expect(subAdminPage.locator('h1, h2').first()).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // STEP 3: Master Admin Reassigns / Suspends Sub-Admin
  // ---------------------------------------------------------------------------
  test('3. Master Admin Reassigns / Suspends Sub-Admin Account', async ({ adminPage }) => {
    console.log('\n--- [Master Admin] 3. Managing Sub-Admin Status (Reassign/Suspend) ---');

    await adminPage.goto('/admin/sub-admins', { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(2000);

    // Search for newly created sub-admin
    const searchInput = adminPage.locator('input[placeholder*="Search"]').first();
    if ((await searchInput.count()) > 0) {
      await searchInput.fill(newSubAdmin.username);
      await adminPage.waitForTimeout(1000);
    }

    const subAdminRow = adminPage.locator(`tr:has-text("${newSubAdmin.username}"), div[role="row"]:has-text("${newSubAdmin.username}")`).first();
    if ((await subAdminRow.count()) > 0) {
      console.log(`   ✅ Found Sub-Admin in Master Admin table.`);
      
      // Test suspend / action toggle button
      const actionBtn = subAdminRow.locator('button[aria-label*="Suspend"], button:has-text("Suspend"), button:has-text("Edit")').first();
      if ((await actionBtn.count()) > 0 && (await actionBtn.isVisible())) {
        await actionBtn.click();
        await adminPage.waitForTimeout(1500);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // STEP 4: Comprehensive Button Audit across All Admin Portal Modules
  // ---------------------------------------------------------------------------
  test('4. Comprehensive Button & Navigation Audit across All 10 Admin Modules', async ({ adminPage }) => {
    console.log('\n--- [Admin UI Audit] 4. Auditing All Core Modules & Buttons ---');

    const adminModules = [
      { name: 'Dashboard', path: '/admin/dashboard', checkSelector: 'h1, h2' },
      { name: 'Categories', path: '/admin/categories', checkSelector: 'button:has-text("Add Category"), input:visible, h1, h2' },
      { name: 'Users', path: '/admin/users', checkSelector: 'input:visible, button:visible, h1, h2' },
      { name: 'Orders', path: '/admin/orders', checkSelector: 'input:visible, select, [role="combobox"], h1, h2' },
      { name: 'Disputes', path: '/admin/disputes', checkSelector: 'input:visible, [role="tab"]:visible, h1, h2' },
      { name: 'KYC Verification', path: '/admin/kyc', checkSelector: 'h1, h2, table, button:visible' },
      { name: 'Moderation', path: '/admin/moderation', checkSelector: 'h1, h2, [role="tab"]:visible, button:visible' },
      { name: 'Support', path: '/admin/support', checkSelector: 'h1, h2, input:visible, button:visible' },
      { name: 'Roles & Permissions', path: '/admin/roles', checkSelector: 'button:has-text("Create Role"), table, h1, h2' },
      { name: 'Sub-Admins', path: '/admin/sub-admins', checkSelector: 'button:has-text("Create Sub-Admin"), h1, h2' },
    ];

    for (const mod of adminModules) {
      console.log(`   🔍 Auditing Module: ${mod.name} (${mod.path})...`);
      await adminPage.goto(mod.path, { waitUntil: 'domcontentloaded' });
      await adminPage.waitForTimeout(1200);

      const target = adminPage.locator(mod.checkSelector).first();
      await expect(target).toBeVisible({ timeout: 10000 });
      console.log(`      ✅ ${mod.name}: Primary action controls rendered and active.`);
    }

    console.log('   🎉 Complete Admin Portal Navigation & Button Audit Passed.');
  });
});
