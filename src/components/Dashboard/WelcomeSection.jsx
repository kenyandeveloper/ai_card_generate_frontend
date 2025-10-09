import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";
import { useUser } from "../context/UserContext";

const WelcomeSection = ({ username }) => {
  const { user } = useUser?.() || {};
  const name =
    username || user?.username || user?.email?.split("@")[0] || "Learner";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-slate-800 to-blue-900/10 rounded-2xl shadow-xl border border-slate-700 overflow-hidden relative"
    >
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 blur-3xl" />

      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
            {greeting}, {name}!
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" />
          <p className="text-slate-300 text-base md:text-lg">
            Track your progress, review your decks, and continue your learning
            journey.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeSection;
