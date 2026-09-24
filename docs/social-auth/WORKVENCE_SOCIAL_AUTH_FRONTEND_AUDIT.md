# Workvence Social Authentication — Frontend Architecture Audit

**Project:** Workvence Frontend (Next.js 16 App Router, TypeScript, React 19)  
**Date:** September 2026  
**Status:** Architecture Audit & Pre-Implementation Discovery  
**Scope:** Client-side integration of Google Login and Apple Login with existing NestJS backend  

---

## 1. Executive Summary & Audit Context

Workvence is a production-grade freelance marketplace featuring dual user roles (Buyer and Seller), real-time communication, service listings (Packages), and project briefs. 

The backend (NestJS) already implements social authentication and exposes two dedicated endpoints:
- `POST /api/auth/google`
- `POST /api/auth/apple`

The intended architecture is provider ID Token-based:
1. The browser initiates authentication via the official Google or Apple client SDK.
2. The provider authenticates the user and returns an **ID Token** (JWT).
3. The Next.js frontend posts the ID Token to the NestJS backend endpoint (`POST /api/auth/google` or `POST /api/auth/apple`).
4. The NestJS backend cryptographically validates the ID Token, locates or creates the user in the database, establishes the session, and sets an **HTTP-only cookie**.
5. The frontend refreshes its local authenticated user state using the established session and navigates the user according to their role and redirect destination.

> **CRITICAL ARCHITECTURAL CONSTRAINT:**  
> The frontend **must NOT store authentication tokens in `localStorage`, `sessionStorage`, Zustand persisted storage, or JavaScript-created cookies**. The backend owns and controls the HTTP-only session cookie.

This document presents a comprehensive audit of the existing Workvence authentication architecture, identifying all relevant files, UI elements, API conventions, cookie behaviors, role handling, and dependencies before any code changes are made.

---

## 2. Current Frontend Authentication Architecture

### 2.1 Overview of Auth Flow & Components

```
+---------------------------------------------------------------------------------------------------+
|                                     BROWSER RUNTIME                                               |
|                                                                                                   |
|  +--------------------+   +-----------------------+   +---------------------------------------+   |
|  |   /login Page      |   |   /register Page      |   |   AuthModal Component                 |   |
|  |   (Single-Step UI) |   |   (Multi-Step Wizard) |   |   (Modal for In-Context Sign-in/Join) |   |
|  +---------+----------+   +-----------+-----------+   +-------------------+-------------------+   |
|            |                          |                                   |                       |
|            +--------------------------+-----------------------------------+                       |
|                                       |                                                           |
|                                       v                                                           |
|                        +------------------------------+                                           |
|                        |   HTTP Client (axiosFetch)   |                                           |
|                        |   baseURL: "/api"            |                                           |
|                        |   withCredentials: true      |                                           |
|                        +--------------+---------------+                                           |
|                                       |                                                           |
+---------------------------------------|-----------------------------------------------------------+
                                        | (Next.js Rewrites or Direct Proxy)
                                        v
+---------------------------------------------------------------------------------------------------+
|                                     NESTJS BACKEND                                                |
|                                                                                                   |
|   +-------------------+   +--------------------+   +------------------------------------------+   |
|   | POST /auth/login  |   | POST /auth/google  |   | Set-Cookie: accessToken=...; HttpOnly;   |   |
|   | POST /auth/logout |   | POST /auth/apple   |   | SameSite=Lax; Path=/                     |   |
|   | GET  /auth/me     |   | POST /auth/refresh |   |                                          |   |
|   +-------------------+   +--------------------+   +------------------------------------------+   |
+---------------------------------------------------------------------------------------------------+
                                        |
                                        v
+---------------------------------------------------------------------------------------------------+
|                                  STATE & SESSION SYNC                                             |
|                                                                                                   |
|   +---------------------------+   +------------------------------+   +------------------------+   |
|   | userStore (Zustand)       |   | Server Proxy (src/proxy.ts)  |   | Navbar Session Poller  |   |
|   | Memory state: user object |   | Inspects request cookies     |   | GET /auth/me fallback  |   |
|   | Role & Profile data       |   | Route protection & guards    |   | Silent session check   |   |
|   +---------------------------+   +------------------------------+   +------------------------+   |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Comprehensive File-by-File Inventory

The following table documents every file involved in authentication, session management, route protection, and user state:

| File Path | Purpose | Current Auth Responsibility | Social Login Impact |
| :--- | :--- | :--- | :--- |
| `src/app/(auth)/login/page.tsx` | Dedicated Sign-in Page | Renders 1-step sign-in form. Currently has placeholder buttons for Google and Apple (`data-testid="login-google-btn"`, `data-testid="login-apple-btn"`). Submits credentials to `POST /auth/login`. | **Primary Integration Target:** Connect Google and Apple click handlers to provider SDKs; send ID token to NestJS; refresh user state; handle redirect. |
| `src/app/(auth)/register/page.tsx` | Dedicated Sign-up Page | Multi-step registration wizard. Step 1 contains a "Continue with Google" button pointing to `window.location.href = ${apiUrl}/auth/google`. Handles username/email availability checks and password validation. | **Secondary Integration Target:** Connect Google and Apple SDK flows to register view; support default buyer/seller role assignment based on `?seller=true` query param. |
| `src/features/auth/AuthModal/AuthModal.tsx` | In-Context Auth Dialog | Modal popup triggered from Brief proposal submission, Navbar, or marketing CTAs. Supports "Sign In" and "Join Workvence" tabs. Contains Google and Apple placeholder buttons. | **Primary Integration Target:** Connect Google and Apple SDK flows inside the modal; call `onSuccess(user)` and `onClose()` on completion without full-page reload. |
| `src/store/userStore.ts` | Global Auth State (Zustand) | Maintains `user: User \| null`. Legacy implementation wrote `accessToken`, `refreshToken`, `isSeller`, `user`, and `role` to `document.cookie` and `localStorage`. | **High Impact:** Must be updated or used to store `user` profile in memory while **not** writing auth tokens to `localStorage` or `document.cookie` when backend sets HTTP-only cookies. |
| `src/utils/axiosFetch.ts` | Primary Axios Client | Configured with `baseURL: "/api"` and `withCredentials: true`. Attaches `Authorization: Bearer <accessToken>` if cookie exists. Automatically refreshes on 401 via `refreshAccessToken()`. | **High Impact:** Already has `withCredentials: true`, ensuring HTTP-only cookies are automatically passed to NestJS backend on all requests. Must ensure social auth requests route through this instance. |
| `src/utils/tokenRefresh.ts` | Token Management Utility | Handles token decoding (`decodeJwtPayload`), checking expiration (`isAccessTokenExpiringSoon`), proactive refresh (`POST /auth/refresh-token`), and logout on expiration (`handleAuthExpired`). | **Medium Impact:** Works with cookies. Needs alignment with the backend HTTP-only cookie name (e.g. `accessToken` vs `refreshToken`). |
| `src/proxy.ts` | Route Protection & Guard Proxy | Next.js 16 server-side middleware proxy. Reads `accessToken`, `refreshToken`, `user`, and `role` cookies from incoming requests to enforce guest-only, admin-only, seller-only, and buyer-only route rules. | **High Impact:** Because `proxy.ts` runs on the Next.js server runtime, it can read HTTP-only cookies sent by the browser. The cookie names set by NestJS must match what `proxy.ts` expects (`accessToken`, `refreshToken`). |
| `src/components/layout/Navbar/Navbar.tsx` | Global Navigation Header | Hydrates `user` state on mount, silently verifies session via `GET /auth/me`, proactive token refresh interval, renders Buyer vs Seller header links, profile dropdown, and logout trigger (`POST /auth/logout`). | **Medium Impact:** Serves as the primary reference for how `GET /auth/me` is called to silently refresh authenticated user state. |
| `src/app/dashboard/page.tsx` | Central Dashboard Router | Redirects authenticated users: if `user.isSeller` -> `/dashboard/seller`, else -> `/dashboard/buyer`. Renders fallback loading state if unauthenticated. | **Medium Impact:** Validates that post-login navigation works seamlessly for social login users according to their assigned role. |
| `src/app/(auth)/verify-email/page.tsx` | OTP Email Verification | Handles 6-digit OTP verification for email/password signups. | **Low Impact:** Social login users verified by Google/Apple should bypass email OTP verification as their emails are pre-verified by the OAuth providers. |
| `src/types/user.ts` | TypeScript Interfaces | Defines `User`, `UserRole`, `JwtPayload`, and seller profile interfaces. | **Low Impact:** Reused for typing social login responses and user store state. |

---

## 4. Audit of the Existing Login & Register UI

### 4.1 Login Page (`src/app/(auth)/login/page.tsx`)
- **Layout:** Responsive split layout (Left Pane: Auth form container `max-w-[420px]`; Right Pane: Hero image `loginImage.png` sticky on `lg:` viewports).
- **Existing Social Buttons:**
  - 2-column grid (`grid grid-cols-2 gap-3 w-full mb-6`).
  - Google Button:
    - Text: `Continue with Google`
    - Icon: `FcGoogle` from `react-icons/fc`
    - Selector: `data-testid="login-google-btn"`
    - Current Action: Redirects via `window.location.href = ${apiUrl}/auth/google` (legacy server redirect).
  - Apple Button:
    - Text: `Continue with Apple`
    - Icon: `FaApple` from `react-icons/fa`
    - Selector: `data-testid="login-apple-btn"`
    - Current Action: Placeholder toast (`toast('Apple sign-in will be available soon.')`).
- **Divider:** Standard horizontal rule with `"or"` centered.
- **Button Tokens:** Height `h-10 sm:h-11`, subtle border `border-gray-200/90`, rounded `rounded-[6px]`, background white with hover state `hover:bg-gray-50/80`, font size `text-xs sm:text-[13px] font-medium text-[#1f2937]`, shadow `shadow-2xs`.
- **Verdict:** Reusable as-is. No redesign or extra layout modifications needed.

### 4.2 Register Page (`src/app/(auth)/register/page.tsx`)
- **Layout:** Split layout (Left Pane: Step 1 options / Step 2 credentials; Right Pane: Hero image `registerImage.png`).
- **Existing Social Button:**
  - Step 1 displays `Continue with Google` button with `FcGoogle` icon (`data-testid="continue-google-btn"`).
  - Apple button currently absent on register page; needs to be added matching the login page 2-column layout.
- **Role Awareness:** Accepts `?seller=true` query parameter to pre-select seller registration intent (`isSeller: true`).

### 4.3 Auth Modal (`src/features/auth/AuthModal/AuthModal.tsx`)
- **Layout:** Dialog overlay with two tabs: "Sign In" and "Join Workvence".
- **Existing Social Buttons:**
  - In "Sign In" view:
    - Google Button (`data-testid="modal-login-google-btn"`) with `FcGoogle`.
    - Apple Button (`data-testid="modal-login-apple-btn"`) with `FaApple`.
- **Verdict:** UI structure is established and ready for SDK handler binding.

---

## 5. API Architecture & HTTP-Only Cookie Mechanics

### 5.1 Axios Configuration
The core API client is in `src/utils/axiosFetch.ts`:
```ts
const axiosFetch: AxiosInstance = axios.create({
  baseURL: getBaseURL(), // Returns "/api" on client
  withCredentials: true  // CRITICAL: Automatically sends and receives cookies
});
```

### 5.2 Next.js API Rewrites (`next.config.ts`)
Next.js proxies client requests starting with `/api` directly to the NestJS backend:
```ts
async rewrites() {
  const mainApiUrl = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:8080/api';
  return [
    { source: '/api/support/:path*', destination: `${mainApiUrl}/support/:path*` },
    { source: '/api/storage/:path*', destination: `${mainApiUrl}/storage/:path*` },
    { source: '/api/admin/:path*',   destination: `${adminApiUrl}/:path*` },
    { source: '/api/:path*',         destination: `${mainApiUrl}/:path*` },
  ];
}
```
Therefore, calling `axiosFetch.post('/auth/google', ...)` resolves to `${mainApiUrl}/auth/google` with cookie forwarding preserved.

### 5.3 Cookie Flow Comparison

```
+---------------------------------------------------------------------------------------+
| PREVIOUS LEGACY FLOW (Password Login)                                                 |
| 1. POST /api/auth/login                                                               |
| 2. Backend returned { accessToken, refreshToken, user } in JSON body                  |
| 3. Client JavaScript manually executed:                                               |
|    document.cookie = `accessToken=${token}; path=/; ...`                              |
|    localStorage.setItem("user", JSON.stringify(user))                                 |
+---------------------------------------------------------------------------------------+
                                        vs
+---------------------------------------------------------------------------------------+
| TARGET SOCIAL AUTH FLOW (HTTP-Only Cookie)                                            |
| 1. Client SDK receives provider ID Token                                              |
| 2. POST /api/auth/google { idToken: "..." } with withCredentials: true               |
| 3. NestJS verifies ID Token, sets Set-Cookie: accessToken=...; HttpOnly; SameSite=Lax |
| 4. Client JS NEVER reads or writes the auth token cookie                              |
| 5. Client updates in-memory userStore: setUser(response.data.user)                    |
| 6. Subsequent requests automatically carry the cookie via browser network layer       |
+---------------------------------------------------------------------------------------+
```

---

## 6. Role System & Onboarding Audit

### 6.1 Role Representation
In Workvence, user roles are defined in `src/types/user.ts`:
```ts
export type UserRole = 'buyer' | 'seller' | 'admin' | string;
export interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  isSeller: boolean;
  isAdmin?: boolean;
  role?: UserRole;
  isKycVerified?: boolean;
  // ...
}
```

### 6.2 Existing Role Logic & Redirects
1. **Default Role for New Users:** In the password flow, new users default to `isSeller: false` unless the registration form had `isSeller: true` (e.g. from `/register?seller=true` or modal "Work as Freelancer" toggle).
2. **Dashboard Routing (`src/app/dashboard/page.tsx`):**
   - If `user.isSeller === true` -> redirects to `/dashboard/seller`.
   - If `user.isSeller === false` -> redirects to `/dashboard/buyer`.
3. **Route Guards (`src/proxy.ts`):**
   - Seller routes (`/manage-orders`, `/earnings`, `/my-packages`, `/kyc`) check `isSeller` or `role === "seller"`.
   - Buyer routes (`/orders`, `/orders/manage`) redirect sellers to `/manage-orders`.
4. **KYC & Onboarding:**
   - Sellers have a KYC verification step (`/kyc`).
   - Session prompt dismissal is stored in `sessionStorage.getItem('kyc_prompt_dismissed_session')`.

---

## 7. Account Linking & Security Analysis

### 7.1 Existing Account Linking Status
- The current frontend has **no account linking UI or endpoints**.
- Users authenticate either with local email/password or (previously) direct OAuth redirect.

### 7.2 Security Risk: Blind Account Merging
- **DO NOT** merge accounts automatically on the client side based solely on an email match.
- If a user registered with password `john@example.com` and later clicks "Continue with Google" with the same email, the NestJS backend must be the sole authority to decide whether to link the Google ID, reject with an account conflict (HTTP 409), or require password confirmation.
- The frontend will handle any conflict responses using the existing toast system without assuming automatic merging.

---

## 8. Provider Integration Requirements

### 8.1 Google Integration Requirements
- **Method:** Google Identity Services (GIS) Web SDK (`https://accounts.google.com/gsi/client`).
- **Client Configuration:** Public Google Client ID (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`).
- **Token Type:** Google ID Token (JWT `credential`).
- **Security:** The Google Client Secret must **never** be present in frontend code or repository environment files.

### 8.2 Apple Integration Requirements
- **Method:** Official Apple JS SDK (`https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js`).
- **Client Configuration:** Apple Service ID (`NEXT_PUBLIC_APPLE_CLIENT_ID`) and Redirect URI (`NEXT_PUBLIC_APPLE_REDIRECT_URI`).
- **Token Type:** Apple ID Token (`authorization.id_token`).
- **Security:** Apple private key, Key ID, Team ID, and client secret generation must **never** exist on the frontend. The backend handles Apple token cryptographic validation.

---

## 9. Environment Variables Audit

| Variable Name | Status in Project | Public or Secret | Value / Required For |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SERVER_API_URL` | Present in `.env` | Public | `https://devadmin.workvence.com/api` |
| `NEXT_PUBLIC_API_URL` | Present in `.env` | Public | `https://devadmin.workvence.com/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Present in `.env` | Public | `https://devadmin.workvence.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | **Confirmed by Backend** | Public | `1021646956156-mdh9qbtl2ib60hcss17bt49mit2j6o18.apps.googleusercontent.com` |
| `NEXT_PUBLIC_APPLE_CLIENT_ID` | Needs Client Apple Service ID | Public | Apple Sign-in Service ID (e.g. `com.sosmarketplace.web`) |
| `NEXT_PUBLIC_APPLE_REDIRECT_URI`| Optional (defaults to origin) | Public | Apple OAuth redirect URI (e.g. `https://workvence.com/login`) |

---

## 10. Audit Conclusion & Confirmed Specifications

1. **Backend Integration Contract Confirmed:**
   - Google: `POST /api/auth/google` with `{ idToken: credential }`.
   - Apple: `POST /api/auth/apple` with `{ idToken: authorization.id_token, user?: { firstName, lastName } }`.
   - Backend automatically creates new users (default role `"buyer"`) or logs in existing users without needing separate sign-up buttons.
   - Backend automatically issues `Set-Cookie` for `accessToken` and `refreshToken`.
2. **Token Storage Decoupling:**
   - Frontend must rely on `credentials: 'include'` / `withCredentials: true`.
   - Frontend must never store auth tokens in `localStorage` or `sessionStorage`.
3. **Pending Client Item:**
   - Apple Service ID (`NEXT_PUBLIC_APPLE_CLIENT_ID`).

