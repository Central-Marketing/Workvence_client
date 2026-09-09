import { NextRequest, NextResponse } from "next/server";
import { JwtPayload, User } from "@/types";

/**
 * Route Categorization
 */

// 1. Guest-only routes (redirect authenticated users to dashboard)
const AUTH_GUEST_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// 2. Admin-only routes (requires isAdmin role)
const ADMIN_ROUTES = [
  "/admin",
];

// 3. Seller-only routes (requires isSeller role)
const SELLER_ROUTES = [
  "/earnings",
  "/my-packages",
  "/kyc",
  "/settings/verification",
  "/seller/suspended",
  "/suspended-seller",
];

// 4. Authenticated routes accessible by both Buyers and Sellers
const GENERAL_PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/orders",
  "/messages",
  "/message",
  "/favorites",
  "/pay",
  "/organize",
  "/briefs/create",
  "/briefs/my-briefs",
  "/support",
];

function decodeJwtPayload(token?: string): JwtPayload | null {
  if (!token || typeof token !== "string") return null;
  const trimmed = token.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
  try {
    const parts = trimmed.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. Extract authentication tokens from cookies
  const authCookie = req.cookies.get("accessToken")?.value;
  const refreshCookie = req.cookies.get("refreshToken")?.value;

  const jwtPayload = decodeJwtPayload(authCookie);
  const refreshPayload = decodeJwtPayload(refreshCookie);

  const isJwtValid = Boolean(
    jwtPayload &&
    (!jwtPayload.exp || jwtPayload.exp * 1000 > Date.now())
  );

  const isRefreshTokenValid = Boolean(
    refreshPayload &&
    (!refreshPayload.exp || refreshPayload.exp * 1000 > Date.now())
  );

  // Automatic server-side access token refresh if expired but refresh token is valid
  let refreshedAccessToken: string | null = null;
  let refreshFailed = false;

  if (!isJwtValid && isRefreshTokenValid && refreshCookie) {
    try {
      const rawMainUrl = (
        process.env.NEXT_PUBLIC_SERVER_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8080/api"
      ).trim().replace(/\/$/, "");
      const mainApiUrl = rawMainUrl.endsWith("/api") ? rawMainUrl : `${rawMainUrl}/api`;

      const refreshRes = await fetch(`${mainApiUrl}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": `refreshToken=${refreshCookie}`,
          "x-refresh-token": refreshCookie,
        },
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data?.accessToken) {
          refreshedAccessToken = data.accessToken;
        }
      } else if (refreshRes.status === 401) {
        refreshFailed = true;
      }
    } catch {
      // Backend unreachable or offline, proceed with client-side fallback
    }
  }

  const effectiveJwtPayload = refreshedAccessToken
    ? decodeJwtPayload(refreshedAccessToken)
    : jwtPayload;

  const userCookie = req.cookies.get("user")?.value;
  let parsedUser: User | null = null;
  if (userCookie && userCookie !== "undefined" && userCookie !== "null") {
    try {
      parsedUser = JSON.parse(decodeURIComponent(userCookie)) as User;
    } catch {
      try {
        parsedUser = JSON.parse(userCookie) as User;
      } catch {
        // User cookie is not JSON formatted
      }
    }
  }

  const isParsedUserValid = Boolean(
    parsedUser &&
    typeof parsedUser === "object" &&
    (parsedUser._id || parsedUser.id || parsedUser.username || parsedUser.email)
  );

  const hasValidJwtUser = Boolean(
    (refreshedAccessToken || isJwtValid) &&
    effectiveJwtPayload &&
    (effectiveJwtPayload.id || effectiveJwtPayload._id || effectiveJwtPayload.username || effectiveJwtPayload.email)
  );

  const hasSessionToken = Boolean(
    refreshedAccessToken ||
    (!refreshFailed && (
      (authCookie && authCookie.trim() !== "" && authCookie !== "undefined" && authCookie !== "null") ||
      (refreshCookie && refreshCookie.trim() !== "" && refreshCookie !== "undefined" && refreshCookie !== "null")
    ))
  );

  // Authenticated requires either a verified unexpired JWT with user identity OR a verified user cookie paired with an active session token
  const isAuthenticated = !refreshFailed && (hasValidJwtUser || (isParsedUserValid && hasSessionToken));

  const isSellerCookie = req.cookies.get("isSeller")?.value;
  const roleCookie = req.cookies.get("role")?.value?.toLowerCase();

  // Determine user role state
  const isSeller = Boolean(
    isSellerCookie === "true" ||
    roleCookie === "seller" ||
    parsedUser?.isSeller === true ||
    parsedUser?.role === "seller" ||
    effectiveJwtPayload?.isSeller === true ||
    effectiveJwtPayload?.role === "seller" ||
    refreshPayload?.isSeller === true ||
    refreshPayload?.role === "seller"
  );
  const isAdmin = Boolean(
    roleCookie === "admin" ||
    parsedUser?.isAdmin === true ||
    parsedUser?.role === "admin" ||
    effectiveJwtPayload?.isAdmin === true ||
    effectiveJwtPayload?.role === "admin" ||
    refreshPayload?.isAdmin === true ||
    refreshPayload?.role === "admin"
  );

  // Helper to attach renewed access token cookie to responses
  const applyRefreshedCookie = (response: NextResponse): NextResponse => {
    if (refreshedAccessToken) {
      response.cookies.set("accessToken", refreshedAccessToken, {
        path: "/",
        maxAge: 3600, // 1 hour lifetime
        sameSite: "lax",
      });
    }
    return response;
  };

  // 2. Match Route Groups
  const isAuthGuestRoute = AUTH_GUEST_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isSellerRoute = SELLER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isGeneralProtectedRoute =
    GENERAL_PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    ) ||
    (pathname.startsWith("/briefs/") && pathname.endsWith("/proposals"));

  const isAnyProtectedRoute = isAdminRoute || isSellerRoute || isGeneralProtectedRoute;

  // -------------------------------------------------------------
  // RULE A: Redirect Logged-In Users away from Guest Auth Pages
  // -------------------------------------------------------------
  if (isAuthGuestRoute && isAuthenticated) {
    const isSellerIntent = searchParams.get("seller") === "true";
    // Allow /register?seller=true to remain accessible for both authenticated and unauthenticated users
    if (pathname === "/register" && isSellerIntent) {
      return applyRefreshedCookie(NextResponse.next());
    }

    const redirectTarget = searchParams.get("redirect") || "/dashboard";
    // Prevent open redirect loops to auth pages
    const safeTarget = (redirectTarget.startsWith("/") && !redirectTarget.startsWith("/login") && !redirectTarget.startsWith("/register"))
      ? redirectTarget
      : "/dashboard";
    return applyRefreshedCookie(NextResponse.redirect(new URL(safeTarget, req.url)));
  }

  // -------------------------------------------------------------
  // RULE B: Protect Authenticated Routes from Unauthenticated Guests
  // -------------------------------------------------------------
  if (isAnyProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clear cookies if refresh failed or tokens are invalid
    if (refreshFailed) {
      ["accessToken", "refreshToken", "user", "isSeller", "role"].forEach((cookieName) => {
        response.cookies.delete(cookieName);
      });
    }
    return response;
  }

  // -------------------------------------------------------------
  // RULE C: Protect Admin Routes (Role: Admin)
  // -------------------------------------------------------------
  if (isAdminRoute && !isAdmin) {
    // If regular authenticated user attempts to access /admin, redirect to dashboard
    return applyRefreshedCookie(NextResponse.redirect(new URL("/dashboard", req.url)));
  }

  // -------------------------------------------------------------
  // RULE D: Protect Seller Routes (Role: Seller / Admin)
  // -------------------------------------------------------------
  if (isSellerRoute && !isSeller && !isAdmin) {
    // If explicitly verified as a non-seller buyer, redirect to dashboard
    if (isSellerCookie === "false" || parsedUser?.isSeller === false || effectiveJwtPayload?.isSeller === false) {
      return applyRefreshedCookie(NextResponse.redirect(new URL("/dashboard", req.url)));
    }
  }

  // -------------------------------------------------------------
  // RULE E: Allow Request to Proceed
  // -------------------------------------------------------------
  return applyRefreshedCookie(NextResponse.next());
}

/**
 * Matcher Configuration
 * Runs proxy on all application routes while skipping static assets, media, Next internals, and API routes.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public media files (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     * - api routes (/api/*)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
