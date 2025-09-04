"use client";

import { motion } from "framer-motion";

const ProgressCardSkeleton = () => {
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

  const SkeletonBox = ({ className = "" }) => (
    <motion.div
      variants={shimmer}
      initial="hidden"
      animate="visible"
      className={`bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-xl ${className}`}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <SkeletonBox className="w-10 h-10" />
        <SkeletonBox className="h-8 w-48" />
      </div>

      {/* Weekly Goal Progress Skeleton */}
      <div className="mb-8 p-6 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl border border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <SkeletonBox className="h-6 w-40" />
          <div className="flex items-center gap-2">
            <SkeletonBox className="w-4 h-4" />
            <SkeletonBox className="h-5 w-20" />
          </div>
        </div>

        <div className="relative">
          <SkeletonBox className="h-3 w-full rounded-full" />
          <div className="mt-2 text-right">
            <SkeletonBox className="h-4 w-24 ml-auto" />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            className="bg-slate-700/50 rounded-xl p-4 border border-slate-700"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-600 rounded-lg">
                <SkeletonBox className="w-5 h-5" />
              </div>
            </div>
            <SkeletonBox className="h-8 w-16 mb-1" />
            <SkeletonBox className="h-4 w-24" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProgressCardSkeleton;
