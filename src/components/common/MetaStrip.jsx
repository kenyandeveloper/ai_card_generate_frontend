import { useEffect, useState } from "react";
import { Flame, Star, Flag, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext";

export default function MetaStrip({
  showStreak = true,
  showXP = true,
  showWeeklyGoal = true,
  showDue = false,
  dueCount = 0,
  ephemeral = false,
  ephemeralMs = 1200,
}) {
  const { user } = useUser?.() || {};
  const streak = user?.streakDays ?? user?.stats?.streak ?? 2;
  const xp = user?.xp ?? 120;
  const nextLevelXp = user?.nextLevelXp ?? 200;
  const weeklyTarget = user?.weeklyGoal?.targetDays ?? 3;
  const weeklyProgress = user?.weeklyGoal?.completedDays ?? 1;

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!ephemeral) return;
    const t = setTimeout(() => setVisible(false), ephemeralMs);
    return () => clearTimeout(t);
  }, [ephemeral, ephemeralMs]);

  const Badge = ({
    icon: Icon,
    label,
    color = "bg-surface-highlight",
    iconColor = "text-text-secondary",
  }) => (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 ${color} rounded-lg border border-border-muted/60`}
    >
      <Icon size={16} className={iconColor} />
      <span className="text-sm text-text-secondary font-medium">{label}</span>
    </div>
  );

  const content = (
    <div className="px-6 py-3 mb-4 border-b border-border-muted flex items-center gap-3 flex-wrap bg-surface-muted/40 rounded-xl">
      {showStreak && (
        <Badge
          icon={Flame}
          label={`Day ${streak} streak`}
          color="bg-warning-soft"
          iconColor="text-warning"
        />
      )}
      {showXP && (
        <Badge
          icon={Star}
          label={`${xp}/${nextLevelXp} XP`}
          color="bg-surface-highlight"
          iconColor="text-primary"
        />
      )}
      {showWeeklyGoal && (
        <Badge
          icon={Flag}
          label={`${weeklyProgress}/${weeklyTarget} days this week`}
          color="bg-surface-highlight"
          iconColor="text-secondary"
        />
      )}
      {showDue && (
        <div className="group relative">
          <Badge
            icon={Clock}
            label={`${dueCount} due`}
            color="bg-surface-highlight"
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-surface-elevated text-text-secondary text-xs rounded-lg border border-border-muted opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Cards due for review (spaced repetition)
          </div>
        </div>
      )}
    </div>
  );

  if (!ephemeral) {
    return visible ? content : null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
