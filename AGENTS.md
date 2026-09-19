<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Workvence Frontend — AI Agent Guidelines & Operating Rules

> **CRITICAL CARDINAL RULE:**
> **PRESERVE THE EXISTING PROJECT. DO NOT BREAK, REMOVE, DELETE, OR REPLACE EXISTING FUNCTIONALITY WITHOUT EXPLICIT PERMISSION FROM THE USER.**
> 
> You are working on an active, production-grade freelance marketplace platform (**Workvence**). Before making ANY change, inspect the existing codebase, understand the established patterns, and apply the minimal change necessary to accomplish the user's explicit request.

---

## 1. Project Architecture & Directory Structure

Workvence frontend is built with **Next.js 16 (App Router)** and TypeScript. The source code resides in `src/` following a hybrid feature-based and modular architecture:

```
workvence_frontend/
├── .env                              # Environment variables
├── AGENTS.md                         # This operating manual (preserve top Next.js block)
├── next.config.ts                    # Next.js config (standalone output, rewrites, remote images, redirects)
├── package.json                      # Project dependencies & scripts (pnpm is the package manager)
├── playwright.config.ts              # E2E test runner configuration
├── tailwind.config.js                # Custom container fluid plugin, typography, brand colors, screen breakpoints
├── tsconfig.json                     # Strict TypeScript config with @/* path alias
├── public/                           # Static assets, logos, and custom SF Pro fonts (/fonts/sf-pro/)
├── tests/                            # Playwright E2E suites, journey tests, and test helpers
│   ├── e2e/                          # Production dual-user journeys (buyer & seller)
│   ├── fixtures/                     # Test fixtures and accounts
│   └── helpers/                      # OTP polling, temp-mail providers, network assertions
└── src/
    ├── app/                          # Next.js 16 App Router pages, route groups & layouts
    │   ├── (auth)/                   # Guest authentication routes: /login, /register, /forgot-password, /reset-password
    │   ├── (buyer)/                  # Buyer-specific routes: /favorites, /orders, etc.
    │   ├── (marketing)/              # Public routes: /, /packages, /seller/[username], /trust-safety, etc.
    │   ├── (seller)/                 # Seller routes: /organize, /organize/[id], /my-packages, /earnings
    │   ├── admin/                    # Admin portal routes
    │   ├── briefs/                   # Job briefs: /briefs/create, /briefs/my-briefs
    │   ├── buyer/                    # Buyer profile / dashboard
    │   ├── dashboard/                # Central role-based dashboard router
    │   ├── kyc/                      # Identity verification & KYC submission
    │   ├── manage-orders/            # Seller order management
    │   ├── message/ & messages/      # Real-time chat & conversation threads
    │   ├── notifications/            # Notification center
    │   ├── orders/                   # Order tracking, details & delivery
    │   ├── profile/                  # User profile management
    │   ├── seller/                   # Seller profile / dashboard / suspended status
    │   ├── settings/                 # Account settings, security & verification
    │   ├── support/                  # Support ticketing system
    │   ├── globals.css               # Global CSS, SF Pro font-faces, Quill editor theme overrides
    │   ├── layout.tsx                # Root layout (Inter + Outfit variable fonts, Providers, LayoutWrapper)
    │   └── Providers.tsx             # TanStack QueryClientProvider, Toaster, GlobalSocketListener
    ├── components/                   # Reusable shared components
    │   ├── layout/                   # Navbar, Footer, Sidebar, LayoutWrapper
    │   ├── marketing/                # Hero, Featured, Testimonials, CategorySliders
    │   └── ui/                       # Buttons, Modals, Loaders, Skeletons, Dropdowns, Inputs
    ├── data/                         # Static datasets, category mocks, country lists
    ├── features/                     # Feature-sliced modules (business logic + views)
    │   ├── admin/                    # Admin moderation, category management, logs
    │   ├── auth/                     # Auth forms, OTP verification, password reset
    │   ├── buyer/                    # Buyer dashboard, order views, favorites
    │   ├── chat/                     # ChatView, message bubbles, attachments, socket events
    │   ├── dashboard/                # Role-based dashboards (BuyerDashboard, SellerDashboard)
    │   ├── gigs/                     # Package cards, category cards, reviews, gig details
    │   ├── kyc/                      # KYC form steps and document upload
    │   ├── orders/                   # Order timelines, delivery modal, buyer/seller views
    │   ├── package/                  # Package detail view components
    │   ├── profile/                  # Public profiles, seller normalizers, skill tags
    │   ├── seller/                   # Seller dashboards, earnings charts
    │   └── support/                  # Ticket lists, chat support, resolution workflows
    ├── hooks/                        # Custom React hooks
    │   ├── useAdminCategories.ts     # Hierarchical category/subcategory/niche resolver
    │   ├── useDebounce.ts            # Input debouncing hook
    │   └── useSupportSocket.ts       # Support chat socket events hook
    ├── lib/                          # External client wrappers & socket connection factories
    ├── proxy.ts                      # Server-side proxy & route protection middleware
    ├── reducers/                     # State reducers for complex forms (packageReducer.ts)
    ├── services/                     # Server services (gigService.server.ts)
    ├── store/                        # Zustand stores (userStore.ts - auth state & cookie sync)
    ├── types/                        # Strongly-typed TypeScript interfaces
    │   ├── brief.ts, chat.ts, gig.ts, order.ts, user.ts, kyc.ts, support.ts, earnings.ts
    └── utils/                        # Core utilities & API clients
        ├── axiosFetch.ts             # Main Axios instance with auto 401 token refresh queue
        ├── adminAxios.ts             # Dedicated admin API client (/api/admin)
        ├── tokenRefresh.ts           # Cookie/token management & refresh handshake
        ├── socket.ts                 # Socket.io connection manager
        ├── supportService.ts         # Cloudinary / CDN upload & support utilities
        ├── generateImageURL.ts       # Fallback CDN / ImgBB uploader
        └── countriesFlags.ts         # Country dial codes and flags
```

---

## 2. Technology Stack & Dependencies

AI agents must strictly respect the installed tech stack and never install competing or redundant packages:

- **Framework:** Next.js `16.3.0` (App Router, Turbopack compatible, standalone output)
- **Core Runtime:** React `19.2.8` & React DOM `19.2.8`
- **Language:** TypeScript `^5` (strict mode, path alias `@/*` pointing to `./src/*`)
- **Package Manager:** `pnpm` (use `pnpm`, not npm or yarn)
- **Styling:** Tailwind CSS `3.4.19` + PostCSS + Autoprefixer
- **State Management:**
  - `zustand` (`^5.0.14`) — Client session & auth state (`src/store/userStore.ts`)
  - `@tanstack/react-query` (`^5.101.4`) — Server state caching, query invalidation, optimistic updates
  - React `useReducer` — Complex multi-tier form workflows (`src/reducers/packageReducer.ts`)
- **HTTP Client:** `axios` (`^1.19.0`) with interceptors for token attachment and automatic 401 refresh
- **Real-Time Communication:** `socket.io-client` (`^4.8.3`) for real-time messaging, notifications, and support tickets
- **Payments:** `@stripe/react-stripe-js` (`^6.8.0`) & `@stripe/stripe-js` (`^9.13.0`)
- **Rich Text Editor:** `react-quill-new` (`^3.8.3`) with custom `.quill-snow` theme overrides
- **Icons:** `lucide-react` (`^1.28.0`) and `react-icons` (`^5.7.0`) — **Do not install other icon packs**
- **Sliders & Media:** `swiper` (`^14.0.7`), `react-slick` (`^0.31.0`), `pure-react-carousel`
- **Notifications:** `react-hot-toast` (`^2.6.0`) with global `ToastLimitEnforcer`, `sweetalert2` (`^11.26.25`)
- **Charts:** `recharts` (`^3.10.1`)
- **Animation:** `gsap` (`^3.15.0`) & `@gsap/react` (`^2.1.2`)
- **Testing:** Playwright (`@playwright/test` `^1.63.0`)

---

## 3. UI, Design System & Styling Preservation Rules

Workvence has a distinctive, polished aesthetic that must be strictly preserved across all edits:

1. **Brand Colors:**
   - **Primary Action Green:** `#0D6D5F` (used across buttons, active tabs, highlights, borders, and brand accents).
   - **Tailwind Palette:** `brand-green` (`#327C73`), `brand-light` (`#6AD724`), `brand-black` (`#112131`).
   - **CSS Theme Tokens:** `--green-color` (`#10b981`), `--dark-green` (`#0f172a`), `--gray-color` (`#64748b`), `--accent-color` (`#10b981`).
   - **Backgrounds:** Off-white surfaces `#F8F9FA` or `#f8fafc`, pure white card containers `#ffffff`.
   - **Neutral Text:** Dark titles `#0f172a` / `#1e293b`, muted subtitles `#64748b` / `#94a3b8`.
   - **DO NOT** introduce random saturated purples, blues, or unbranded greens.

2. **Typography:**
   - **Primary Font:** `SF Pro Display`, `SF Pro`, `SF Pro Text` (loaded locally from `/fonts/sf-pro/` in `globals.css`).
   - **Secondary Google Fonts:** Inter (`var(--font-inter)`), Outfit (`var(--font-outfit)`).
   - Do not replace or reconfigure font definitions in `globals.css` or `layout.tsx`.

3. **Layout & Container:**
   - Notice that Tailwind's rigid container plugin is disabled (`container: false` in `tailwind.config.js`).
   - A custom fluid `.container` component is defined with breakpoint-specific side padding:
     - Mobile: `paddingLeft/Right: 1rem`
     - `sm`: `1.5rem`
     - `md`: `2rem`
     - `lg`: `3rem`
     - `xl` & `2xl`: `80px`
   - Custom screen breakpoint: `macbook: '1440px'`.

4. **Component Styling Tokens:**
   - **Border Radii:** Rounded cards use `rounded-2xl` or `rounded-xl`. Buttons and pills use `rounded-xl` or `rounded-full`.
   - **Borders:** Subtle gray borders: `border border-gray-200` or `border-gray-200/80`.
   - **Shadows:** Minimalist modern shadows: `shadow-2xs`, `shadow-xs`, `shadow-[0_1px_6px_rgba(0,0,0,0.02)]`.
   - **Inputs:** `bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-[13px]`.
   - **Buttons:** Dark primary buttons `bg-black hover:bg-gray-900 text-white`, brand buttons `bg-[#0D6D5F] hover:bg-[#0b5c50] text-white`, outline buttons `border border-gray-200 hover:bg-gray-50`.
   - **Icons:** Use `lucide-react` consistently with existing sizing (`w-4 h-4` or `w-3.5 h-3.5`).

5. **Aesthetics & Non-Destructive Editing:**
   - Never redesign a page or component when asked to fix a bug or add a field.
   - Match existing component classes and spacing directly from neighboring markup.
   - Do not touch layouts, headers, footers, or sidebars unless explicitly instructed.

---

## 4. Functionality Preservation Rules

You are forbidden from breaking or removing existing functionality:

- **Never remove features to "simplify":** Do not remove features (e.g. pricing tiers, attachments, filters, FAQs, chat capabilities, delivery timers) because they appear complex.
- **Never delete existing components or routes** without explicit permission.
- **Never alter authentication or role guards:** The system differentiates between Buyers, Sellers, and Admins. Do not bypass permissions or role validation to "make code run".
- **Never remove form fields or validation rules:** Unless the user specifically asks to change a field, keep all existing fields, validations, helper texts, and error toasts intact.
- **Never remove search, filtering, or pagination:** Preserve query params, category selection, subcategory filtering, and niche hierarchy.
- **Never remove real-time socket connections:** Workvence relies on Socket.io for messaging, notifications, and order updates. Ensure socket events (`sendMessage`, `receiveMessage`, `notification`, etc.) are maintained.
- **Never remove payment or escrow logic:** Stripe checkout, payment intents, milestone releases, and order flows must remain intact.
- **Never delete dependencies:** Never run `pnpm remove` or delete packages from `package.json` assuming they are unused.

---

## 5. Minimal-Change Principle

When addressing tasks:
1. **Search Before Writing:** Search for existing implementations (`grep_search` / `Select-String`) before creating new components, utilities, or types.
2. **Reuse Existing Utilities:**
   - API calls: use `axiosFetch` from `@/utils` (or `adminAxios` for admin routes).
   - Uploads: use `supportService.uploadFileToCloudinary` or `generateImageURL`.
   - Toasts: use `toast` from `react-hot-toast`.
   - User state: use `useUserStore` from `@/store/userStore`.
   - Categories: use `useAdminCategories` hook.
3. **Surgical Diffs:** Change only the lines necessary. Do not reformat entire files, run automated linters over unchanged code, or rename variables unnecessarily.
4. **No Arbitrary Architecture Changes:** Do not migrate Zustand to Redux, Axios to fetch, Tailwind to CSS Modules, or App Router to Pages Router.

---

## 6. API, Backend Contract & NestJS DTO Preservation

The frontend communicates with a **NestJS backend** that enforces strict validation rules:

1. **Strict NestJS Validation (`ValidationPipe`):**
   - The backend uses `whitelist: true, forbidNonWhitelisted: true`.
   - **CRITICAL:** If you send properties that are NOT in the backend DTO, the backend will reject the request with HTTP 400 (`"property X should not exist"`).
   - When updating or creating resources (gigs, packages, briefs, profiles, messages):
     - **NEVER** spread entire database entities (e.g., `...raw`, `...packageData`) into mutation payloads.
     - Strip database IDs, timestamps, calculated metrics, and relational fields before sending:
       `id`, `_id`, `totalStars`, `starNumber`, `sales`, `favoriteCount`, `slug`, `reviewedAt`, `createdAt`, `updatedAt`, `publishedAt`, `user`, `userID`, `userId`, `reviews`, `gigRating`, `starRating`, `ratingBreakdown`, `starCounts`, `__v`.
     - Explicitly construct clean, whitelisted payloads.

2. **API Proxy & Rewrites (`next.config.ts`):**
   - In browser environments, `axiosFetch` uses baseURL `/api`.
   - Next.js rewrites proxy requests to:
     - `/api/support/:path*` -> `${mainApiUrl}/support/:path*`
     - `/api/storage/:path*` -> `${mainApiUrl}/storage/:path*`
     - `/api/admin/:path*` -> `${adminApiUrl}/:path*`
     - `/api/:path*` -> `${mainApiUrl}/:path*`
   - Default backend URLs:
     - Main API: `NEXT_PUBLIC_SERVER_API_URL` or `NEXT_PUBLIC_API_URL` (default `http://localhost:8080/api`)
     - Admin API: `NEXT_PUBLIC_ADMIN_API_URL` (default `http://localhost:8082/api/admin`)
   - **Do not modify these rewrites or hardcode backend ports into client components.**

3. **HTTP Client Conventions:**
   - Always use `axiosFetch` from `@/utils` for application requests.
   - Do not instantiate new `axios.create()` instances unless authorized.
   - `axiosFetch` automatically attaches `Authorization: Bearer <accessToken>` and seamlessly handles 401 token refreshes.

---

## 7. Authentication, Sessions & Security

Workvence implements a robust dual-storage session architecture:

1. **State & Storage Synchronization (`src/store/userStore.ts`):**
   - `userStore` maintains `user` state and syncs to:
     - `localStorage` (`user`, `accessToken`, `token`, `refreshToken`)
     - `document.cookie` (`accessToken`, `refreshToken`, `isSeller`, `user`, `role` with `SameSite=Lax`)
   - On logout, both localStorage and cookies are completely cleared.
   - Never write direct localStorage mutations without syncing `userStore`.

2. **Automatic 401 Refresh Queue (`src/utils/axiosFetch.ts` & `src/utils/tokenRefresh.ts`):**
   - When a request returns 401, `axiosFetch` intercepts the error, calls `/auth/refresh` using the stored `refreshToken`, updates the access token in cookies/localStorage, and transparently replays queued requests.
   - Never remove or disrupt this interceptor logic.

3. **Route Guards (`src/proxy.ts`):**
   - Routes are categorized into:
     - Guest-only: `/login`, `/register`, `/forgot-password`, `/reset-password`
     - Admin-only: `/admin` (requires admin role)
     - Seller-only: `/manage-orders`, `/earnings`, `/my-packages`, `/kyc`, `/settings/verification`
     - Buyer-only: `/orders`, `/orders/manage`
     - General protected: `/dashboard`, `/profile`, `/messages`, `/favorites`, `/pay`, `/organize`, `/briefs/create`, `/support`
   - Role boundaries must never be circumvented.

---

## 8. Routing & Navigation Rules

- **Next.js 16 App Router:** Routes are organized in `src/app/` using route groups (`(auth)`, `(buyer)`, `(seller)`, `(marketing)`).
- **Route Groups do not affect URL paths:** e.g., `src/app/(seller)/organize/[id]/page.tsx` serves `/organize/[id]`.
- **Dynamic Route Segments:** `[id]`, `[username]` — always retrieve params via `useParams()` or page props appropriately.
- **Search Before Renaming/Moving Routes:** Before moving or changing any route, search the entire codebase for all occurrences of the path (`router.push`, `Link href`, redirect calls).
- **Redirects:** Respect existing permanent redirects in `next.config.ts` (e.g. `/package` -> `/packages`).

---

## 9. Responsive Design & Cross-Device Compatibility

- **Mobile First & Responsive:** Workvence is fully responsive across mobile phones, tablets, laptops, and wide desktops.
- **Breakpoints:** Standard Tailwind breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`) plus custom `macbook: 1440px`.
- **Mobile Navigation:** Preserve mobile header toggles, slide-over menus, and horizontal scrolling tabs (`scrollbar-none`).
- **Never Break Mobile for a Desktop Fix:** Any change made to a desktop layout must be verified on smaller viewports to prevent overflow or broken grids.

---

## 10. Git Safety & Working Tree Integrity

Agents must exercise extreme care with Git operations:

1. **Check Status First:**
   ```bash
   git status
   git branch --show-current
   git diff
   ```
2. **Forbidden Destructive Commands:**
   - **NEVER** run `git reset --hard`
   - **NEVER** run `git clean -fd`
   - **NEVER** run `git checkout .`
   - **NEVER** force-push (`git push -f`)
3. **Preserve Uncommitted Work:** Never overwrite or discard changes in the working directory that were created by the user or another process.
4. **Clean Commits:** Commits should follow conventional format (e.g., `fix(seller): ...`, `feat(briefs): ...`) and only touch relevant files.

---

## 11. Testing, Verification & Scripts

Always verify your changes before declaring a task complete:

- **TypeScript Type Check:**
  ```bash
  pnpm exec tsc --noEmit
  ```
  Must exit with **0 errors**. Always run this after editing TypeScript/TSX files.

- **Linting:**
  ```bash
  pnpm lint
  ```

- **E2E Testing (Playwright):**
  ```bash
  pnpm test:e2e
  # Or headed mode:
  pnpm test:e2e:headed
  ```
  Test suites live in `tests/e2e/`.

- **Development Server:**
  ```bash
  pnpm dev
  ```

- **Inspect Git Diff:**
  Always review `git diff` on modified files to verify no unwanted changes or whitespace regressions were introduced.

---

## 12. Distinguishing Bugs from Intended Features

> **CRITICAL DISTINCTION:**
> Fixing a bug does **NOT** mean removing the feature that contains the bug.

- **If a feature throws an error:** Fix the error in the feature's logic. Do **not** remove the button, delete the input, or disable the action.
  - *Example:* If removing an image still displays it in the gallery, fix the state management and remove fallbacks to stale cache. Do **not** hide the image gallery or remove the delete button.
  - *Example:* If an update endpoint returns a 400 error because of non-whitelisted fields, sanitize the request payload. Do **not** eliminate the form fields.
- **If an API fails:** Check whether the endpoint URL, headers, or payload format mismatch the backend DTO. Do **not** replace the API call with local mock data unless explicitly requested.

---

## 13. Explicit Permission Rules

AI agents must **STOP and obtain explicit user permission** before:
1. Deleting any existing file or directory.
2. Removing any existing page route or component.
3. Installing new major dependencies or removing existing dependencies.
4. Altering database/API contracts or core Axios configurations.
5. Modifying authentication architectures or route guard structures.
6. Changing global styling tokens, theme colors, or typography in `globals.css` / `tailwind.config.js`.
7. Performing any destructive Git operations.

---

*This document must be read and respected by all AI agents working on the Workvence frontend repository.*
