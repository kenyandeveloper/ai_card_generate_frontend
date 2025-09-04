"use client";

import { motion } from "framer-motion";
import { PlayCircle, Clock, TrendingUp, BookOpen } from "lucide-react";
import { getRelativeTime } from "../../utils/dashBoardutil";

const DeckCard = ({ deck, deckStats, navigate }) => {
  const masteryColor =
    deckStats.mastery >= 80
      ? "text-green-400"
      : deckStats.mastery >= 60
      ? "text-yellow-400"
      : "text-red-400";

  const masteryBgColor =
    deckStats.mastery >= 80
      ? "from-green-400 to-green-600"
      : deckStats.mastery >= 60
      ? "from-yellow-400 to-yellow-600"
      : "from-red-400 to-red-600";

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group"
    >
      <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors duration-300">
                {deck.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
            {deck.description || "No description available."}
          </p>

          {/* Stats */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span>Last studied</span>
              </div>
              <span className="font-medium text-slate-300">
                {getRelativeTime(deckStats.lastStudied)}
              </span>
            </div>

            {/* Mastery Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Mastery</span>
                </div>
                <span className={`text-sm font-bold ${masteryColor}`}>
                  {deckStats.mastery}%
                </span>
              </div>

              <div className="relative">
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${deckStats.mastery}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-full bg-gradient-to-r ${masteryBgColor} rounded-full relative`}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/study/${deck.id}`)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <PlayCircle className="w-5 h-5" />
            Start Studying
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default DeckCard;
