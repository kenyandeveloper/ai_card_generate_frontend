// src/components/Dashboard/DeckCard.jsx
import { motion } from "framer-motion";
import { PlayCircle, Clock, TrendingUp, BookOpen, Lock } from "lucide-react";
import { getRelativeTime } from "../../utils/dashBoardutil";

const getMasteryColor = (mastery) => {
  if (mastery >= 80) {
    return {
      text: "text-success",
      gradient: "from-success to-success",
    };
  }
  if (mastery >= 60) {
    return {
      text: "text-warning",
      gradient: "from-warning to-warning",
    };
  }
  return {
    text: "text-danger",
    gradient: "from-danger to-danger",
  };
};

const DeckCard = ({ deck, deckStats, navigate, isPremium = false }) => {
  const deckId = deck?.id ?? deck?.deck_id;
  const masteryValue = Number.isFinite(deckStats?.mastery)
    ? deckStats.mastery
    : 0;
  const colors = getMasteryColor(masteryValue);
  const lastStudiedLabel = deckStats?.lastStudied
    ? getRelativeTime(deckStats.lastStudied)
    : "—";

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group"
    >
      <div className="bg-surface-elevated rounded-2xl shadow-lg border border-border-muted overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border-muted bg-gradient-to-r from-surface-elevated to-surface-highlight">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-xl group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-text-primary truncate group-hover:text-primary transition-colors duration-300">
                {deck.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
            {deck.description || "No description available."}
          </p>

          {/* Stats */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-text-muted">
                <Clock className="w-4 h-4" />
                <span>Last studied</span>
              </div>
              <span className="font-medium text-text-secondary">
                {lastStudiedLabel}
              </span>
            </div>

            {/* Mastery Progress */}
            {isPremium ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-muted">Mastery</span>
                  </div>
                  <span className={`text-sm font-bold ${colors.text}`}>
                    {masteryValue}%
                  </span>
                </div>

                <div className="relative">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-highlight">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${masteryValue}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`relative h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                    >
                      <div className="absolute inset-0 bg-primary-soft animate-pulse" />
                    </motion.div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-border-muted bg-surface-highlight/40 px-3 py-2 text-sm text-text-muted">
                <Lock className="h-4 w-4 text-text-secondary" />
                <span>Upgrade to see mastery progress for this deck.</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!deckId) {
                console.error("Attempted to navigate to deck without id", deck);
                return;
              }
              console.debug("Navigating to study deck", deckId);
              navigate(`/study/${deckId}`);
            }}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-emphasis hover:to-secondary-emphasis text-primary-foreground font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
