// src/components/Dashboard/UsageMeter.jsx
const isUnlimitedValue = (limit) =>
  typeof limit === "string" && limit.toLowerCase() === "unlimited";

const getPercentage = (used, limit) => {
  if (isUnlimitedValue(limit) || limit === null || limit === undefined) {
    return 0;
  }
  if (!limit) return 0;
  const safeUsed = Math.max(Number(used) || 0, 0);
  const safeLimit = Math.max(Number(limit) || 0, 0);
  if (safeLimit === 0) return 0;
  return Math.min((safeUsed / safeLimit) * 100, 100);
};

export default function UsageMeter({
  label,
  used = 0,
  limit = 0,
  period = "",
  isPremium = false,
}) {
  const percentage = getPercentage(used, limit);
  const isUnlimited = isUnlimitedValue(limit);
  const isNearLimit = percentage >= 80 && !isPremium && !isUnlimited;

  return (
    <div className="space-y-2 rounded-xl border border-border-muted bg-surface-elevated p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        <span
          className={`text-sm font-semibold ${
            isNearLimit ? "text-warning" : "text-text-primary"
          }`}
        >
          {used} / {isUnlimited ? "∞" : limit} {period}
        </span>
      </div>

      {!isUnlimited && (
        <div className="h-2 rounded-full bg-surface-highlight">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isNearLimit ? "bg-warning" : "bg-success"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {isUnlimited && (
        <div className="flex items-center gap-2 text-xs text-success">
          <span className="inline-block h-2 w-2 rounded-full bg-success" />
          <span>Premium — Unlimited</span>
        </div>
      )}

      {isNearLimit && !isPremium && (
        <p className="text-xs text-warning">
          You&apos;re close to the limit. Upgrade for more capacity.
        </p>
      )}
    </div>
  );
}
