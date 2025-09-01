"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "../context/UserContext";
import {
  Box,
  Container,
  useTheme,
  Alert,
  useMediaQuery,
  Pagination,
} from "@mui/material";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // not used

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
  const [totalItems, setTotalItems] = useState(0);
  const cardsPerPage = 10;

  // 🔒 race guard: increment this before each fetch; only latest response is applied
  const requestSeq = useRef(0);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [userLoading, isAuthenticated, navigate]);

  // 🔄 Reset state immediately when deckId or user changes
  useEffect(() => {
    // clear any stale content while new deck loads
    setDeck(null);
    setFlashcards([]);
    setError("");
    setTotalPages(1);
    setTotalItems(0);
    setCurrentPage(1);
    // also bump the requestSeq so any in-flight responses won't apply
    requestSeq.current += 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId, user]);

  // 🔹 Loader function (race-safe)
  const loadDeckAndFlashcards = useCallback(async () => {
    if (!user || !deckId) return;
    setLoading(true);
    const seq = ++requestSeq.current;
    try {
      const { deckData, flashcardsData, pagination } =
        await fetchDeckAndFlashcards(deckId, currentPage, cardsPerPage);
      // apply only if this is the latest request
      if (seq === requestSeq.current) {
        setDeck(deckData);
        setFlashcards(Array.isArray(flashcardsData) ? flashcardsData : []);
        setTotalPages(pagination.total_pages);
        setTotalItems(pagination.total_items);
        setError("");
      }
    } catch (err) {
      if (seq === requestSeq.current) {
        console.error("Error fetching data:", err);
        setError("Failed to load deck data. Please try again later.");
        // keep flashcards cleared on error
        setDeck((prev) => prev ?? null);
        setFlashcards([]);
      }
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
      }
    }
  }, [user, deckId, currentPage]);

  // initial & paginated fetch (and when deckId changes)
  useEffect(() => {
    if (user && deckId) {
      loadDeckAndFlashcards();
    }
  }, [user, deckId, currentPage, loadDeckAndFlashcards]);

  const handleAddFlashcard = () => {
    setAddModalOpen(true);
  };

  // ✅ Avoid append+refresh duplication: reload after adding instead of append
  const handleSaveFlashcard = async () => {
    try {
      await addFlashcard(deckId, newFlashcard);
      setAddModalOpen(false);
      setNewFlashcard({ front_text: "", back_text: "" });
      setError("");
      await loadDeckAndFlashcards();
    } catch (err) {
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
    } catch (err) {
      setError("Failed to update flashcard. Please try again.");
    }
  };

  const handleDeleteFlashcard = (flashcardId) => {
    setFlashcardToDelete(flashcardId);
    setDeleteConfirmationOpen(true);
  };

  // ✅ After delete, reload to keep pagination correct and avoid drift
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

  const handlePageChange = (_event, value) => {
    setCurrentPage(value);
    // loading will be set by the fetch effect
  };

  if (userLoading || loading) {
    return (
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "100vh",
          pb: { xs: 4, sm: 8 },
        }}
      >
        <NavBar />
        <Container
          maxWidth="xl"
          sx={{
            mt: { xs: 2, sm: 3, md: 4 },
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <LoadingState />
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        pb: { xs: 4, sm: 8 },
      }}
    >
      <NavBar />
      <Container
        maxWidth="xl"
        sx={{
          mt: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <DeckHeader
          deck={deck}
          onAddFlashcard={handleAddFlashcard}
          navigate={navigate}
          isMobile={isMobile}
          // 🔹 allow refresh after AI inserts
          onRefresh={loadDeckAndFlashcards}
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: { xs: 2, sm: 3 } }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
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
          isMobile={isMobile}
        />

        {totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: { xs: 3, sm: 4 },
              mb: { xs: 2, sm: 3 },
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "small" : "medium"}
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "text.primary",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                },
              }}
            />
          </Box>
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
          isMobile={isMobile}
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
          isMobile={isMobile}
        />

        <ConfirmationDialog
          open={deleteConfirmationOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Flashcard"
          message="Are you sure you want to delete this flashcard? This action cannot be undone."
          isMobile={isMobile}
        />
      </Container>
    </Box>
  );
};

export default DeckView;
