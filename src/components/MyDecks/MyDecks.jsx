// MyDecks.jsx (Vite + Tailwind, dark mode only)
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

import NavBar from "../NavBar";
import useDeckManagement from "./DeckManagement";
import MyDecksSkeleton from "./MyDecksSkeleton";
import Header from "./Header";
import FilterSort from "./FilterSort";
import DecksGrid from "./DecksGrid";
import DeckModal from "./DeckModal";
import ConfirmationDialog from "./ConfirmationDialog";
import { useDecks as useDecksStore } from "../../hooks/useDecks";
import { DataFetchWrapper } from "../common/DataFetchWrapper";
import { DeckCardSkeleton } from "../common/LoadingSkeleton";
import { ErrorAlert, InlineError } from "../common/ErrorAlert";
import { showError, showSuccess } from "../common/ErrorSnackbar";

export default function MyDecks() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: userLoading } = useUser();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({
    subject: "",
    category: "",
    difficulty: "",
    search: "",
  });
  const [sortBy, setSortBy] = useState("title");
  const [formError, setFormError] = useState("");
  const [savingDeck, setSavingDeck] = useState(false);
  const [deletingDeck, setDeletingDeck] = useState(false);

  const decksPerPage = 6;
  const {
    decks,
    loading,
    error: decksError,
    createDeck,
    updateDeck,
    deleteDeck,
    refetch,
  } = useDecksStore({
    enabled: Boolean(isAuthenticated),
  });

  const deckManagement = useDeckManagement();

  // Filter & sort
  const filteredAndSortedDecks = useMemo(() => {
    if (!Array.isArray(decks)) return [];
    return decks
      .filter((deck) => {
        const matchesSubject =
          !filter.subject || deck.subject === filter.subject;
        const matchesCategory =
          !filter.category || deck.category === filter.category;
        const matchesDifficulty =
          !filter.difficulty ||
          deck.difficulty === Number.parseInt(filter.difficulty);
        const matchesSearch =
          !filter.search ||
          deck.title.toLowerCase().includes(filter.search.toLowerCase());
        return (
          matchesSubject &&
          matchesCategory &&
          matchesDifficulty &&
          matchesSearch
        );
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "lastStudied")
          return new Date(b.last_studied) - new Date(a.last_studied);
        if (sortBy === "difficulty") return a.difficulty - b.difficulty;
        return 0;
      });
  }, [decks, filter, sortBy]);

  // Derived
  const subjects = useMemo(
    () => [...new Set((decks || []).map((d) => d.subject).filter(Boolean))],
    [decks]
  );
  const categories = useMemo(
    () => [...new Set((decks || []).map((d) => d.category).filter(Boolean))],
    [decks]
  );

  const totalPages = useMemo(() => {
    if (filteredAndSortedDecks.length === 0) return 1;
    return Math.ceil(filteredAndSortedDecks.length / decksPerPage) || 1;
  }, [filteredAndSortedDecks, decksPerPage]);

  const paginatedDecks = useMemo(() => {
    const start = (currentPage - 1) * decksPerPage;
    return filteredAndSortedDecks.slice(start, start + decksPerPage);
  }, [filteredAndSortedDecks, currentPage, decksPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Handlers
  const handlePageChange = (_, value) => {
    if (value < 1 || value > totalPages) return;
    setCurrentPage(value);
  };
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };
  const handleStudyDeck = (event, deckId) => {
    event.stopPropagation();
    navigate(`/study/${deckId}`);
  };

  const handleCreateOrUpdateDeck = async () => {
    if (!deckManagement.deckTitle.trim()) {
      setFormError("Deck title is required");
      return;
    }
    const payload = {
      title: deckManagement.deckTitle,
      description: deckManagement.deckDescription,
      subject: deckManagement.deckSubject,
      category: deckManagement.deckCategory,
      difficulty: deckManagement.deckDifficulty,
    };
    try {
      setSavingDeck(true);
      if (deckManagement.editingDeck?.id) {
        await updateDeck(deckManagement.editingDeck.id, payload);
        showSuccess("Deck updated successfully!");
      } else {
        await createDeck(payload);
        showSuccess("Deck created successfully!");
      }
      deckManagement.handleCloseModal();
      setFormError("");
    } catch (error) {
      const message =
        error?.message || "An error occurred while saving the deck.";
      setFormError(message);
      showError(message);
    } finally {
      setSavingDeck(false);
      deckManagement.resetForm?.();
    }
  };

  const handleDelete = async (deckId) => {
    try {
      setDeletingDeck(true);
      await deleteDeck(deckId);
      showSuccess("Deck deleted successfully!");
    } catch (error) {
      const message =
        error?.message || "An error occurred while deleting the deck.";
      setFormError(message);
      showError(message);
      throw error;
    } finally {
      setDeletingDeck(false);
    }
  };

  // Auth redirect
  useEffect(() => {
    if (!userLoading && !isAuthenticated) navigate("/login");
  }, [userLoading, isAuthenticated, navigate]);

  // Loading
  if (userLoading) {
    // TODO: Update MyDecksSkeleton to not accept isMobile; purely CSS responsive.
    return <MyDecksSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-24">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-3 sm:mt-4 md:mt-6">
        <Header onCreateDeck={() => deckManagement.setModalOpen(true)} />

        <ErrorAlert
          message={decksError}
          onRetry={() => refetch()}
        />

        <FilterSort
          subjects={subjects}
          categories={categories}
          filter={filter}
          setFilter={handleFilterChange}
          sortBy={sortBy}
          setSortBy={handleSortChange}
        />

        <DataFetchWrapper
          loading={loading}
          error={decksError}
          onRetry={() => refetch()}
          loadingComponent={<DeckCardSkeleton count={decksPerPage} />}
          emptyMessage="No decks yet. Create your first deck!"
          isEmpty={Array.isArray(decks) && decks.length === 0}
        >
          <DecksGrid
            decks={decks}
            filteredDecks={paginatedDecks}
            currentPage={currentPage}
            totalPages={totalPages}
            onEdit={deckManagement.handleEditDeck}
            onDelete={deckManagement.handleDeleteDeck}
            onStudy={handleStudyDeck}
            onPageChange={handlePageChange}
            onCreateDeck={() => deckManagement.setModalOpen(true)}
          />
        </DataFetchWrapper>

        <DeckModal
          open={deckManagement.modalOpen}
          onClose={deckManagement.handleCloseModal}
          editingDeck={deckManagement.editingDeck}
          deckTitle={deckManagement.deckTitle}
          setDeckTitle={deckManagement.setDeckTitle}
          deckDescription={deckManagement.deckDescription}
          setDeckDescription={deckManagement.setDeckDescription}
          deckSubject={deckManagement.deckSubject}
          setDeckSubject={deckManagement.setDeckSubject}
          deckCategory={deckManagement.deckCategory}
          setDeckCategory={deckManagement.setDeckCategory}
          deckDifficulty={deckManagement.deckDifficulty}
          setDeckDifficulty={deckManagement.setDeckDifficulty}
          onSave={handleCreateOrUpdateDeck}
          saving={savingDeck}
        />

        <ConfirmationDialog
          open={deckManagement.deleteConfirmationOpen}
          onClose={deckManagement.handleDeleteCancel}
          onConfirm={() => deckManagement.handleDeleteConfirm(handleDelete)}
          title="Delete Deck"
          message="Are you sure you want to delete this deck? This action cannot be undone."
          loading={deletingDeck}
        />

        <InlineError message={formError} className="mt-4" />
      </main>
    </div>
  );
}
