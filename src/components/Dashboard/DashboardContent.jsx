"use client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import WelcomeSection from "./WelcomeSection";
import ProgressCard from "./ProgressCard";
import DecksSection from "./DeckSection";
import QuickStudyCard from "./QuickStudyCard";
import LearningTipsCard from "./LeadingTipsCard";
import { getDeckStats } from "../../utils/dashBoardutil";
import DashboardSkeleton from "./DashboardSkeleton"; // ← use your skeleton

const DashboardContent = ({
  user,
  stats,
  decks,
  progress,
  isLoading,
  theme,
  isDarkMode,
  // remove navigate prop and just use router navigate to avoid confusion
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (decks?.length ?? 0) === 0) {
      navigate("/welcome", { replace: true });
    }
  }, [isLoading, decks, navigate]);

  if (isLoading) {
    return <DashboardSkeleton />; // ← paint immediately
  }

  // If not loading and no decks, we’ve already navigated; render nothing as a safety.
  if (!isLoading && (decks?.length ?? 0) === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <WelcomeSection username={user?.username} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <ProgressCard stats={stats} theme={theme} isDarkMode={true} />
            <DecksSection
              decks={decks}
              getDeckStats={(deckId) => getDeckStats(deckId, progress)}
              navigate={navigate}
              theme={theme}
              isLoading={isLoading}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <QuickStudyCard />
            <LearningTipsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
