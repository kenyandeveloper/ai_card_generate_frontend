import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "../context/UserContext";
import NavBar from "../NavBar";
import DeckHeader from "./DeckHeader";
import FlashcardList from "./FlashCardList";
import EditFlashcardModal from "./EditFlashcardModal";
import AddFlashcardModal from "./AddFlashcardModal";
import {
  fetchDeckAndFlashcards,
  addFlashcard,
  updateFlashcard,
  deleteFlashcard,
} from "../../utils/deckApi";
import ConfirmationDialog from "../MyDecks/ConfirmationDialog";
import LoadingState from "./LoadingState";

const DeckView = () => {
  const { user, isAuthenticated, loading: userLoading } = useUser();
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newFlashcard, setNewFlashcard] = useState({
    front_text: "",
    back_text: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [flashcardToDelete, setFlashcardToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const cardsPerPage = 10;

  const requestSeq = useRef(0);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [userLoading, isAuthenticated, navigate]);

  // Reset state when deckId or user changes
  useEffect(() => {
    setDeck(null);
    setFlashcards([]);
    setError("");
    setTotalPages(1);
    setCurrentPage(1);
    requestSeq.current += 1;
  }, [deckId, user]);

  // Loader function (race-safe)
  const loadDeckAndFlashcards = useCallback(async () => {
    if (!user || !deckId) return;
    setLoading(true);
    const seq = ++requestSeq.current;
    try {
      const { deckData, flashcardsData, pagination } =
        await fetchDeckAndFlashcards(deckId, currentPage, cardsPerPage);
      if (seq === requestSeq.current) {
        setDeck(deckData);
        setFlashcards(Array.isArray(flashcardsData) ? flashcardsData : []);
        setTotalPages(pagination.total_pages);
        setError("");
      }
    } catch (err) {
      if (seq === requestSeq.current) {
        console.error("Error fetching data:", err);
        setError("Failed to load deck data. Please try again later.");
        setDeck((prev) => prev ?? null);
        setFlashcards([]);
      }
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
      }
    }
  }, [user, deckId, currentPage]);

  // initial & paginated fetch
  useEffect(() => {
    if (user && deckId) {
      loadDeckAndFlashcards();
    }
  }, [user, deckId, currentPage, loadDeckAndFlashcards]);

  const handleAddFlashcard = () => {
    setAddModalOpen(true);
  };

  const handleSaveFlashcard = async () => {
    try {
      await addFlashcard(deckId, newFlashcard);
      setAddModalOpen(false);
      setNewFlashcard({ front_text: "", back_text: "" });
      setError("");
      await loadDeckAndFlashcards();
    } catch {
      setError("Failed to add flashcard. Please try again.");
    }
  };

  const handleEditFlashcard = async (editedFlashcard) => {
    try {
      const updatedCard = await updateFlashcard(editedFlashcard);
      setFlashcards((prev) =>
        prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
      );
      setModalOpen(false);
      setError("");
    } catch {
      setError("Failed to update flashcard. Please try again.");
    }
  };

  const handleDeleteFlashcard = (flashcardId) => {
    setFlashcardToDelete(flashcardId);
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!flashcardToDelete) return;

    try {
      await deleteFlashcard(flashcardToDelete);
      setDeleteConfirmationOpen(false);
      setFlashcardToDelete(null);
      await loadDeckAndFlashcards();
    } catch (err) {
      console.error("Error deleting flashcard:", err);
      setError("Failed to delete flashcard. Please try again.");
      setDeleteConfirmationOpen(false);
      setFlashcardToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(false);
    setFlashcardToDelete(null);
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-background pb-8 md:pb-16">
        <NavBar />
        <div className="max-w-7xl mx-auto mt-4 md:mt-8 px-4 md:px-8">
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8 md:pb-16">
      <NavBar />
      <div className="max-w-7xl mx-auto mt-4 md:mt-8 px-4 md:px-8">
        <DeckHeader
          deck={deck}
          onAddFlashcard={handleAddFlashcard}
          navigate={navigate}
          onRefresh={loadDeckAndFlashcards}
        />

        {error && (
          <div className="mb-4 md:mb-6 bg-danger-soft border border-danger text-danger px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-text-muted hover:text-text-primary ml-4"
            >
              ×
            </button>
          </div>
        )}

        <FlashcardList
          flashcards={flashcards}
          onEdit={(flashcard) => {
            setSelectedFlashcard(flashcard);
            setModalOpen(true);
          }}
          onDelete={handleDeleteFlashcard}
          navigate={navigate}
          deckId={deckId}
          onAddFlashcard={handleAddFlashcard}
          is_default={deck?.is_default}
        />

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 md:mt-8 mb-4 md:mb-6">
            <div className="flex gap-1">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-surface-elevated hover:bg-surface-highlight disabled:bg-background-subtle disabled:text-text-subtle rounded-lg text-sm md:text-base transition-colors"
              >
                Previous
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm md:text-base transition-colors ${
                      currentPage === page
                        ? "bg-primary text-text-primary"
                        : "bg-surface-elevated hover:bg-surface-highlight text-text-secondary"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next Button */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-surface-elevated hover:bg-surface-highlight disabled:bg-background-subtle disabled:text-text-subtle rounded-lg text-sm md:text-base transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <EditFlashcardModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setError("");
          }}
          flashcard={selectedFlashcard}
          onSave={handleEditFlashcard}
          error={error}
          setError={setError}
        />

        <AddFlashcardModal
          open={addModalOpen}
          onClose={() => {
            setAddModalOpen(false);
            setError("");
          }}
          newFlashcard={newFlashcard}
          setNewFlashcard={setNewFlashcard}
          onSave={handleSaveFlashcard}
          error={error}
          setError={setError}
        />

        <ConfirmationDialog
          open={deleteConfirmationOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Flashcard"
          message="Are you sure you want to delete this flashcard? This action cannot be undone."
        />
      </div>
    </div>
  );
};

export default DeckView;
