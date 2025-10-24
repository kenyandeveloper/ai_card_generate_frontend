import { motion } from "framer-motion";
import { Trophy, Target, Clock, Brain, TrendingUp, Zap } from "lucide-react";

const ProgressCard = ({ stats }) => {
  const weeklyGoal = stats?.weekly_goal || 50;
  const studied = stats?.total_flashcards_studied || 0;
  const progressPercentage = Math.min(
    weeklyGoal ? (studied / weeklyGoal) * 100 : 0,
    100
  );

  const statCards = [
    {
      icon: Trophy,
      label: "Cards Mastered",
      value: stats?.cards_mastered ?? 0,
      color: "text-success",
      bgColor: "bg-success-soft",
    },
    {
      icon: TrendingUp,
      label: "Retention Rate",
      value: `${stats?.retention_rate ?? 0}%`,
      color: "text-secondary",
      bgColor: "bg-secondary-soft",
    },
    {
      icon: Clock,
      label: "Avg. Study Time",
      value: `${stats?.average_study_time ?? 0}min`,
      color: "text-primary",
      bgColor: "bg-primary-soft",
    },
    {
      icon: Brain,
      label: "Mastery Level",
      value: `${stats?.mastery_level ?? 0}%`,
      color: "text-accent",
      bgColor: "bg-accent-soft",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-surface-elevated rounded-2xl shadow-xl border border-border-muted p-6 mb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Target size={24} className="text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">
          Learning Progress
        </h2>
      </div>

      {/* Weekly Goal Progress */}
      <div className="mb-8 p-6 bg-surface-muted/70 rounded-xl border border-border-muted">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-text-primary">
            Weekly Goal Progress
          </h3>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-secondary" />
            <span className="text-sm text-text-secondary font-medium">
              {studied} / {weeklyGoal}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-surface-muted rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="mt-2 text-right">
          <span className="text-sm text-text-muted font-medium">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            className="bg-surface rounded-xl p-4 border border-border-muted text-center hover:scale-105 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-center mb-3">
              <div
                className={`p-3 rounded-xl ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">
              {stat.value}
            </div>
            <p className="text-sm text-text-muted font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProgressCard;
