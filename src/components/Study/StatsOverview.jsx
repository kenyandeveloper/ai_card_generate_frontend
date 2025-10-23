import { Target } from "lucide-react";

export default function StatsOverview({
  userStats,
  onUpdateGoalClick,
  completedThisWeek = 0,
}) {
  const weeklyGoal = userStats?.weekly_goal ?? 50;
  const progress = Math.min((completedThisWeek / weeklyGoal) * 100, 100);

  return (
    <div className="bg-surface-elevated border border-border-muted rounded-2xl p-4 md:p-5 mb-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className="p-3 rounded-xl bg-primary/10 border border-border-muted flex items-center justify-center text-primary"
          aria-hidden="true"
        >
          <Target className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-text-muted text-sm">Weekly Goal</p>

          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-text-primary">{weeklyGoal} cards</h3>

            <button
              onClick={onUpdateGoalClick}
              className="text-text-secondary border border-border-muted hover:bg-surface-highlight px-3 py-1 rounded-lg text-sm transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-muted text-xs">
            {completedThisWeek}/{weeklyGoal} this week
          </span>
          <span className="text-text-muted text-xs">
            {Math.round(progress)}%
          </span>
        </div>

        <div
          className="h-1.5 bg-surface-highlight rounded-full overflow-hidden"
          aria-label={`Weekly goal progress: ${completedThisWeek} of ${weeklyGoal} cards`}
        >
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
