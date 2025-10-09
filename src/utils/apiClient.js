import axios from "axios";
import { getToken } from "./authToken";

// Normalize base URL (no trailing slash)
const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// Attach Authorization header if token exists.
// If you later switch to cookie JWT, just remove this and rely on withCredentials.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.withCredentials = false; // header-based auth → no cookies
  } else {
    config.withCredentials = true; // allow cookie-based if you ever set them
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
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
