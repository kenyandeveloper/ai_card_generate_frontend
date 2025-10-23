import { useMemo } from "react";
import { TrendingUp, Target, Clock, Lock } from "lucide-react";
import UsageMeter from "../Dashboard/UsageMeter";
import LockedFeature from "../Dashboard/LockedFeature";

const getAccuracyDisplay = (accuracy) => {
  if (typeof accuracy !== "number") return "N/A";
  return `${(accuracy * 100).toFixed(1)}%`;
};

const getTotalReviewsDisplay = (total) => {
  if (typeof total !== "number") return "—";
  return total;
};

const buildDeckInsights = (dashboardDecks = []) =>
  dashboardDecks
    .map((deck) => {
      const id = deck?.id ?? deck?.deck_id;
      if (!id) return null;
      return {
        id,
        name: deck?.name ?? deck?.deck_title ?? "Untitled deck",
        progress: deck?.progress ?? null,
        flashcardsCount:
          deck?.flashcards_count ?? deck?.total_cards ?? deck?.cards_total ?? 0,
        flashcardsStudied:
          deck?.flashcards_studied ??
          deck?.studied_count ??
          deck?.total_reviews ??
          0,
      };
    })
    .filter(Boolean);

const filterWeakCards = (weakCards = []) =>
  weakCards.filter((card) => card?.deck_id);

export default function ProgressOverview({
  stats,
  dashboardDecks,
  usageInfo,
  isPremium,
  onNavigateToDeck,
}) {
  const summaryStats = stats || {};
  const dailyAccuracy = summaryStats.daily_accuracy || [];
  const weakCards = filterWeakCards(summaryStats.weak_cards || []);
  const accuracyDisplay = getAccuracyDisplay(summaryStats.accuracy);
  const totalReviewsDisplay = getTotalReviewsDisplay(
    summaryStats.total_reviews
  );
  const timeStudiedDisplay =
    typeof summaryStats.time_studied_week === "number"
      ? `${Math.round(summaryStats.time_studied_week)} min`
      : typeof summaryStats.time_studied_minutes === "number"
      ? `${Math.round(summaryStats.time_studied_minutes)} min`
      : "N/A";
  const avgTimePerCard =
    typeof summaryStats.avg_time_per_card === "number"
      ? summaryStats.avg_time_per_card
      : null;
  const aiUsage = usageInfo?.ai_generation ?? null;
  const quizUsage = usageInfo?.quizzes ?? null;

  const timeCardValue = isPremium ? (
    timeStudiedDisplay
  ) : (
    <div className="flex items-center gap-2 text-text-muted">
      <Lock className="h-5 w-5" />
      <span className="text-sm font-semibold">Premium</span>
    </div>
  );

  const timeCardDescription = isPremium
    ? avgTimePerCard && avgTimePerCard > 0
      ? `~${avgTimePerCard.toFixed(1)} min per card`
      : "Log a few reviews to unlock average time insights."
    : "Upgrade to unlock detailed time analytics.";

  const normalizedDeckInsights = useMemo(
    () => buildDeckInsights(dashboardDecks),
    [dashboardDecks]
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <StatSummaryCard
          title="Overall Accuracy"
          value={accuracyDisplay}
          icon={<TrendingUp className="h-6 w-6" />}
          tone="primary"
          description="Keep consistency high to boost mastery."
        />
        <StatSummaryCard
          title="Total Reviews"
          value={totalReviewsDisplay}
          icon={<Target className="h-6 w-6" />}
          tone="success"
          description="Every review sharpens recall."
        />
        <StatSummaryCard
          title="Time Studied"
          value={timeCardValue}
          icon={<Clock className="h-6 w-6" />}
          tone="accent"
          description={timeCardDescription}
        />
      </div>

      {(aiUsage || quizUsage) && (
        <div className="rounded-2xl border border-border-muted bg-surface-elevated p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary">
            Your Usage
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            Track how many AI credits and quizzes you have used.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {aiUsage && (
              <UsageMeter
                label="AI Flashcards"
                used={aiUsage.used}
                limit={aiUsage.limit}
                period="this month"
                isPremium={isPremium}
              />
            )}
            {quizUsage && (
              <UsageMeter
                label="Quizzes"
                used={quizUsage.used}
                limit={quizUsage.limit}
                period="this week"
                isPremium={isPremium}
              />
            )}
          </div>
        </div>
      )}

      {isPremium ? (
        dailyAccuracy.length > 0 && (
          <div className="rounded-2xl border border-border-muted bg-surface-elevated p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                Daily Accuracy Trend
              </h3>
              <span className="text-sm text-text-muted">
                Spot streaks and slow days at a glance.
              </span>
            </div>
            <AccuracyTrendChart data={dailyAccuracy} />
          </div>
        )
      ) : (
        <LockedFeature
          title="Daily Accuracy Trends"
          description="Visualise your learning progress over time with daily accuracy charts."
          benefits={[
            "Identify streaks and slow days instantly",
            "Spot improvements after each study session",
            "Get insights that guide your next review",
          ]}
        />
      )}

      {normalizedDeckInsights.length > 0 && (
        <div className="rounded-2xl border border-border-muted bg-surface-elevated p-6">
          <h3 className="text-lg font-semibold text-text-primary">
            Deck Progress Snapshot
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            See how your top decks are progressing.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {normalizedDeckInsights.slice(0, 4).map((deck) => (
              <DeckProgressCard
                key={deck.id}
                deck={deck}
                isPremium={isPremium}
                onNavigateToDeck={onNavigateToDeck}
              />
            ))}
          </div>
        </div>
      )}

      {isPremium ? (
        weakCards.length > 0 && (
          <div className="rounded-2xl border border-border-muted bg-surface-elevated p-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Cards That Need Attention
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              Tackle these low-accuracy cards to raise your mastery.
            </p>
            <div className="mt-4 space-y-3">
              {weakCards.map((card) => (
                <button
                  key={card.flashcard_id}
                  type="button"
                  onClick={() => onNavigateToDeck?.(card.deck_id)}
                  className="w-full rounded-xl border border-border-muted bg-surface-highlight/40 p-4 text-left transition-colors hover:bg-surface-highlight"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary">
                        {card.question}
                      </p>
                      <p className="mt-1 text-sm text-text-muted">
                        Deck: {card.deck_name}
                      </p>
                      <p className="mt-2 text-sm text-text-secondary">
                        Accuracy {Math.round((card.accuracy || 0) * 100)}% •
                        Attempts {card.total_attempts}
                      </p>
                    </div>
                    <span className="rounded-full bg-danger-soft px-3 py-1 text-xs font-semibold text-danger">
                      Review
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      ) : (
        <LockedFeature
          title="Cards Needing Attention"
          description="Identify weak cards instantly and focus your reviews where it matters most."
          benefits={[
            "See which questions you miss most often",
            "Jump straight into the deck that needs practice",
            "Track accuracy improvements over time",
          ]}
        />
      )}
    </div>
  );
}

const toneIconClasses = {
  primary: "text-primary",
  success: "text-success",
  accent: "text-secondary",
};

const StatSummaryCard = ({ title, value, icon, tone = "primary", description }) => {
  const isPrimitive =
    typeof value === "string" || typeof value === "number";

  return (
    <div className="rounded-2xl border border-border-muted bg-surface-elevated p-5 transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-muted">{title}</p>
          {isPrimitive || value === undefined || value === null ? (
            <p className="mt-2 text-3xl font-bold text-text-primary">
              {isPrimitive ? value : "—"}
            </p>
          ) : (
            <div className="mt-2">{value}</div>
          )}
        </div>
        <div
          className={`rounded-full bg-background-subtle/80 p-3 ${
            toneIconClasses[tone] || "text-text-primary"
          }`}
        >
          {icon}
        </div>
      </div>
      {description && (
        <p className="mt-3 text-sm text-text-muted">{description}</p>
      )}
    </div>
  );
};

const DeckProgressCard = ({ deck, isPremium, onNavigateToDeck }) => {
  return (
    <div className="rounded-xl border border-border-muted/70 bg-background-subtle/30 p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-text-primary">{deck.name}</p>
        <button
          type="button"
          onClick={() => onNavigateToDeck?.(deck.id)}
          className="text-sm font-medium text-primary hover:text-primary-emphasis"
        >
          Study
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {isPremium ? (
          <>
            <ProgressRow
              label="Mastered"
              value={deck.progress?.mastered || 0}
              color="bg-green-500"
            />
            <ProgressRow
              label="Learning"
              value={deck.progress?.learning || 0}
              color="bg-yellow-500"
              textClass="text-yellow-700"
            />
            <ProgressRow
              label="Not Started"
              value={deck.progress?.not_started || 0}
              color="bg-gray-400"
              textClass="text-text-muted"
            />
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="flex h-full">
                <div
                  className="bg-green-500 transition-all duration-300"
                  style={{
                    width: `${
                      ((deck.progress?.mastered || 0) /
                        (deck.flashcardsCount || 1)) *
                      100
                    }%`,
                  }}
                  title={`${deck.progress?.mastered || 0} mastered`}
                />
                <div
                  className="bg-yellow-500 transition-all duration-300"
                  style={{
                    width: `${
                      ((deck.progress?.learning || 0) /
                        (deck.flashcardsCount || 1)) *
                      100
                    }%`,
                  }}
                  title={`${deck.progress?.learning || 0} learning`}
                />
              </div>
            </div>
            <p className="text-xs text-text-muted">
              {deck.flashcardsStudied || 0} of {deck.flashcardsCount || 0} cards
              reviewed
            </p>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-border-muted bg-surface-highlight/40 p-3 text-left">
              <p className="text-sm font-semibold text-text-primary">
                {deck.flashcardsStudied || 0} cards reviewed
              </p>
              <p className="text-xs text-text-muted">
                {deck.flashcardsCount || 0} total cards in this deck
              </p>
            </div>
            <p className="text-xs text-text-muted">
              Upgrade to view mastery breakdown for each deck.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const ProgressRow = ({ label, value, color, textClass }) => (
  <div className="flex items-center justify-between text-sm text-text-muted">
    <span className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      {label}
    </span>
    <span className={`font-semibold ${textClass || "text-text-primary"}`}>
      {value}
    </span>
  </div>
);

const AccuracyTrendChart = ({ data }) => {
  const points = data.slice(-30);
  const width = 600;
  const height = 220;
  const padding = 32;
  const getX = (index) =>
    points.length === 1
      ? padding + (width - padding * 2) / 2
      : padding +
        ((width - padding * 2) * index) / Math.max(points.length - 1, 1);
  const getY = (accuracyValue) =>
    padding + (height - padding * 2) * (1 - (accuracyValue ?? 0));

  const path = points
    .map((entry, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${getX(index)} ${getY(entry.accuracy ?? 0)}`;
    })
    .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Daily accuracy line chart"
        className="max-h-[280px]"
      >
        <defs>
          <linearGradient id="accuracyGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="url(#accuracyGradient)"
          opacity={0.15}
        />
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = padding + (height - padding * 2) * (1 - fraction);
          return (
            <g key={fraction}>
              <line
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="#2a2e3b"
                strokeDasharray="4 6"
                opacity={0.35}
              />
              <text
                x={padding - 12}
                y={y + 4}
                fontSize="12"
                fill="#9aa1b1"
                textAnchor="end"
              >
                {(fraction * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}

        {path && (
          <path
            d={path}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {points.map((entry, index) => {
          const x = getX(index);
          const y = getY(entry.accuracy ?? 0);
          return (
            <g key={entry.date}>
              <circle cx={x} cy={y} r={4} fill="#1d4ed8" />
              <circle cx={x} cy={y} r={8} fill="#1d4ed8" opacity={0.15} />
            </g>
          );
        })}

        <g>
          {points.map((entry, index) => {
            const x = getX(index);
            const label = new Date(entry.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
            return (
              <text
                key={entry.date}
                x={x}
                y={height - padding + 18}
                fontSize="12"
                fill="#9aa1b1"
                textAnchor="middle"
              >
                {label}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
