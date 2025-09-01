"use client";

import { motion } from "framer-motion";

const StatsCard = ({
  icon: Icon,
  value,
  label,
  color,
  bgColor,
  iconColor,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      className={`${bgColor} rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group cursor-pointer hover:scale-105`}
    >
      <div className="flex items-center gap-3 mb-2">
        <motion.div
          className={`p-2 rounded-lg ${bgColor} group-hover:scale-110 transition-transform duration-300`}
          whileHover={{ rotate: 5 }}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </motion.div>
      </div>

      <motion.div
        className="text-2xl font-bold text-slate-900 dark:text-white mb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
      >
        {value}
      </motion.div>

      <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
        {label}
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        initial={false}
        animate={{ x: [-100, 100] }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 3,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

export default StatsCard;
