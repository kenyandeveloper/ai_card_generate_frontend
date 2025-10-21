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
      color: "text-primary",
    },
    {
      icon: Moon,
      text: "Review cards right before bedtime to improve memory consolidation",
      color: "text-secondary",
    },
    {
      icon: MessageCircle,
      text: "Explain concepts out loud to enhance understanding",
      color: "text-success",
    },
    {
      icon: Link,
      text: "Connect new information to things you already know",
      color: "text-accent",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-surface-elevated rounded-2xl shadow-xl border border-border-muted overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-border-muted bg-gradient-to-r from-surface-elevated to-surface-highlight">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-xl">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-bold text-text-primary">Learning Tips</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-warning" />
          <p className="text-text-secondary font-medium">
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
              className="flex items-start gap-3 p-3 rounded-xl bg-surface-highlight/60 hover:bg-surface-highlight transition-colors duration-300 group"
            >
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className={`w-4 h-4 ${tip.color} group-hover:scale-110 transition-transform duration-300`} />
              </div>
              <p className="text-sm text-text-muted leading-relaxed group-hover:text-text-secondary transition-colors duration-300">
                {tip.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-soft to-secondary-soft rounded-xl border border-border-primary">
          <p className="text-sm text-text-muted text-center">
            💡 <strong className="text-text-primary">Pro tip:</strong> Consistency
            beats intensity. Study a little every day!
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningTipsCard;
