import axios from "axios";

const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_SERVER_API_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl;
  }
  const hostname = typeof window !== "undefined" && window.location.hostname
    ? window.location.hostname
    : "localhost";
  return `http://${hostname}:8080/api`;
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