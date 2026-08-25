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

function decodeJwtPayload(token?: string): any {
  if (!token || typeof token !== "string") return null;
  const trimmed = token.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
  try {
    const parts = trimmed.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. Extract authentication token from accessToken cookie
  const authCookie = req.cookies.get("accessToken")?.value;

  const jwtPayload = decodeJwtPayload(authCookie);
  const isJwtValid = Boolean(
    jwtPayload &&
    (!jwtPayload.exp || jwtPayload.exp * 1000 > Date.now())
  );

  const userCookie = req.cookies.get("user")?.value;
  let parsedUser: any = null;
  if (userCookie && userCookie !== "undefined" && userCookie !== "null") {
    try {
      parsedUser = JSON.parse(decodeURIComponent(userCookie));
    } catch {
      // User cookie is not JSON formatted
    }
  }

  const isParsedUserValid = Boolean(
    parsedUser &&
    typeof parsedUser === "object" &&
    (parsedUser._id || parsedUser.id || parsedUser.username || parsedUser.email)
  );

  // Valid authentication requires a valid, unexpired JWT or a verified user session
  const hasAuthTokenString = Boolean(
    authCookie &&
    authCookie.trim() !== "" &&
    authCookie !== "undefined" &&
    authCookie !== "null"
  );
  const isAuthenticated = isJwtValid || (hasAuthTokenString && isParsedUserValid);

  const isSellerCookie = req.cookies.get("isSeller")?.value;
  const roleCookie = req.cookies.get("role")?.value?.toLowerCase();

  // Determine user role state
  const isSeller = Boolean(
    isSellerCookie === "true" ||
    roleCookie === "seller" ||
    parsedUser?.isSeller === true ||
    parsedUser?.role === "seller" ||
    jwtPayload?.isSeller === true ||
    jwtPayload?.role === "seller"
  );
  const isAdmin = Boolean(
    roleCookie === "admin" ||
    parsedUser?.isAdmin === true ||
    parsedUser?.role === "admin" ||
    jwtPayload?.isAdmin === true ||
    jwtPayload?.role === "admin"
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
    if (pathname === "/register" && isSellerIntent && !isSeller) {
      return NextResponse.redirect(new URL("/settings/verification", req.url));
    }

    const redirectUrl = searchParams.get("redirect") || "/dashboard";
    // Prevent open redirect loops to auth pages
    const safeTarget = (redirectUrl.startsWith("/") && !redirectUrl.startsWith("/login") && !redirectUrl.startsWith("/register"))
      ? redirectUrl
      : "/dashboard";
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
    // If explicitly verified as a non-seller buyer, redirect to dashboard
    if (isSellerCookie === "false" || parsedUser?.isSeller === false || jwtPayload?.isSeller === false) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
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
