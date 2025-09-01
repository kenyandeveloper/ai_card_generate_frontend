"use client";

import { motion } from "framer-motion";
import { Brain, Lightbulb, CheckCircle } from "lucide-react";

const LearningTipsCard = () => {
  const tips = [
    {
      icon: Clock,
      text: "Study in short, focused sessions rather than long marathons",
      color: "text-blue-500",
    },
    {
      icon: Moon,
      text: "Review cards right before bedtime to improve memory consolidation",
      color: "text-purple-500",
    },
    {
      icon: MessageCircle,
      text: "Explain concepts out loud to enhance understanding",
      color: "text-green-500",
    },
    {
      icon: Link,
      text: "Connect new information to things you already know",
      color: "text-orange-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Learning Tips
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            Improve your retention with these strategies:
          </p>
        </div>

        <div className="space-y-4">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300 group"
            >
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                {tip.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            💡 <strong>Pro tip:</strong> Consistency beats intensity. Study a
            little every day!
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Import missing icons
import { Clock, Moon, MessageCircle, Link } from "lucide-react";

export default LearningTipsCard;
