import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DeckCard from "./DeckCard";
import EmptyState from "./EmptyState";

export default function DecksGrid({
  filteredDecks,
  currentPage,
  totalPages,
  onEdit,
  onDelete,
  onStudy,
  onPageChange,
  onCreateDeck,
  navigate,
}) {
  // Generate page numbers with ellipsis for mobile
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Show 5 page numbers max on mobile

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, current, and nearby pages
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      {filteredDecks.length === 0 ? (
        <EmptyState onCreateDeck={onCreateDeck} />
      ) : (
        <>
          {/* Grid - 1 column mobile, 2 tablet, 3 desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredDecks.map((deck) => (
              <motion.div
                key={deck.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <DeckCard
                  deck={deck}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStudy={onStudy}
                  navigate={navigate}
                />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 sm:mt-12 mb-6 sm:mb-8">
              <nav
                className="flex items-center gap-2 sm:gap-3"
                role="navigation"
                aria-label="Pagination"
              >
                {/* Previous Button */}
                <button
                  onClick={() => onPageChange(null, currentPage - 1)}
                  disabled={currentPage === 1}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-highlight/60 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-muted transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="min-w-[44px] h-[44px] flex items-center justify-center text-text-subtle text-sm sm:text-base"
                        >
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(null, page)}
                        className={`min-w-[44px] min-h-[44px] px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                          page === currentPage
                            ? "bg-primary text-text-primary shadow-lg shadow-lg"
                            : "text-text-secondary hover:text-primary hover:bg-surface-highlight/60"
                        }`}
                        aria-label={`Page ${page}`}
                        aria-current={page === currentPage ? "page" : undefined}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => onPageChange(null, currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-highlight/60 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-muted transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
