import {
  ArrowLeft,
  Rotate3D,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
} from "lucide-react";
import { InlineSpinner } from "../../common/LoadingSpinner";

const StudyActions = ({
  showAnswer,
  setShowAnswer,
  currentFlashcardIndex,
  flashcardsLength,
  setCurrentFlashcardIndex,
  onAnswer,
  handleFinishSession,
  isCurrentCardAnswered,
  submittingReview,
}) => {
  const allCardsAnswered =
    flashcardsLength > 0 &&
    isCurrentCardAnswered &&
    currentFlashcardIndex === flashcardsLength - 1;

  const handleResponse = (wasCorrect) => {
    if (submittingReview) return;
    onAnswer(wasCorrect);
  };

  const handlePrevious = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentFlashcardIndex < flashcardsLength - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      setShowAnswer(false);
    }
  };

  return (
    <div className="mt-8">
      {/* Main Action Buttons */}
      <div
        className={`flex justify-center gap-4 ${
          allCardsAnswered ? "mb-4" : ""
        }`}
      >
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="bg-primary hover:bg-primary-emphasis text-text-primary px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 min-w-[200px] justify-center"
          >
            <Rotate3D className="w-5 h-5" />
            Show Answer
          </button>
        ) : (
          <>
            {!isCurrentCardAnswered ? (
              <div className="flex gap-4">
                <button
                  onClick={() => handleResponse(false)}
                  disabled={submittingReview}
                  className="bg-danger hover:bg-danger-emphasis text-text-primary px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 min-w-[160px] justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Press Left Arrow or 0"
                >
                  {submittingReview ? (
                    <>
                      <InlineSpinner size={18} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="w-5 h-5" />
                      Incorrect
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleResponse(true)}
                  disabled={submittingReview}
                  className="bg-success hover:bg-success-emphasis text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 min-w-[160px] justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Press Right Arrow or 1"
                >
                  {submittingReview ? (
                    <>
                      <InlineSpinner size={18} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-5 h-5" />
                      Correct
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAnswer(false)}
                className="bg-primary hover:bg-primary-emphasis text-text-primary px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 min-w-[200px] justify-center"
              >
                <Rotate3D className="w-5 h-5" />
                Show Question
              </button>
            )}
          </>
        )}
      </div>

      {/* Finish Session Button */}
      {allCardsAnswered && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleFinishSession}
            className="bg-primary hover:bg-primary-emphasis text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 min-w-[200px] justify-center"
          >
            <CheckCircle className="w-5 h-5" />
            Finish Study Session
          </button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between w-full mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentFlashcardIndex === 0}
          className="bg-surface-elevated hover:bg-surface-highlight text-text-primary p-3 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous Card (Left Arrow)"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentFlashcardIndex === flashcardsLength - 1}
          className="bg-surface-elevated hover:bg-surface-highlight text-text-primary p-3 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next Card (Right Arrow)"
        >
          <ArrowLeft className="w-6 h-6 rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default StudyActions;
