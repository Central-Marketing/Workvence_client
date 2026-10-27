# Workvence Full-Platform Playwright Test Automation Suite

Unified cross-platform end-to-end testing infrastructure covering **Marketplace Frontend** (`https://dev.workvence.com`) and **Admin Portal Frontend** (`https://admin.workvence.com`).

All test cases, suites, test data, and fixtures are centralized exclusively inside this **`tests/`** directory.

---

## 🌟 Suite Architecture & Directory Organization

```
tests/
├── e2e/
│   ├── suite-1-full-lifecycle-journey.spec.ts     # Master Journey 1: Full Marketplace Lifecycle (5 tests)
│   ├── suite-2-payment-and-disputes.spec.ts       # Master Journey 2: Payments, Exact 15% Fees & Disputes (5 tests)
│   ├── suite-3-support-chat-and-security.spec.ts  # Master Journey 3: Support Ticketing & Thread Privacy (5 tests)
│   ├── suite-4-subadmin-and-admin-controls.spec.ts # Master Journey 4: Admin Controls & Sub-Admins (4 tests)
│   └── modules/                                  # 14 Granular Modules (All 238 QA Matrix Cases)
│       ├── 01-auth.spec.ts                       # AUTH-001 to AUTH-022 (10 tests)
│       ├── 02-buyer-experience.spec.ts           # BUY-001 to BUY-020 (5 tests)
│       ├── 03-seller-hub.spec.ts                 # SEL-001 to SEL-020 (4 tests)
│       ├── 04-package-studio.spec.ts             # PKG-001 to PKG-022 (4 tests)
│       ├── 05-briefs-proposals.spec.ts           # BRF-001 to BRF-020 (4 tests)
│       ├── 06-payments-escrow.spec.ts            # PAY-001 to PAY-015 (3 tests)
│       ├── 07-orders-lifecycle.spec.ts           # ORD-001 to ORD-022 (4 tests)
│       ├── 08-messaging.spec.ts                  # MSG-001 to MSG-016 (4 tests)
│       ├── 09-support-help.spec.ts               # SUP-001 to SUP-014 (3 tests)
│       ├── 10-admin-portal.spec.ts               # ADM-001 to ADM-035 (3 tests across all 10 modules)
│       ├── 11-user-profiles.spec.ts              # PRF-001 to PRF-012 (2 tests)
│       ├── 12-notifications.spec.ts              # NOT-001 to NOT-010 (2 tests)
│       ├── 13-responsive-ui.spec.ts              # UI-001 to UI-016 (4 tests)
│       └── 14-security-rbac.spec.ts              # SEC-001 to SEC-015 (4 tests)
├── fixtures/
│   └── multi-role.fixture.ts                     # Live Buyer, Seller & Admin browser contexts & storage states
├── helpers/
│   ├── assertions/                               # Authenticity, network & console monitors
│   ├── reporter/                                 # Custom Markdown & HTML reporting
│   └── stripe/                                   # Stripe Checkout automation & test card helpers
└── test-data/
    └── users.ts                                  # Target URLs & live credentials
```

---

## 🌟 Master Macro Suites (19 Tests)

### **Suite 1: Marketplace End-to-End Buyer & Seller Lifecycle & UI Buttons**
- **File:** `tests/e2e/suite-1-full-lifecycle-journey.spec.ts`
- **Coverage:**
  1. Public discovery, category bar dropdowns, search auto-complete, header/footer button audits.
  2. Seller `/organize` studio package wizard (step-by-step tier inputs, gallery, tags, publish) & `/my-packages` action controls.
  3. Buyer `/briefs/create` proposal submission & `/briefs/my-briefs` tracking.
  4. Cross-user real-time Socket.io chat messaging & file attachments (`/messages`).
  5. Seller `/earnings` dashboard, clearance timeline, and withdrawal modal trigger.

---

### **Suite 2: Payments, Exact 15% Fee Calculations, Disputes & Refunds**
- **File:** `tests/e2e/suite-2-payment-and-disputes.spec.ts`
- **Coverage:**
  - **Live Stripe Test Mode Automation:** Automatically fills and confirms test card `4242...` on the Stripe Checkout page.
  - **Exact 15% Platform Charge Verification:**
    - Baseline Order: `$100.00`
    - Platform Charge (15%): `$15.00`
    - Seller Net Payout (85%): `$85.00`
    - Escrow Lock: `$100.00`
  - **Scenario 1 (Full Buyer Refund):** 100% refunded to Buyer (`$100.00`), Seller receives `$0.00`, Order marked `cancelled`.
  - **Scenario 2 (Full Seller Release):** Seller receives **85%** (`$85.00` net after 15% platform deduction), Buyer receives `$0.00`, Order marked `completed`.
  - **Scenario 3 (Custom Split):** Admin inputs `$40.00` Buyer Refund:
    - Buyer receives: `$40.00`
    - Seller gross: `$60.00`
    - 15% Platform charge on seller gross: `$9.00`
    - Seller net payout: `$51.00`
  - **Scenario 4 (Direct Admin Cancellation):** 100% full refund to Buyer directly from the Admin Orders table.

---

### **Suite 3: Support Ticketing, Dual-Thread Isolation & Private Chat Security**
- **File:** `tests/e2e/suite-3-support-chat-and-security.spec.ts`
- **Coverage:**
  1. Buyer opens order-linked support ticket on `/support/new`.
  2. Admin accesses ticket on `/admin/support/:id` and replies in **Buyer Thread**.
  3. Buyer receives Admin response in real-time.
  4. Admin switches to **Seller Thread** and posts private seller instructions.
  5. **Privacy Boundary Assertion:** Asserts that Buyer CANNOT see private messages from the Seller Thread.
  6. Admin tests "Forward to Dispute" modal escalation.

---

### **Suite 4: Master Admin Operations, Sub-Admin Provisioning & 10 Admin Modules**
- **File:** `tests/e2e/suite-4-subadmin-and-admin-controls.spec.ts`
- **Coverage:**
  1. Master Admin logs into Admin Portal.
  2. Master Admin dynamically provisions a new Sub-Admin via `/admin/sub-admins` (No email OTP required).
  3. Sub-Admin authenticates with new credentials and inspects dashboard.
  4. Master Admin manages Sub-Admin (reassigns role, suspends account).
  5. Comprehensive button & module verification across all 10 Admin modules:
     - Dashboard (`/admin/dashboard`)
     - Categories (`/admin/categories`)
     - Users (`/admin/users`)
     - Orders (`/admin/orders`)
     - Disputes (`/admin/disputes`)
     - KYC Verification (`/admin/kyc`)
     - Moderation (`/admin/moderation`)
     - Support (`/admin/support`)
     - Roles & Permissions (`/admin/roles`)
     - Sub-Admins (`/admin/sub-admins`)

---

## 🚀 Execution Commands

From `workvence_frontend/`:

### Run All 14 Granular Modules (238 QA Matrix Cases)
```bash
pnpm test:e2e:modules
```

### Run All 4 Master Journey Suites
```bash
pnpm test:e2e:master
```

### Run Entire Suite (Master + Granular Modules)
```bash
pnpm test:e2e:full
```

### Run with Interactive Browser (Headed)
```bash
pnpm test:e2e:headed
```

---

## 🔒 Test Accounts & Target Environments

Configured in `tests/test-data/users.ts`:
- **Marketplace Base URL:** `https://dev.workvence.com`
- **Admin Portal Base URL:** `https://admin.workvence.com`

Required Environment Variables:
- **Admin:** `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- **Seller:** `SELLER_EMAIL` / `SELLER_PASSWORD`
- **Buyer:** `BUYER_EMAIL` / `BUYER_PASSWORD`
- **Sub-Admin:** Dynamically provisioned per run by the Master Admin without email verification.

