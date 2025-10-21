// src/components/AddFlashcardModal.jsx
import { useEffect, useRef, useState } from "react";

export default function AddFlashcardModal({
  open,
  onClose,
  newFlashcard,
  setNewFlashcard,
  onSave,
  error,
  setError,
}) {
  const [touched, setTouched] = useState({
    front_text: false,
    back_text: false,
  });
  const questionRef = useRef(null);

  const validateForm = () => {
    const errors = {};
    if (!newFlashcard.front_text?.trim())
      errors.front_text = "Question is required";
    if (!newFlashcard.back_text?.trim())
      errors.back_text = "Answer is required";
    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      setError("");
      onSave();
    } else {
      setError("Please fill in all required fields.");
      setTouched({ front_text: true, back_text: true });
    }
  };

  const handleBlur = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // Focus first field when modal opens
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => questionRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose?.();
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
  };

  const qInvalid = touched.front_text && !newFlashcard.front_text?.trim();
  const aInvalid = touched.back_text && !newFlashcard.back_text?.trim();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-flashcard-title"
      onKeyDown={onKeyDown}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-[90%] max-w-lg rounded-2xl border border-border-strong bg-background-subtle p-6 shadow-2xl">
        <h2 id="add-flashcard-title" className="text-xl font-bold mb-4">
          Add New Flashcard
        </h2>

        {/* Alert */}
        {error ? (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-danger text-sm"
          >
            {error}
          </div>
        ) : null}

        {/* Question */}
        <div className="mb-4">
          <label
            htmlFor="fc-question"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Question <span className="text-danger">*</span>
          </label>
          <input
            id="fc-question"
            ref={questionRef}
            type="text"
            value={newFlashcard.front_text}
            onChange={(e) =>
              setNewFlashcard({ ...newFlashcard, front_text: e.target.value })
            }
            onBlur={handleBlur("front_text")}
            aria-invalid={qInvalid ? "true" : "false"}
            aria-describedby={qInvalid ? "fc-question-err" : undefined}
            className={`w-full rounded-lg bg-surface-elevated border px-3 py-2 outline-none placeholder:text-text-muted
              ${
                qInvalid
                  ? "border-danger/60"
                  : "border-border-muted focus:border-border-muted"
              }`}
            placeholder="e.g., What is a binary search?"
          />
          {qInvalid && (
            <p id="fc-question-err" className="mt-1 text-xs text-danger">
              Question is required
            </p>
          )}
        </div>

        {/* Answer */}
        <div className="mb-5">
          <label
            htmlFor="fc-answer"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Answer <span className="text-danger">*</span>
          </label>
          <textarea
            id="fc-answer"
            rows={3}
            value={newFlashcard.back_text}
            onChange={(e) =>
              setNewFlashcard({ ...newFlashcard, back_text: e.target.value })
            }
            onBlur={handleBlur("back_text")}
            aria-invalid={aInvalid ? "true" : "false"}
            aria-describedby={aInvalid ? "fc-answer-err" : undefined}
            className={`w-full rounded-lg bg-surface-elevated border px-3 py-2 outline-none placeholder:text-text-muted resize-y
              ${
                aInvalid
                  ? "border-danger/60"
                  : "border-border-muted focus:border-border-muted"
              }`}
            placeholder="Type the correct answer here"
          />
          {aInvalid && (
            <p id="fc-answer-err" className="mt-1 text-xs text-danger">
              Answer is required
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-lg bg-primary hover:bg-primary px-4 py-2 font-medium"
          >
            Add Flashcard
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border-muted hover:border-border-muted px-4 py-2"
          >
            Cancel
          </button>
        </div>

        {/* Helper text */}
        <p className="mt-3 text-xs text-text-muted">
          Tip: Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border-muted">
            Ctrl/⌘ + Enter
          </kbd>{" "}
          to save.
        </p>
      </div>
    </div>
  );
}
