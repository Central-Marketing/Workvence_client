import { NextRequest, NextResponse } from "next/server";

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

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. Extract authentication tokens and session cookies
  const authCookie =
    req.cookies.get("accessToken")?.value ||
    req.cookies.get("token")?.value ||
    req.cookies.get("jwt")?.value ||
    req.cookies.get("auth_token")?.value ||
    req.cookies.get("session")?.value;

  const userCookie = req.cookies.get("user")?.value;
  let parsedUser: any = null;
  if (userCookie) {
    try {
      parsedUser = JSON.parse(decodeURIComponent(userCookie));
    } catch {
      // User cookie is not JSON formatted
    }
  }

  const isSellerCookie = req.cookies.get("isSeller")?.value;
  const roleCookie = req.cookies.get("role")?.value?.toLowerCase();

  // Determine user authentication and role state
  const isAuthenticated = Boolean(authCookie || parsedUser);
  const isSeller = Boolean(
    isSellerCookie === "true" ||
    roleCookie === "seller" ||
    parsedUser?.isSeller === true ||
    parsedUser?.role === "seller"
  );
  const isAdmin = Boolean(
    roleCookie === "admin" ||
    parsedUser?.isAdmin === true ||
    parsedUser?.role === "admin"
  );

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
  const isGeneralProtectedRoute = GENERAL_PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAnyProtectedRoute = isAdminRoute || isSellerRoute || isGeneralProtectedRoute;

  // -------------------------------------------------------------
  // RULE A: Redirect Logged-In Users away from Guest Auth Pages
  // -------------------------------------------------------------
  if (isAuthGuestRoute && isAuthenticated) {
    const redirectUrl = searchParams.get("redirect") || "/dashboard";
    // Prevent open redirect loops
    const safeTarget = redirectUrl.startsWith("/") ? redirectUrl : "/dashboard";
    return NextResponse.redirect(new URL(safeTarget, req.url));
  }

  // -------------------------------------------------------------
  // RULE B: Protect Authenticated Routes from Unauthenticated Guests
  // -------------------------------------------------------------
  if (isAnyProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // -------------------------------------------------------------
  // RULE C: Protect Admin Routes (Role: Admin)
  // -------------------------------------------------------------
  if (isAdminRoute && !isAdmin) {
    // If regular authenticated user attempts to access /admin, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // -------------------------------------------------------------
  // RULE D: Protect Seller Routes (Role: Seller / Admin)
  // -------------------------------------------------------------
  if (isSellerRoute && !isSeller && !isAdmin) {
    // If a buyer attempts to access /earnings, /my-packages, or /kyc, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // -------------------------------------------------------------
  // RULE E: Allow Request to Proceed
  // -------------------------------------------------------------
  return NextResponse.next();
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
