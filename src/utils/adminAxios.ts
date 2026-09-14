import axios, { InternalAxiosRequestConfig } from "axios";
import { getCookie, refreshAccessToken, handleAuthExpired } from "./tokenRefresh";

const getAdminBaseURL = () => {
  if (typeof window !== "undefined") {
    return "/api/admin";
  }

  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL;
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/$/, "");
    return cleanUrl.endsWith("/admin") ? cleanUrl : `${cleanUrl}/admin`;
  }

  return "https://devadmin.workvence.com/api/admin";
};

const adminAxios = axios.create({
  baseURL: getAdminBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to prevent double /admin/ pathing in URLs and attach auth token
adminAxios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.url && config.url.startsWith("/admin/")) {
    config.url = config.url.replace(/^\/admin\//, "/");
  }

  const accessToken = getCookie("accessToken");
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Automatic token refresh interceptor for admin requests on 401
adminAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest?.url || "";
    const isAuthRoute =
      requestUrl.includes("/auth/refresh-token") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/login");

    if (isAuthRoute) {
      if (requestUrl.includes("/auth/refresh")) {
        handleAuthExpired();
      }
      return Promise.reject(error);
    }

    if (originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return adminAxios(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default adminAxios;
