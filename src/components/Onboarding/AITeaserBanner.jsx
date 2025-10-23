// src/components/Onboarding/AITeaserBanner.jsx
import { Sparkles } from "lucide-react";

export default function AITeaserBanner({ onTryAI, onDismiss }) {
  return (
    <section
      role="status"
      aria-live="polite"
      className="mt-3 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-slate-800/70 p-4 sm:p-5 shadow-md"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Icon + Copy */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-indigo-500/15 p-2 ring-1 ring-inset ring-indigo-500/25">
            <Sparkles className="h-5 w-5 text-indigo-300" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              ✨ Want something custom?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              Generate a deck on <strong>any topic</strong> with AI. You get{" "}
              <strong>one free AI deck</strong> to try it out.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onTryAI}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-medium text-text-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          >
            Try free AI deck
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center justify-center rounded-xl border border-border-muted px-3.5 py-2 text-sm font-medium text-text-primary hover:bg-surface-elevated/60 focus:outline-none focus:ring-2 focus:ring-slate-500/60"
          >
            Not now
          </button>
        </div>
      </div>
    </section>
  );
}
