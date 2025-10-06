import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

// Prefer env var, fallback to local API
const API_URL = import.meta.env?.VITE_API_URL;
const TOKEN_KEY = "authToken";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // When true, UI should prompt for email verification (OTP flow)
  const [otpRequired, setOtpRequired] = useState(false);

  // ---------------- helpers ----------------

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const setToken = (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setIsAuthenticated(false);
    }
  };

  const authHeaders = () => {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
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
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
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
      headers: {
        ...authHeaders(),
        ...(init.headers || {}),
      },
    });

  // ---------------- user fetch ----------------

  const fetchUser = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      // Your /user currently returns the JWT identity (likely user id).
      // If you later return a full user object, this still works.
      const data = await authedApi("/user", { method: "GET" });
      setUser(data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Error fetching user:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- auth flows ----------------

  /**
   * Sign up a user.
   * We don't auto-login here. Caller should start the OTP email verification flow:
   *   await requestOtp(email) -> show modal -> verifyOtp(...)
   */
  const signup = async (email, username, password) => {
    await api("/signup", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
    // Surface to UI that verification is required.
    setOtpRequired(true);
    return { verification_required: true };
  };

  /**
   * Login with email+password.
   * Returns:
   *  - { success: true }  → fully authenticated (token received)
   *  - { verification_required: true } → must run OTP email verification
   */
  const login = async (email, password) => {
    const data = await api("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // New backend behavior: verified users get access_token immediately.
    if (data?.access_token) {
      setToken(data.access_token);
      await fetchUser();
      setOtpRequired(false);
      return { success: true };
    }

    // Unverified users:
    if (data?.verification_required || data?.mfa_required) {
      // (mfa_required kept for backward-compat in case backend still returns it)
      setOtpRequired(true);
      return { verification_required: true };
    }

    // Fallback (shouldn't normally happen)
    setOtpRequired(true);
    return { verification_required: true };
  };

  /**
   * Request an email verification OTP.
   * Returns the raw server response:
   *   - { status: "sent", otp_id, dev_code? }
   *   - { status: "skipped", reason: "already_verified" }
   */
  const requestOtp = async (email) => {
    const data = await api("/login/otp/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    // Keep UI in "OTP required" unless the server says it's skipped.
    setOtpRequired(data?.status !== "skipped");
    return data;
  };

  /**
   * Verify email with OTP; stores token and loads user.
   * Returns { success: true } on success.
   */
  const verifyOtp = async (email, otp_id, code) => {
    const data = await api("/login/otp/verify", {
      method: "POST",
      body: JSON.stringify({ email, otp_id, code }),
    });

    const token = data?.access_token || data?.token;
    if (!token) throw new Error("Missing access token in response");

    setToken(token);
    await fetchUser();
    setOtpRequired(false);
    return { success: true };
  };

  // Forgot password: request a reset code
  const requestPasswordReset = async (email) => {
    const data = await api("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    // { status: "sent", otp_id, dev_code? }  (soft-success even if email not found)
    return data;
  };
  // Forgot password: verify code + set new password
  const resetPassword = async (email, otp_id, code, new_password) => {
    const data = await api("/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp_id, code, new_password }),
    });
    // { message: "Password reset successful." }
    return data;
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    setOtpRequired(false);
  };

  // ---------------- context value ----------------

  return (
    <UserContext.Provider
      value={{
        user,
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
