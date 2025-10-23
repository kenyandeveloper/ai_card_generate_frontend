import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Repeat } from "lucide-react";

export default function FlashcardItem({
  flashcard,
  onEdit,
  onDelete,
  isMobile: propIsMobile, // optional, keep for callers that pass it
}) {
  const [previewSide, setPreviewSide] = useState("front");
  const isMobile = propIsMobile ?? false; // Tailwind should handle most responsive styling

  const toggleCardSide = () => {
    setPreviewSide((s) => (s === "front" ? "back" : "front"));
  };

  // Icon size: prefer a consistent size; fall back to smaller if caller insists on isMobile
  const iconSize = isMobile ? 16 : 18;
  const flipSize = isMobile ? 14 : 16;

  return (
    <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }}>
      <article className="h-full flex flex-col rounded-2xl border border-border-strong bg-background-subtle/80 shadow hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="px-3 py-2 sm:px-4 sm:py-3 border-b border-border-strong">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="inline-flex items-center rounded-md bg-surface-elevated text-text-secondary px-2 py-0.5 text-[0.7rem] sm:text-xs">
              {previewSide === "front" ? "Question" : "Answer"}
            </span>

            <button
              type="button"
              onClick={toggleCardSide}
              aria-label="Flip card"
              title="Flip card"
              className="rounded-md p-1 sm:p-1.5 text-primary hover:bg-primary hover:text-text-primary transition"
            >
              <Repeat size={flipSize} />
            </button>
          </div>

          <p className="text-sm sm:text-base leading-6 text-text-primary whitespace-pre-line break-words min-h-[60px] sm:min-h-[80px]">
            {previewSide === "front"
              ? flashcard.front_text
              : flashcard.back_text}
          </p>
        </div>

        {/* Actions */}
        <div className="px-3 py-2 sm:px-4 sm:py-3 border-t border-border-strong flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(flashcard)}
              aria-label="Edit flashcard"
              title="Edit flashcard"
              className="rounded-md p-1 sm:p-1.5 text-text-secondary hover:text-primary transition"
            >
              <Pencil size={iconSize} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(flashcard.id)}
              aria-label="Delete flashcard"
              title="Delete flashcard"
              className="rounded-md p-1 sm:p-1.5 text-danger hover:text-danger transition"
            >
              <Trash2 size={iconSize} />
            </button>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
