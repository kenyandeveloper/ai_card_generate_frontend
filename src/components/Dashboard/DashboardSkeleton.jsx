"use client";

import { motion } from "framer-motion";

const DashboardSkeleton = ({ isMobile }) => {
  const shimmer = {
    hidden: { opacity: 0.3 },
    visible: {
      opacity: [0.3, 0.8, 0.3],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };

  const SkeletonBox = ({ className, children }) => (
    <motion.div
      variants={shimmer}
      initial="hidden"
      animate="visible"
      className={`bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-xl ${className}`}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-center gap-4 mb-4">
          <SkeletonBox className="w-12 h-12" />
          <div className="space-y-2 flex-1">
            <SkeletonBox className="h-8 w-64" />
            <SkeletonBox className="h-4 w-96" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress Card Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <SkeletonBox className="w-10 h-10" />
              <SkeletonBox className="h-8 w-48" />
            </div>

            {/* Weekly Goal Progress Skeleton */}
            <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <SkeletonBox className="h-6 w-40" />
                <SkeletonBox className="h-5 w-20" />
              </div>
              <SkeletonBox className="h-3 w-full rounded-full" />
              <div className="mt-2 flex justify-end">
                <SkeletonBox className="h-4 w-24" />
              </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <SkeletonBox className="w-8 h-8" />
                  </div>
                  <SkeletonBox className="h-8 w-16 mb-1" />
                  <SkeletonBox className="h-4 w-24" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Decks Section Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <SkeletonBox className="w-10 h-10" />
                <SkeletonBox className="h-8 w-32" />
              </div>
              <SkeletonBox className="h-10 w-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-start gap-3">
                      <SkeletonBox className="w-9 h-9" />
                      <SkeletonBox className="h-6 w-40 flex-1" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <SkeletonBox className="h-4 w-full mb-2" />
                    <SkeletonBox className="h-4 w-3/4 mb-4" />

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <SkeletonBox className="h-4 w-24" />
                        <SkeletonBox className="h-4 w-16" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <SkeletonBox className="h-4 w-16" />
                          <SkeletonBox className="h-4 w-12" />
                        </div>
                        <SkeletonBox className="h-2 w-full rounded-full" />
                      </div>
                    </div>

                    <SkeletonBox className="h-12 w-full" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Study Skeleton */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl" />
                <div className="h-6 w-32 bg-white/20 rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/20 rounded" />
                <div className="h-4 w-3/4 bg-white/20 rounded" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-40 bg-white/20 rounded" />
                <div className="h-4 w-36 bg-white/20 rounded" />
              </div>
              <div className="h-12 w-full bg-white/20 rounded-xl" />
            </div>
          </motion.div>

          {/* Learning Tips Skeleton */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-3">
                <SkeletonBox className="w-10 h-10" />
                <SkeletonBox className="h-6 w-32" />
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <SkeletonBox className="w-5 h-5" />
                <SkeletonBox className="h-5 w-48" />
              </div>

              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50"
                  >
                    <SkeletonBox className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 flex-1">
                      <SkeletonBox className="h-4 w-full" />
                      <SkeletonBox className="h-4 w-2/3" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <SkeletonBox className="h-4 w-3/4 mx-auto" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
