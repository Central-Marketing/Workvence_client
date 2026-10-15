import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getCookie, refreshAccessToken, handleAuthExpired } from "./tokenRefresh";

const getBaseURL = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_API_URL || "";
  if (typeof window !== "undefined") {
    try {
      const pathname = new URL(envUrl, window.location.origin).pathname.replace(/\/$/, "");
      return pathname || "/api/v1";
    } catch {
      return "/api/v1";
    }
  }
  return envUrl.trim().replace(/\/$/, "");
};

const axiosFetch: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true
});

axiosFetch.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Strip duplicate prefix if caller already included baseURL or /api
  if (config.url) {
    const base = getBaseURL();
    if (base && base !== "/" && config.url.startsWith(base)) {
      config.url = config.url.slice(base.length) || "/";
    }
    if (config.url.startsWith("/api/v1/")) {
      config.url = config.url.replace(/^\/api\/v1\//, "/");
    } else if (config.url.startsWith("/api/")) {
      config.url = config.url.replace(/^\/api\//, "/");
    }
  }

  // Attach access token header if available in cookie or localStorage
  const accessToken =
    getCookie("accessToken") ||
    (typeof window !== "undefined" ? localStorage.getItem("accessToken") || localStorage.getItem("token") : null);
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Automatic token refresh interceptor on 401 Unauthorized
axiosFetch.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest?.url || "";
    const isAuthRoute =
      requestUrl.includes("/auth/refresh-token") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register");

    // If an auth route itself returned 401, do not attempt to refresh to prevent loops
    if (isAuthRoute) {
      if (requestUrl.includes("/auth/refresh")) {
        handleAuthExpired();
      }
      return Promise.reject(error);
    }

    // Attempt token refresh if not already retried
    if (originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // Only attempt refresh if user has an active session
      // (accessToken, user cookie, HttpOnly session indicator, or stored session)
      const hasSession = Boolean(
        originalRequest.headers?.Authorization ||
        getCookie("accessToken") ||
        getCookie("user") ||
        getCookie("isSeller") ||
        getCookie("refreshToken") ||
        (typeof window !== "undefined" &&
          (localStorage.getItem("user") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("refreshToken")))
      );
      if (!hasSession) {
        return Promise.reject(error);
      }

      try {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosFetch(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosFetch;
