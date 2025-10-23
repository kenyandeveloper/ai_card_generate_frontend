import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { progressApi, dashboardApi } from "../utils/apiClient";
import { handleApiError } from "../services/errorHandler";
import { getToken } from "../utils/authToken";
import { FIVE_MINUTES, MAX_RETRY_ATTEMPTS } from "../utils/cache/cacheHelpers";
import { ProgressContext } from "../hooks/useProgressContext";

export const ProgressProvider = ({ children }) => {
  const [progressByDeck, setProgressByDeck] = useState({});
  const [allProgress, setAllProgress] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cacheTimestamp, setCacheTimestamp] = useState({});
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [usageInfo, setUsageInfo] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  // Circuit breaker refs
  const retryCountRef = useRef({});
  const fetchInProgressRef = useRef({});
  const progressByDeckRef = useRef(progressByDeck);
  const allProgressRef = useRef(allProgress);
  const dashboardStatsRef = useRef(dashboardStats);
  const cacheTimestampRef = useRef(cacheTimestamp);

  const canAttemptFetch = useCallback((key) => {
    if (!getToken()) {
      if (import.meta.env?.DEV) {
        console.debug(`[ProgressContext] No auth token for ${key}`);
      }
      return false;
    }

    if (fetchInProgressRef.current[key]) {
      if (import.meta.env?.DEV) {
        console.debug(`[ProgressContext] Fetch in progress for ${key}`);
      }
      return false;
    }

    const retryCount = retryCountRef.current[key] || 0;
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      if (import.meta.env?.DEV) {
        console.warn(`[ProgressContext] Max retries reached for ${key}`);
      }
      return false;
    }

    return true;
  }, []);

  const setTimestamp = useCallback((key) => {
    setCacheTimestamp((prev) => {
      const next = {
        ...prev,
        [key]: Date.now(),
      };
      cacheTimestampRef.current = next;
      return next;
    });
  }, []);

  const isFresh = useCallback((key) => {
    const timestamp = cacheTimestampRef.current[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < FIVE_MINUTES;
  }, []);

  useEffect(() => {
    progressByDeckRef.current = progressByDeck;
  }, [progressByDeck]);

  useEffect(() => {
    allProgressRef.current = allProgress;
  }, [allProgress]);

  useEffect(() => {
    dashboardStatsRef.current = dashboardStats;
  }, [dashboardStats]);

  useEffect(() => {
    cacheTimestampRef.current = cacheTimestamp;
  }, [cacheTimestamp]);

  const fetchProgressForDeck = useCallback(
    async (deckId, { forceRefresh = false } = {}) => {
      if (!deckId) return null;

      const key = String(deckId);

      if (!forceRefresh) {
        const cached = progressByDeckRef.current[key];
        if (cached && isFresh(key)) {
          return cached;
        }
      }

      if (!canAttemptFetch(key)) {
        return progressByDeckRef.current[key] || null;
      }

      fetchInProgressRef.current[key] = true;

      try {
        setLoading(true);
        setError(null);
        const data = await progressApi.listByDeck(deckId);
        setProgressByDeck((prev) => {
          const next = {
            ...prev,
            [key]: data,
          };
          progressByDeckRef.current = next;
          return next;
        });
        setTimestamp(key);

        // Reset retry count on success
        retryCountRef.current[key] = 0;

        return data;
      } catch (err) {
        retryCountRef.current[key] = (retryCountRef.current[key] || 0) + 1;

        const errorInfo = handleApiError(err);
        if (err?.response?.status !== 401) {
          setError(errorInfo.message);
        }
        console.error("Failed to fetch progress for deck:", errorInfo);
        throw err;
      } finally {
        setLoading(false);
        fetchInProgressRef.current[key] = false;
      }
    },
    [isFresh, setTimestamp, canAttemptFetch]
  );

  const fetchAllProgress = useCallback(
    async ({ forceRefresh = false } = {}) => {
      const key = "__all__";

      if (!forceRefresh && allProgressRef.current && isFresh(key)) {
        return allProgressRef.current;
      }

      if (!canAttemptFetch(key)) {
        return allProgressRef.current || [];
      }

      fetchInProgressRef.current[key] = true;

      try {
        setLoading(true);
        setError(null);
        const data = await progressApi.list();
        const next = Array.isArray(data) ? data : [];
        setAllProgress(next);
        allProgressRef.current = next;
        setTimestamp(key);

        // Reset retry count on success
        retryCountRef.current[key] = 0;

        return data;
      } catch (err) {
        retryCountRef.current[key] = (retryCountRef.current[key] || 0) + 1;

        const errorInfo = handleApiError(err);
        if (err?.response?.status !== 401) {
          setError(errorInfo.message);
        }
        console.error("Failed to fetch overall progress:", errorInfo);
        throw err;
      } finally {
        setLoading(false);
        fetchInProgressRef.current[key] = false;
      }
    },
    [isFresh, setTimestamp, canAttemptFetch]
  );

  const normalizeDashboardPayload = useCallback((payload) => {
    if (!payload || typeof payload !== "object") {
      return { stats: null, decks: [] };
    }

    const ratio = (value) => {
      if (typeof value !== "number") return null;
      return value > 1 ? value / 100 : value;
    };

    const valuesFromStats = (statsObj = {}) => ({
      accuracy: ratio(statsObj.accuracy ?? statsObj.accuracy_pct),
      accuracy_pct:
        typeof statsObj.accuracy_pct === "number"
          ? statsObj.accuracy_pct
          : typeof statsObj.accuracy === "number"
          ? statsObj.accuracy * 100
          : null,
      total_reviews:
        statsObj.total_reviews ?? statsObj.total_flashcards_studied ?? null,
      time_studied_minutes:
        statsObj.time_studied_minutes ?? statsObj.time_studied_week ?? null,
      avg_time_per_card: statsObj.avg_time_per_card ?? null,
      daily_accuracy: statsObj.daily_accuracy || [],
      weak_cards: statsObj.weak_cards || [],
      focus_score: statsObj.focus_score ?? null,
      study_streak: statsObj.study_streak ?? null,
      weekly_goal: statsObj.weekly_goal ?? null,
      mastery_level: statsObj.mastery_level ?? null,
      cards_mastered: statsObj.cards_mastered ?? null,
      retention_rate: ratio(
        statsObj.retention_rate ?? statsObj.accuracy ?? statsObj.accuracy_pct
      ),
    });

    if (payload.stats && payload.decks) {
      const baseStats = valuesFromStats(payload.stats);
      return {
        stats: {
          ...baseStats,
          accuracy: baseStats.accuracy,
          accuracy_pct: baseStats.accuracy_pct,
        },
        decks: Array.isArray(payload.decks) ? payload.decks : [],
        username: payload.username,
      };
    }

    const {
      accuracy,
      total_reviews,
      total_flashcards_studied,
      time_studied_minutes,
      minutes_per_day,
      daily_accuracy,
      weak_cards,
      mastery_level,
      cards_mastered,
      retention_rate,
      focus_score,
      study_streak,
      weekly_goal,
      most_reviewed_deck,
      decks,
      username,
    } = payload;

    const fallbackStats = {
      accuracy: ratio(accuracy),
      accuracy_pct:
        typeof accuracy === "number"
          ? accuracy > 1
            ? accuracy
            : accuracy * 100
          : null,
      total_reviews: total_reviews ?? total_flashcards_studied ?? null,
      time_studied_minutes: time_studied_minutes ?? minutes_per_day ?? null,
      avg_time_per_card: null,
      daily_accuracy: daily_accuracy || [],
      weak_cards: weak_cards || [],
      mastery_level: mastery_level ?? null,
      cards_mastered: cards_mastered ?? null,
      retention_rate: ratio(retention_rate ?? accuracy),
      focus_score: focus_score ?? null,
      study_streak: study_streak ?? null,
      weekly_goal: weekly_goal ?? null,
      most_reviewed_deck: most_reviewed_deck ?? null,
    };

    return {
      stats: fallbackStats,
      decks: Array.isArray(decks) ? decks : [],
      username,
    };
  }, []);

  const fetchDashboardStats = useCallback(
    async ({ forceRefresh = false } = {}) => {
      const key = "dashboard";

      const cachedStats = dashboardStatsRef.current;
      if (!forceRefresh && cachedStats && isFresh(key)) {
        if (import.meta.env?.DEV) {
          console.debug("[ProgressContext] Using cached dashboard stats");
        }
        return cachedStats;
      }

      if (!canAttemptFetch(key)) {
        return dashboardStatsRef.current;
      }

      fetchInProgressRef.current[key] = true;

      try {
        setLoading(true);
        setError(null);
        const data = await dashboardApi.fetchDashboard();
        const normalized = normalizeDashboardPayload(data);
        setUsageInfo(data?.usage ?? null);

        const planKey = (data?.usage?.plan_type ?? data?.usage?.plan ?? "")
          .toString()
          .toLowerCase();
        const entitlements = Array.isArray(data?.usage?.entitlements)
          ? data.usage.entitlements.map((item) =>
              (item || "").toString().toLowerCase()
            )
          : [];
        const premiumPlans = [
          "premium",
          "premium_monthly",
          "premium_daily",
          "daily",
        ];
        const hasPremiumPlan =
          premiumPlans.some((slug) => planKey.includes(slug)) ||
          entitlements.some(
            (entry) => entry.includes("premium") || entry.includes("daily_pass")
          );
        setIsPremium(hasPremiumPlan);

        if (import.meta.env?.DEV) {
          console.debug("[ProgressContext] Dashboard fetched successfully");
        }

        setDashboardStats(normalized);
        dashboardStatsRef.current = normalized;
        setTimestamp(key);

        // Reset retry count on success
        retryCountRef.current[key] = 0;

        return normalized;
      } catch (err) {
        retryCountRef.current[key] = (retryCountRef.current[key] || 0) + 1;

        const errorInfo = handleApiError(err);
        if (err?.response?.status !== 401) {
          setError(errorInfo.message);
        }
        console.error("Failed to fetch dashboard stats:", errorInfo);
        setUsageInfo(null);
        setIsPremium(false);
        throw err;
      } finally {
        setLoading(false);
        fetchInProgressRef.current[key] = false;
      }
    },
    [isFresh, setTimestamp, normalizeDashboardPayload, canAttemptFetch]
  );

  const logReview = useCallback(
    async (deckId, flashcardId, wasCorrect, timeSpentSeconds) => {
      const deckKey = deckId != null ? String(deckId) : null;
      try {
        setLoading(true);
        setError(null);
        if (import.meta.env?.DEV) {
          console.log("[ProgressContext] Logging review:", {
            deckId,
            flashcardId,
            wasCorrect,
            timeSpentSeconds,
            tracking: trackingEnabled,
          });
        }

        const response = await progressApi.logReview(
          deckId,
          flashcardId,
          wasCorrect,
          timeSpentSeconds,
          trackingEnabled
        );

        if (response?.tracked === false) {
          if (import.meta.env?.DEV) {
            console.log(
              "[ProgressContext] Review not tracked (tracking disabled)"
            );
          }
          return response;
        }

        if (deckKey) {
          setProgressByDeck((prev) => {
            const next = {
              ...prev,
              [deckKey]: null,
            };
            progressByDeckRef.current = next;
            return next;
          });
          setCacheTimestamp((prev) => {
            const next = { ...prev };
            delete next[deckKey];
            cacheTimestampRef.current = next;
            return next;
          });
        }

        setAllProgress(null);
        allProgressRef.current = null;
        setCacheTimestamp((prev) => {
          const next = { ...prev };
          delete next.__all__;
          delete next.dashboard;
          cacheTimestampRef.current = next;
          return next;
        });
        setDashboardStats(null);
        dashboardStatsRef.current = null;

        return response;
      } catch (err) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
        console.error("Failed to log review:", errorInfo);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [trackingEnabled]
  );

  const toggleTracking = useCallback((enabled) => {
    setTrackingEnabled(Boolean(enabled));
    if (import.meta.env?.DEV) {
      console.log(
        `[ProgressContext] Tracking ${enabled ? "ENABLED" : "DISABLED"}`
      );
    }
  }, []);

  const updateUserStats = useCallback(async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.updateUserStats(payload);

      setDashboardStats(null);
      dashboardStatsRef.current = null;
      setCacheTimestamp((prev) => {
        const next = { ...prev };
        delete next.dashboard;
        cacheTimestampRef.current = next;
        return next;
      });

      return response;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error("Failed to update user stats:", errorInfo);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const invalidateDeckProgress = useCallback((deckId) => {
    if (!deckId) return;
    const deckKey = String(deckId);
    setProgressByDeck((prev) => {
      if (!(deckKey in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[deckKey];
      progressByDeckRef.current = next;
      return next;
    });
    setCacheTimestamp((prev) => {
      const next = { ...prev };
      delete next[deckKey];
      cacheTimestampRef.current = next;
      return next;
    });
  }, []);

  const invalidateAllProgress = useCallback(() => {
    setProgressByDeck({});
    progressByDeckRef.current = {};
    setAllProgress(null);
    allProgressRef.current = null;
    setDashboardStats(null);
    dashboardStatsRef.current = null;
    setCacheTimestamp({});
    cacheTimestampRef.current = {};
    setUsageInfo(null);
    setIsPremium(false);
    retryCountRef.current = {};
    fetchInProgressRef.current = {};
  }, []);

  const getCachedProgress = useCallback((deckId) => {
    if (!deckId) return null;
    return progressByDeckRef.current[String(deckId)] ?? null;
  }, []);

  const isProgressFresh = useCallback(
    (deckId) => {
      if (!deckId) return false;
      return isFresh(String(deckId));
    },
    [isFresh]
  );

  const resetRetryCount = useCallback(() => {
    retryCountRef.current = {};
  }, []);

  useEffect(() => {
    const handleAuthReset = () => {
      if (import.meta.env?.DEV) {
        console.debug("[ProgressContext] Auth reset, clearing state");
      }
      invalidateAllProgress();
    };

    window.addEventListener("auth:unauthorized", handleAuthReset);
    return () => {
      window.removeEventListener("auth:unauthorized", handleAuthReset);
    };
  }, [invalidateAllProgress]);

  const value = useMemo(
    () => ({
      progressByDeck,
      allProgress,
      dashboardStats,
      loading,
      error,
      cacheTimestamp,
      usageInfo,
      isPremium,
      trackingEnabled,
      fetchProgressForDeck,
      fetchAllProgress,
      fetchDashboardStats,
      logReview,
      updateUserStats,
      invalidateDeckProgress,
      invalidateAllProgress,
      getCachedProgress,
      isProgressFresh,
      toggleTracking,
      resetRetryCount,
    }),
    [
      progressByDeck,
      allProgress,
      dashboardStats,
      loading,
      error,
      cacheTimestamp,
      usageInfo,
      isPremium,
      trackingEnabled,
      fetchProgressForDeck,
      fetchAllProgress,
      fetchDashboardStats,
      logReview,
      updateUserStats,
      invalidateDeckProgress,
      invalidateAllProgress,
      getCachedProgress,
      isProgressFresh,
      toggleTracking,
      resetRetryCount,
    ]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
