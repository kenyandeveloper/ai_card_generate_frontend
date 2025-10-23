import { motion } from "framer-motion";
import { Brain, PlayCircle, Plus } from "lucide-react";
import FlashcardItem from "./FlashcardItem";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const FlashcardList = ({
  flashcards,
  onEdit,
  onDelete,
  navigate,
  deckId,
  onAddFlashcard,
}) => {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {flashcards.length === 0 ? (
        <div className="bg-surface-elevated rounded-2xl md:rounded-3xl shadow-lg p-6 md:p-8 lg:p-12 text-center">
          <Brain size={48} className="text-primary mx-auto mb-4 md:mb-6" />
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-2 md:mb-4">
            No Flashcards Yet
          </h2>
          <p className="text-text-muted mb-6 md:mb-8 text-sm md:text-base px-2 md:px-4 lg:px-8">
            Create your first flashcard and start learning!
          </p>
          <button
            onClick={onAddFlashcard}
            className="bg-primary hover:bg-primary-emphasis text-text-primary rounded-xl md:rounded-2xl px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Create Your First Flashcard
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {flashcards.map((flashcard) => (
              <motion.div key={flashcard.id} variants={itemVariants}>
                <FlashcardItem
                  flashcard={flashcard}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </div>

          <div className="mt-8 md:mt-10 lg:mt-12 text-center">
            <button
              onClick={() => navigate(`/study/${deckId}`)}
              className="bg-primary hover:bg-primary-emphasis text-text-primary rounded-xl md:rounded-2xl px-8 md:px-10 lg:px-12 py-2 md:py-3 text-sm md:text-base font-medium transition-colors inline-flex items-center gap-2"
            >
              <PlayCircle size={20} />
              Start Studying
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default FlashcardList;
