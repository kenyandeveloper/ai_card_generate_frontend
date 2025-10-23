import { Pencil, Trash2, PlayCircle, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DeckCard = ({ deck, onEdit, onDelete, onStudy, navigate }) => {
  const fallbackNavigate = useNavigate();
  const goTo = navigate ?? fallbackNavigate;

  const handleStudy = (event) => {
    if (onStudy) {
      onStudy(event, deck.id);
      return;
    }
    goTo(`/study/${deck.id}`);
  };

  return (
    <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }}>
      <div className="rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-surface-elevated h-full flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 lg:p-8 border-b border-border-muted">
          <h3 className="font-bold text-text-primary mb-3 sm:mb-4 text-lg sm:text-xl lg:text-2xl leading-tight line-clamp-1">
            {deck.title}
          </h3>
          <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
            <span className="text-text-secondary bg-background-subtle px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm">
              {deck.subject || "No Subject"}
            </span>
            <span className="text-text-secondary bg-background-subtle px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm">
              Diff: {deck.difficulty}/5
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 lg:p-8 flex-grow">
          <p className="text-text-muted mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed line-clamp-2">
            {deck.description || "No description available."}
          </p>

          {deck.mastery !== undefined && (
            <div className="mb-4 sm:mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-muted text-sm sm:text-base">
                  Mastery
                </span>
                <span className="text-text-primary font-bold text-sm sm:text-base">
                  {deck.mastery}%
                </span>
              </div>
              <div className="h-2 bg-surface-highlight rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${deck.mastery}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer - Desktop layout fixed */}
        <div className="p-5 sm:p-6 lg:p-8 border-t border-border-muted">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Icon Actions - Left side on desktop, stacked on mobile */}
            <div className="flex gap-3 sm:gap-2 lg:gap-3">
              <button
                onClick={(e) => onEdit(e, deck)}
                className="min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-highlight/60 rounded-lg transition-colors"
                aria-label="Edit deck"
              >
                <Pencil size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </button>

              <button
                onClick={(e) => onDelete(e, deck.id)}
                className="min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-danger hover:text-danger hover:bg-surface-highlight/60 rounded-lg transition-colors"
                aria-label="Delete deck"
              >
                <Trash2 size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </button>
            </div>

            {/* Action Buttons - Right side on desktop, full width on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 lg:gap-4 sm:flex-1 sm:justify-end sm:max-w-md">
              <button
                onClick={() => goTo(`/mydecks/${deck.id}`)}
                className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 lg:py-3 border border-primary text-primary hover:bg-primary-soft rounded-xl transition-colors text-sm font-medium min-h-[44px] sm:min-h-0 sm:flex-1"
              >
                <Eye size={18} className="sm:w-5 sm:h-5" />
                <span>View Cards</span>
              </button>

              <button
                onClick={handleStudy}
                className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 lg:py-3 bg-primary text-primary-foreground hover:bg-primary-emphasis rounded-xl transition-colors text-sm font-medium min-h-[44px] sm:min-h-0 sm:flex-1"
              >
                <PlayCircle size={18} className="sm:w-5 sm:h-5" />
                <span>Study Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DeckCard;
