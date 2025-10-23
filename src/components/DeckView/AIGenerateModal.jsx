import { useEffect, useMemo, useState } from "react";
import { getBillingStatus } from "../../utils/billingApi";
import useAIGeneration from "./useAIGeneration";

export default function AIGenerateModal({ open, onClose, deckId, onInserted }) {
  const [text, setText] = useState("");
  const [count, setCount] = useState(12);
  const [tab, setTab] = useState("direct");
  const { loading, error, cards, preview, insertIntoDeck, clear } =
    useAIGeneration();
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) {
      setText("");
      setCount(12);
      setTab("direct");
      setLocalError("");
      clear();
      return;
    }

    getBillingStatus()
      .then((status) => {
        const aiUsage = status?.usage?.ai_generation || {};
        const remaining =
          aiUsage.remaining ??
          status?.month_remaining ??
          status?.day_remaining ??
          null;
        const limit =
          aiUsage.limit ??
          status?.month_free_limit ??
          status?.day_free_limit ??
          5;

        if (
          status?.subscription_status !== "active" &&
          remaining !== null &&
          Number(remaining) <= 0
        ) {
          setLocalError(
            `You've used all ${limit ?? 5} free AI generations this month. Upgrade to continue.`
          );
        }
      })
      .catch(() => {
        // Ignore status fetch failures; user can still attempt generation
      });
  }, [open, clear]);

  useEffect(() => {
    if (!error) return;
    const s =
      typeof error === "string"
        ? error.toLowerCase()
        : String(error?.message || "").toLowerCase();

    if (
      s.includes("paywall") ||
      s.includes("quota") ||
      s.includes("payment required") ||
      s.includes("402")
    ) {
      window.dispatchEvent(new CustomEvent("open-billing"));
    }
  }, [error]);

  const disabled = useMemo(
    () => text.trim().length < 30 || loading,
    [text, loading]
  );

  function handlePaywall(err) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const code = data?.code || data?.error_code;
    const message = data?.error || data?.message || "";
    const normalizedMessage =
      typeof message === "string" ? message.toLowerCase() : String(message).toLowerCase();
    const isPaywall =
      status === 402 ||
      code === "PAYWALL" ||
      code === "QUOTA_EXCEEDED" ||
      normalizedMessage.includes("quota") ||
      normalizedMessage.includes("limit");

    if (isPaywall) {
      window.dispatchEvent(new CustomEvent("open-billing"));
      setLocalError(
        data?.message ||
          "Free quota exhausted. Please upgrade to continue generating cards."
      );
      return true;
    }
    return false;
  }

  async function handleGenerateDirect() {
    setLocalError("");
    try {
      const { inserted } = await insertIntoDeck(deckId, text.trim(), count);
      if (inserted > 0) {
        onInserted?.(inserted);
        onClose();
      }
    } catch (err) {
      if (!handlePaywall(err)) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Generation failed. Please try again.";
        setLocalError(msg);
      }
    }
  }

  async function handlePreview() {
    setLocalError("");
    try {
      await preview(text.trim(), count);
      setTab("preview");
    } catch (err) {
      if (!handlePaywall(err)) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Preview failed. Please try again.";
        setLocalError(msg);
      }
    }
  }

  async function handleConfirmInsert() {
    setLocalError("");
    try {
      const { inserted } = await insertIntoDeck(deckId, text.trim(), count);
      if (inserted > 0) {
        onInserted?.(inserted);
        onClose();
      }
    } catch (err) {
      if (!handlePaywall(err)) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Insert failed. Please try again.";
        setLocalError(msg);
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-surface-elevated rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] border border-border-muted">
        {/* Header */}
        <div className="p-6 border-b border-border-muted">
          <h2 className="text-xl font-semibold text-text-primary">
            Generate flashcards with AI
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <p className="text-text-muted text-sm">
              Paste study material (≥ 30 characters). Choose how many cards to
              generate.
            </p>

            {/* Alerts */}
            {localError && (
              <div className="bg-danger-soft border border-danger text-danger px-4 py-3 rounded-lg">
                {localError}
              </div>
            )}
            {error && !localError && (
              <div className="bg-danger-soft border border-danger text-danger px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Text Area */}
            <textarea
              className="w-full bg-surface-muted border border-border-muted rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted min-h-[150px] resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your notes, article excerpt, or lecture text..."
            />

            {/* Card Count Select */}
            <div className="max-w-[200px]">
              <label
                htmlFor="card-count"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Card count
              </label>
              <select
                id="card-count"
                className="w-full bg-surface-muted border border-border-muted rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              >
                {[6, 8, 10, 12, 15, 20, 25, 30].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Loading Bar */}
            {loading && (
              <div className="w-full bg-surface-highlight rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse"></div>
              </div>
            )}

            {/* Preview Section */}
            {tab === "preview" && cards?.length > 0 && (
              <div className="border border-border-muted rounded-lg p-4 bg-surface-muted">
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Preview ({cards.length} cards)
                </h3>
                <hr className="border-border-muted mb-4" />
                <div className="max-h-80 overflow-y-auto space-y-3">
                  {cards.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border-muted bg-surface-elevated"
                    >
                      <p className="text-sm font-semibold text-text-primary mb-1">
                        Q{idx + 1}. {c.question}
                      </p>
                      <p className="text-sm text-text-muted">{c.answer}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-primary-soft border border-primary text-primary px-4 py-3 rounded-lg mt-4">
                  Edits aren&rsquo;t persisted in preview yet. Confirm to insert the
                  generated cards into this deck.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border-muted flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-secondary hover:bg-surface-highlight rounded-lg transition-colors"
          >
            Cancel
          </button>

          {tab === "direct" ? (
            <div className="flex gap-2">
              <button
                onClick={handlePreview}
                disabled={disabled}
                className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview
              </button>
              <button
                onClick={handleGenerateDirect}
                disabled={disabled}
                className="px-4 py-2 bg-primary hover:bg-primary-emphasis text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate & Insert
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setTab("direct")}
                className="px-4 py-2 text-text-secondary hover:bg-surface-highlight rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirmInsert}
                disabled={loading}
                className="px-4 py-2 bg-primary hover:bg-primary-emphasis text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert {cards?.length || count} Cards
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
