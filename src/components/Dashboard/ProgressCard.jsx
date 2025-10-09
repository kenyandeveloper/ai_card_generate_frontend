import { motion } from "framer-motion";
import { Trophy, Target, Clock, Brain, TrendingUp, Zap } from "lucide-react";

const ProgressCard = ({ stats }) => {
  const weeklyGoal = stats?.weekly_goal || 200;
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
      color: "text-amber-500",
      bgColor: "bg-amber-500/20",
    },
    {
      icon: TrendingUp,
      label: "Retention Rate",
      value: `${stats?.retention_rate ?? 0}%`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
    },
    {
      icon: Clock,
      label: "Avg. Study Time",
      value: `${stats?.average_study_time ?? 0}min`,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
    },
    {
      icon: Brain,
      label: "Mastery Level",
      value: `${stats?.mastery_level ?? 0}%`,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/20",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-gradient-to-br from-slate-800 to-blue-900/10 rounded-2xl shadow-xl border border-slate-700 p-6 mb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Target size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Learning Progress</h2>
      </div>

      {/* Weekly Goal Progress */}
      <div className="mb-8 p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-white">
            Weekly Goal Progress
          </h3>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-blue-500" />
            <span className="text-sm text-slate-300 font-medium">
              {studied} / {weeklyGoal}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="mt-2 text-right">
          <span className="text-sm text-slate-400 font-medium">
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
            className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
          >
            <div className="flex justify-center mb-3">
              <div
                className={`p-3 rounded-xl ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProgressCard;
