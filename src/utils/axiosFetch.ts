import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getCookie, refreshAccessToken, handleAuthExpired } from "./tokenRefresh";

const getBaseURL = (): string => {
  if (typeof window !== "undefined") {
    return "/api";
  }
  const envUrl = process.env.NEXT_PUBLIC_SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    const cleaned = envUrl.trim().replace(/\/$/, '');
    return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
  }
  return "https://devadmin.workvence.com/api";
};

const axiosFetch: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true
});

axiosFetch.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Strip duplicate /api/ prefix if URL starts with /api/
  if (config.url && config.url.startsWith("/api/")) {
    config.url = config.url.replace(/^\/api\//, "/");
  }

  // Attach access token header if available in cookie
  const accessToken = getCookie("accessToken");
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
