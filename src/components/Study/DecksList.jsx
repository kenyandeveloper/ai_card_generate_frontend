import { AlertCircle, PlayCircle } from "lucide-react";

const DecksList = ({ decks, onDeckClick, onCreateDeckClick }) => {
  const safeDecks = Array.isArray(decks) ? decks : [];

  if (safeDecks.length === 0) {
    return (
      <div className="bg-surface-elevated border border-border-muted rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          No decks found
        </h3>
        <p className="text-text-muted mb-6">
          Create your first deck to start studying
        </p>
        <button
          onClick={onCreateDeckClick}
          className="bg-primary hover:bg-primary-emphasis text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Create Deck
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {safeDecks.map((deck) => (
        <div
          key={deck.id}
          className="bg-surface-elevated rounded-2xl border border-border-muted shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full"
        >
          {/* Header */}
          <div className="p-6 border-b border-border-muted">
            <h3 className="text-lg font-semibold text-text-primary line-clamp-2">
              {deck.title}
            </h3>
          </div>

          {/* Body */}
          <div className="p-6 flex-1">
            <p className="text-text-muted text-sm mb-4 line-clamp-3">
              {deck.description || "No description available."}
            </p>

            <div className="flex justify-start">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-soft text-primary">
                {deck.subject}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border-muted">
            <button
              onClick={() => onDeckClick(deck.id)}
              className="w-full bg-primary hover:bg-primary-emphasis text-primary-foreground py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              Study Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DecksList;
