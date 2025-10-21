import { Trophy, Brain, Target, Clock } from "lucide-react";
import StatsCard from "./StatsCard";

const StudySummary = ({ showSummary, sessionStats, handleExitStudy }) => {
  if (!showSummary) return null;

  return (
    <div className="fixed inset-0 bg-background-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-surface-elevated border border-border-muted rounded-2xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="p-6 text-center border-b border-border-muted">
          <Trophy className="w-12 h-12 text-success mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            Study Session Complete!
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              icon={Brain}
              value={sessionStats.correctAnswers}
              total={sessionStats.totalCards}
              label="Correct Answers"
              color="#10b981" // success color
            />
            <StatsCard
              icon={Target}
              value={Math.round(
                (sessionStats.correctAnswers / sessionStats.totalCards) * 100
              )}
              unit="%"
              label="Accuracy"
              color="#3b82f6" // primary color
            />
            <StatsCard
              icon={Clock}
              value={Math.round(sessionStats.timeSpent)}
              unit="min"
              label="Time Spent"
              color="#06b6d4" // info color
            />
            <StatsCard
              icon={Trophy}
              value={sessionStats.cardsLearned}
              label="Cards Mastered"
              color="#f59e0b" // warning color
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border-muted flex justify-center">
          <button
            onClick={handleExitStudy}
            className="bg-primary hover:bg-primary-emphasis text-text-primary px-8 py-3 rounded-lg font-medium transition-colors min-w-[200px]"
          >
            Back to Study
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudySummary;
