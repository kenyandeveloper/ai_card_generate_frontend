import { createContext, useState, useContext, useEffect, useCallback } from "react";
import {
  getToken,
  setToken as writeToken,
  clearToken,
} from "../../utils/authToken";
import { authApi } from "../../utils/apiClient";

const UserContext = createContext();
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

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setOtpRequired(false);
  }, []);

  // ---------- user fetch ----------
  const refreshUser = async () => {
    try {
      const data = await authApi.getUser();
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

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  // ---------- auth flows ----------
  const signup = async (email, username, password) => {
    await authApi.signup({ email, username, password });
    setOtpRequired(true);
    return { verification_required: true };
  };

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
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
    authApi.requestOtp({ email }).then((d) => {
      setOtpRequired(d?.status !== "skipped");
      return d;
    });

  const verifyOtp = async (email, otp_id, code) => {
    const data = await authApi.verifyOtp({ email, otp_id, code });
    const token = data?.access_token || data?.token;
    if (!token) throw new Error("Missing access token in response");
    setToken(token);
    await refreshUser();
    setOtpRequired(false);
    return { success: true };
  };

  const requestPasswordReset = async (email) =>
    authApi.requestPasswordReset({ email });

  const resetPassword = async (email, otp_id, code, new_password) =>
    authApi.resetPassword({ email, otp_id, code, new_password });

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
