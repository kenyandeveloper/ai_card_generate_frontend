import React, { createContext, useState, useContext, useEffect } from "react";
import {
  getToken,
  setToken as writeToken,
  clearToken,
} from "../../utils/authToken";

const UserContext = createContext();
const API_URL = import.meta.env?.VITE_API_URL;

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otpRequired, setOtpRequired] = useState(false);

  // ---------- helpers ----------
  const setToken = (token) => {
    if (token) {
      writeToken(token);
      setIsAuthenticated(true);
    } else {
      clearToken();
      setIsAuthenticated(false);
    }
  };

  const authHeaders = () => {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
    // If you move to cookie auth, return {} and rely on credentials.
  };

  const parseMaybeJson = async (res) => {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    const text = await res.text();
    return text ? { _text: text } : {};
  };

  const api = async (path, init = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
      // NOTE: we don’t set credentials here; header auth is default via authHeaders().
    });
    if (res.status === 401) {
      logout();
      throw new Error("Unauthorized");
    }
    const data = await parseMaybeJson(res);
    if (!res.ok) {
      const msg = data?.error || data?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  };

  const authedApi = (path, init = {}) =>
    api(path, {
      ...init,
      headers: { ...authHeaders(), ...(init.headers || {}) },
    });

  // ---------- user fetch ----------
  const refreshUser = async () => {
    try {
      const data = await authedApi("/user", { method: "GET" });
      setUser(data);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      console.error("Error fetching user:", err);
      logout();
      throw err;
    }
  };

  const fetchUser = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- auth flows ----------
  const signup = async (email, username, password) => {
    await api("/signup", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
    setOtpRequired(true);
    return { verification_required: true };
  };

  const login = async (email, password) => {
    const data = await api("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data?.access_token) {
      setToken(data.access_token);
      await refreshUser();
      setOtpRequired(false);
      return { success: true };
    }
    if (data?.verification_required || data?.mfa_required) {
      setOtpRequired(true);
      return { verification_required: true };
    }
    setOtpRequired(true);
    return { verification_required: true };
  };

  const requestOtp = async (email) =>
    api("/login/otp/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    }).then((d) => {
      setOtpRequired(d?.status !== "skipped");
      return d;
    });

  const verifyOtp = async (email, otp_id, code) => {
    const data = await api("/login/otp/verify", {
      method: "POST",
      body: JSON.stringify({ email, otp_id, code }),
    });
    const token = data?.access_token || data?.token;
    if (!token) throw new Error("Missing access token in response");
    setToken(token);
    await refreshUser();
    setOtpRequired(false);
    return { success: true };
  };

  const requestPasswordReset = async (email) =>
    api("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

  const resetPassword = async (email, otp_id, code, new_password) =>
    api("/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp_id, code, new_password }),
    });

  const logout = () => {
    setToken(null);
    setUser(null);
    setOtpRequired(false);
  };

  // ---------- role helper ----------
  const hasRole = (...roles) => {
    const r = user?.role;
    return !!r && roles.includes(r);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser, // ← expose so TeacherInviteDialog can update after /user refetch
        isAuthenticated,
        loading,
        otpRequired,
        signup,
        login,
        requestOtp,
        verifyOtp,
        logout,
        requestPasswordReset,
        resetPassword,
        hasRole, // ← helper for UI gating
        refreshUser, // ← optional if you want to manually refetch /user elsewhere
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
