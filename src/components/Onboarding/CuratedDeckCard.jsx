// src/components/Onboarding/CuratedDeckCard.jsx
import { CheckCircle } from "lucide-react";

export default function CuratedDeckCard({ deck, selected, onToggle }) {
  // Click toggles selection; expose state to AT with aria-pressed.
  const handleClick = () => onToggle(deck.id);

  return (
    <div
      className={[
        "relative rounded-2xl border transition-all",
        "bg-background-subtle/60 border-border-muted hover:border-border-muted",
        selected ? "ring-2 ring-indigo-500/40 border-indigo-500/50" : "ring-0",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={selected}
        className="w-full text-left rounded-2xl p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
      >
        {/* Selection badge */}
        {selected && (
          <span className="absolute right-2 top-2 rounded-full bg-background-subtle p-1">
            <CheckCircle
              className="h-5 w-5 text-indigo-400"
              aria-hidden="true"
            />
            <span className="sr-only">Selected deck</span>
          </span>
        )}

        {/* Top chips */}
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center rounded-lg border border-border-muted px-2 py-0.5 text-xs text-text-secondary">
            {deck.subject}
          </span>
          <span className="inline-flex items-center rounded-lg bg-surface-elevated px-2 py-0.5 text-xs text-text-primary">
            {deck.estCards} cards
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-semibold text-text-primary">
          {deck.title}
        </h3>

        {/* Description */}
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-text-muted">
          {deck.description}
        </p>
      </button>
    </div>
  );
}
