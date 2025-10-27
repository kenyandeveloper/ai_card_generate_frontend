import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { InlineSpinner } from "../common/LoadingSpinner";
import { useQuiz } from "../../contexts/QuizContext";

const AUTO_ADVANCE_MS = 2500;

const normalizeOption = (option, index) => {
  if (option && typeof option === "object") {
    const label =
      option.label ??
      option.text ??
      option.value ??
      option.answer ??
      option.choice ??
      `Option ${index + 1}`;
    const id = option.id ?? option.value ?? option.key ?? index;
    return {
      id: String(id),
      label: String(label),
      submissionValue: String(label),
      raw: option,
    };
  }

  const label = option != null ? String(option) : `Option ${index + 1}`;
  return {
    id: String(index),
    label,
    submissionValue: label,
    raw: option,
  };
};

const shuffleArray = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default function QuizSession() {
  const {
    session,
    currentQuestion,
    progress,
    timer,
    submitAnswer,
    nextQuestion,
    completeQuiz,
    loading,
    isSubmitting,
  } = useQuiz();

  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const answerTimeoutRef = useRef(null);
  const timerExpiredRef = useRef(false);
  const previousQuestionIdRef = useRef(null);

  const hasTimer = Boolean(session?.timerPerQuestion);
  const timerDuration = session?.timerPerQuestion ?? 30;
  const isLastQuestion = progress?.current === progress?.total;

  useEffect(() => {
    return () => {
      if (answerTimeoutRef.current) {
        clearTimeout(answerTimeoutRef.current);
      }
      timer.pause?.();
    };
  }, [timer]);

  useEffect(() => {
    if (!currentQuestion) {
      setShuffledOptions([]);
      setSelectedOption(null);
      setFeedback(null);
      return;
    }

    const normalizedOptions = (currentQuestion.options || []).map((option, index) =>
      normalizeOption(option, index)
    );

    const shouldReshuffle =
      previousQuestionIdRef.current !== currentQuestion.id ||
      normalizedOptions.length !== shuffledOptions.length;

    if (shouldReshuffle) {
      previousQuestionIdRef.current = currentQuestion.id;
      setShuffledOptions(shuffleArray(normalizedOptions));
    } else {
      setShuffledOptions((prev) =>
        prev.length === normalizedOptions.length ? prev : shuffleArray(normalizedOptions)
      );
    }

    setSelectedOption(
      currentQuestion.userAnswer != null
        ? {
            submissionValue: currentQuestion.userAnswer,
            label: currentQuestion.userAnswer,
            id: String(currentQuestion.userAnswer),
          }
        : null
    );

    if (currentQuestion.userAnswer != null) {
      setFeedback({
        isCorrect:
          typeof currentQuestion.isCorrect === "boolean"
            ? currentQuestion.isCorrect
            : false,
        explanation:
          currentQuestion.feedback ?? currentQuestion.explanation ?? null,
        selectedSubmission: currentQuestion.userAnswer,
        correctAnswer: currentQuestion.correctAnswer ?? null,
      });
      timer.pause?.();
    } else {
      setFeedback(null);
      timerExpiredRef.current = false;
      if (hasTimer) {
        timer.reset();
        timer.start();
      } else {
        timer.reset();
      }
    }

    if (answerTimeoutRef.current) {
      clearTimeout(answerTimeoutRef.current);
    }
  }, [currentQuestion, hasTimer, timer, shuffledOptions.length]);

  const handleAdvance = useCallback(() => {
    if (isLastQuestion) {
      completeQuiz();
    } else {
      nextQuestion();
    }
  }, [completeQuiz, nextQuestion, isLastQuestion]);

  const handleFeedback = useCallback(
    (result, submissionValue) => {
      timer.pause?.();
      setFeedback({
        isCorrect: result?.isCorrect ?? false,
        explanation: result?.explanation ?? null,
        selectedSubmission: submissionValue,
        correctAnswer: result?.correctAnswer ?? null,
      });

      if (answerTimeoutRef.current) {
        clearTimeout(answerTimeoutRef.current);
      }

      answerTimeoutRef.current = setTimeout(() => {
        handleAdvance();
      }, AUTO_ADVANCE_MS);
    },
    [handleAdvance, timer]
  );

  const handleAnswerSubmit = useCallback(
    async (submissionValue) => {
      if (!currentQuestion) return;

      const answerText =
        submissionValue == null ? "[no answer]" : submissionValue;
      try {
        const result = await submitAnswer(currentQuestion.id, answerText);
        handleFeedback(result, submissionValue);
      } catch {
        // submitAnswer already surfaces error toast
      }
    },
    [currentQuestion, submitAnswer, handleFeedback]
  );

  const handleSubmit = useCallback(() => {
    if (!currentQuestion || selectedOption == null || isSubmitting) {
      return;
    }
    handleAnswerSubmit(selectedOption.submissionValue ?? selectedOption.label);
  }, [currentQuestion, selectedOption, isSubmitting, handleAnswerSubmit]);

  const handleAutoSubmit = useCallback(() => {
    if (!currentQuestion || feedback || isSubmitting) {
      return;
    }
    handleAnswerSubmit(null);
  }, [currentQuestion, feedback, isSubmitting, handleAnswerSubmit]);

  useEffect(() => {
    if (!hasTimer || !currentQuestion) {
      return;
    }

    if (timer.timeRemaining === timerDuration) {
      timerExpiredRef.current = false;
    }

    if (timer.timeRemaining === 0 && !timerExpiredRef.current) {
      timerExpiredRef.current = true;
      handleAutoSubmit();
    }
  }, [timer.timeRemaining, timerDuration, hasTimer, currentQuestion, handleAutoSubmit]);

  useEffect(() => {
    return () => {
      if (answerTimeoutRef.current) {
        clearTimeout(answerTimeoutRef.current);
      }
    };
  }, []);

  const optionStates = useMemo(() => {
    if (!currentQuestion) return {};
    const normalize = (value) =>
      value != null ? String(value).trim().toLowerCase() : null;

    const correctValue = normalize(
      feedback?.correctAnswer ?? currentQuestion.correctAnswer ?? null
    );
    const answeredValue = normalize(
      feedback?.selectedSubmission != null
        ? feedback.selectedSubmission
        : selectedOption
        ? selectedOption.submissionValue ?? selectedOption.label
        : null
    );

    return shuffledOptions.reduce((acc, option, index) => {
      const optionKey = String(option.submissionValue ?? option.label ?? index);
      const optionLabelNormalized = normalize(option.label);
      let state = "default";

      if (feedback) {
        if (correctValue != null && optionLabelNormalized === correctValue) {
          state = "correct";
        } else if (answeredValue != null && optionLabelNormalized === answeredValue) {
          state = "incorrect";
        } else {
          state = "disabled";
        }
      } else if (
        selectedOption &&
        optionLabelNormalized ===
          normalize(
            selectedOption.submissionValue ??
              selectedOption.label ??
              selectedOption.id ??
              index
          )
      ) {
        state = "selected";
      }

      acc[optionKey] = state;
      return acc;
    }, {});
  }, [currentQuestion, shuffledOptions, selectedOption, feedback]);

  const progressPercent = useMemo(() => {
    if (!progress || !progress.total) return 0;
    return Math.min(100, Math.max(0, (progress.current / progress.total) * 100));
  }, [progress]);

  const timerPercent = useMemo(() => {
    if (!hasTimer || timerDuration === 0) return 0;
    return Math.max(0, Math.min(100, (timer.timeRemaining / timerDuration) * 100));
  }, [hasTimer, timer.timeRemaining, timerDuration]);

  if (!currentQuestion) {
    return (
      <section className="rounded-2xl border border-border-muted bg-surface p-6 shadow-sm text-center text-text-muted">
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <InlineSpinner size={18} />
            Loading quiz...
          </div>
        ) : (
          <p>No active quiz session. Generate a quiz to begin.</p>
        )}
      </section>
    );
  }

  const questionNumber =
    currentQuestion.questionNumber ?? progress?.current ?? 1;
  const promptText =
    currentQuestion.prompt ||
    currentQuestion.question ||
    currentQuestion.text ||
    `Question ${questionNumber}`;

  return (
    <section className="rounded-2xl border border-border-muted bg-surface p-6 shadow-sm">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted">
            Question {questionNumber} of {progress?.total}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-text-primary">
            {promptText}
          </h2>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="w-40 rounded-full bg-surface-highlight">
            <div
              className="h-2 rounded-full bg-primary transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {hasTimer && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock className="h-4 w-4 text-primary" />
              <span>{timer.timeRemaining}s left</span>
            </div>
          )}
        </div>
      </header>

      {hasTimer && (
        <div className="mb-6 h-2 w-full rounded-full bg-surface-highlight overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-[width]"
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      )}

      <div className="space-y-3">
        {shuffledOptions.map((option, index) => {
          const optionValue = String(option.submissionValue ?? option.label ?? option.id ?? index);
          const state = optionStates[optionValue] || "default";
          const isDisabled = Boolean(feedback) || loading || isSubmitting;
          const choiceLetter = String.fromCharCode(65 + index);

          const baseClasses =
            "w-full rounded-xl border px-4 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";
          const stateClasses = {
            default:
              "border-border-muted bg-background-subtle text-text-secondary hover:border-primary hover:text-text-primary",
            selected:
              "border-primary bg-primary-soft/70 text-text-primary shadow-sm",
            correct:
              "border-success bg-success-soft/40 text-success font-semibold",
            incorrect:
              "border-danger bg-danger-soft/40 text-danger font-semibold",
            disabled:
              "border-border-muted bg-background-subtle text-text-muted opacity-70",
          }[state];

          return (
            <button
              key={optionValue}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (feedback) return;
                setSelectedOption(option);
              }}
              className={`${baseClasses} ${stateClasses} disabled:cursor-not-allowed`}
            >
              <span className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-muted bg-background-subtle font-semibold text-text-secondary">
                  {choiceLetter}
                </span>
                <span className="flex-1 text-text-primary">{option.label}</span>
                {state === "correct" && (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
                {state === "incorrect" && (
                  <XCircle className="h-5 w-5 text-danger" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-text-muted">
          Answers submit automatically after {AUTO_ADVANCE_MS / 1000}s of feedback.
          You can manually proceed after submitting.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              Boolean(feedback) ||
              selectedOption == null ||
              isSubmitting ||
              loading
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-emphasis disabled:cursor-not-allowed disabled:bg-primary/50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit answer
          </button>
          {feedback && (
            <button
              type="button"
              onClick={() => {
                if (answerTimeoutRef.current) {
                  clearTimeout(answerTimeoutRef.current);
                }
                handleAdvance();
              }}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border-muted px-5 text-sm font-semibold text-text-secondary hover:text-text-primary"
            >
              {isLastQuestion ? "View results" : "Next question"}
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="mt-6 rounded-xl border border-border-muted bg-background-subtle px-4 py-4">
          <div className="flex items-start gap-3">
            {feedback.isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-danger mt-0.5" />
            )}
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {feedback.isCorrect ? "Correct!" : "Incorrect"}
              </p>
              {feedback.explanation && (
                <p className="mt-1 text-sm text-text-muted">
                  {feedback.explanation}
                </p>
              )}
              {!feedback.isCorrect && feedback.correctAnswer && (
                <p className="mt-1 text-xs text-text-secondary">
                  Correct answer: <span className="font-medium text-text-primary">{feedback.correctAnswer}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
