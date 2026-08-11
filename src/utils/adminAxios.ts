import axios from "axios";

const getAdminBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL;

  if (typeof window !== "undefined") {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isLocal) {
      return `http://${window.location.hostname}:8082/api/admin`;
    }

    if (envUrl) {
      const cleanUrl = envUrl.replace(/\/$/, "");
      return cleanUrl.endsWith("/admin") ? cleanUrl : `${cleanUrl}/admin`;
    }

    return `${window.location.origin}/api/admin`;
  }

  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/$/, "");
    return cleanUrl.endsWith("/admin") ? cleanUrl : `${cleanUrl}/admin`;
  }

  return "http://localhost:8082/api/admin";
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
