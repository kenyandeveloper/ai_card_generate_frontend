// Header.jsx (Vite + Tailwind, dark mode only)
import { BookOpen, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Header({ onCreateDeck }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-2 sm:mb-3 md:mb-4"
    >
      <div className="mb-2 sm:mb-4 flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
        {/* Title */}
        <h1 className="flex items-center gap-2 font-bold text-xl sm:text-2xl md:text-3xl text-text-primary">
          <BookOpen
            className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
            aria-hidden="true"
          />
          <span>My Flashcard Decks</span>
        </h1>

        {/* Action */}
        <button
          type="button"
          onClick={onCreateDeck}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary-emphasis focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 transition sm:self-auto self-start"
          aria-label="Create new deck"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {/* On very small screens show shorter label; on >=sm show full label */}
          <span className="sm:hidden">New Deck</span>
          <span className="hidden sm:inline">Create New Deck</span>
        </button>
      </div>

      <p className="text-sm sm:text-base leading-relaxed text-text-muted">
        Manage your flashcard decks and track your learning progress
      </p>
    </motion.section>
  );
}
