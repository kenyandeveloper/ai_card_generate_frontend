import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getBillingStatus } from "../utils/billingApi";
import { useUser } from "../hooks/useUser";

const BillingContext = createContext(null);

const CACHE_KEY = "flashlearn:billing_status";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const readCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data || !parsed?.timestamp) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // Ignore caching issues (e.g., private mode)
  }
};

const clearCache = () => {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore storage issues
  }
};

export const BillingProvider = ({ children }) => {
  const { isAuthenticated } = useUser();
  const [billingStatus, setBillingStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setBillingStatus(null);
      setIsLoading(false);
      clearCache();
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const status = await getBillingStatus();
      setBillingStatus(status);
      writeCache(status);
      return status;
    } catch (err) {
      console.error("[BillingContext] Failed to fetch billing status:", err);
      setError(err?.message || "Failed to load billing status");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setBillingStatus(null);
      setError(null);
      setIsLoading(false);
      clearCache();
      return;
    }

    const cached = readCache();
    if (cached) {
      setBillingStatus(cached);
    }

    let cancelled = false;
    const run = async () => {
      try {
        await refresh();
      } catch {
        if (!cached && !cancelled) {
          setBillingStatus(null);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refresh]);

  const isActive = Boolean(
    billingStatus?.subscription_status &&
      billingStatus.subscription_status === "active"
  );

  const value = useMemo(
    () => ({
      billingStatus,
      isLoading,
      error,
      refresh,
      isActive,
      isPremium: isActive,
    }),
    [billingStatus, error, isActive, isLoading, refresh]
  );

  return (
    <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error("useBilling must be used within BillingProvider");
  }
  return context;
};
