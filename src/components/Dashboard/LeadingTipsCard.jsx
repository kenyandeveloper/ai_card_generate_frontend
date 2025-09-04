"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Lightbulb,
  CheckCircle,
  Clock,
  Moon,
  MessageCircle,
  Link,
} from "lucide-react";

const LearningTipsCard = () => {
  const tips = [
    {
      icon: Clock,
      text: "Study in short, focused sessions rather than long marathons",
      color: "text-blue-400",
    },
    {
      icon: Moon,
      text: "Review cards right before bedtime to improve memory consolidation",
      color: "text-purple-400",
    },
    {
      icon: MessageCircle,
      text: "Explain concepts out loud to enhance understanding",
      color: "text-green-400",
    },
    {
      icon: Link,
      text: "Connect new information to things you already know",
      color: "text-orange-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Learning Tips</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <p className="text-slate-300 font-medium">
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
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-colors duration-300 group"
            >
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                {tip.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-800">
          <p className="text-sm text-slate-400 text-center">
            💡 <strong className="text-slate-200">Pro tip:</strong> Consistency
            beats intensity. Study a little every day!
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningTipsCard;
