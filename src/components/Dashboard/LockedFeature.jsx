// src/components/Dashboard/LockedFeature.jsx
import { Lock } from "lucide-react";

export default function LockedFeature({
  title,
  description,
  benefits = [],
  ctaLabel = "Upgrade to Premium",
  onUpgrade,
}) {
  const handleUpgrade = () => {
    if (typeof onUpgrade === "function") {
      onUpgrade();
      return;
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-billing"));
    }
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-border-muted bg-surface-elevated/60 p-8 text-center shadow-sm">
      <Lock className="mx-auto mb-4 h-12 w-12 text-text-muted" />
      <h3 className="mb-2 text-xl font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="mb-6 text-sm text-text-muted">{description}</p>
      )}

      {benefits.length > 0 && (
        <ul className="mx-auto mb-6 max-w-md space-y-2 text-left">
          {benefits.map((benefit, index) => (
            <li
              key={benefit || index}
              className="flex items-start gap-2 text-sm text-text-secondary"
            >
              <span className="mt-0.5 text-success">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={handleUpgrade}
        className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary-emphasis"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
