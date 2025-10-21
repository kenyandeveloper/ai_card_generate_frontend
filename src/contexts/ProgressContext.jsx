import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { progressApi, dashboardApi } from "../utils/apiClient";
import { handleApiError } from "../services/errorHandler";

const FIVE_MINUTES = 5 * 60 * 1000;

const ProgressContext = createContext(null);

export const useProgressContext = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgressContext must be used within ProgressProvider");
  }
  return context;
};

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

  const setTimestamp = useCallback((key) => {
    setCacheTimestamp((prev) => ({
      ...prev,
      [key]: Date.now(),
    }));
  }, []);

  const isFresh = useCallback(
    (key) => {
      const timestamp = cacheTimestamp[key];
      if (!timestamp) return false;
      return Date.now() - timestamp < FIVE_MINUTES;
    },
    [cacheTimestamp]
  );

  const fetchProgressForDeck = useCallback(
    async (deckId, { forceRefresh = false } = {}) => {
      if (!deckId) return null;

      const key = String(deckId);
      const cached = progressByDeck[key];
      if (!forceRefresh && cached && isFresh(key)) {
        return cached;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await progressApi.listByDeck(deckId);
        setProgressByDeck((prev) => ({
          ...prev,
          [key]: data,
        }));
        setTimestamp(key);
        return data;
      } catch (err) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
        console.error("Failed to fetch progress for deck:", errorInfo);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isFresh, progressByDeck, setTimestamp]
  );

  const fetchAllProgress = useCallback(
    async ({ forceRefresh = false } = {}) => {
      const key = "__all__";
      if (!forceRefresh && allProgress && isFresh(key)) {
        return allProgress;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await progressApi.list();
        setAllProgress(Array.isArray(data) ? data : []);
        setTimestamp(key);
        return data;
      } catch (err) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
        console.error("Failed to fetch overall progress:", errorInfo);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [allProgress, isFresh, setTimestamp]
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
      if (!forceRefresh && dashboardStats && isFresh(key)) {
        if (import.meta.env?.DEV) {
          console.debug("[ProgressContext] Using cached dashboard stats");
        }
        return dashboardStats;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await dashboardApi.fetchDashboard();
        const normalized = normalizeDashboardPayload(data);
        setUsageInfo(data?.usage ?? null);
        const planKey = (
          data?.usage?.plan_type ??
          data?.usage?.plan ??
          ""
        )
          .toString()
          .toLowerCase();
        const entitlements = Array.isArray(data?.usage?.entitlements)
          ? data.usage.entitlements.map((item) =>
              (item || "").toString().toLowerCase()
            )
          : [];
        const premiumPlans = ["premium", "premium_monthly", "premium_daily", "daily"];
        const hasPremiumPlan =
          premiumPlans.some((slug) => planKey.includes(slug)) ||
          entitlements.some(
            (entry) =>
              entry.includes("premium") || entry.includes("daily_pass")
          );
        setIsPremium(hasPremiumPlan);
        if (import.meta.env?.DEV) {
          console.debug("[ProgressContext] Raw dashboard response:", data);
          console.debug("[ProgressContext] Normalized dashboard response:", normalized);
          console.debug("[ProgressContext] Usage:", data?.usage);
          console.debug("[ProgressContext] Plan:", data?.usage?.plan);
          console.debug("[ProgressContext] Plan type:", data?.usage?.plan_type);
        }
        setDashboardStats(normalized);
        setTimestamp(key);
        return normalized;
      } catch (err) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
      console.error("Failed to fetch dashboard stats:", errorInfo);
      setUsageInfo(null);
      setIsPremium(false);
      throw err;
    } finally {
      setLoading(false);
    }
  },
    [dashboardStats, isFresh, setTimestamp, normalizeDashboardPayload]
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
          setProgressByDeck((prev) => ({
            ...prev,
            [deckKey]: null,
          }));
          setCacheTimestamp((prev) => {
            const next = { ...prev };
            delete next[deckKey];
            return next;
          });
        }

        setAllProgress(null);
        setCacheTimestamp((prev) => {
          const next = { ...prev };
          delete next.__all__;
          delete next.dashboard;
          return next;
        });
        setDashboardStats(null);

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
      console.log(`[ProgressContext] Tracking ${enabled ? "ENABLED" : "DISABLED"}`);
    }
  }, []);

  const updateUserStats = useCallback(async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.updateUserStats(payload);

      setDashboardStats(null);
      setCacheTimestamp((prev) => {
        const next = { ...prev };
        delete next.dashboard;
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
      return next;
    });
    setCacheTimestamp((prev) => {
      const next = { ...prev };
      delete next[deckKey];
      return next;
    });
  }, []);

  const invalidateAllProgress = useCallback(() => {
    setProgressByDeck({});
    setAllProgress(null);
    setDashboardStats(null);
    setCacheTimestamp({});
    setUsageInfo(null);
    setIsPremium(false);
  }, []);

  const getCachedProgress = useCallback(
    (deckId) => {
      if (!deckId) return null;
      return progressByDeck[String(deckId)] ?? null;
    },
    [progressByDeck]
  );

  const isProgressFresh = useCallback(
    (deckId) => {
      if (!deckId) return false;
      return isFresh(String(deckId));
    },
    [isFresh]
  );

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
    ]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
