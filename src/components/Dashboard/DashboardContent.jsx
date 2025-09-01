"use client";
import WelcomeSection from "./WelcomeSection";
import ProgressCard from "./ProgressCard";
import DecksSection from "./DeckSection";
import QuickStudyCard from "./QuickStudyCard";
import LearningTipsCard from "./LeadingTipsCard";
import { getDeckStats } from "../../utils/dashBoardutil";

const DashboardContent = ({
  user,
  stats,
  decks,
  progress,
  isLoading,
  theme,
  isDarkMode,
  navigate,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <WelcomeSection username={user?.username} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <ProgressCard stats={stats} theme={theme} isDarkMode={isDarkMode} />
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
