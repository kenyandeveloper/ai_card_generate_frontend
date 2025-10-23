import { Brain, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import NavBar from "../../NavBar";

const EmptyDeckState = ({ deckId }) => {
  return (
    <>
      <NavBar />
      <div className="max-w-md mx-auto mt-16 px-4">
        <div className="bg-surface-elevated border border-border-muted rounded-2xl p-8 text-center">
          <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            No Flashcards Found
          </h2>
          <p className="text-text-muted mb-6">
            This deck doesn&rsquo;t have any flashcards yet. Add some flashcards
            to start studying!
          </p>
          <Link
            to={`/mydecks/${deckId}`}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-emphasis text-text-primary px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Deck
          </Link>
        </div>
      </div>
    </>
  );
};

export default EmptyDeckState;
