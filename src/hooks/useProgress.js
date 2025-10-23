import { useEffect, useMemo, useRef } from "react";
import { useProgressContext } from "../hooks/useProgressContext";
import { getToken } from "../utils/authToken";

export const useProgress = (deckId = null, skipFetch = false) => {
  const progressContext = useProgressContext();
  const { fetchProgressForDeck, getCachedProgress, isProgressFresh } =
    progressContext;

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Guard conditions
    if (skipFetch || !deckId) {
      return;
    }

    // Don't fetch without auth token
    if (!getToken()) {
      if (import.meta.env?.DEV) {
        console.debug("[useProgress] No auth token, skipping fetch");
      }
      return;
    }

    // Only fetch once if not fresh
    if (!hasFetchedRef.current && !isProgressFresh(deckId)) {
      hasFetchedRef.current = true;
      fetchProgressForDeck(deckId).catch((err) => {
        if (import.meta.env?.DEV) {
          console.debug("[useProgress] Fetch failed:", err.message);
        }
        // Allow retry after auth error
        if (err?.response?.status === 401) {
          hasFetchedRef.current = false;
        }
      });
    }
  }, [deckId, skipFetch, fetchProgressForDeck, isProgressFresh]);

  const deckProgress = useMemo(
    () => (deckId ? getCachedProgress(deckId) : null),
    [deckId, getCachedProgress]
  );

  return {
    ...progressContext,
    deckProgress,
  };
};

export const useDashboardStats = (skipFetch = false) => {
  const {
    dashboardStats,
    fetchDashboardStats,
    loading,
    error,
    resetRetryCount,
  } = useProgressContext();

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Guard conditions
    if (skipFetch || dashboardStats) {
      return;
    }

    // Don't fetch without auth token
    if (!getToken()) {
      if (import.meta.env?.DEV) {
        console.debug("[useDashboardStats] No auth token, skipping fetch");
      }
      return;
    }

    // Only fetch once
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      if (import.meta.env?.DEV) {
        console.debug("[useDashboardStats] Trigger fetchDashboardStats()");
      }
      fetchDashboardStats().catch((err) => {
        if (import.meta.env?.DEV) {
          console.debug("[useDashboardStats] Fetch failed:", err.message);
        }
        // Allow retry after auth error
        if (err?.response?.status === 401) {
          hasFetchedRef.current = false;
        }
      });
    }
  }, [skipFetch, dashboardStats, fetchDashboardStats]);

  // Reset fetch tracking on auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      hasFetchedRef.current = false;
      resetRetryCount();
    };

    window.addEventListener("auth:unauthorized", handleAuthChange);
    return () => {
      window.removeEventListener("auth:unauthorized", handleAuthChange);
    };
  }, [resetRetryCount]);

  useEffect(() => {
    if (dashboardStats && import.meta.env?.DEV) {
      console.debug("[useDashboardStats] dashboardStats:", dashboardStats);
      console.debug("[useDashboardStats] stats:", dashboardStats?.stats);
      console.debug("[useDashboardStats] decks:", dashboardStats?.decks);
      console.debug(
        "[useDashboardStats] weak_cards:",
        dashboardStats?.stats?.weak_cards
      );
    }
  }, [dashboardStats]);

  return {
    data: dashboardStats?.stats || null,
    decks: dashboardStats?.decks || [],
    loading,
    error,
    refetch: (options = {}) => {
      hasFetchedRef.current = false;
      resetRetryCount();
      return fetchDashboardStats({ forceRefresh: true, ...options });
    },
  };
};
