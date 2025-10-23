// src/components/Dashboard/DecksSection.jsx
import { motion } from "framer-motion";
import { BookOpen, Plus, ArrowRight } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import DeckCard from "./DeckCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const DecksSection = ({ decks, getDeckStats, navigate, isPremium = false }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-surface-elevated rounded-2xl shadow-xl border border-border-muted p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-xl">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Recent Decks</h2>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <RouterLink
            to="/mydecks"
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary-emphasis hover:to-secondary-emphasis text-primary-foreground font-semibold py-2 px-4 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create Deck
          </RouterLink>
        </motion.div>
      </div>

      {/* Decks Grid */}
      {decks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {decks
              .map((deck) => {
                const deckId = deck?.id ?? deck?.deck_id;
                if (!deckId) {
                  console.warn("Skipping deck without id", deck);
                  return null;
                }
                return { ...deck, id: deckId };
              })
              .filter(Boolean)
              .slice(0, 4)
              .map((deck) => {
                const deckStats = getDeckStats(deck.id);
                return (
                  <motion.div key={deck.id} variants={itemVariants}>
                    <DeckCard
                      deck={deck}
                      deckStats={deckStats}
                      navigate={navigate}
                      isPremium={isPremium}
                    />
                  </motion.div>
                );
              })}
          </div>

          {decks.length > 4 && (
            <div className="text-center pt-4 border-t border-border-muted">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RouterLink
                  to="/mydecks"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-emphasis font-semibold transition-colors duration-300"
                >
                  View All Decks
                  <ArrowRight className="w-4 h-4" />
                </RouterLink>
              </motion.div>
            </div>
          )}
        </>
      ) : (
        <motion.div
          variants={itemVariants}
          className="text-center py-12 px-6 bg-gradient-to-r from-surface-elevated to-surface-highlight rounded-xl border-2 border-dashed border-border-muted"
        >
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No decks yet
            </h3>
            <p className="text-text-muted mb-6">
              Create your first deck to start your learning journey
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <RouterLink
              to="/mydecks"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary-emphasis hover:to-secondary-emphasis text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create Your First Deck
            </RouterLink>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DecksSection;
