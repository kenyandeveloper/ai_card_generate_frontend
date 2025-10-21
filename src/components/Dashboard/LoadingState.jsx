"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-background via-background-subtle to-background flex items-center justify-center">
      <div className="text-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-soft to-secondary-soft rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary-soft to-accent-soft rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Main Loading Content */}
        <div className="relative z-10">
          {/* Animated Logo */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="relative"
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{
                rotate: {
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                },
                scale: {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
              }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center shadow-2xl">
                <Brain className="w-10 h-10 text-text-primary" />
              </div>

              {/* Floating Sparkles */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ y: [-5, 5, -5], rotate: [0, 180, 360] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="w-6 h-6 text-warning" />
              </motion.div>

              <motion.div
                className="absolute -bottom-2 -left-2"
                animate={{ y: [5, -5, 5], rotate: [360, 180, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-text-primary via-primary to-secondary bg-clip-text text-transparent">
              FlashLearn
            </h2>

            <motion.p
              className="text-text-muted text-lg"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              Preparing your learning experience...
            </motion.p>
          </motion.div>

          {/* Loading Progress */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8"
          >
            <div className="w-64 h-2 bg-surface-highlight rounded-full overflow-hidden mx-auto">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                animate={{ x: [-256, 256], opacity: [0.5, 1, 0.5] }}
                transition={{
                  x: {
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  opacity: {
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                }}
                style={{ width: "50%" }}
              />
            </div>
          </motion.div>

          {/* Loading Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex justify-center space-x-2 mt-6"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
