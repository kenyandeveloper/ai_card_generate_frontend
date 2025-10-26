import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import NavBar from "../NavBar";
import StudyContent from "./StudyContent";
import StudySkeleton from "./StudySkeleton";
import useStudyData from "./useStudyData";
import WeeklyGoalDialog from "./WeeklyGoalDialog";
import MetaStrip from "../common/MetaStrip";
import StatsOverview from "./StatsOverview";
import { useDashboardStats, useProgress } from "../../hooks/useProgress";
import { DataFetchWrapper } from "../common/DataFetchWrapper";
import { LoadingSkeleton } from "../common/LoadingSkeleton";
import { showError, showSuccess } from "../common/ErrorSnackbar";
import { calculateStats } from "../../utils/statCalculations";

const Study = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: userLoading } = useUser();
  const decksPerPage = 6;

  const {
    decks,
    pagination,
    isLoading: dataLoading,
    error,
    handlePageChange,
    refreshData,
  } = useStudyData(decksPerPage);

  const {
    data: dashboardStats,
    loading: statsLoading,
    error: statsError,
    refetch,
  } = useDashboardStats();
  const { allProgress, fetchAllProgress, updateUserStats } = useProgress();

  const defaultStats = {
    weekly_goal: 50,
    mastery_level: 0,
    study_streak: 0,
    retention_rate: 0,
    cards_mastered: 0,
  };

  const [userStats, setUserStats] = useState(defaultStats);

  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [newWeeklyGoal, setNewWeeklyGoal] = useState(50);

  // Authentication redirect
  useEffect(() => {
    if (!userLoading && !isAuthenticated) navigate("/login");
  }, [userLoading, isAuthenticated, navigate]);

  useEffect(() => {
    fetchAllProgress(); // 🔥 triggers progress data load
  }, [fetchAllProgress]);

  useEffect(() => {
    if (!dashboardStats) {
      return;
    }
    setUserStats({
      weekly_goal: dashboardStats.weekly_goal || 50,
      mastery_level: dashboardStats.mastery_level || 0,
      study_streak: dashboardStats.study_streak || 0,
      retention_rate: dashboardStats.retention_rate || 0,
      cards_mastered: dashboardStats.cards_mastered || 0,
    });
    setNewWeeklyGoal(dashboardStats.weekly_goal || 50);
  }, [dashboardStats]);
  console.log("[Study] allProgress length:", allProgress?.length);
  console.log("[Study] first item:", allProgress?.[0]);

  // compute weekly stats similar to Dashboard
  const calculatedStats = calculateStats(
    allProgress || [],
    userStats.weekly_goal
  );

  const updateWeeklyGoal = async () => {
    try {
      await updateUserStats({ weekly_goal: newWeeklyGoal });
      await refetch();
      setUserStats((prev) => ({ ...prev, weekly_goal: newWeeklyGoal }));
      setGoalDialogOpen(false);
      showSuccess("Weekly goal updated successfully!");
      refreshData();
    } catch (error) {
      showError(error.message || "Error updating weekly goal");
    }
  };

  const handleDeckClick = (deckId) => {
    navigate(`/study/${deckId}`);
  };

  if (userLoading) {
    return <StudySkeleton />;
  }

  const isLoading = dataLoading || (statsLoading && !dashboardStats);
  const combinedError = error || statsError;
  const handleRetry = () => {
    refreshData();
    refetch();
  };

  const dueCount = pagination?.dueCount ?? 0;

  return (
    <>
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 md:pt-6">
        <MetaStrip
          showStreak
          showXP
          showWeeklyGoal
          showDue
          dueCount={dueCount || 0}
          ephemeral
          ephemeralMs={1200}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <DataFetchWrapper
          loading={isLoading}
          error={combinedError}
          onRetry={handleRetry}
          loadingComponent={
            <div className="py-6 md:py-8">
              <LoadingSkeleton count={4} height={80} />
            </div>
          }
          isEmpty={Array.isArray(decks) && decks.length === 0}
          emptyMessage="No decks available yet. Create a deck to start studying!"
        >
          <StudyContent
            decks={decks}
            pagination={pagination}
            handlePageChange={handlePageChange}
            onDeckClick={handleDeckClick}
            onCreateDeckClick={() => navigate("/mydecks")}
            extraTop={
              <StatsOverview
                userStats={userStats}
                completedThisWeek={
                  calculatedStats?.total_flashcards_studied ?? 0
                }
                onUpdateGoalClick={() => setGoalDialogOpen(true)}
              />
            }
          />
        </DataFetchWrapper>
      </div>

      <WeeklyGoalDialog
        open={goalDialogOpen}
        onClose={() => setGoalDialogOpen(false)}
        weeklyGoal={newWeeklyGoal}
        onWeeklyGoalChange={setNewWeeklyGoal}
        onSave={updateWeeklyGoal}
      />
    </>
  );
};

export default Study;
