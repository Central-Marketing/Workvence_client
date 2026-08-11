import axios from "axios";

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return "/api";
  }
  return process.env.NEXT_PUBLIC_SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
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