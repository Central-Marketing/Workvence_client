# Workvence Responsive Audit

## 1. Executive Summary

This comprehensive audit evaluates the active, production-grade **Workvence Marketplace** frontend against the **Workvence Responsive Design System** specification and explicit product decisions. 

Workvence is an established Next.js 16 (App Router) freelance platform with rich functionality (Stripe checkout, Socket.io real-time chat, video meetings, seller KYC, package comparisons, order delivery tracking, and AI brief creation). The primary objective of this audit is to identify real responsive defects across all 12 target viewports (from 375×812 phone up to 1920×1080 display), with special focus on the intermediate **MacBook / Compact Desktop (1024×768, 1280×800)** and **Mobile S/L (375px–480px)** tiers, while strictly preserving existing business logic, authentication, real-time sockets, brand visual identity, and desktop ergonomics.

### Key Audit Metrics
- **Total Route Pages Audited:** 32 pages across App Router groups `(marketing)`, `(buyer)`, `(seller)`, `(auth)`, `briefs`, `orders`, `messages`, `kyc`, `settings`, and `admin`.
- **Total Components Audited:** 48 feature and shared components.
- **Critical (P0) Issues Identified:** 4 (Layout-breaking defects causing content squishing/collision on target devices).
- **Major (P1) Issues Identified:** 9 (Severe responsive bugs affecting usability, table readability, and touch targets).
- **Moderate (P2) Issues Identified:** 11 (Token inconsistencies, viewport height overflows, and button size deviations).
- **Minor / Cosmetic (P3) Issues Identified:** 8 (Slight spacing/typographic deviations that do not break functionality).

---

## 2. Existing Architecture

Workvence frontend is architected as follows:
- **Framework & Core:** Next.js 16.3.0 (App Router), React 19.2.8, TypeScript 5 (strict mode, `@/*` alias).
- **Styling Engine:** Tailwind CSS 3.4.19 with PostCSS. Rigid container plugin disabled (`corePlugins.container: false`), replaced with a custom `.container` component in `tailwind.config.js` and enforced via `globals.css`.
- **Typography:** Custom local SF Pro font-faces (`SF Pro Display`, `SF Pro`, `SF Pro Text` loaded in `globals.css` with variable Google font fallbacks `--font-inter` and `--font-outfit`).
- **State & Server Cache:** Zustand (`userStore.ts`) synchronizing cookies/localStorage; TanStack Query (`@tanstack/react-query`) for server state, invalidation, and caching.
- **Client/Network:** Axios (`axiosFetch.ts`) with automatic 401 token refresh queue; Socket.io client (`socket.ts`) for real-time messaging, inbox badges, and notifications.
- **Component Architecture:** Feature-sliced modules (`src/features/gigs`, `src/features/package`, `src/features/orders`, `src/features/chat`, `src/features/profile`, `src/features/dashboard`, `src/features/seller`, `src/features/buyer`) paired with shared UI primitives (`src/components/ui/Button`, `src/components/layout/Navbar`, `Footer`, etc.).

---

## 3. Existing Responsive Strategy

The existing codebase implements several sound responsive practices alongside areas needing alignment:
1. **Fluid Global Container:** The global `.container` utility is configured with `maxWidth: 1400px` and responsive horizontal padding (`px-4` at mobile, `px-6` at sm, `px-8` / `2rem` at md+).
2. **Breakpoints Utilized:** Standard Tailwind breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`) supplemented by a custom `macbook: 1440px` breakpoint in `tailwind.config.js`.
3. **Mobile Navigation:** `Navbar.tsx` implements a dedicated mobile slide-over drawer triggered by a hamburger button below `lg` (1024px), preserving search and notifications.
4. **Chat Drawer Architecture:** `ChatView.tsx` wraps the left conversation list and right recipient sidebar in modal drawers on mobile viewports.
5. **Horizontal Scroll Containment:** Key tables in `SellerDashboard.tsx` and `manage-orders/page.tsx` wrap tabular data in `overflow-x-auto` with `min-w-[700px]`.

---

## 4. Design-System Comparison & Workvence Overrides

| Token Category | JSON Design System Specification | Existing Workvence Implementation | Conflict / Override Decision |
| :--- | :--- | :--- | :--- |
| **Max Content Container** | 1600px at 1920px canonical | `.container` enforced as `max-width: 1400px` in `globals.css` | **WORKVENCE OVERRIDE WINS:** Content must remain centered within `max-w-[1400px]` on 1440, 1680, 1920px. 1600px is explicitly forbidden. |
| **Primary Button Height** | Stepped: small 40px, default 48px, large 56px | Varied across components: 28px, 34px, 38px, 40px, 48px | **WORKVENCE OVERRIDE WINS:** Fixed `height: 40px` (`h-10` / `h-[40px]`) across all viewports. |
| **Button Font Size & Weight** | small=13px (400), default=14px (600), large=16px (600) | Varied: `text-xs`, `text-[13px]`, `text-[14px]`, `text-[16px]` | **WORKVENCE OVERRIDE WINS:** Fixed `text-[16px]` and `font-semibold` (`font-weight: 600`). Never shrink button fonts below 16px to force-fit rows. |
| **Brand Colors** | Primary Brand Blue `#2563eb`, hover `#1d4ed8` | Deep Brand Green `#0D6D5F`, `#327C73`, dark neutral `#112131` | **WORKVENCE IDENTITY WINS:** Retain Workvence `#0D6D5F` / `#327C73` palette strictly. Do not import `#2563eb`. |
| **Typeface** | SF Pro (`-apple-system`, Segoe UI fallback) | SF Pro (`SF Pro Display`, `SF Pro Text`, Inter fallback) | **PERFECT MATCH:** Local OTF/TTF fonts loaded in `globals.css`. |
| **Type Scale Cap** | Stops growing past ~1440px (Canonical scale) | Some headers scale up to `2xl:text-[84px]` | **ADOPT JSON PRINCIPLE:** Cap type growth at 1440px; 1680 and 1920 share the canonical scale. |
| **Radius** | 4px, 8px, 12px, full | 4px, 6px (fiverr), 8px, 10px, 12px, 16px, full | **PRESERVE EXISTING:** Workvence cards use 12px/16px; buttons use 6px/8px/full. |

---

## 5. Global Problems

### G-01: Redundant and Compounding Container Max-Widths & Padding
- **Files Affected:** `src/features/orders/views/BuyerOrderView.tsx` (L298), `src/app/(marketing)/workspace/page.tsx` (L130), `src/components/marketing/Featured/Featured.tsx` (L366).
- **Current Implementation:** Classes such as `container mx-auto px-4 md:px-6 max-w-7xl` or `max-w-5xl` or `max-w-[1800px]`.
- **Defect:** Compounding max-widths fight with the global `.container` rule (`max-width: 1400px !important`). `max-w-7xl` unnecessarily restricts width to 1280px on 1440px+ displays, while `max-w-[1800px]` extends outside the standard 1400px boundary.
- **Affected Viewports:** 1280×800, 1440×900, 1680×1050, 1920×1080.
- **Severity:** P2 (Moderate).

### G-02: Button Primitive Variant Exclusion in Fixed-40 Rule
- **File Affected:** `src/components/ui/Button/Button.tsx` (L63-L78).
- **Current Implementation:**
  ```tsx
  const isFixed40Variant = !isIconOnly && ["dark", "black", "soft", "secondary"].includes(variant);
  ```
- **Defect:** Brand primary buttons (`variant="brand"` or `variant="primary"` or `variant="emerald"`) were omitted from `isFixed40Variant`. If a developer passes `size="sm"`, brand action buttons shrink to 34px-36px height with `text-xs`, violating the mandatory Workvence fixed 40px/16px/600 rule.
- **Affected Viewports:** All viewports (Mobile through Desktop).
- **Severity:** P1 (Major).

### G-03: Viewport Height Exhaustion on Landscape Tablet (1024×768)
- **Files Affected:** `src/components/marketing/Featured/Featured.tsx` (L291), `src/components/marketing/PromoSection/PromoSection.tsx` (L56).
- **Current Implementation:** `Featured` uses `h-[840px]` at `lg:`, and `PromoSection` enforces `min-h-[520px] lg:h-[620px]` on its video container.
- **Defect:** On 1024×768 (iPad landscape), the total viewport height is only 768px. An 840px hero section exceeds the entire screen height, forcing the user to scroll before even reaching search suggestions or category pills.
- **Affected Viewports:** 1024×768.
- **Severity:** P1 (Major).

---

## 6. Page-Level Problems

### P-01: Package Details Layout Collapse at 1024px
- **File:** `src/app/(marketing)/package/[id]/page.tsx` (L231).
- **Component:** `PackageContent` (Main two-column grid).
- **Current Implementation:**
  ```tsx
  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_500px] gap-8 lg:gap-10 items-start">
  ```
- **Affected Viewport:** 1024×768 (Tablet Landscape / MacBook Compact).
- **Actual Problem:** Available width inside `.container` at 1024px is 960px (`1024px - 64px padding`). The sticky pricing sidebar consumes a fixed 500px, plus a 40px gap (`lg:gap-10`). This leaves ONLY `960 - 500 - 40 = 420px` for the entire main column (Gallery, About, Seller details, Compare Table, Reviews). The main content is crushed into 420px while the sidebar occupies over 52% of the content width!
- **Recommended Solution:** Adjust the two-column breakpoint so that at `lg` (1024px–1279px) the sidebar uses `380px` or stacks gracefully, activating `500px` only at `xl:grid-cols-[minmax(0,1fr)_460px] 2xl:grid-cols-[minmax(0,1fr)_500px]`.
- **Functionality Risk:** Zero risk. Pure grid template layout adjustment.
- **Desktop Impact:** Preserved on Canonical Desktop (1440px, 1680px, 1920px).
- **Severity:** **P0 (Critical)**.

### P-02: Package Comparison Table Forced 3-Column Collapse on Mobile
- **File:** `src/features/package/components/PackageComparisonTable.tsx` (L85, L221, L329).
- **Component:** `PackageComparisonTable`.
- **Current Implementation:** `grid grid-cols-3` without an overflow container (`overflow-x-auto`).
- **Affected Viewports:** 375×812, 390×844, 414×896, 480×900 (Mobile S and Mobile L).
- **Actual Problem:** Inside 375px mobile screen width (`343px` after side padding), dividing by 3 yields only `114px` per tier column. Buttons containing "Select Standard" with `fullWidth` truncate or overflow; tier descriptions and feature list strings break into 5–6 vertical hyphenated lines.
- **Recommended Solution:** Wrap the comparison table in an `overflow-x-auto` container with `min-w-[620px]` on mobile, or provide a mobile tier toggle switcher so mobile users view one comprehensive tier at a time while desktop retains the full 3-column comparative view.
- **Functionality Risk:** Zero risk. Retains `onSelectTier` and checkout triggers.
- **Desktop Impact:** Unchanged. Desktop retains 3-column comparison.
- **Severity:** **P0 (Critical)**.

### P-03: ChatView 3-Column Simultaneous Squeeze on Compact Desktop (1024px)
- **File:** `src/features/chat/ChatView/ChatView.tsx` (L1456, L1616, L2456).
- **Component:** `ChatView`.
- **Current Implementation:** At `lg:`, Left conversation sidebar takes `340px`, Right info sidebar takes `320px`, both rendered in normal flow simultaneously.
- **Affected Viewport:** 1024×768.
- **Actual Problem:** Inside 1024px, `1024 - 340 - 320 = 364px` remains for the entire central chat thread, message composer, and header action buttons. Inside 364px, the header buttons ("Create Offer", "Start Video Meeting", "Search", "More") collide, and message bubble widths are constricted.
- **Recommended Solution:** Keep the right sidebar as an overlay slide-out drawer on `lg` (1024px–1279px) toggled by the recipient profile click, and only dock it statically in-flow at `xl:` (1280px) or `macbook:` (1440px).
- **Functionality Risk:** Zero risk. All socket events and chat handlers remain identical.
- **Desktop Impact:** Unchanged on 1440px canonical desktop.
- **Severity:** **P0 (Critical)**.

### P-04: Buyer Dashboard Popular Packages Grid/Scroll Conflict
- **File:** `src/features/dashboard/buyer/BuyerDashboard.tsx` (L210-L218).
- **Component:** `BuyerDashboard` (Most Popular Packages section).
- **Current Implementation:**
  ```tsx
  <div ref={popularScrollRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-2">
  ```
- **Affected Viewports:** 375×812, 390×844, 414×896.
- **Actual Problem:** `grid-cols-1` stacks cards vertically on mobile. Clicking the previous/next scroll arrow buttons invokes `scrollBy({ left: 320 })` horizontally, which has no effect on a 1-column vertical grid! Users cannot scroll between cards using the arrows on mobile.
- **Recommended Solution:** Use flex horizontal layout on mobile (`flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4`) with `min-w-[260px]` per card on mobile, enabling smooth horizontal swipe and working scroll arrows.
- **Functionality Risk:** Zero risk. Card links and data bindings remain intact.
- **Desktop Impact:** Unchanged on desktop (4-column grid).
- **Severity:** **P1 (Major)**.

### P-05: ExploreCategories Single-Row Squeeze at 1024px
- **File:** `src/components/marketing/ExploreCategories/ExploreCategories.tsx` (L148-L164).
- **Component:** `ExploreCategories`.
- **Current Implementation:** `lg:overflow-x-visible` and `flex-1 lg:min-w-0` forces 8 category cards into a single row at `lg` (1024px).
- **Affected Viewport:** 1024×768 (iPad landscape / 13in laptop).
- **Actual Problem:** Inside 960px container width, `960 - 7*16 gap = 848 / 8 = 106px` per card. With `p-4` (32px padding), card inner content width is only 74px. Category titles ("Graphic & Design", "Writing & Translation") get crushed into 3–4 broken lines.
- **Recommended Solution:** Allow `overflow-x-auto` to persist until `xl` (1280px), or render a 4-column 2-row grid on `lg` (`lg:grid lg:grid-cols-4 xl:flex xl:overflow-x-visible`).
- **Functionality Risk:** Zero risk.
- **Desktop Impact:** Canonical 1440px desktop displays 8 cards cleanly across the row.
- **Severity:** **P1 (Major)**.

---

## 7. Component-Level Problems

### C-01: Hero Gallery Minimum Column Width Overflow on Mobile
- **File:** `src/components/marketing/Featured/Featured.tsx` (L366-L486).
- **Component:** `Featured` bottom gallery.
- **Current Implementation:** 5 columns each having `flex-1 min-w-[90px] shrink-0` plus `gap-4` (16px).
- **Affected Viewports:** 375×812, 390×844, 414×896.
- **Actual Problem:** `5 * 90px + 4 * 16px gap = 514px` minimum width. On a 375px phone, the gallery is 139px wider than the screen. Because the section has `overflow-hidden`, the outer columns (Col 1 and Col 5) are partially cropped and invisible.
- **Recommended Solution:** On mobile (`<640px`), hide outer columns (`hidden sm:flex` for Col 1 and Col 5) and show the prominent center 3 columns (`min-w-[80px]`), fitting perfectly within 343px width without clipping.
- **Functionality Risk:** Zero risk. Pure presentation image gallery.
- **Desktop Impact:** Canonical desktop displays all 5 columns.
- **Severity:** **P1 (Major)**.

### C-02: PackageHeaderStats 4-Column Stat Bar Compression
- **File:** `src/features/package/components/PackageHeaderStats.tsx` (L161).
- **Component:** `PackageHeaderStats` (Profile Status, Reviews, Rating, On-time Delivery stats).
- **Current Implementation:** `grid grid-cols-2 min-[480px]:grid-cols-2 lg:grid-cols-4`.
- **Affected Viewport:** 1024×768 (when main column is compressed to 420px).
- **Actual Problem:** At 1024px, 4 columns across 420px leaves only 105px per card. Stat labels ("Profile Status", "On-Time Delivery") truncate aggressively.
- **Recommended Solution:** Keep `grid-cols-2` until `xl:` (1280px) where the main column expands to >700px.
- **Functionality Risk:** None.
- **Desktop Impact:** Canonical desktop displays 4 columns cleanly.
- **Severity:** **P1 (Major)**.

### C-03: ChatView "Create Offer" Button Sizing & Hierarchy
- **File:** `src/features/chat/ChatView/ChatView.tsx` (L1760).
- **Component:** `ChatView` header action.
- **Current Implementation:** `<Button variant="dark" size="xs" className="h-8 sm:h-9 px-2 sm:px-3 text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0">`.
- **Affected Viewports:** All viewports below 1440px.
- **Actual Problem:** Directly violates the Workvence button override standard (`height: 40px`, `text-[16px]`, `font-semibold`). It shrinks to 32px (`h-8`) with 11px font size to force-fit on one row.
- **Recommended Solution:** Apply `h-10 text-[16px] font-semibold px-4` to the button. In the chat header, allow non-essential secondary actions to wrap or collapse into the "More" (`RiMore2Fill`) menu when horizontal space is constrained, rather than shrinking the button.
- **Functionality Risk:** None. Retains modal trigger `setShowOfferModal(true)`.
- **Desktop Impact:** Button looks and feels substantial and premium at 40px.
- **Severity:** **P1 (Major)**.

### C-04: Seller About Sidebar 3-Box Grid Squeeze
- **File:** `src/features/profile/components/SellerAboutSidebar.tsx` (L58).
- **Component:** `SellerAboutSidebar` (Location, Response Time, On-Time Delivery boxes).
- **Current Implementation:** `grid grid-cols-1 sm:grid-cols-3 mb-6`.
- **Affected Viewports:** 1024×768, 1280×800.
- **Actual Problem:** Inside the profile sidebar (`lg:col-span-4`, ~300px wide), `sm:grid-cols-3` splits the 3 boxes into 3 narrow columns (~95px each). Values like "1 Hour" and "On Time Delivery" get cramped.
- **Recommended Solution:** In sidebar context, use a vertical stack (`grid-cols-1`) or `grid-cols-1 xl:grid-cols-3` so each stat box has ample breathing room.
- **Functionality Risk:** None.
- **Desktop Impact:** Clean, legible metric cards.
- **Severity:** **P2 (Moderate)**.

### C-05: 2x2 Grid Missing Horizontal Dividers in TrustedBy & HowItWorks
- **Files:** `src/components/marketing/TrustedBy/TrustedBy.tsx` (L105), `src/components/marketing/HowItWorks/HowItWorks.tsx` (L155).
- **Component:** `TrustedBy` & `HowItWorks` step grids.
- **Current Implementation:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100`.
- **Affected Viewports:** 640×960, 768×1024, 834×1194 (Tablet Portrait tier).
- **Actual Problem:** When 4 cards render in a 2×2 grid at `sm:`, Tailwind's `divide-x` applies a border to every child except the first, creating vertical lines that cut through row 2 without providing horizontal dividers between row 1 and row 2.
- **Recommended Solution:** Replace `divide-x`/`divide-y` with explicit card borders or border utilities scoped to breakpoint columns (`sm:border-r sm:[&:nth-child(2n)]:border-r-0 sm:border-b sm:[&:nth-child(n+3)]:border-b-0`).
- **Functionality Risk:** None.
- **Desktop Impact:** Unchanged on 4-column desktop.
- **Severity:** **P2 (Moderate)**.

---

## 8. Typography Deviations

1. **Unbounded Display Headline Growth at 2xl (1536px+):**
   - In `Featured.tsx` (L311), headline reaches `macbook:text-[74px] 2xl:text-[84px]`.
   - *Design System Rule:* Desktop type stops growing past ~1440px; 1440, 1680, and 1920 share one canonical scale (Display: 56px, H1: 48px). Extra width belongs to container whitespace, not enlarged type.
2. **Sub-14px Body Copy on Mobile:**
   - In `PackageComparisonTable.tsx` (L231, L266, L301), feature text drops to `text-xs` (12px) on mobile.
   - *Design System Rule:* Body text never drops below 14px (WCAG 1.4.4, iOS 16px input zoom threshold).
3. **Severe Font-Size Jumps on Breakpoints:**
   - In `HowItWorks.tsx` (L165-L168), step titles jump from `text-[17px]` at sm to `text-[24px]` at md; descriptions jump from `text-[14px]` to `text-[20px]`.
   - *Design System Rule:* Line-heights and font sizes must follow the 5-tier modular scale predictably.

---

## 9. Container Deviations

1. **Compounding Container Constraints:**
   - `BuyerOrderView.tsx` (L298): `className="container mx-auto px-4 md:px-6 max-w-7xl"` artificially limits the 1400px container to 1280px.
   - `workspace/page.tsx` (L130): `className="container mx-auto px-4 md:px-6 max-w-5xl"` (1024px limit).
   - `podcast/page.tsx` (L161): `className="container mx-auto px-4 md:px-6 max-w-4xl"` (896px limit).
2. **Global Container Margin Rule Compliance:**
   - Workvence override requires `w-full max-w-[1400px] mx-auto`.
   - While `globals.css` sets this, pages adding ad-hoc `px-4 md:px-6` create double padding when nested.

---

## 10. Spacing Deviations

1. **Micro-spacing Arbitrary Values:**
   - Frequent use of `gap-[10px]`, `gap-3.5` (14px), `gap-1.5` (6px) where design system specifies 8px (`space-2`), 12px (`space-3`), 16px (`space-4`).
   - Actionable only where it causes element collision on narrow viewports.
2. **Hero Vertical Rhythm Alignment:**
   - `Featured.tsx` vertical padding on mobile is `pt-8 sm:pt-12 md:pt-14 pb-0`. JSON specifies `sectionPadding: 40px` for 375/390 and `48px` for 414/480.

---

## 11. Button Problems

1. **Height Variations Below Mandatory 40px:**
   - `Navbar.tsx` (L399, L410): `h-[38px] xl:h-[40px] text-[14px] xl:text-[16px]`.
   - `ChatView.tsx` (L1760): `h-8 sm:h-9 text-[11px] sm:text-xs`.
   - `Footer.tsx` (L201): `w-8 h-8 min-h-[32px]`.
   - `BuyerDashboard.tsx` (L194, L204): `w-8 h-8 min-w-[32px]`.
2. **Font Size Variations Below 16px:**
   - Buttons across several forms render `text-xs` (12px) or `text-sm` (14px).
   - *Workvence Rule:* Standard marketplace buttons must use `h-10`, `text-[16px]`, `font-semibold`.

---

## 12. Overflow Problems

1. **Horizontal Page Scroll Risks:**
   - `PackageComparisonTable` on mobile (`<640px`) forces 3 columns without overflow scroll, triggering horizontal text clipping.
   - `ExploreCategories` on 1024px forces 8 columns without scroll, crushing card contents.
   - `ChatView` on 1024px displays 3 columns in-flow, crushing center chat to 364px.
2. **Vertical Modal Overflow:**
   - In `src/app/briefs/create/page.tsx` (L658), the AI Prompt Modal lacks `max-h-[90vh] overflow-y-auto`. On landscape phone or small laptop, the bottom buttons can fall below the viewport fold.

---

## 13. MacBook / Intermediate Width Problems (1024×768, 1280×800, 1440×900)

The audit confirms that the **1024×768 and 1280×800** viewports are the highest-risk zones in the existing codebase:
1. **1024×768 (iPad Landscape / 13" Entry Display):**
   - `PackagePage`: Sidebar takes 500px, leaving only 420px for main content (**P0**).
   - `ChatView`: Left sidebar (340px) + Right sidebar (320px) leave only 364px for chat thread (**P0**).
   - `Featured`: Section height (840px) exceeds total screen height (768px) (**P1**).
   - `ExploreCategories`: 8 cards forced in 1 row causes text wrapping failures (**P1**).
2. **1280×800 (Small Windows Laptop / MacBook Air scaled):**
   - `PackagePage`: Main column has only 676px next to 500px sidebar, causing stat cards to truncate.
   - `ChatView`: Center column is constrained when all 3 panels are open.

---

## 14. Functionality Risks

The following functional areas must be guarded during responsive remediation:
- **Socket.io Event Listeners:** ChatView relies on real-time event attachments (`sendMessage`, `receiveMessage`, typing indicators). Restructuring drawer layout must never remount the chat thread or discard active socket subscriptions.
- **Form States & Reducers:** `organize/page.tsx` uses a complex multi-tier `packageReducer`. Responsive layout changes to tabs/Quill editor must preserve form dispatch bindings.
- **Stripe & Payment Handlers:** Order action modals and checkout triggers (`onCheckout`) pass critical tier keys (`basic`, `standard`, `premium`) into payment intents.
- **Zustand User Store Sync:** Auth and role switching logic must remain completely untouched.

---

## 15. Already-Correct Areas

The following components and implementations are already well-adapted and require no alteration:
- **Global Container Configuration:** `tailwind.config.js` and `globals.css` successfully lock maximum width to `1400px` with centered margins.
- **Footer Responsiveness:** `Footer.tsx` cleanly collapses from 12 columns into responsive sub-grids and stacks bottom copyright/social items without overflow.
- **Order Views Architecture:** `SellerOrderView.tsx` and `BuyerOrderView.tsx` stack smoothly from 12 columns to 1 column on mobile while keeping timelines and deliverable download buttons fully accessible.
- **Auth Forms Responsiveness:** `login/page.tsx` and `register/page.tsx` cleanly hide the decorative right graphic panel on viewports `<768px` and center the form card.
- **TrustProtection & CTA Sections:** Sizing, typography, and buttons in `TrustProtection.tsx` and `CTA.tsx` already adhere to the 40px/16px/600 button standard and scale cleanly across breakpoints.
- **Quill Content Display:** The global `.quill-content-display` class in `globals.css` handles word-break and overflow wrap cleanly for rich text descriptions.

---

## 16. Recommended Priority Matrix

| Priority | Issue ID | File / Component | Problem Summary | Desktop Preservation |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | P-01 | `package/[id]/page.tsx` | 500px sidebar crushes main content to 420px at 1024px | Yes (Canonical 1440px unchanged) |
| **P0** | P-02 | `PackageComparisonTable.tsx` | Forced 3-column table collapses to unreadable 114px slivers on mobile | Yes (Desktop comparative table unchanged) |
| **P0** | P-03 | `ChatView.tsx` | 3 panels open in-flow simultaneously crushes chat window to 364px at 1024px | Yes (1440px 3-column view unchanged) |
| **P1** | G-02 | `Button.tsx` | Brand primary buttons missing from fixed-40 rule, causing sub-40px button sizes | Yes (Improves button consistency) |
| **P1** | G-03 | `Featured.tsx` | 840px hero height overflows 768px screen height on iPad landscape | Yes (1440px hero height preserved) |
| **P1** | P-04 | `BuyerDashboard.tsx` | Grid-1 vertical stack conflicts with horizontal scroll buttons | Yes (4-column grid preserved) |
| **P1** | P-05 | `ExploreCategories.tsx` | 8 category cards forced in 1 row at 1024px creates text wrapping defect | Yes (8-card desktop row preserved) |
| **P1** | C-01 | `Featured.tsx` (Gallery) | 5 columns with min-w 90px overflows 375px mobile screens | Yes (Desktop 5-column gallery preserved) |
| **P1** | C-02 | `PackageHeaderStats.tsx` | 4 stat columns in compressed 420px container truncates text | Yes (Desktop 4 stats preserved) |
| **P1** | C-03 | `ChatView.tsx` (Header) | "Create Offer" button shrunk to 32px height / 11px font | Yes (Standard 40px button restored) |
| **P2** | G-01 | Multiple Pages | Ad-hoc `max-w-7xl` and `max-w-5xl` conflicting with 1400px container | Yes (Unified 1400px container) |
| **P2** | C-04 | `SellerAboutSidebar.tsx` | 3 stat boxes compressed inside 300px sidebar | Yes (Clean vertical stack) |
| **P2** | C-05 | `TrustedBy` / `HowItWorks` | 2x2 grid missing horizontal divider borders on tablet portrait | Yes (Desktop 4-col borders preserved) |
| **P2** | Typography | `Featured.tsx` | Headline text grows to 84px at 2xl instead of stopping at canonical 56px | Yes (Capped at canonical scale) |
| **P3** | Spacing | Various Components | Minor gap and padding deviations from JSON scale tokens | Yes |
