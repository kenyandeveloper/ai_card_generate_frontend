import axios from "axios";

// Strip trailing slash so we don’t get double slashes in requests
const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://ai-card-generate-backend.onrender.com"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// 🔐 Accept any of these keys (matches your current use of "authToken")
function getToken() {
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
}

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
