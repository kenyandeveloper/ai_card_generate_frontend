import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import StudyHeader from "./StudyMode/StudyHeader";
import StudyProgress from "./StudyMode/StudyProgress";
import FlashcardDisplay from "./StudyMode/FlashcardDisplay";
import StudyActions from "./StudyMode/StudyActions";
import StudySummary from "./StudyMode/StudySummary";
import { useStudySession } from "./StudyMode/useStudySession";
import LoadingState from "./LoadingState";
import EmptyDeckState from "./StudyMode/EmptyDeckState";
import { useProgress } from "../../hooks/useProgress";

const StudyMode = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const sessionStartTimeRef = useRef(Date.now());
  const startTimeRef = useRef(Date.now());
  const { trackingEnabled, toggleTracking } = useProgress();

  const {
    deck,
    flashcards,
    currentFlashcardIndex,
    setCurrentFlashcardIndex,
    showAnswer,
    setShowAnswer,
    loading,
    error,
    sessionStats,
    showSummary,
    handleAnswer,
    getCardProgress,
    answeredCards,
    handleFinishSession,
    submittingReview,
    getElapsedSeconds,
  } = useStudySession(deckId, startTimeRef, sessionStartTimeRef);

  // Helper function to check if current card is answered
  const isCurrentCardAnswered = useCallback(() => {
    if (!flashcards[currentFlashcardIndex]) return false;
    return answeredCards.has(flashcards[currentFlashcardIndex].id);
  }, [flashcards, currentFlashcardIndex, answeredCards]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      const currentCard = flashcards[currentFlashcardIndex];
      if (!currentCard) return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setShowAnswer(!showAnswer);
      }
      // Right arrow - move to next card or submit correct answer
      else if (e.key === "ArrowRight") {
        if (showAnswer && !isCurrentCardAnswered()) {
          handleAnswer(true);
        } else if (currentFlashcardIndex < flashcards.length - 1) {
          setCurrentFlashcardIndex(currentFlashcardIndex + 1);
          setShowAnswer(false);
        }
      }
      // Left arrow - move to previous card or submit incorrect answer
      else if (e.key === "ArrowLeft") {
        if (showAnswer && !isCurrentCardAnswered()) {
          handleAnswer(false);
        } else if (currentFlashcardIndex > 0) {
          setCurrentFlashcardIndex(currentFlashcardIndex - 1);
          setShowAnswer(false);
        }
      }
      // Number keys for direct response
      else if (showAnswer && !isCurrentCardAnswered()) {
        if (e.key === "1") {
          handleAnswer(true);
        } else if (e.key === "0") {
          handleAnswer(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    showAnswer,
    currentFlashcardIndex,
    flashcards,
    handleAnswer,
    setCurrentFlashcardIndex,
    setShowAnswer,
    answeredCards,
    isCurrentCardAnswered,
  ]);

  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayTime(getElapsedSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, [getElapsedSeconds, currentFlashcardIndex]);

  const handleExitStudy = () => {
    navigate("/study");
  };

  if (loading) {
    return <LoadingState message="Loading study session..." />;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 px-4">
        <div className="bg-danger-soft/20 border border-danger rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-danger font-medium mb-1">Error</h3>
              <p className="text-danger text-sm">{error}</p>
            </div>
            <button
              onClick={() => navigate("/study")}
              className="ml-4 text-danger hover:text-text-primary text-sm font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return <EmptyDeckState deckId={deckId} />;
  }

  const currentFlashcard = flashcards[currentFlashcardIndex];
  const cardProgress = getCardProgress(currentFlashcard.id);
  const progressPercentage =
    ((currentFlashcardIndex + 1) / flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
        <StudyHeader deck={deck} handleExitStudy={handleExitStudy} />
        <div className="hidden mb-4 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">
              Track Progress
            </span>
            <span className="text-xs text-text-muted">
              Enable to log this session to your stats.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!trackingEnabled}
              onChange={(e) => toggleTracking(e.target.checked)}
              className="sr-only peer"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>

        <StudyProgress
          currentIndex={currentFlashcardIndex}
          totalCards={flashcards.length}
          progressPercentage={progressPercentage}
        />

        <FlashcardDisplay
          currentFlashcard={currentFlashcard}
          showAnswer={showAnswer}
          setShowAnswer={setShowAnswer}
          cardProgress={cardProgress}
        />

        <div className="mt-4 text-center text-sm text-text-muted">
          Time on card: {displayTime}s
        </div>

        <StudyActions
          showAnswer={showAnswer}
          setShowAnswer={setShowAnswer}
          currentFlashcardIndex={currentFlashcardIndex}
          flashcardsLength={flashcards.length}
          setCurrentFlashcardIndex={setCurrentFlashcardIndex}
          onAnswer={handleAnswer}
          handleFinishSession={handleFinishSession}
          isCurrentCardAnswered={isCurrentCardAnswered()}
          submittingReview={submittingReview}
        />

        <StudySummary
          showSummary={showSummary}
          sessionStats={sessionStats}
          handleExitStudy={handleExitStudy}
        />
      </div>
    </div>
  );
};

export default StudyMode;
