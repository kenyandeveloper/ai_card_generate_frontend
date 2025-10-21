import { GraduationCap, Plus } from "lucide-react";

const EmptyState = ({ onCreateDeck }) => {
  return (
    <div className="bg-surface-elevated rounded-2xl sm:rounded-3xl shadow-lg p-8 sm:p-12 md:p-16 lg:p-24 text-center max-w-2xl mx-auto">
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="p-4 sm:p-5 bg-primary-soft rounded-2xl border border-primary/30">
          <GraduationCap
            size={32}
            strokeWidth={1.5}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary"
          />
        </div>
      </div>

      <h3 className="text-text-primary font-bold mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl">
        Start Your Learning Journey
      </h3>

      <p className="text-text-muted mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
        Create your first flashcard deck and begin mastering new subjects.
      </p>

      <button
        onClick={onCreateDeck}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary-emphasis active:bg-primary-emphasis rounded-xl sm:rounded-2xl transition-colors text-base sm:text-base font-medium px-8 sm:px-12 py-3.5 sm:py-4 min-h-[48px] shadow-lg"
      >
        <Plus size={20} className="sm:w-5 sm:h-5" />
        <span>Create Your First Deck</span>
      </button>
    </div>
  );
};

export default EmptyState;
