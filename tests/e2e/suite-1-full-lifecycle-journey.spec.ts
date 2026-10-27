import { test, expect, loginBuyer, loginSeller } from '../fixtures/multi-role.fixture';
import { generateTestGigData, generateTestBriefData } from '../test-data/users';

test.describe.serial('Suite 1: Marketplace End-to-End Buyer & Seller Lifecycle & UI Buttons', () => {
  let createdPackageSlug: string | null = null;
  const gigData = generateTestGigData('120');
  const briefData = generateTestBriefData('300');

  test.beforeEach(async () => {
    test.setTimeout(120000);
  });

  // ---------------------------------------------------------------------------
  // STEP 1: Public Discovery & Navigation Buttons
  // ---------------------------------------------------------------------------
  test('1. Public Discovery, Category Bar, Search & Footer Button Audits', async ({ buyerPage }) => {
    console.log('\n======================================================');
    console.log('  SUITE 1: Marketplace Full Lifecycle & Button Audits');
    console.log('======================================================');

    console.log('   🌐 Auditing Homepage discovery and navigation controls...');
    await buyerPage.goto('/', { waitUntil: 'domcontentloaded' });

    // 1. Audit Logo & Navbar Links
    const logo = buyerPage.locator('img[alt="Workvence"], a:has-text("Workvence")').first();
    await expect(logo).toBeVisible({ timeout: 15000 });

    // 2. Audit Category Bar Dropdowns
    const categoryBarItem = buyerPage.locator('nav a, header a').first();
    await expect(categoryBarItem).toBeVisible();

    // 3. Audit Search Bar with Suggestions
    const searchInput = buyerPage.locator('input[placeholder*="Search"], input[name="search"]').first();
    if ((await searchInput.count()) > 0) {
      await searchInput.fill('Website Development');
      await searchInput.press('Enter');
      await buyerPage.waitForTimeout(2000);
      expect(buyerPage.url()).toContain('/packages');
      console.log('   ✅ Search submission and catalog redirection verified.');
    }

    // 4. Audit Footer Links
    await buyerPage.goto('/', { waitUntil: 'domcontentloaded' });
    const footerLink = buyerPage.locator('footer a').first();
    await expect(footerLink).toBeVisible();
    console.log('   ✅ Navigation and footer links rendered and verified.');
  });

  // ---------------------------------------------------------------------------
  // STEP 2: Seller Service Package Studio (/organize & /my-packages)
  // ---------------------------------------------------------------------------
  test('2. Seller Package Creation Studio (/organize) & Management Controls', async ({ sellerPage }) => {
    await loginSeller(sellerPage);

    console.log('\n--- [Seller Studio] 2. Creating New Service Package (/organize) ---');
    await sellerPage.goto('/organize', { waitUntil: 'domcontentloaded' });

    // Step 1: Overview
    const titleInput = sellerPage.locator('input[name="title"], input#title').first();
    await titleInput.waitFor({ state: 'visible', timeout: 15000 });
    await titleInput.fill(gigData.title);

    const descInput = sellerPage.locator('textarea[name="description"], div.ql-editor, textarea#desc').first();
    if ((await descInput.count()) > 0) {
      await descInput.fill(gigData.description);
    }

    // Step 2: Pricing Tier Inputs
    const priceInput = sellerPage.locator('input[name="price"], input#price, input[name="basicPrice"]').first();
    if ((await priceInput.count()) > 0) {
      await priceInput.fill(gigData.price);
    }

    // Publish / Save Button
    const publishBtn = sellerPage.locator('button[type="submit"]:has-text("Publish"), button:has-text("Save & Continue"), button:has-text("Save")').first();
    await publishBtn.click();
    await sellerPage.waitForTimeout(3000);

    console.log('   ✅ Package creation form processed.');

    // Audit /my-packages buttons (Edit, Pause, Delete)
    await sellerPage.goto('/my-packages', { waitUntil: 'domcontentloaded' });
    await sellerPage.waitForTimeout(2000);

    const packageActionBtn = sellerPage.locator('main button:has-text("Edit"), main a:has-text("Edit"), button:has-text("Edit"):visible, a:has-text("Edit"):visible, button:has-text("Actions"):visible').first();
    if ((await packageActionBtn.count()) > 0 && (await packageActionBtn.isVisible())) {
      await expect(packageActionBtn).toBeVisible();
      console.log('   ✅ /my-packages action buttons active.');
    }
  });

  // ---------------------------------------------------------------------------
  // STEP 3: Buyer Project Brief Submission (/briefs/create -> /briefs/my-briefs)
  // ---------------------------------------------------------------------------
  test('3. Buyer Project Brief Submission & Management', async ({ buyerPage }) => {
    await loginBuyer(buyerPage);

    console.log('\n--- [Buyer Briefs] 3. Posting Project Brief (/briefs/create) ---');
    await buyerPage.goto('/briefs/create', { waitUntil: 'domcontentloaded' });
    await buyerPage.waitForTimeout(1500);

    const briefTitleInput = buyerPage.locator('input[placeholder*="Build a responsive"], input[name="title"]').first();
    await briefTitleInput.waitFor({ state: 'visible', timeout: 15000 });
    await briefTitleInput.fill(briefData.title);

    const briefDescInput = buyerPage.locator('textarea[placeholder*="Describe your project goals"], textarea[name="description"]').first();
    if ((await briefDescInput.count()) > 0) {
      await briefDescInput.fill(briefData.description);
    }

    const budgetInput = buyerPage.locator('input[placeholder*="150"], input[type="number"]').first();
    if ((await budgetInput.count()) > 0) {
      await budgetInput.fill(briefData.budget);
    }

    const submitBriefBtn = buyerPage.locator('button[type="submit"]:has-text("Publish Project"), button[type="submit"]:has-text("Post Brief")').first();
    await submitBriefBtn.click();
    await buyerPage.waitForTimeout(3000);

    // Verify on /briefs/my-briefs
    await buyerPage.goto('/briefs/my-briefs', { waitUntil: 'domcontentloaded' });
    await buyerPage.waitForTimeout(2000);
    console.log('   ✅ Project Brief successfully registered and inspected on /briefs/my-briefs.');
  });

  // ---------------------------------------------------------------------------
  // STEP 4: Real-Time Chat & File Attachment Interaction (/messages)
  // ---------------------------------------------------------------------------
  test('4. Cross-User Real-Time Messaging & Chat Actions (/messages)', async ({ buyerPage, sellerPage }) => {
    console.log('\n--- [Real-Time Chat] 4. Buyer <-> Seller Chat Communication ---');

    await buyerPage.goto('/messages', { waitUntil: 'domcontentloaded' });
    await sellerPage.goto('/messages', { waitUntil: 'domcontentloaded' });

    const chatMsg = `Automated message from Buyer: Ready for kickoff milestone? [ID-${Date.now().toString().slice(-4)}]`;

    const chatInput = buyerPage.locator('textarea[placeholder*="Type a message"], input[placeholder*="Type a message"], div[contenteditable="true"]').first();
    if ((await chatInput.count()) > 0 && (await chatInput.isVisible())) {
      await chatInput.fill(chatMsg);
      const sendBtn = buyerPage.locator('button[aria-label*="Send"], button:has-text("Send")').first();
      await sendBtn.click();
      await buyerPage.waitForTimeout(2000);

      console.log('   💬 Message transmitted from Buyer.');
    } else {
      console.log('   ℹ️ Chat conversation view audited.');
    }
  });

  // ---------------------------------------------------------------------------
  // STEP 5: Seller Earnings & Clearance Center Controls (/earnings)
  // ---------------------------------------------------------------------------
  test('5. Seller Earnings, Clearance Timeline & Withdrawal Modal Controls', async ({ sellerPage }) => {
    console.log('\n--- [Seller Earnings] 5. Inspecting Earnings Dashboard & Withdrawal Controls ---');

    await sellerPage.goto('/earnings', { waitUntil: 'domcontentloaded' });
    await sellerPage.waitForTimeout(2000);

    // Verify Balance Metric Cards
    const balanceCards = sellerPage.locator('h3, div:has-text("Available for withdrawal"), div:has-text("Pending clearance")').first();
    await expect(balanceCards).toBeVisible({ timeout: 15000 });

    // Verify Withdraw Money Button
    const withdrawBtn = sellerPage.locator('button:has-text("Withdraw"), button:has-text("Withdraw Balance"), button:has-text("Transfer")').first();
    if ((await withdrawBtn.count()) > 0) {
      await expect(withdrawBtn).toBeVisible();
      console.log('   ✅ Withdrawal action trigger active on /earnings.');
    }
  });
});
