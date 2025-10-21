// ErrorHandler.jsx (Vite + Tailwind + lucide-react; dark mode only)
import { TriangleAlert, X } from "lucide-react";

export default function ErrorHandler({ error, onClose }) {
  if (!error) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mb-2 sm:mb-3 md:mb-4 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-danger"
    >
      <div className="flex items-start gap-3">
        <TriangleAlert className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 text-sm leading-relaxed">
          {typeof error === "string" ? error : String(error)}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss error"
            className="rounded-md p-1 -m-1 hover:bg-danger/15 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
