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
import { getToken } from "../utils/authToken";

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useUser();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Force dark mode for the dashboard UI
  const isDarkMode = true;

  // Check auth before fetching data
  const hasAuth = Boolean(isAuthenticated && getToken());

  const {
    decks,
    loading: decksLoading,
    error: decksError,
    refetch: refetchDecks,
  } = useDecks({
    enabled: hasAuth,
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
  } = useDashboardStats(
    !hasAuth // Skip fetch if no auth
  );

  useEffect(() => {
    if (import.meta.env?.DEV) {
      console.debug("[Dashboard] Hook state", {
        apiStats,
        dashboardDecks,
        statsLoading,
        dashboardError,
        hasAuth,
      });
    }
  }, [apiStats, dashboardDecks, statsLoading, dashboardError, hasAuth]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  // Fetch progress data
  useEffect(() => {
    if (!user || !hasAuth) {
      return;
    }

    let cancelled = false;
    const loadProgress = async () => {
      setMetricsLoading(true);
      try {
        await fetchAllProgress();
      } catch (error) {
        // Only log non-auth errors
        if (error?.response?.status !== 401) {
          console.error("Error fetching progress data:", error);
        }
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
  }, [user, hasAuth, fetchAllProgress]);

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
    if (progressError && progressError !== "Authentication required") {
      console.error("Progress context error:", progressError);
    }
    if (dashboardError && dashboardError !== "Authentication required") {
      console.error("Dashboard stats error:", dashboardError);
    }
  }, [progressError, dashboardError]);

  const isMetricsLoading =
    loading ||
    decksLoading ||
    metricsLoading ||
    progressLoading ||
    statsLoading;

  // Filter out auth errors from display
  const displayError = useMemo(() => {
    if (!hasAuth) return null;

    const errors = [decksError, progressError, dashboardError].filter(Boolean);
    const nonAuthErrors = errors.filter(
      (err) =>
        err !== "Authentication required" &&
        !err.includes("Missing Authorization Header")
    );

    return nonAuthErrors.length > 0 ? nonAuthErrors[0] : null;
  }, [decksError, progressError, dashboardError, hasAuth]);

  const handleRetry = () => {
    if (import.meta.env?.DEV) {
      console.debug("[Dashboard] Manual retry triggered");
    }

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
        error={displayError}
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
          isDarkMode={isDarkMode}
          navigate={navigate}
        />
      </DataFetchWrapper>
    </DashboardLayout>
  );
};

export default Dashboard;
