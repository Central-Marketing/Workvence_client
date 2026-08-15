import axios from "axios";

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

// Interceptor to prevent double /admin/ pathing in URLs
adminAxios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith("/admin/")) {
    config.url = config.url.replace(/^\/admin\//, "/");
  }
  return config;
});

export default adminAxios;
