import { motion } from "framer-motion";
import { Brain, Trophy, Clock, Target } from "lucide-react";
import CircularProgress from "./CircularProgress";

const stats = [
  {
    icon: Brain,
    value: 85,
    label: "Retention Rate",
    description: "Average memory retention",
    suffix: "%",
  },
  {
    icon: Trophy,
    value: 120,
    label: "Cards Mastered",
    description: "Successfully learned",
  },
  {
    icon: Clock,
    value: 15,
    label: "Minutes/Day",
    description: "Average study time",
  },
  {
    icon: Target,
    value: 92,
    label: "Accuracy",
    description: "Correct answers",
    suffix: "%",
  },
];

const circularStats = [
  { value: 85, label: "Weekly Goal" },
  { value: 92, label: "Mastery Level" },
  { value: 78, label: "Study Streak" },
  { value: 95, label: "Focus Score" },
];

export default function ProgressStats() {
  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Left: Circular Progress Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gray-900 rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-2xl transition-shadow"
        >
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {circularStats.map((item, i) => (
              <div key={i}>
                <CircularProgress
                  percentage={item.value}
                  label={item.label}
                  size={window.innerWidth < 640 ? 80 : 120}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Stats Cards Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900 rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition-shadow"
              >
                {/* Icon Container */}
                <div className="w-12 h-12 bg-purple-900/15 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-purple-500" strokeWidth={2.5} />
                </div>

                {/* Value */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-100 mb-2">
                    {stat.value}
                    {stat.suffix || ""}
                  </h3>
                  <h4 className="text-sm md:text-base font-medium text-gray-100 mb-1">
                    {stat.label}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-400">
                    {stat.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
