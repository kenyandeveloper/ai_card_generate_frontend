import { motion, AnimatePresence } from "framer-motion";
import { Brain, ThumbsUp, ThumbsDown, Trophy } from "lucide-react";

const FlashcardDisplay = ({
  currentFlashcard,
  showAnswer,
  setShowAnswer,
  cardProgress,
}) => {
  const handleCardClick = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <div className="perspective-1000">
      <AnimatePresence mode="wait">
        <motion.div
          key={showAnswer ? "-answer" : "-question"}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="min-h-[300px] bg-surface-elevated border-2 border-border-muted rounded-2xl p-8 cursor-pointer flex flex-col justify-center items-center relative hover:border-primary hover:shadow-lg transition-all duration-200"
            onClick={handleCardClick}
          >
            {/* Header */}
            <h3 className="text-xl text-text-secondary mb-4">
              {showAnswer ? "Answer" : "Question"}
            </h3>

            {/* Content */}
            <h2 className="text-3xl text-text-primary font-medium text-center mb-8">
              {showAnswer
                ? currentFlashcard.back_text
                : currentFlashcard.front_text}
            </h2>

            {/* Instructions */}
            <p className="text-text-muted text-sm">
              {showAnswer ? "Click to see question" : "Click to see answer"}
            </p>

            {/* Stats */}
            <div className="absolute bottom-4 left-4 flex gap-4 text-text-muted">
              <div className="flex items-center gap-1" title="Times Studied">
                <Brain className="w-4 h-4" />
                <span className="text-xs">{cardProgress.study_count}</span>
              </div>
              <div className="flex items-center gap-1" title="Correct Attempts">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs">{cardProgress.correct_attempts}</span>
              </div>
              <div
                className="flex items-center gap-1"
                title="Incorrect Attempts"
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="text-xs">
                  {cardProgress.incorrect_attempts}
                </span>
              </div>
            </div>

            {/* Mastered Badge */}
            {cardProgress.is_learned && (
              <div className="absolute top-4 right-4 text-success flex items-center gap-1">
                <Trophy className="w-5 h-5" />
                <span className="text-sm font-medium">Mastered</span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FlashcardDisplay;
