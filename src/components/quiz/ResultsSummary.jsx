import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  RefreshCcw,
  BookOpen,
} from "lucide-react";
import { useQuiz } from "../../contexts/QuizContext";
import { showError } from "../common/ErrorSnackbar";

const formatTime = (seconds) => {
  if (seconds == null || Number.isNaN(seconds)) {
    return "—";
  }
  const totalSeconds = Math.max(0, Math.round(Number(seconds)));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

const accuracyVariant = (accuracy) => {
  if (accuracy >= 90) return { text: "text-success", badge: "bg-success-soft/30" };
  if (accuracy >= 70) return { text: "text-warning", badge: "bg-warning-soft/30" };
  return { text: "text-danger", badge: "bg-danger-soft/30" };
};

export default function ResultsSummary() {
  const navigate = useNavigate();
  const { session, generateQuiz, resetQuiz } = useQuiz();
  const [expanded, setExpanded] = useState(() => new Set());

  const totalQuestions =
    session?.totalQuestions ?? session?.questions?.length ?? 0;
  const correctAnswers = session?.score?.correct ?? 0;
  const accuracy = totalQuestions
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;
  const accuracyClasses = accuracyVariant(accuracy);
  const timeTakenSeconds =
    session?.timeTakenSeconds ??
    (session?.completedAt && session?.startedAt
      ? Math.round((session.completedAt - session.startedAt) / 1000)
      : null);
  const formattedTime = formatTime(timeTakenSeconds);

  const toggleQuestion = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const retryParams = useMemo(() => {
    const baseDeckIds = session?.generationParams?.deckIds;
    const fallbackDeckIds = Array.isArray(session?.deckIds)
      ? [...session.deckIds]
      : [];
    const deckIds = Array.isArray(baseDeckIds) ? [...baseDeckIds] : fallbackDeckIds;

    const questionCount =
      session?.generationParams?.questionCount ??
      session?.totalQuestions ??
      session?.questionCount ??
      session?.questions?.length ??
      10;

    const timerEnabled =
      session?.generationParams?.timerEnabled ??
      Boolean(session?.timerPerQuestion);

    return { deckIds, questionCount, timerEnabled };
  }, [session]);

  const canRetry = retryParams.deckIds.length > 0;

  const handleRetry = useCallback(() => {
    if (!canRetry) {
      showError(
        "Unable to retry because deck context is missing. Start a new quiz from setup."
      );
      navigate("/quiz");
      return;
    }

    resetQuiz();
    setTimeout(() => {
      generateQuiz(retryParams);
    }, 0);
  }, [canRetry, generateQuiz, navigate, resetQuiz, retryParams]);

  const handleReviewDecks = useCallback(() => {
    navigate("/study");
  }, [navigate]);

  const reviewItems = useMemo(() => {
    return (session?.questions ?? []).map((question, index) => {
      const key = question.id ?? index;
      const isCorrect = question.isCorrect === true;
      const isExpanded = expanded.has(key);
      const userAnswer =
        question.userAnswer ??
        session?.finalSummary?.answers?.[index]?.user_answer ??
        "Not answered";
      const correctAnswer =
        question.correctAnswer ??
        session?.finalSummary?.answers?.[index]?.correct_answer ??
        "Unavailable";
      const explanation =
        question.feedback ??
        question.explanation ??
        session?.finalSummary?.answers?.[index]?.feedback ??
        null;

      return {
        key,
        isCorrect,
        isExpanded,
        question,
        userAnswer,
        correctAnswer,
        explanation,
      };
    });
  }, [expanded, session]);

  if (session?.status !== "completed") {
    return (
      <section className="rounded-2xl border border-border-muted bg-surface p-6 shadow-sm text-center text-text-muted">
        Finish the quiz to see your summary.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border-muted bg-surface p-6 shadow-sm space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-text-primary mb-2">
          Quiz Results
        </h1>
        <p className="text-sm text-text-muted">
          Here’s how you performed. Review each question below to reinforce what
          you’ve learned.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border-muted bg-background-subtle/40 p-5">
          <p className="text-sm text-text-muted">You scored</p>
          <p className="text-3xl font-semibold text-text-primary mt-1">
            {correctAnswers} out of {totalQuestions}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Keep practicing to improve your mastery across these decks.
          </p>
        </div>

        <div className="rounded-2xl border border-border-muted bg-background-subtle/40 p-5 space-y-4">
          <div>
            <p className="text-sm text-text-muted">Accuracy</p>
            <div
              className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${accuracyClasses.badge} ${accuracyClasses.text}`}
            >
              {accuracy}% accurate
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="h-4 w-4 text-primary" />
            <span>
              Time spent:{" "}
              <span className="font-semibold text-text-primary">
                {formattedTime}
              </span>
            </span>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">
          Question review
        </h2>
        {(reviewItems.length === 0 && (
          <p className="text-sm text-text-muted">
            No questions recorded for this quiz.
          </p>
        )) ||
          reviewItems.map(
            ({ key, isCorrect, isExpanded, question, userAnswer, correctAnswer, explanation }) => {
              const headerClasses = isCorrect
                ? "border-success bg-success-soft/20"
                : "border-danger bg-danger-soft/20";
              return (
                <div
                  key={key}
                  className={`rounded-xl border ${headerClasses}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleQuestion(key)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-danger" />
                      )}
                      <span className="text-sm font-semibold text-text-primary">
                        Question {question.questionNumber ?? key}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-text-secondary" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-text-secondary" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border-muted bg-background-subtle/40 px-4 py-4 space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-text-primary">
                          {question.prompt}
                        </p>
                      </div>
                      <div
                        className={`rounded-lg border px-3 py-2 ${
                          isCorrect
                            ? "border-success/60 bg-success-soft/30 text-success"
                            : "border-danger/60 bg-danger-soft/30 text-danger"
                        }`}
                      >
                        <p className="text-xs uppercase tracking-wide">
                          Your answer
                        </p>
                        <p className="font-semibold">{userAnswer}</p>
                      </div>
                      {!isCorrect && (
                        <div className="rounded-lg border border-success/50 bg-success-soft/20 px-3 py-2 text-success">
                          <p className="text-xs uppercase tracking-wide">
                            Correct answer
                          </p>
                          <p className="font-semibold">{correctAnswer}</p>
                        </div>
                      )}
                      {explanation && (
                        <p className="text-sm text-text-secondary">
                          {explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          )}
      </section>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-text-secondary">
          Review your answers or jump back into studying to reinforce the
          material.
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRetry}
            disabled={!canRetry}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-emphasis disabled:cursor-not-allowed disabled:bg-primary/50"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry quiz
          </button>
          <button
            type="button"
            onClick={handleReviewDecks}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-muted px-5 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary"
          >
            <BookOpen className="h-4 w-4" />
            Review decks
          </button>
        </div>
      </div>
    </section>
  );
}
