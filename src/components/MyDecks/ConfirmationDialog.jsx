import { InlineSpinner } from "../common/LoadingSpinner";

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8">
        <div
          className="bg-surface-elevated w-full h-full sm:h-auto sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
        >
          {/* Title */}
          <div className="py-8 sm:py-10 px-8 sm:px-12 border-b border-border-muted">
            <h2
              id="dialog-title"
              className="text-text-primary font-semibold text-lg sm:text-xl"
            >
              {title}
            </h2>
          </div>

          {/* Content */}
          <div className="py-4 sm:py-6 px-8 sm:px-12 flex-grow">
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="p-8 sm:p-10 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="min-w-[70px] sm:min-w-[80px] px-6 py-3 text-primary hover:bg-surface-highlight rounded-lg transition-colors text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="min-w-[70px] sm:min-w-[80px] px-6 py-3 bg-danger text-text-primary hover:bg-danger rounded-lg transition-colors text-xs sm:text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <InlineSpinner size={18} />
                  Deleting...
                </span>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationDialog;
