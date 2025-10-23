// src/components/Dashboard/DashboardContent.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import WelcomeSection from "./WelcomeSection";
import ProgressCard from "./ProgressCard";
import DecksSection from "./DeckSection";
import QuickStudyCard from "./QuickStudyCard";
import LearningTipsCard from "./LeadingTipsCard";
import { getDeckStats } from "../../utils/dashBoardutil";
import DashboardSkeleton from "./DashboardSkeleton";
import { useProgress } from "../../hooks/useProgress";

const DashboardContent = ({
  user,
  progressStats,
  decks,
  progress,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { isPremium } = useProgress();

  if (import.meta.env?.DEV) {
    console.debug("[DashboardContent] props", {
      progressStats,
      decks,
      progress,
    });
  }

  useEffect(() => {
    if (!isLoading && (decks?.length ?? 0) === 0) {
      navigate("/welcome", { replace: true });
    }
  }, [isLoading, decks, navigate]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Safety: if no decks after loading, we've already navigated
  if ((decks?.length ?? 0) === 0) {
    return null;
  }


  return (
    <div className="space-y-8">
      <WelcomeSection username={user?.username} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <ProgressCard stats={progressStats} />
        <DecksSection
          decks={decks}
          getDeckStats={(deckId) => getDeckStats(deckId, progress)}
          navigate={navigate}
          isPremium={isPremium}
        />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <QuickStudyCard />
          <LearningTipsCard />
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
