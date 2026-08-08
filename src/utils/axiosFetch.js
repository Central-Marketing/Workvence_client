import axios from "axios";

const getBaseURL = () => {
  if (typeof window === "undefined") {
    // Server-side rendering (SSR) needs absolute URL
    return process.env.NEXT_PUBLIC_SERVER_API_URL || "http://localhost:8080/api";
  }
  // Client-side requests should always go to the relative /api proxy
  // This completely fixes CORS and cross-origin cookie issues with cloudflare tunnels!
  return "/api";
};

const axiosFetch = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true
});

axiosFetch.interceptors.request.use((config) => {
  // Strip duplicate /api/ prefix if URL starts with /api/
  if (config.url && config.url.startsWith("/api/")) {
    config.url = config.url.replace(/^\/api\//, "/");
  }
  return config;
});

export default axiosFetch;