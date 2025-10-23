import { useState } from "react";
import { X } from "lucide-react";
import { InlineSpinner } from "../common/LoadingSpinner";

const DeckModal = ({
  open,
  onClose,
  editingDeck,
  deckTitle,
  setDeckTitle,
  deckDescription,
  setDeckDescription,
  deckSubject,
  setDeckSubject,
  deckCategory,
  setDeckCategory,
  deckDifficulty,
  setDeckDifficulty,
  onSave,
  saving = false,
}) => {
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({
    deckTitle: false,
    deckDescription: false,
    deckSubject: false,
    deckCategory: false,
    deckDifficulty: false,
  });

  const validateForm = () => {
    const errors = {};
    if (!deckTitle.trim()) errors.deckTitle = "Title is required";
    if (!deckDescription.trim())
      errors.deckDescription = "Description is required";
    if (!deckSubject.trim()) errors.deckSubject = "Subject is required";
    if (!deckCategory.trim()) errors.deckCategory = "Category is required";
    if (!deckDifficulty) errors.deckDifficulty = "Difficulty Level is required";

    return errors;
  };

  const handleSave = () => {
    if (saving) return;
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      setError("");
      onSave();
    } else {
      setError("Please fill in all required fields.");
      setTouched({
        deckTitle: true,
        deckDescription: true,
        deckSubject: true,
        deckCategory: true,
        deckDifficulty: true,
      });
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal - Fullscreen on mobile, centered card on desktop */}
      <div
        className="fixed inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 flex flex-col sm:block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deck-modal-title"
      >
        <div className="bg-surface-elevated w-full h-full sm:h-auto sm:w-[90vw] sm:max-w-2xl sm:max-h-[90vh] flex flex-col sm:rounded-3xl shadow-2xl overflow-hidden">
          {/* Header - Fixed on mobile */}
          <div className="flex items-center justify-between p-5 sm:p-8 border-b border-border-muted shrink-0">
            <h2
              id="deck-modal-title"
              className="text-text-primary font-bold text-xl sm:text-2xl"
            >
              {editingDeck ? "Edit Deck" : "Create New Deck"}
            </h2>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-highlight rounded-lg transition-colors -mr-2"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-5 sm:p-8">
              {error && (
                <div
                  role="alert"
                  className="mb-6 bg-danger-soft border border-danger/50 text-danger p-4 rounded-xl flex items-start justify-between"
                >
                  <p className="text-sm leading-relaxed">{error}</p>
                  <button
                    onClick={() => setError("")}
                    className="text-danger hover:text-danger ml-4 min-w-[24px] text-xl"
                    aria-label="Close error"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-6 sm:gap-8">
                {/* Deck Title */}
                <div>
                  <label
                    htmlFor="deck-title"
                    className="block text-text-secondary text-sm font-medium mb-2"
                  >
                    Deck Title <span className="text-danger">*</span>
                  </label>
                  <input
                    id="deck-title"
                    type="text"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    onBlur={handleBlur("deckTitle")}
                    className={`w-full bg-background-subtle text-text-primary border ${
                      touched.deckTitle && !deckTitle.trim()
                        ? "border-danger"
                        : "border-border-muted"
                    } rounded-xl px-4 py-3.5 sm:py-3 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all`}
                    placeholder="e.g., Spanish Vocabulary"
                  />
                  {touched.deckTitle && !deckTitle.trim() && (
                    <p className="text-danger text-sm mt-2">
                      Title is required
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="deck-description"
                    className="block text-text-secondary text-sm font-medium mb-2"
                  >
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="deck-description"
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                    onBlur={handleBlur("deckDescription")}
                    rows={3}
                    className={`w-full bg-background-subtle text-text-primary border ${
                      touched.deckDescription && !deckDescription.trim()
                        ? "border-danger"
                        : "border-border-muted"
                    } rounded-xl px-4 py-3.5 sm:py-3 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all resize-none`}
                    placeholder="Brief description of this deck..."
                  />
                  {touched.deckDescription && !deckDescription.trim() && (
                    <p className="text-danger text-sm mt-2">
                      Description is required
                    </p>
                  )}
                </div>

                {/* Subject & Category Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="deck-subject"
                      className="block text-text-secondary text-sm font-medium mb-2"
                    >
                      Subject <span className="text-danger">*</span>
                    </label>
                    <input
                      id="deck-subject"
                      type="text"
                      value={deckSubject}
                      onChange={(e) => setDeckSubject(e.target.value)}
                      onBlur={handleBlur("deckSubject")}
                      className={`w-full bg-background-subtle text-text-primary border ${
                        touched.deckSubject && !deckSubject.trim()
                          ? "border-danger"
                          : "border-border-muted"
                      } rounded-xl px-4 py-3.5 sm:py-3 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all`}
                      placeholder="e.g., History"
                    />
                    {touched.deckSubject && !deckSubject.trim() && (
                      <p className="text-danger text-sm mt-2">
                        Subject is required
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="deck-category"
                      className="block text-text-secondary text-sm font-medium mb-2"
                    >
                      Category <span className="text-danger">*</span>
                    </label>
                    <input
                      id="deck-category"
                      type="text"
                      value={deckCategory}
                      onChange={(e) => setDeckCategory(e.target.value)}
                      onBlur={handleBlur("deckCategory")}
                      className={`w-full bg-background-subtle text-text-primary border ${
                        touched.deckCategory && !deckCategory.trim()
                          ? "border-danger"
                          : "border-border-muted"
                      } rounded-xl px-4 py-3.5 sm:py-3 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all`}
                      placeholder="e.g., Academic"
                    />
                    {touched.deckCategory && !deckCategory.trim() && (
                      <p className="text-danger text-sm mt-2">
                        Category is required
                      </p>
                    )}
                  </div>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label
                    htmlFor="deck-difficulty"
                    className="block text-text-secondary text-sm font-medium mb-2"
                  >
                    Difficulty Level <span className="text-danger">*</span>
                  </label>
                  <select
                    id="deck-difficulty"
                    value={deckDifficulty}
                    onChange={(e) => setDeckDifficulty(Number(e.target.value))}
                    onBlur={handleBlur("deckDifficulty")}
                    className={`w-full bg-background-subtle text-text-primary border ${
                      touched.deckDifficulty && !deckDifficulty
                        ? "border-danger"
                        : "border-border-muted"
                    } rounded-xl px-4 py-3.5 sm:py-3 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.25rem",
                    }}
                  >
                    <option value="">Select difficulty</option>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <option key={level} value={level}>
                        {level} -{" "}
                        {level === 1
                          ? "Beginner"
                          : level === 5
                          ? "Expert"
                          : `Level ${level}`}
                      </option>
                    ))}
                  </select>
                  {touched.deckDifficulty && !deckDifficulty && (
                    <p className="text-danger text-sm mt-2">
                      Difficulty is required
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed on mobile */}
          <div className="p-5 sm:p-8 border-t border-border-muted shrink-0">
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 min-h-[48px] border-2 border-border-muted text-text-secondary hover:bg-surface-highlight rounded-xl transition-colors text-base font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:flex-1 min-h-[48px] bg-primary text-text-primary hover:bg-primary-emphasis rounded-xl transition-colors text-base font-medium shadow-lg shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <InlineSpinner size={20} />
                    {editingDeck ? "Saving..." : "Creating..."}
                  </span>
                ) : editingDeck ? (
                  "Save Changes"
                ) : (
                  "Create Deck"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeckModal;
