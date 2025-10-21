// src/components/Billing/BillingDialog.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { Loader, AlertCircle, X } from "lucide-react";
import {
  createCheckout,
  getBillingStatus,
  verifyPayment,
} from "../../utils/billingApi";

const LAST_CHECKOUT_KEY = "flashlearn:last_checkout_id";

const PLAN_OPTIONS = [
  {
    value: "daily",
    label: "Daily Pass",
    priceText: "KES 30",
    billingPeriod: "day",
    description: "Unlock all premium features for 24 hours - perfect for exam prep sprints.",
    durationCopy: "24-hour access",
  },
  {
    value: "monthly",
    label: "Monthly Pro",
    priceText: "KES 100",
    billingPeriod: "month",
    description: "Unlimited AI generation, quizzes, and analytics for the entire month.",
    durationCopy: "30-day access",
    badge: "Most popular",
    default: true,
  },
];

const DEFAULT_PLAN_VALUE =
  PLAN_OPTIONS.find((plan) => plan.default)?.value || PLAN_OPTIONS[0].value;

const normalizePlanSlug = (value) => {
  if (value == null) return "";
  const key = value.toString().trim().toLowerCase();
  if (!key) return "";

  const dailyTokens = [
    "daily",
    "day",
    "daily_pass",
    "daily-pass",
    "daily plan",
    "dailypro",
    "24h",
    "24hr",
    "1day",
    "1-day",
    "daily_24h",
    "premium_daily",
    "daily access",
  ];
  const monthlyTokens = [
    "monthly",
    "month",
    "monthly_pro",
    "monthly-pro",
    "monthly plan",
    "30d",
    "30-day",
    "premium_monthly",
    "monthlypro",
  ];

  if (dailyTokens.some((token) => key.includes(token))) {
    return "daily";
  }
  if (monthlyTokens.some((token) => key.includes(token))) {
    return "monthly";
  }
  return "";
};

const derivePlanFromStatus = (status) => {
  const candidates = [
    status?.plan_type,
    status?.planType,
    status?.subscription_tier,
    status?.subscription_plan,
    status?.plan,
    status?.current_plan,
    status?.usage?.plan_type,
    status?.usage?.plan,
    status?.usage?.current_plan,
  ];

  for (const candidate of candidates) {
    const normalized = normalizePlanSlug(candidate);
    if (normalized) return normalized;
  }

  const durationHours =
    status?.current_period_duration_hours ??
    status?.duration_hours ??
    status?.usage?.duration_hours ??
    null;
  if (typeof durationHours === "number") {
    if (durationHours <= 30) {
      return "daily";
    }
    if (durationHours >= 24 * 28) {
      return "monthly";
    }
  }

  return null;
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatTimeRemaining = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return "expired";
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `~${days}d ${remainingHours}h left`;
  }
  if (hours > 0) {
    return `~${hours}h ${minutes}m left`;
  }
  return `~${minutes}m left`;
};

export default function BillingDialog({ open, onClose }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualId, setManualId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const pollTimer = useRef(null);
  const [selectedPlan, setSelectedPlan] = useState(DEFAULT_PLAN_VALUE);
  const [manualPlanSelection, setManualPlanSelection] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const s = await getBillingStatus();
      setStatus(s);
      if (s?.subscription_status === "active") {
        try {
          localStorage.removeItem(LAST_CHECKOUT_KEY);
        } catch (err) {
          console.error("Failed to remove checkout key:", err);
        }
      }
    } catch (err) {
      console.error("Failed to fetch billing status:", err);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setSelectedPlan(DEFAULT_PLAN_VALUE);
      setManualPlanSelection(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || manualPlanSelection) return;
    const derived = derivePlanFromStatus(status);
    if (derived) {
      setSelectedPlan(derived);
    }
  }, [open, manualPlanSelection, status]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setManualId("");
    refresh();

    if (pollTimer.current) clearInterval(pollTimer.current);
    let elapsed = 0;
    pollTimer.current = setInterval(async () => {
      elapsed += 5000;
      await refresh();
      if (elapsed >= 30000) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    }, 5000);

    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, [open, refresh]);

  const onSubscribe = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await createCheckout({ plan_type: selectedPlan });
      if (!res?.checkout_url) throw new Error("No checkout URL returned");

      try {
        localStorage.setItem(LAST_CHECKOUT_KEY, res.api_ref || "");
      } catch (err) {
        console.error("Failed to save checkout key:", err);
      }

      window.location.href = res.checkout_url;
    } catch (err) {
      console.error("Checkout failed:", err);
      setError("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onManualVerify = async () => {
    const val = manualId.trim();
    if (!val) return;
    try {
      setVerifying(true);
      setError("");
      await verifyPayment({ invoice_id: val, checkout_id: val });
      await refresh();
    } catch (err) {
      console.error("Verification failed:", err);
      setError("Verification failed. Check the ID and try again.");
    } finally {
      setVerifying(false);
    }
  };

  const active = status?.subscription_status === "active";
  const currentPlanValue = derivePlanFromStatus(status);
  const currentPlanOption =
    PLAN_OPTIONS.find((plan) => plan.value === currentPlanValue) || null;
  const planLabelFromStatus =
    status?.plan_label ||
    status?.plan_name ||
    status?.subscription_plan ||
    status?.plan ||
    (active ? "Premium" : "Free tier");
  const normalizedPlanKey =
    currentPlanValue ||
    normalizePlanSlug(planLabelFromStatus) ||
    normalizePlanSlug(status?.plan_type);
  const isDailyPlan = normalizedPlanKey === "daily";
  const planDisplay = active
    ? currentPlanOption
      ? `${currentPlanOption.label} (${currentPlanOption.priceText}/${currentPlanOption.billingPeriod})`
      : planLabelFromStatus
    : "Free tier";
  const periodLabel = isDailyPlan ? "Expires" : "Renews";
  const aiUsage = status?.usage?.ai_generation || {};
  const quizUsage = status?.usage?.quizzes || {};
  const freeLimit =
    aiUsage.limit ??
    status?.month_free_limit ??
    status?.day_free_limit ??
    status?.free_limit ??
    5;
  const freeUsed =
    aiUsage.used ??
    status?.month_used ??
    status?.day_used ??
    status?.free_used ??
    0;
  const freeRemaining =
    aiUsage.remaining ??
    status?.month_remaining ??
    status?.day_remaining ??
    status?.free_remaining ??
    (typeof freeLimit === "number" && typeof freeUsed === "number"
      ? Math.max(freeLimit - freeUsed, 0)
      : null);
  const selectedPlanMeta =
    PLAN_OPTIONS.find((plan) => plan.value === selectedPlan) ||
    PLAN_OPTIONS[0];
  const subscribeLabel = selectedPlanMeta
    ? `Subscribe - ${selectedPlanMeta.priceText}/${selectedPlanMeta.billingPeriod}`
    : "Subscribe";
  const periodEndRaw =
    status?.current_period_end ||
    status?.expires_at ||
    status?.renew_at ||
    status?.period_ends_at ||
    null;
  const periodEndLabel = formatDateTime(periodEndRaw);
  const remainingCopy = isDailyPlan ? formatTimeRemaining(periodEndRaw) : "";
  const benefits = active
    ? [
        {
          icon: "🚀",
          text: `AI generation: ${freeUsed ?? 0}/${
            freeLimit ?? 100
          } used this month`,
        },
        {
          icon: "📝",
          text:
            quizUsage.limit === "unlimited"
              ? "Unlimited quizzes ✨"
              : `Quizzes: ${quizUsage.used ?? 0}/${
                  quizUsage.limit ?? 5
                } this week`,
        },
        { icon: "📊", text: "Detailed time analytics & study insights" },
        { icon: "🎯", text: "Identify weak cards that need attention" },
        { icon: "📈", text: "Daily accuracy trends & progress charts" },
      ]
    : [
        { icon: "🚀", text: "Unlimited AI flashcard generation (100/month)" },
        { icon: "📝", text: "Unlimited quizzes (no weekly limit)" },
        { icon: "📊", text: "Detailed time analytics & study insights" },
        { icon: "🎯", text: "Identify weak cards that need attention" },
        { icon: "📈", text: "Daily accuracy trends & progress charts" },
        { icon: "🔍", text: "Detailed deck progress breakdown" },
        { icon: "💡", text: "Personalized study recommendations" },
      ];

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-labelledby="billing-dialog-title"
        aria-describedby="billing-dialog-description"
      >
        <div className="relative w-full max-w-md">
          <div className="max-h-[90vh] overflow-y-auto rounded-xl border border-border-muted bg-surface-elevated shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-muted px-6 py-4 sticky top-0 bg-surface-elevated">
              <h2
                id="billing-dialog-title"
                className="text-xl font-semibold text-text-primary"
              >
                Billing
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close billing dialog"
                className="rounded-lg p-1.5 text-text-muted hover:bg-surface-highlight transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div
              id="billing-dialog-description"
              className="px-6 py-5 space-y-4"
            >
            {error && (
              <div
                className="flex items-start gap-3 p-4 bg-danger-soft border border-danger rounded-lg"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            {!active && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    Choose your plan
                  </h3>
                  <p className="text-sm text-text-muted">
                    Pick a pass that matches your study schedule. Switch anytime.
                  </p>
                </div>
                <div className="grid gap-3">
                  {PLAN_OPTIONS.map((option) => {
                    const isSelected = selectedPlan === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`relative cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                          isSelected
                            ? "border-primary bg-primary-soft/30"
                            : "border-border-muted bg-surface-highlight/30 hover:border-primary/60"
                        }`}
                      >
                        <input
                          type="radio"
                          name="billing-plan"
                          value={option.value}
                          checked={isSelected}
                          onChange={() => {
                            setSelectedPlan(option.value);
                            setManualPlanSelection(true);
                          }}
                          className="sr-only"
                        />
                        {option.badge && (
                          <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                            {option.badge}
                          </span>
                        )}
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-text-primary">
                              {option.label}
                            </p>
                            <p className="text-xs uppercase tracking-wide text-text-secondary">
                              {option.durationCopy}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-bold text-primary">
                              {option.priceText}
                            </p>
                            <p className="text-xs text-text-muted">
                              per {option.billingPeriod}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-text-muted">
                          {option.description}
                        </p>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {!active && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    Premium Benefits
                  </h3>
                  <p className="text-sm text-text-muted">
                    Unlock powerful study tools designed to accelerate your learning.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {benefits.map((benefit, index) => (
                    <div
                      key={benefit.text || index}
                      className="flex items-start gap-3 rounded-lg border border-border-muted/60 bg-surface-highlight/30 p-3 text-sm text-text-secondary"
                    >
                      <span className="text-xl leading-none">{benefit.icon}</span>
                      <span>{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-text-muted">
              Plan:{" "}
              <span className="font-semibold text-text-primary">
                {planDisplay}
              </span>
            </div>

            <div className="text-sm text-text-muted">
              Status:{" "}
              <span
                className={`font-semibold ${
                  active ? "text-success" : "text-text-primary"
                }`}
              >
                {active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-text-muted">
                AI generations this month:{" "}
                <span className="font-semibold text-text-primary">
                  {freeUsed ?? 0}/{freeLimit ?? 5}
                </span>
                {freeRemaining != null &&
                  typeof freeRemaining === "number" && (
                    <span> ({freeRemaining} remaining)</span>
                  )}
              </div>

              {status?.usage?.quizzes && (
                <div className="text-sm text-text-muted">
                  Quizzes this week:{" "}
                  <span className="font-semibold text-text-primary">
                    {quizUsage.limit === "unlimited"
                      ? "Unlimited ✨"
                      : `${quizUsage.used ?? 0}/${quizUsage.limit ?? 5}`}
                  </span>
                </div>
              )}
            </div>

            {periodEndRaw && (
              <div className="text-xs text-text-subtle">
                {periodLabel}: {periodEndLabel}
                {remainingCopy && remainingCopy !== "expired" && (
                  <span className="ml-1 text-text-muted">
                    ({remainingCopy})
                  </span>
                )}
              </div>
            )}

            {!active && (
              <>
                <div className="flex flex-col gap-3 sm:flex-row-reverse">
                  <button
                    onClick={onSubscribe}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-primary hover:bg-primary-emphasis disabled:bg-primary/60 disabled:cursor-not-allowed text-primary-foreground font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      subscribeLabel
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 px-4 rounded-lg border border-border-muted text-text-primary transition-colors duration-200 hover:bg-surface-highlight"
                  >
                    Cancel
                  </button>
                </div>

                <div className="text-xs text-text-subtle leading-relaxed">
                  After paying you&rsquo;ll be redirected. If it doesn&rsquo;t
                  auto-activate, paste your{" "}
                  <code className="px-1.5 py-0.5 bg-surface-highlight rounded text-text-secondary">
                    invoice_id
                  </code>{" "}
                  or{" "}
                  <code className="px-1.5 py-0.5 bg-surface-highlight rounded text-text-secondary">
                    checkout_id
                  </code>{" "}
                  and press Verify:
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label htmlFor="manual-verify-input" className="sr-only">
                      Invoice ID or Checkout ID
                    </label>
                    <input
                      id="manual-verify-input"
                      type="text"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      placeholder="invoice_id or checkout_id"
                      className="w-full px-3 py-2 bg-surface-highlight border border-border-muted rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <button
                    onClick={onManualVerify}
                    disabled={verifying || !manualId.trim()}
                    className="px-4 py-2 bg-surface-highlight hover:bg-surface-muted disabled:bg-surface-highlight/60 disabled:cursor-not-allowed border border-border-muted text-text-secondary font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    {verifying ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-border-muted flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-text-muted hover:text-text-primary font-medium transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
