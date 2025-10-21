import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { useTheme, useMediaQuery } from "@mui/material";
import DashboardLayout from "./Dashboard/DashboardLayout";
import DashboardContent from "./Dashboard/DashboardContent";
import DashboardSkeleton from "./Dashboard/DashboardSkeleton";
import { calculateStats } from "../utils/statCalculations";
import { useDecks } from "../hooks/useDecks";
import { useDashboardStats, useProgress } from "../hooks/useProgress";
import { DataFetchWrapper } from "./common/DataFetchWrapper";

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useUser();
  const navigate = useNavigate();
  const theme = useTheme(); // still used for responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Force dark mode for the dashboard UI, regardless of system preference
  const isDarkMode = true;

  const {
    decks,
    loading: decksLoading,
    error: decksError,
    refetch: refetchDecks,
  } = useDecks({
    enabled: Boolean(isAuthenticated),
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const {
    allProgress,
    fetchAllProgress,
    loading: progressLoading,
    error: progressError,
  } = useProgress();
  const {
    data: apiStats,
    decks: dashboardDecks,
    loading: statsLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboardStats();

  useEffect(() => {
    if (import.meta.env?.DEV) {
      console.debug("[Dashboard] Hook state", {
        apiStats,
        dashboardDecks,
        statsLoading,
        dashboardError,
      });
    }
  }, [apiStats, dashboardDecks, statsLoading, dashboardError]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) {
      return;
    }
    let cancelled = false;
    const loadProgress = async () => {
      setMetricsLoading(true);
      try {
        await fetchAllProgress();
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        if (!cancelled) {
          setMetricsLoading(false);
        }
      }
    };
    loadProgress();
    return () => {
      cancelled = true;
    };
  }, [user, fetchAllProgress]);

  const progress = useMemo(
    () => (Array.isArray(allProgress) ? allProgress : []),
    [allProgress]
  );

  const stats = useMemo(() => {
    if (!apiStats) {
      return {
        total_flashcards_studied: 0,
        weekly_goal: 0,
        study_streak: 0,
        mastery_level: 0,
        cards_mastered: 0,
        retention_rate: 0,
        average_study_time: 0,
      };
    }
    return calculateStats(progress, apiStats?.weekly_goal ?? 0);
  }, [progress, apiStats]);

  useEffect(() => {
    if (progressError) {
      console.error("Progress context error:", progressError);
    }
    if (dashboardError) {
      console.error("Dashboard stats error:", dashboardError);
    }
  }, [progressError, dashboardError]);

  const isMetricsLoading =
    loading ||
    decksLoading ||
    metricsLoading ||
    progressLoading ||
    statsLoading;

  const combinedError = decksError || progressError || dashboardError;

  const handleRetry = () => {
    if (decksError) {
      refetchDecks();
    }
    if (progressError) {
      fetchAllProgress({ forceRefresh: true });
    }
    if (dashboardError) {
      refetchDashboard({ forceRefresh: true });
    }
  };

  return (
    <DashboardLayout>
      <DataFetchWrapper
        loading={isMetricsLoading}
        error={combinedError}
        onRetry={handleRetry}
        loadingComponent={
          <DashboardSkeleton isMobile={isMobile} theme={theme} />
        }
        loadingText="Loading dashboard..."
        emptyMessage="No decks found. Create your first deck to get started!"
        isEmpty={Array.isArray(decks) && decks.length === 0}
        renderChildrenOnEmpty
      >
        <DashboardContent
          user={user}
          progressStats={stats}
          decks={decks}
          progress={progress}
          isLoading={false}
          theme={theme}
          isDarkMode={isDarkMode} // always true
          navigate={navigate}
        />
      </DataFetchWrapper>
    </DashboardLayout>
  );
};

export default Dashboard;
