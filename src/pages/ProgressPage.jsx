import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/Dashboard/DashboardLayout";
import { DataFetchWrapper } from "../components/common/DataFetchWrapper";
import ProgressOverview from "../components/Progress/ProgressOverview";
import { useDashboardStats, useProgress } from "../hooks/useProgress";
import { useUser } from "../hooks/useUser";

const ProgressPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: userLoading } = useUser();
  const { data: stats, decks: dashboardDecks, loading, error, refetch } =
    useDashboardStats();
  const { usageInfo, isPremium } = useProgress();

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, userLoading, navigate]);

  if (!isAuthenticated && !userLoading) {
    return null;
  }

  return (
    <DashboardLayout>
      <DataFetchWrapper
        loading={loading}
        error={error}
        onRetry={() => refetch({ forceRefresh: true })}
        loadingText="Loading your progress..."
      >
        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold text-text-primary">
              Progress Insights
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Track your study performance, usage, and deck mastery in one place.
            </p>
          </header>

          <ProgressOverview
            stats={stats}
            dashboardDecks={dashboardDecks}
            usageInfo={usageInfo}
            isPremium={isPremium}
            onNavigateToDeck={(deckId) => navigate(`/study/${deckId}`)}
          />
        </div>
      </DataFetchWrapper>
    </DashboardLayout>
  );
};

export default ProgressPage;
