import { useEffect, useMemo } from "react";
import { useProgressContext } from "../contexts/ProgressContext.jsx";

export const useProgress = (deckId = null, skipFetch = false) => {
  const progressContext = useProgressContext();
  const { fetchProgressForDeck, getCachedProgress, isProgressFresh } =
    progressContext;

  useEffect(() => {
    if (!skipFetch && deckId && !isProgressFresh(deckId)) {
      fetchProgressForDeck(deckId);
    }
  }, [deckId, skipFetch, isProgressFresh, fetchProgressForDeck]);

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
  const { dashboardStats, fetchDashboardStats, loading, error } =
    useProgressContext();

  useEffect(() => {
    if (!skipFetch && !dashboardStats) {
      if (import.meta.env?.DEV) {
        console.debug("[useDashboardStats] Trigger fetchDashboardStats()");
      }
      fetchDashboardStats();
    }
  }, [skipFetch, dashboardStats, fetchDashboardStats]);

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
    refetch: (options = {}) =>
      fetchDashboardStats({ forceRefresh: true, ...options }),
  };
};
