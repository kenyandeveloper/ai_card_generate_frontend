import { useState, useEffect } from "react";

const EditFlashcardModal = ({
  open,
  onClose,
  flashcard,
  onSave,
  error,
  setError,
}) => {
  const [editedFlashcard, setEditedFlashcard] = useState(flashcard);
  const [frontError, setFrontError] = useState("");
  const [backError, setBackError] = useState("");

  useEffect(() => {
    setEditedFlashcard(flashcard);
    setFrontError("");
    setBackError("");
  }, [flashcard]);

  const handleSave = () => {
    // Reset errors
    setFrontError("");
    setBackError("");
    setError("");

    // Validate
    if (!editedFlashcard?.front_text?.trim()) {
      setFrontError("Question is required");
      return;
    }
    if (!editedFlashcard?.back_text?.trim()) {
      setBackError("Answer is required");
      return;
    }

    onSave(editedFlashcard);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-elevated rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border-muted">
          <h2 className="text-xl font-bold text-text-primary">Edit Flashcard</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="bg-danger-soft border border-danger text-danger px-4 py-3 rounded-lg flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={() => setError("")}
                  className="text-danger hover:text-text-primary ml-4"
                >
                  ×
                </button>
              </div>
            )}

            {/* Question Input */}
            <div>
              <label
                htmlFor="question-input"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Question *
              </label>
              <input
                id="question-input"
                type="text"
                value={editedFlashcard?.front_text || ""}
                onChange={(e) =>
                  setEditedFlashcard({
                    ...editedFlashcard,
                    front_text: e.target.value,
                  })
                }
                className={`w-full bg-background-subtle border ${
                  frontError ? "border-danger" : "border-border-muted"
                } rounded-lg px-4 py-3 text-text-primary placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                placeholder="Enter the question..."
              />
              {frontError && (
                <p className="text-danger text-sm mt-1">{frontError}</p>
              )}
            </div>

            {/* Answer Input */}
            <div>
              <label
                htmlFor="answer-input"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Answer *
              </label>
              <textarea
                id="answer-input"
                value={editedFlashcard?.back_text || ""}
                onChange={(e) =>
                  setEditedFlashcard({
                    ...editedFlashcard,
                    back_text: e.target.value,
                  })
                }
                rows={4}
                className={`w-full bg-background-subtle border ${
                  backError ? "border-danger" : "border-border-muted"
                } rounded-lg px-4 py-3 text-text-primary placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y`}
                placeholder="Enter the answer..."
              />
              {backError && (
                <p className="text-danger text-sm mt-1">{backError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border-muted flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary-emphasis text-primary-foreground py-2 px-4 rounded-lg transition-colors font-medium"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-primary text-primary hover:bg-primary-soft hover:text-primary py-2 px-4 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFlashcardModal;
