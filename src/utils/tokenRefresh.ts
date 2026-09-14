import axios from "axios";
import { JwtPayload } from "@/types";
import { useUserStore } from "@/store/userStore";
import socket from "@/utils/socket";

// Track in-flight refresh to prevent duplicate concurrent calls
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Get cookie value by name from document.cookie (browser-only)
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )\\s*${name}\\s*=\\s*([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Set a cookie (browser-only)
 */
export function setCookie(name: string, value: string, maxAgeSec: number = 3600): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
}

/**
 * Decode JWT payload safely in both browser and Node environments
 */
export function decodeJwtPayload(token?: string): JwtPayload | null {
  if (!token || typeof token !== "string") return null;
  const trimmed = token.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
  try {
    const parts = trimmed.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload) as JwtPayload;
    } else if (typeof Buffer !== "undefined") {
      const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
      return JSON.parse(jsonPayload) as JwtPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if the current access token is expired or expiring within bufferSeconds (default: 5 mins)
 */
export function isAccessTokenExpiringSoon(bufferSeconds: number = 300): boolean {
  const token = getCookie("accessToken");
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  // payload.exp is in seconds
  const remainingMs = payload.exp * 1000 - Date.now();
  return remainingMs <= bufferSeconds * 1000;
}

/**
 * Handle authentication expiration:
 * Clears cookies, local/session storage, userStore, disconnects socket,
 * and redirects to /login on 401 errors.
 */
export function handleAuthExpired(redirectPath?: string): void {
  if (typeof window === "undefined") return;

  // 1. Purge auth cookies
  const cookiesToClear = ["accessToken", "refreshToken", "user", "isSeller", "role"];
  cookiesToClear.forEach((name) => {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  });

  // 2. Clear storage
  localStorage.removeItem("user");
  sessionStorage.removeItem("kyc_prompt_dismissed_session");

  // 3. Reset Zustand store
  try {
    useUserStore.getState().setUser(null);
  } catch {
    // Ignore store access failure
  }

  // 4. Disconnect realtime socket
  try {
    socket.disconnect();
  } catch {
    // Ignore socket error
  }

  // 5. Redirect to /login
  const currentTarget = redirectPath || (window.location.pathname + window.location.search);
  const isGuestAuthRoute =
    currentTarget.startsWith("/login") ||
    currentTarget.startsWith("/register") ||
    currentTarget.startsWith("/forgot-password") ||
    currentTarget.startsWith("/reset-password");

  if (!isGuestAuthRoute) {
    const loginUrl = `/login?redirect=${encodeURIComponent(currentTarget)}`;
    window.location.href = loginUrl;
  }
}

/**
 * Base URL resolver for auth endpoints
 */
const getAuthBaseURL = (): string => {
  if (typeof window !== "undefined") {
    return "/api";
  }
  const envUrl = process.env.NEXT_PUBLIC_SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    const cleaned = envUrl.trim().replace(/\/$/, "");
    return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
  }
  return "https://devadmin.workvence.com/api";
};

/**
 * Refresh access token using POST /api/auth/refresh-token
 * Sends credentials (Cookie: refreshToken) + header fallback (x-refresh-token: <token>)
 * Concurrency-safe: Queues simultaneous callers to a single in-flight request.
 */
export async function refreshAccessToken(): Promise<string> {
  // If already refreshing, wait for existing promise
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((token) => {
        if (token) {
          resolve(token);
        } else {
          reject(new Error("Refresh token expired or invalid"));
        }
      });
    });
  }

  isRefreshing = true;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Header method: x-refresh-token: <refresh_token>
    const refreshToken = getCookie("refreshToken");
    if (refreshToken) {
      headers["x-refresh-token"] = refreshToken;
    }

    // Call /api/auth/refresh-token using dedicated axios instance to avoid interceptor recursion
    const response = await axios.post(
      `${getAuthBaseURL()}/auth/refresh-token`,
      {},
      {
        withCredentials: true,
        headers,
      }
    );

    const newAccessToken = response.data?.accessToken;
    if (newAccessToken) {
      // Access token lifetime: 1 hour (3600 seconds)
      setCookie("accessToken", newAccessToken, 3600);
      isRefreshing = false;
      onRefreshed(newAccessToken);
      return newAccessToken;
    }

    throw new Error("No accessToken returned by refresh endpoint");
  } catch (error: any) {
    isRefreshing = false;
    onRefreshed(null);

    // Error 401 — Invalid or expired token: Redirect user to login page
    if (error.response?.status === 401) {
      handleAuthExpired();
    }

    throw error;
  }
}
