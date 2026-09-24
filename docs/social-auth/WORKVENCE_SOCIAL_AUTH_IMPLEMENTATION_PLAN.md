# Workvence Social Authentication — Frontend Implementation Plan

**Feature:** Google & Apple Social Login (ID Token Flow with HTTP-Only Cookie Session)  
**Project:** Workvence Frontend (Next.js 16 App Router, TypeScript, React 19)  
**Date:** September 2026  
**Status:** Pre-Implementation Specification — PLAN ONLY  

---

## 1. Architectural Overview & Target Flow Diagram

The target architecture utilizes provider browser SDKs to obtain ID tokens directly on the client, which are then exchanged with the NestJS backend for a secure, HTTP-only session cookie.

```
+---------------------------------------------------------------------------------------------------------+
| STEP 1: USER INITIATION (Browser)                                                                      |
| User clicks "Continue with Google" or "Continue with Apple" on /login, /register, or AuthModal          |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                                     v
+---------------------------------------------------------------------------------------------------------+
| STEP 2: PROVIDER POPUP AUTHENTICATION (Google GIS / Apple JS SDK)                                       |
| - Google: google.accounts.id popup / prompt returns { credential: string } (JWT ID Token)               |
| - Apple:  AppleID.auth.signIn() popup returns { authorization: { id_token: string } }                   |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                                     v
+---------------------------------------------------------------------------------------------------------+
| STEP 3: ID TOKEN POST TO NESTJS BACKEND                                                                 |
| Frontend invokes axiosFetch (baseURL: "/api", withCredentials: true):                                    |
|   POST /api/auth/google  { idToken: credential, isSeller?: boolean }                                    |
|   POST /api/auth/apple   { idToken: id_token,   isSeller?: boolean }                                    |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                                     v
+---------------------------------------------------------------------------------------------------------+
| STEP 4: NESTJS BACKEND TOKEN VERIFICATION & SESSION CREATION                                            |
| - Backend verifies provider cryptographic signature (Google CERTS / Apple JWKS)                         |
| - Backend finds existing user or creates new user record                                                |
| - Backend generates JWT / session token                                                                 |
| - Backend emits response header: Set-Cookie: accessToken=...; HttpOnly; SameSite=Lax; Path=/            |
| - Backend returns response body: { user: User, isNewUser?: boolean }                                    |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                                     v
+---------------------------------------------------------------------------------------------------------+
| STEP 5: FRONTEND STATE REFRESH & SESSION SYNC                                                           |
| - Frontend does NOT write tokens to localStorage, sessionStorage, or document.cookie                    |
| - Frontend updates memory state: useUserStore.getState().setUser(data.user)                             |
| - Session verification via axiosFetch.get('/auth/me') confirms cookie validity                          |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                                     v
+---------------------------------------------------------------------------------------------------------+
| STEP 6: ROLE-BASED NAVIGATION & REDIRECT                                                                |
| - If safe "redirect" query parameter exists -> navigate to redirect target                             |
| - Else if user.isSeller === true            -> navigate to /dashboard/seller                            |
| - Else                                      -> navigate to /dashboard/buyer                             |
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. File-by-File Change Plan

| File Path | Action | Why | Implementation Responsibility |
| :--- | :--- | :--- | :--- |
| `src/services/socialAuth.ts` | **CREATE** | Dedicated service to encapsulate provider SDK loading, token acquisition, and API calls to NestJS | Contains `initiateGoogleLogin()`, `initiateAppleLogin()`, script loaders, and token exchange methods. Prevents duplicate code across `/login`, `/register`, and `AuthModal`. |
| `src/hooks/useSocialAuth.ts` | **CREATE** | Reusable React hook for handling social login state | Manages `loadingProvider: 'google' \| 'apple' \| null`, error handling, toast alerts, state update, and role redirection. |
| `src/app/(auth)/login/page.tsx` | **MODIFY** | Connect existing Google and Apple buttons to social auth hook | Wire `onClick` on `data-testid="login-google-btn"` and `data-testid="login-apple-btn"` to `useSocialAuth`. Disable buttons during active loading. |
| `src/app/(auth)/register/page.tsx` | **MODIFY** | Add Apple button to Step 1 and connect both Google/Apple to social auth hook | Pass `isSellerParam` (`?seller=true`) to the backend registration payload if user is registering as a seller. |
| `src/features/auth/AuthModal/AuthModal.tsx` | **MODIFY** | Connect modal Google and Apple buttons to social auth hook | Ensure modal closes (`onClose()`) and calls `onSuccess(user)` without triggering unnecessary full-page redirects. |
| `src/store/userStore.ts` | **MODIFY** | Support HTTP-only cookie model where token is not manually stored | Ensure `setUser(user)` updates in-memory `user` state without forcing `localStorage.setItem('accessToken', ...)` or manual `document.cookie` setting when tokens are managed via HTTP-only cookies. |
| `src/utils/axiosFetch.ts` | **REUSE** | Core HTTP client | Reused as-is because `withCredentials: true` is already configured. |
| `src/proxy.ts` | **REUSE** | Next.js server-side route guards | Reused as-is; automatically reads incoming HTTP-only cookies from the browser to enforce route protection. |
| `src/components/layout/Navbar/Navbar.tsx` | **REUSE** | Header & session verification | Reused as-is; its background `axiosFetch.get('/auth/me')` automatically checks the HTTP-only session cookie. |

---

## 3. Google Login Integration Plan

### 3.1 Confirmed Client Configuration
- **Public Google Client ID:** `1021646956156-mdh9qbtl2ib60hcss17bt49mit2j6o18.apps.googleusercontent.com`
- **Frontend Environment Variable:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- **Security Rule:** Zero Google client secret on frontend.

### 3.2 Recommended SDK Approach
Use either `@react-oauth/google` or official Google Identity Services (`https://accounts.google.com/gsi/client`):
- Both approaches return the standard Google ID Token as `credential` (`credentialResponse.credential` or `response.credential`).
- When the user authenticates, Google returns the JWT ID Token.

### 3.3 Backend API Payload (Confirmed)
- **Endpoint:** `POST /api/auth/google`
- **Exact Request Body:**
  ```json
  {
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
  }
  ```
  *(Strictly one key: `idToken`. No other properties).*
- **Request Transport:** `axiosFetch.post('/auth/google', { idToken })` with `withCredentials: true`.

---

## 4. Apple Login Integration Plan

### 4.1 Confirmed Client Configuration
- **Apple JS SDK URL:** `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/auth.js`
- **Apple Service ID:** Configured via `NEXT_PUBLIC_APPLE_CLIENT_ID`
- **Redirect URI:** `NEXT_PUBLIC_APPLE_REDIRECT_URI` (defaults to `window.location.origin + '/login'`)
- **Mode:** `usePopup: true` (opens clean popup window instead of full-page redirect)
- **Security Rule:** No Apple private keys, Key ID, or Team ID on frontend.

### 4.2 Handling First-Time vs Returning Logins
- **First Sign-in:** Apple returns `authorization.id_token` AND `user` object (`{ name: { firstName, lastName } }`).
- **Returning Sign-in:** Apple *only* returns `authorization.id_token`.
- **Payload Construction:**
  ```ts
  const payload: { idToken: string; user?: { firstName?: string; lastName?: string } } = {
    idToken: appleResponse.authorization.id_token,
  };
  if (appleResponse.user?.name) {
    payload.user = {
      firstName: appleResponse.user.name.firstName,
      lastName: appleResponse.user.name.lastName,
    };
  }
  ```

### 4.3 Backend API Payload (Confirmed)
- **Endpoint:** `POST /api/auth/apple`
- **Exact Request Body (First Time):**
  ```json
  {
    "idToken": "eyJraWQiOiJ...",
    "user": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
  ```
- **Exact Request Body (Returning):**
  ```json
  {
    "idToken": "eyJraWQiOiJ..."
  }
  ```
- **Request Transport:** `axiosFetch.post('/auth/apple', payload)` with `withCredentials: true`.
Use the official **Apple Sign in with Apple JS SDK** (`https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js`):
- Operates via standard browser popup modal (`usePopup: true`).
- Compatible with desktop and mobile browsers.
- Returns Apple ID Token (`authorization.id_token`) directly in the promise resolution.

### 4.2 Technical Implementation Details
1. **SDK Loader (`src/services/socialAuth.ts`):**
   ```ts
   export const loadAppleSDK = (): Promise<void> => {
     return new Promise((resolve, reject) => {
       if (typeof window === 'undefined') return;
       if ((window as any).AppleID?.auth) {
         resolve();
         return;
       }
       const script = document.createElement('script');
       script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
       script.async = true;
       script.defer = true;
       script.onload = () => resolve();
       script.onerror = () => reject(new Error('Failed to load Apple SDK'));
       document.head.appendChild(script);
     });
   };
   ```

2. **Triggering Apple Auth:**
   ```ts
   window.AppleID.auth.init({
     clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID!,
     scope: 'name email',
     redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || window.location.origin,
     state: 'workvence_auth',
     usePopup: true,
   });

   const response = await window.AppleID.auth.signIn();
   const appleIdToken = response.authorization.id_token;
   ```

3. **Backend Exchange:**
   ```ts
   const { data } = await axiosFetch.post('/auth/apple', {
     idToken: appleIdToken,
     isSeller: options?.isSeller || false,
     user: response.user, // Optional initial name/email captured on first login
   });
   ```

4. **Security Enforcement:**
   - The frontend uses **only** public `NEXT_PUBLIC_APPLE_CLIENT_ID` and `NEXT_PUBLIC_APPLE_REDIRECT_URI`.
   - Apple private key (.p8), Key ID, and Team ID remain strictly on the NestJS backend.

---

## 5. Auth State & HTTP-Only Cookie Integration

### 5.1 Strictly Decoupled Token Storage
To satisfy the requirement that **frontend code must NOT store authentication tokens in `localStorage`, `sessionStorage`, or manual cookies**:
1. When `POST /api/auth/google` or `POST /api/auth/apple` succeeds:
   - NestJS sends `Set-Cookie: accessToken=...; Path=/; HttpOnly; SameSite=Lax`.
   - The browser automatically handles cookie storage.
2. The frontend code receives the user profile:
   ```ts
   const user = data.user;
   // Update Zustand in-memory state
   useUserStore.getState().setUser(user);
   ```
3. `userStore.ts` will be updated to avoid setting manual `accessToken` cookies when `user` is provided from an HTTP-only flow.

### 5.2 Background Session Validation
Immediately after social login or on page reloads, `Navbar.tsx` validates the session via:
```ts
const { data } = await axiosFetch.get('/auth/me');
if (data?.user) {
  setUser(data.user);
}
```
Because `axiosFetch` has `withCredentials: true`, the HTTP-only cookie is sent automatically, confirming active session state.

---

## 6. Role & Onboarding Handling Plan

### 6.1 Role Preservation & Defaulting
- **Existing User:** The NestJS backend returns the existing user entity with their established role (`isSeller`, `role`). The frontend preserves whatever role is returned.
- **New User:** 
  - If the user initiates social login from `/register?seller=true` or modal "Work as Freelancer", the frontend passes `{ isSeller: true }` in the payload.
  - Otherwise, default to `{ isSeller: false }` (Buyer).
- **Post-Login Routing:**
  ```ts
  const rawRedirect = searchParams?.get('redirect');
  if (rawRedirect && isValidRedirect(rawRedirect)) {
    router.push(decodeURIComponent(rawRedirect));
  } else if (user.isSeller) {
    router.push('/dashboard/seller');
  } else {
    router.push('/dashboard/buyer');
  }
  ```

---

## 7. Error Handling & Loading State Matrix

| Scenario | Trigger / Cause | Frontend Behavior | Toast / User Feedback |
| :--- | :--- | :--- | :--- |
| **Popup Closed by User** | User closes Google/Apple modal without completing auth | Gracefully reset loading state (`setLoading(false)`). Do not show aggressive error. | None or subtle "Sign-in cancelled." |
| **Invalid / Expired Token** | Provider clock skew or stale token | Reset loading state. | `toast.error('Authentication expired. Please try again.')` |
| **Backend 400 Bad Request** | Non-whitelisted field or missing `idToken` | Log details in dev mode; reset loading. | `toast.error('Authentication failed. Please try again.')` |
| **Backend 409 Conflict** | Account exists with another provider and merging is disabled | Reset loading. | `toast.error('An account already exists with this email. Please log in with your password.')` |
| **Backend 500 / Offline** | NestJS backend unavailable | Reset loading. | `toast.error('Server is temporarily unreachable. Please try again later.')` |
| **Double Click Prevention** | User clicks button multiple times | Disable button when `loadingProvider !== null`; show spinner. | Button disabled state active |

---

## 8. Responsive Design & Workvence Design System Preservation

All social login buttons will strictly preserve Workvence design tokens:
1. **Button Height:** Standard fixed height `h-10 sm:h-11` (40px/44px). Never shrunken on mobile.
2. **Typography:** `text-xs sm:text-[13px] font-medium text-[#1f2937] font-sf-pro`.
3. **Border & Radius:** `border border-gray-200/90 rounded-[6px]`.
4. **Icons:** Reusing established icons:
   - Google: `FcGoogle` (`text-lg`)
   - Apple: `FaApple` (`text-lg text-black`)
5. **Responsive Viewport Tiers Tested:**
   - 375×812 & 390×844 (Mobile S)
   - 414×896 & 480×900 (Mobile L)
   - 640×960 & 768×1024 (Tablet Portrait)
   - 1024×768 & 1280×800 (Laptop / Compact)
   - 1440×900 & 1920×1080 (Desktop Canonical)

---

## 9. Security Requirements & Hard Rules

- [x] **Zero Provider Secrets:** No Google Client Secret or Apple Private Key in frontend code or `.env`.
- [x] **No Token Storage in LocalStorage:** ID tokens and session tokens must never be written to `localStorage` or `sessionStorage`.
- [x] **HTTP-Only Session:** The session cookie is managed exclusively by the NestJS backend via `Set-Cookie`.
- [x] **Credential Transmission:** All API requests use `withCredentials: true` over HTTPS in production.
- [x] **No Blind Merging:** Account merging decisions are restricted to the backend.

---

## 10. Step-by-Step Implementation Sequence

### Phase 1: Environment & SDK Foundations
- Configure public environment variables (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_APPLE_CLIENT_ID`, `NEXT_PUBLIC_APPLE_REDIRECT_URI`).
- Implement `src/services/socialAuth.ts` with SDK loaders for Google Identity Services and Apple JS SDK.

### Phase 2: React Social Auth Hook
- Implement `src/hooks/useSocialAuth.ts` managing:
  - Provider initiation (Google and Apple)
  - ID token retrieval
  - `axiosFetch.post` invocation with error handling
  - Zustand `userStore` update
  - Role-based redirect routing

### Phase 3: Login Page Integration
- Update `src/app/(auth)/login/page.tsx` to bind Google and Apple buttons to `useSocialAuth`.
- Verify loading spinners and disabled states.

### Phase 4: Register Page Integration
- Update `src/app/(auth)/register/page.tsx` Step 1 to add Apple button alongside Google button.
- Pass `isSeller` flag if registering as seller.

### Phase 5: AuthModal Dialog Integration
- Update `src/features/auth/AuthModal/AuthModal.tsx` to bind modal buttons to `useSocialAuth`.
- Verify modal closes cleanly without full-page navigation on success.

### Phase 6: Session & State Decoupling
- Update `src/store/userStore.ts` to prevent writing auth tokens to `localStorage` or `document.cookie` when session is HTTP-only.

### Phase 7: Responsive & Cross-Device Audit
- Test buttons and modal on mobile (390px), tablet (768px), laptop (1024px, 1440px), and desktop (1920px).

### Phase 8: End-to-End Verification
- Run TypeScript compile check (`pnpm exec tsc --noEmit`).
- Verify dual-user journey and authentication flows.

---

## 11. Backend Contract Specifications (CONFIRMED BY BACKEND DEVELOPER)

The NestJS backend developer has officially provided the complete specification and integration guide:

1. **Google Request Payload (`POST /api/auth/google`):**
   ```json
   {
     "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
   }
   ```
   - **Confirmed:** Strictly one key named `"idToken"`. Obtained directly from `credentialResponse.credential` (or `response.credential`).
   - **Google Client ID:** `1021646956156-mdh9qbtl2ib60hcss17bt49mit2j6o18.apps.googleusercontent.com`.

2. **Apple Request Payload (`POST /api/auth/apple`):**
   ```json
   {
     "idToken": "appleResponse.authorization.id_token",
     "user": {
       "firstName": "John",
       "lastName": "Doe"
     }
   }
   ```
   - **Confirmed:** `idToken` (required string).
   - **Confirmed:** `user` object is **optional**, sent *only* on the first sign-in if `appleResponse.user` is provided by Apple. Subsequent logins omit the `user` property.

3. **Backend Success Response Format:**
   Both endpoints return the identical schema as standard email/password login:
   ```json
   {
     "message": "Login successful",
     "accessToken": "eyJhbGciOi...",
     "refreshToken": "eyJhbGciOi...",
     "isVerified": true,
     "user": {
       "id": "cm123...",
       "_id": "cm123...",
       "email": "user@gmail.com",
       "name": "Jane Doe",
       "username": "janedoe",
       "avatar": "https://lh3.googleusercontent.com/...",
       "role": "buyer",
       "authProvider": "google"
     }
   }
   ```

4. **HTTP-Only Cookie Handling:**
   - **Confirmed:** Backend automatically emits `Set-Cookie` for `accessToken` and `refreshToken`.
   - **Confirmed:** Client must pass `credentials: 'include'` (in fetch) or `withCredentials: true` (in Axios) to persist and transmit authentication cookies automatically.

5. **User Creation & Account Linking Policy:**
   - **Confirmed:** Separate "Sign Up" button is NOT required.
   - If the user is new, the backend creates their account automatically and sets default role (`"buyer"`).
   - If the user already exists with that email, the backend logs them in safely.

6. **Items Still Awaiting Client Input:**
   - `NEXT_PUBLIC_APPLE_CLIENT_ID` (Apple Service ID identifier from Apple Developer Console, e.g. `com.sosmarketplace.web`).

---

## 12. Acceptance Criteria & Definition of Done

- [ ] Google button triggers official Google Identity Services popup and receives valid ID token.
- [ ] Apple button triggers official Apple JS SDK popup and receives valid ID token.
- [ ] ID tokens are transmitted to `POST /api/auth/google` and `POST /api/auth/apple` via `axiosFetch`.
- [ ] NestJS sets HTTP-only session cookie; frontend does NOT store tokens in `localStorage` or JS cookies.
- [ ] Authenticated user state hydrates into `useUserStore`.
- [ ] Existing user roles are preserved; new users receive default roles.
- [ ] Redirects correctly send Buyers to `/dashboard/buyer` and Sellers to `/dashboard/seller`.
- [ ] Error toasts trigger properly on popup cancellation, network failure, or account conflicts.
- [ ] Zero TypeScript errors (`pnpm exec tsc --noEmit`).
- [ ] Preserves all existing Workvence design tokens, buttons, and responsive viewports.
