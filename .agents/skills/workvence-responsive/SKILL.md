---
name: workvence-responsive
description: Comprehensive rules, design tokens, and engineering workflows for auditing, implementing, and maintaining responsiveness across the Workvence marketplace without breaking desktop design or existing functionality.
---

# Workvence Responsive Engineering

## Purpose

This skill teaches AI agents and developers how to engineer, audit, fix, and maintain responsive layouts across the **Workvence Marketplace** frontend. It ensures that every screen size—from small mobile phones to 4K desktop monitors—functions seamlessly and looks exceptional without compromising desktop ergonomics or altering core business functionality.

---

## When to Use

Activate this skill when:
- Creating new marketplace pages, components, or feature flows.
- Fixing mobile layout, overflow, or responsive bugs.
- Resolving intermediate viewport defects on MacBook (1024px–1440px).
- Adding form controls, modals, tables, or navigation items.
- Performing responsive regression audits and QA across viewports.

---

## Source of Truth

The primary source of truth is the **Workvence Responsive Design System** specification combined with the following **explicit Workvence product overrides**:

1. **Global Content Container:**
   - Maximum content width is strictly **1400px** (`max-w-[1400px] mx-auto w-full`).
   - Content must remain centered on screens > 1400px (1440px, 1680px, 1920px).
   - **DO NOT** use a 1600px maximum content width.
2. **Button System Baseline:**
   - Fixed height: **40px** (`h-10` or `h-[40px]`).
   - Fixed font size: **16px** (`text-[16px]`).
   - Fixed font weight: **600** (`font-semibold`).
   - Layout around buttons adapts (wrapping, stacking); the button size itself **never shrinks**.
3. **Brand Visual Identity:**
   - Primary Action Green: `#0D6D5F`
   - Brand Green: `#327C73`
   - Neutral Surface Dark: `#0f172a` / `#112131`
   - **DO NOT** swap Workvence green tokens for generic `#2563eb` blue.

### Priority Order for Responsive Decisions
1. Existing functionality
2. Existing Workvence visual identity
3. 1400px maximum content width
4. 40px fixed button height
5. 16px button font size
6. 600 button font weight
7. Responsive layout adapting around controls
8. Supplementary design-system recommendations

---

## Responsive Tiers

Workvence defines **five responsive tiers** across 12 target viewports:

| Tier ID | Tier Name | Viewport Targets | Columns | Margin | Gutter | Container Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `mobile-s` | Mobile S | 375×812, 390×844 | 4 | 16px | 16px | Fluid |
| `mobile-l` | Mobile L | 414×896, 480×900 | 4 | 20–24px | 16px | Fluid |
| `tablet-portrait` | Tablet Portrait | 640×960, 768×1024, 834×1194 | 8 | 24–32px | 20–24px | Fluid |
| `tablet-landscape-desktop-compact` | Tablet Landscape / Desktop Compact | 1024×768, 1280×800 | 12 | 40–48px | 24px | Fluid within 1400px max |
| `desktop-canonical` | Desktop Canonical | 1440×900, 1680×1050, 1920×1080 | 12 | 64–96px | 24–32px | Max 1400px Centered |

---

## Viewport Matrix

Every responsive modification must be verified against all 12 targets:
1. `375 × 812` — iPhone SE / mini class
2. `390 × 844` — Standard iPhone 12–16 class
3. `414 × 896` — Plus / Max / Pixel class
4. `480 × 900` — Phablet / large mobile
5. `640 × 960` — Small tablet / landscape phone (`sm:`)
6. `768 × 1024` — iPad portrait (`md:`)
7. `834 × 1194` — iPad Air / Pro 11in portrait
8. `1024 × 768` — iPad landscape / entry laptop (`lg:`)
9. `1280 × 800` — Small laptop / MacBook Air scaled (`xl:`)
10. `1440 × 900` — Standard MacBook Air/Pro 13–14in (`macbook:`)
11. `1680 × 1050` — Large laptop / external monitor
12. `1920 × 1080` — Desktop / iMac / 1080p external display (`2xl:`)

---

## Existing Code Protection

> [!CAUTION]
> **CRITICAL CARDINAL RULES:**
> 1. "Do not modify business logic while performing responsive work."
> 2. "Do not remove existing functionality to make a layout fit."
> 3. "Do not hide functionality simply because the viewport is narrow unless the design explicitly defines a responsive alternative."

If an element cannot fit in a narrow viewport:
- **FIRST:** Restructure the layout (e.g., convert `flex-row` to `flex-col`, wrap with `flex-wrap`).
- **SECOND:** Use CSS Grid with adaptive `minmax(0, 1fr)`.
- **THIRD:** Reduce non-essential container padding or gaps.
- **FOURTH:** Apply `min-w-0` and `truncate` to long descriptive copy.
- **ONLY THEN:** Consider responsive drawer, accordion, or toggleable visibility.

Never delete:
- Click handlers (`onClick`)
- Form inputs, validation rules, or error states
- Query invalidation or TanStack Query hooks
- Socket.io connection listeners (`socket.ts`)
- Stripe checkout or payment intent flows

---

## Typography Rules

1. **Type Growth Cap:**
   - Desktop typography stops growing past ~1440px.
   - Viewports at 1440px, 1680px, and 1920px share one canonical scale.
   - Do **NOT** use utilities like `2xl:text-[84px]`.
2. **Minimum Body Size:**
   - Body copy must **never drop below 14px** on mobile (WCAG 1.4.4 compliance and iOS auto-zoom prevention).
   - Form inputs must use `text-[16px]` on mobile to prevent Safari viewport zooming.
3. **Hierarchy Reference:**
   - `Display`: 32px (mobile) → 42px (tablet) → 56px (canonical desktop)
   - `H1`: 28px (mobile) → 34px (tablet) → 48px (canonical desktop)
   - `H2`: 24px (mobile) → 28px (tablet) → 36px (canonical desktop)
   - `H3`: 20px (mobile) → 24px (tablet) → 28px (canonical desktop)
   - `H4`: 18px (mobile) → 20px (tablet) → 22px (canonical desktop)
   - `Body`: 14px (mobile) → 16px (tablet/desktop)
   - `BodySmall`: 13px (mobile) → 14px (desktop)

---

## Container Rules

1. **Primary Container Pattern:**
   ```tsx
   <div className="container mx-auto">
   ```
   or
   ```tsx
   <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
   ```
2. **Never Compound Containers:**
   - Do **not** apply `max-w-7xl`, `max-w-5xl`, or `max-w-4xl` directly to an element that already carries the `.container` class unless creating an intentionally narrow reading column (e.g. single-column blog post or KYC form).
3. **Large Screen Centering:**
   - On displays >= 1440px, remaining viewport width is distributed as clean white space outside the centered 1400px container.

---

## Spacing Rules

1. Use standard Tailwind spacing tokens aligned with the 4px/8px grid:
   - `space-1` = 4px (icon-to-label gap)
   - `space-2` = 8px (tight stacks, chip padding)
   - `space-3` = 12px (form field gaps)
   - `space-4` = 16px (mobile side margins, card padding)
   - `space-6` = 24px (desktop card padding, button padding)
   - `space-8` = 32px (gaps between section sub-blocks)
   - `space-12` = 48px (mobile section vertical padding)
   - `space-20` / `space-24` = 80px / 96px (desktop section vertical padding)
2. Avoid random arbitrary values like `gap-[7px]` or `p-[19px]`.

---

## Button Rules

1. **Standard Marketplace Button Baseline:**
   ```tsx
   <Button
     variant="brand" // or "dark", "soft", "outline"
     size="md"
     radius="fiverr"
     className="..."
   >
     Action Label
   </Button>
   ```
   Renders: `h-[40px] text-[16px] font-semibold inline-flex items-center justify-center`.
2. **Forbidden Anti-Patterns:**
   - ❌ `h-8 text-xs` to force-fit buttons on mobile rows.
   - ❌ `h-[38px] text-[14px]` on 1024px laptop viewports.
   - ❌ Shrinking button fonts below 16px.
3. **Adaptive Button Groups:**
   - Desktop: `flex items-center gap-3`
   - Mobile: `flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto`

---

## Layout Rules

1. **Flex Child Protection:**
   - Always pair `flex-1` with `min-w-0` on columns containing text, titles, or inputs to allow text truncation without blowing out container bounds.
2. **Responsive Grid Restructuring:**
   - 4-column cards (e.g. package grids):
     `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5`
   - Never jump directly from `grid-cols-1` to `lg:grid-cols-4` without an intermediate `sm:grid-cols-2`.
3. **Image Aspect Ratios:**
   - Use Tailwind aspect utilities (`aspect-[16/9]`, `aspect-square`, `aspect-[405/220]`) with Next.js `<Image fill className="object-cover" />` rather than fixed pixel heights.

---

## Overflow Rules

1. **Zero Document Scroll:**
   - The root body must never exhibit horizontal scroll (`overflow-x: hidden` or constrained child containers).
2. **Scroll Affordance:**
   - Any component requiring horizontal scrolling (e.g., category pill bars, dense tables) must use:
     `overflow-x-auto scrollbar-none scroll-smooth`
   - Ensure touch scrolling is enabled (`-webkit-overflow-scrolling: touch`).

---

## Header Rules

1. **1024px Compression Prevention:**
   - On `lg` (1024px–1279px), constrain search bar width (`lg:max-w-[240px] xl:max-w-[420px]`) and reduce navlink padding (`px-2 xl:px-4`).
2. **Mobile Drawer Standard:**
   - Preserve slide-over mobile menu below `lg:` (1024px).
   - Ensure mobile menu close button (`FiX`) has a minimum 44px tap target.

---

## Form Rules

1. **Form Input Sizing:**
   - Standard inputs: `h-11` or `py-3 px-4 rounded-xl text-[16px]`.
   - Never use `text-xs` on mobile form inputs to avoid browser zooming.
2. **Stacking on Mobile:**
   - Multi-column inputs (`grid-cols-2` or `grid-cols-3` for city/country/zip) must stack into `grid-cols-1 sm:grid-cols-2` on mobile.

---

## Modal Rules

1. **Universal Mobile Box Sizing:**
   - All modals must employ:
     `max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden rounded-2xl`
   - Modal body must carry `overflow-y-auto p-4 sm:p-6`.
   - Modal footer actions must remain pinned or easily reachable.

---

## Table Rules

1. **Data-Dense Tables:**
   - Always wrap `<table className="w-full min-w-[700px]">` in `<div className="w-full overflow-x-auto scrollbar-none">`.
2. **Comparison Tables (Package Comparison):**
   - On mobile, allow horizontal swipe across tiers or provide a tier segmented pill switcher so individual tiers render legibly without being crushed into 100px columns.

---

## Chat Rules

1. **Compact Desktop (1024px):**
   - Keep the right conversation info panel in an overlay slide-out drawer below `xl:` (1280px).
   - Render the right panel in-flow only at `>= 1280px` to maintain a spacious center chat thread (`>= 680px`).
2. **Socket Safety:**
   - Drawer toggling must only affect CSS classes/visibility; never unmount the underlying `ChatView` container.

---

## MacBook Rules (1024×768, 1280×800)

1. Explicitly test 1024×768 and 1280×800 on every layout change.
2. Ensure two-column layouts (e.g. Package details + Sticky sidebar) do not allot disproportionate width to the sidebar (limit sidebar to <=380px at 1024px).
3. Ensure section heights do not exceed 700px on landscape tablet viewports.

---

## Implementation Workflow

Follow this systematic 5-step workflow when executing responsive work:
1. **Inspect Existing DOM:** Run `grep_search` to find existing classes, handlers, and state bindings.
2. **Apply Minimal Diff:** Adjust Tailwind utility classes without renaming variables or changing component hierarchy.
3. **Verify Fixed Baseline:** Confirm button height remains 40px, button font remains 16px, and container is within 1400px.
4. **Compile Check:** Run `pnpm exec tsc --noEmit` to ensure zero TypeScript errors.
5. **Multi-Viewport Audit:** Verify across all 12 viewport targets.

---

## Validation Workflow

Before declaring any responsive task complete, verify:

```bash
# 1. Strict TypeScript compilation
pnpm exec tsc --noEmit

# 2. Linting verification
pnpm lint
```

Manually or via Playwright test against all 12 targets:
- `375×812` & `390×844` (Mobile S)
- `414×896` & `480×900` (Mobile L)
- `640×960` & `768×1024` & `834×1194` (Tablet Portrait)
- `1024×768` & `1280×800` (Tablet Landscape / MacBook Compact)
- `1440×900` & `1680×1050` & `1920×1080` (Desktop Canonical)

---

## Completion Checklist

- [ ] Zero horizontal document scrollbar on mobile.
- [ ] No clipped or overlapping text.
- [ ] All standard action buttons use `h-10 text-[16px] font-semibold`.
- [ ] Maximum marketplace content width is capped at 1400px and centered.
- [ ] Desktop layout on 1440px+ is completely preserved.
- [ ] All `onClick`, form submits, socket messages, and API calls function identically.
- [ ] TypeScript check exits with 0 errors (`pnpm exec tsc --noEmit`).
