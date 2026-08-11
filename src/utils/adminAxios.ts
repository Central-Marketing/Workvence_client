import axios from "axios";

const getAdminBaseURL = () => {
  if (typeof window !== "undefined") {
    return "/api/admin";
  }
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
  if (envUrl) return envUrl;

  const hostname =
    typeof window !== "undefined" && window.location.hostname
      ? window.location.hostname
      : "localhost";
  return `http://${hostname}:8082/api`;
};

const adminAxios = axios.create({
  baseURL: getAdminBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default adminAxios;
