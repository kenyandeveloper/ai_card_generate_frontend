import { useState } from "react";
import { BookOpen, Plus, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import AIGenerateModal from "./AIGenerateModal";

export default function DeckHeader({
  deck,
  onAddFlashcard,
  navigate,
  onRefresh,
}) {
  const [aiOpen, setAiOpen] = useState(false);
  const title = deck?.title || `Deck ${deck?.id}`;
  const description = deck?.description || "No description available";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="mb-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-3 text-text-secondary">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/mydecks")}
                  className="inline-flex items-center gap-1 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
                >
                  <BookOpen size={16} />
                  <span>My Decks</span>
                </button>
              </li>
              <li aria-hidden="true" className="text-text-primary0">
                <ChevronRight size={16} />
              </li>
              <li aria-current="page" className="text-text-primary">
                {title}
              </li>
            </ol>
          </nav>

          {/* Title + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                {title}
              </h1>
              <p className="text-sm md:text-base text-text-secondary mt-1">
                {description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAiOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-border-muted px-4 py-2 text-sm hover:border-border-muted"
              >
                <Sparkles size={18} />
                <span>Generate with AI</span>
              </button>

              <button
                type="button"
                onClick={onAddFlashcard}
                className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary px-4 py-2 text-sm font-medium"
              >
                <Plus size={18} />
                <span>Add Flashcard</span>
              </button>
            </div>
          </div>
        </header>
      </motion.div>

      {/* AI Generation Modal */}
      <AIGenerateModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        deckId={deck?.id}
        onInserted={() => onRefresh?.()}
      />
    </>
  );
}
