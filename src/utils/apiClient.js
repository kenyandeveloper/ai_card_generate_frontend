// src/utils/apiClient.js
import axios from "axios";

// Normalize base URL (no trailing slash)
const BASE_URL = import.meta.env.VITE_API_URL;

// Read a JWT from any of your legacy keys (keeps compatibility)
function getToken() {
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

const api = axios.create({
  baseURL: BASE_URL,
  // IMPORTANT: don't force credentials globally; set per request in interceptor
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach Authorization header if present AND toggle withCredentials per request
api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    // Header-based auth → do NOT send cookies; avoids credentialed CORS unless needed
    config.headers.Authorization = `Bearer ${token}`;
    config.withCredentials = false;
  } else {
    // No token → allow cookie-based auth (if your backend sets JWT cookies)
    config.withCredentials = true;
  }

  return config;
});

// Optional: small logger to help spot CORS/401s while debugging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Surface useful context in dev
    if (import.meta?.env?.DEV) {
      const url = err?.config?.url || "(unknown)";
      const status = err?.response?.status;
      const msg = err?.response?.data || err?.message;
      // eslint-disable-next-line no-console
      console.warn(`[api] ${status || "ERR"} @ ${url}`, msg);
    }
    return Promise.reject(err);
  }
);

export default api;
