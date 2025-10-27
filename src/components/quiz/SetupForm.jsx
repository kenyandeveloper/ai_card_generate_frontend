import { useEffect, useMemo, useState } from "react";
import { Clock, Search, AlertTriangle } from "lucide-react";
import { InlineSpinner } from "../common/LoadingSpinner";
import { useDecks } from "../../hooks/useDecks";
import { useProgress } from "../../hooks/useProgress";
import { useQuiz } from "../../contexts/QuizContext";

const PREMIUM_MAX_QUESTIONS = 50;
const DEFAULT_FREE_MAX = 3;
const DEFAULT_QUESTION_COUNT = 10;

const getDeckCardCount = (deck) =>
  deck?.flashcard_count ??
  deck?.card_count ??
  deck?.cards_count ??
  deck?.total_cards ??
  deck?.stats?.card_count ??
  deck?.stats?.cardCount ??
  0;

export default function SetupForm() {
  const { decks, loading: decksLoading, error: decksError } = useDecks();
  const { usageInfo, isPremium } = useProgress();
  const { session, loading, error, generateQuiz } = useQuiz();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeckIds, setSelectedDeckIds] = useState(() => new Set());
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [timerEnabled, setTimerEnabled] = useState(false);

  const quizUsage = usageInfo?.quizzes ?? {};
  const numericLimit =
    typeof quizUsage.limit === "number" ? quizUsage.limit : null;
  const maxQuestions = useMemo(() => {
    const usageMax =
      typeof quizUsage.max_questions === "number"
        ? quizUsage.max_questions
        : null;
    if (usageMax) {
      return Math.max(1, Math.min(usageMax, PREMIUM_MAX_QUESTIONS));
    }
    if (isPremium) {
      return PREMIUM_MAX_QUESTIONS;
    }
    return DEFAULT_FREE_MAX;
  }, [quizUsage.max_questions, isPremium]);

  useEffect(() => {
    setQuestionCount((prev) => {
      if (!Number.isFinite(prev) || prev <= 0) {
        return Math.min(DEFAULT_QUESTION_COUNT, maxQuestions);
      }
      return Math.min(prev, maxQuestions);
    });
  }, [maxQuestions]);

  useEffect(() => {
    if (Array.isArray(session?.deckIds) && session.deckIds.length > 0) {
      setSelectedDeckIds(new Set(session.deckIds.map(String)));
    }
    if (session?.timerPerQuestion) {
      setTimerEnabled(true);
    }
    if (session?.questionCount) {
      setQuestionCount((prev) =>
        Math.min(session.questionCount, maxQuestions || prev)
      );
    }
  }, [session, maxQuestions]);

  const filteredDecks = useMemo(() => {
    if (!Array.isArray(decks)) return [];
    if (!searchTerm) return decks;
    const needle = searchTerm.toLowerCase();
    return decks.filter((deck) =>
      (deck.title || "").toLowerCase().includes(needle)
    );
  }, [decks, searchTerm]);

  const toggleDeck = (deckId) => {
    setSelectedDeckIds((prev) => {
      const next = new Set(prev);
      if (next.has(deckId)) {
        next.delete(deckId);
      } else {
        next.add(deckId);
      }
      return next;
    });
  };

  const decrementQuestionCount = () => {
    setQuestionCount((prev) => Math.max(1, prev - 1));
  };

  const incrementQuestionCount = () => {
    setQuestionCount((prev) => Math.min(maxQuestions, prev + 1));
  };

  const handleQuestionInput = (event) => {
    const raw = event.target.value;
    if (raw === "") {
      setQuestionCount("");
      return;
    }
    const value = Number.parseInt(raw, 10);
    if (!Number.isNaN(value)) {
      setQuestionCount(Math.min(Math.max(1, value), maxQuestions));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedDeckIds.size === 0 || questionCount <= 0) {
      return;
    }
    generateQuiz({
      deckIds: Array.from(selectedDeckIds).map(Number), // Convert string IDs to numbers for API
      questionCount,
      timerEnabled,
    });
  };

  const isUsageExhausted =
    numericLimit !== null &&
    typeof quizUsage.used === "number" &&
    quizUsage.used >= numericLimit;
  const generateDisabled =
    selectedDeckIds.size === 0 ||
    questionCount <= 0 ||
    isUsageExhausted ||
    loading;
  const decksUnavailable = !decksLoading && filteredDecks.length === 0;

  return (
    <section className="rounded-2xl border border-border-muted bg-surface p-6 shadow-sm">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">
          Start a Quiz
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Pick the decks you want to include, set question limits, and choose
          whether to enable the timer.
        </p>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {(error || decksError) && (
          <div className="rounded-xl border border-danger bg-danger-soft/20 px-4 py-3 text-sm text-danger">
            {error || decksError}
          </div>
        )}

        {isUsageExhausted && (
          <div className="flex flex-col gap-3 rounded-xl border border-warning bg-warning-soft/30 px-4 py-4 text-sm text-text-secondary md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="text-text-primary font-semibold">
                  Quiz limit reached
                </p>
                <p className="text-text-muted">
                  You&apos;ve used {quizUsage.used}/{numericLimit} quizzes this
                  week. Upgrade to continue generating quizzes.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-billing"))}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-emphasis"
            >
              Upgrade
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">
            Choose decks
          </label>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search decks"
              className="w-full rounded-xl border border-border-muted bg-background-subtle pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="max-h-64 overflow-y-auto rounded-xl border border-border-muted bg-background-subtle/40">
            {decksLoading && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-text-muted">
                <InlineSpinner size={18} />
                Loading decks...
              </div>
            )}

            {decksUnavailable && (
              <div className="px-4 py-6 text-sm text-text-muted">
                No decks found. Create a deck to start quizzing.
              </div>
            )}

            {!decksLoading &&
              filteredDecks.map((deck) => {
                const deckId = String(deck.id ?? deck.deck_id);
                const isChecked = selectedDeckIds.has(deckId);
                const cardCount = getDeckCardCount(deck);
                return (
                  <label
                    key={deckId}
                    className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-surface-highlight/50"
                  >
                    <input
                      type="checkbox"
                      className="mt-1.5 h-4 w-4 rounded border-border-muted text-primary focus:ring-primary"
                      checked={isChecked}
                      onChange={() => toggleDeck(deckId)}
                    />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {deck.title || "Untitled deck"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {cardCount} card{cardCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </label>
                );
              })}
          </div>

          <p className="mt-2 text-xs text-text-muted">
            Selected decks: {selectedDeckIds.size}
          </p>
          {selectedDeckIds.size === 0 && (
            <p className="text-xs text-danger mt-1">
              Select at least one deck to continue
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,300px)]">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              Number of questions
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decrementQuestionCount}
                disabled={questionCount <= 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-muted bg-background-subtle text-lg text-text-secondary transition hover:bg-surface-highlight disabled:cursor-not-allowed disabled:opacity-50"
              >
                –
              </button>
              <input
                type="number"
                min={1}
                max={maxQuestions}
                value={questionCount}
                onChange={handleQuestionInput}
                onBlur={() => {
                  if (questionCount === "" || questionCount < 1) {
                    setQuestionCount(1);
                  }
                }}
                className="h-10 w-20 rounded-lg border border-border-muted bg-background-subtle text-center text-lg font-semibold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={incrementQuestionCount}
                disabled={questionCount >= maxQuestions}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-muted bg-background-subtle text-lg text-text-secondary transition hover:bg-surface-highlight disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              {questionCount}/{maxQuestions} questions (
              {isPremium ? "premium" : "free tier"})
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border-muted bg-background-subtle px-4 py-3">
            <input
              id="timer-toggle"
              type="checkbox"
              checked={timerEnabled}
              onChange={(event) => setTimerEnabled(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border-muted text-primary focus:ring-primary"
            />
            <label
              htmlFor="timer-toggle"
              className="flex flex-col text-sm text-text-secondary"
            >
              <span className="flex items-center gap-2 text-text-primary font-semibold">
                <Clock className="h-4 w-4 text-primary" />
                Enable 30-second timer
              </span>
              <span className="text-xs text-text-muted">
                Automatically submit answers when the timer runs out.
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-text-muted">
            {numericLimit !== null && (
              <span>
                Quizzes used: {quizUsage.used ?? 0}/{numericLimit}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={generateDisabled}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-emphasis disabled:cursor-not-allowed disabled:bg-primary/50"
          >
            {loading && <InlineSpinner size={18} />}
            Generate Quiz
          </button>
        </div>
      </form>
    </section>
  );
}
