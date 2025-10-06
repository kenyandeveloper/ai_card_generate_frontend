import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useUser } from "../context/UserContext";

const benefits = [
  "Create custom flashcards tailored to your specific needs",
  "Develop your own learning rhythm with flexible study schedules",
  "Focus on challenging topics with smart repetition algorithms",
  "Track your personal growth with detailed performance insights",
];

export default function PersonalizedLearningSection() {
  const { user } = useUser?.() || {};

  const weeklyTarget = user?.weeklyGoal?.targetDays ?? 3;
  const weeklyProgress = user?.weeklyGoal?.completedDays ?? 1;
  const weeklyPct = Math.min((weeklyProgress / weeklyTarget) * 100, 100);
  const streakDays = user?.streakDays ?? user?.stats?.streak ?? 2;

  return (
    <section className="mb-12 md:mb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-100">
            Your Journey, Your Way
          </h2>

          <p className="text-sm md:text-lg text-gray-400 mb-8 leading-relaxed">
            Flashlearn adapts to your unique learning style, creating a
            personalized experience that helps you achieve your goals faster:
          </p>

          <ul className="pl-6 mb-8 space-y-4">
            {benefits.map((item, index) => (
              <li key={index} className="text-sm md:text-base text-gray-100">
                {item}
              </li>
            ))}
          </ul>

          <a
            href="/signup"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg transition-colors font-semibold"
          >
            Start your learning journey
          </a>
        </motion.div>

        {/* Right: Weekly Goal Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-6 h-6 text-orange-500" />
              <h3 className="text-xl font-bold text-gray-100">Weekly Goal</h3>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              Study at least{" "}
              <strong className="text-gray-200">
                {weeklyTarget} day{weeklyTarget > 1 ? "s" : ""}
              </strong>{" "}
              this week to keep your streak alive.
            </p>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyPct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-purple-600 rounded-full"
                />
              </div>
            </div>

            {/* Progress Stats */}
            <div className="flex justify-between text-xs text-gray-400 mb-4">
              <span>
                {weeklyProgress}/{weeklyTarget} days
              </span>
              <span>Streak: Day {streakDays} 🔥</span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800 my-4" />

            {/* Reward Pills */}
            <div className="flex gap-2 flex-wrap mb-6">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400">
                +10 XP / session
              </span>
              <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400">
                Keep streak alive
              </span>
              <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400">
                Badge: Focus (soon)
              </span>
            </div>

            {/* Visual */}
            <img
              src="https://images.unsplash.com/photo-1729710877311-0e8e70bf820b?w=1200&auto=format&fit=crop&q=60"
              alt="Hand writing on blank notes"
              className="w-full h-56 md:h-64 object-cover rounded-xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
