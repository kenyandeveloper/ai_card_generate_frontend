import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";
import ProgressStats from "./ProgressStats";

export default function ProgressStatsSection() {
  const { user } = useUser?.() || {};

  const xp = user?.xp ?? 120;
  const nextLevelXp = user?.nextLevelXp ?? 200;
  const progress = Math.min((xp / nextLevelXp) * 100, 100);
  const currentLevel = Math.floor(xp / 200) + 1;

  return (
    <section className="mb-12 md:mb-20">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 text-text-primary">
          Track Your Learning Progress
        </h2>
        <p className="text-base md:text-xl text-center text-text-muted max-w-3xl mx-auto mb-8 md:mb-12 font-normal">
          Visualize your learning journey with detailed analytics and progress
          tracking to stay motivated.
        </p>
      </motion.div>

      {/* XP Progress Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        viewport={{ once: true }}
        className="max-w-lg mx-auto mb-8 md:mb-12 text-center"
      >
        <p className="text-sm text-text-muted font-medium mb-2">
          XP Progress — {xp} / {nextLevelXp}
        </p>

        {/* Progress Bar Container */}
        <div className="relative h-2.5 bg-surface-highlight rounded-full overflow-hidden">
          {/* Progress Fill */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-text-subtle mt-2">
          Level {currentLevel} in progress…
        </p>
      </motion.div>

      {/* Stats Grid */}
      <ProgressStats />
    </section>
  );
}
