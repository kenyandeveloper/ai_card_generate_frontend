import DecksList from "./DecksList";

export default function StudyContent({
  decks,
  pagination,
  handlePageChange,
  onDeckClick,
  onCreateDeckClick,
  extraTop,
}) {
  return (
    <div className="max-w-6xl mx-auto py-6 md:py-8 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Study Dashboard</h1>

      {/* Optional slot under the title */}
      {extraTop}

      <h2 className="text-2xl font-bold text-text-primary mt-6 mb-4">Your Decks</h2>

      <DecksList
        decks={decks}
        onDeckClick={onDeckClick}
        onCreateDeckClick={onCreateDeckClick}
      />

      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 mb-6">
          <div className="flex gap-1">
            {/* Previous button */}
            {pagination.currentPage > 1 && (
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                className="px-3 py-2 bg-surface-highlight hover:bg-surface-highlight text-text-primary rounded-lg transition-colors"
              >
                Previous
              </button>
            )}

            {/* Page numbers */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === pagination.currentPage
                      ? "bg-primary text-text-primary"
                      : "bg-surface-highlight hover:bg-surface-highlight text-text-primary"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next button */}
            {pagination.currentPage < pagination.totalPages && (
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                className="px-3 py-2 bg-surface-highlight hover:bg-surface-highlight text-text-primary rounded-lg transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
