"use client";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Box, Container, useTheme, useMediaQuery } from "@mui/material";
import NavBar from "../NavBar";
import useDecks from "./useDecks";
import useDeckManagement from "./DeckManagement";
import MyDecksSkeleton from "./MyDecksSkeleton";
import ErrorHandler from "./ErrorHandler";
import Header from "./Header";
import FilterSort from "./FilterSort";
import DecksGrid from "./DecksGrid";
import DeckModal from "./DeckModal";
import ConfirmationDialog from "./ConfirmationDialog";

const MyDecks = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, isAuthenticated, loading: userLoading } = useUser();

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

  const decksPerPage = 6;
  const {
    decks,
    loading,
    error: decksError,
    totalPages,
    handleCreateOrUpdate,
    handleDelete,
  } = useDecks(user, currentPage, decksPerPage);

  const deckManagement = useDeckManagement();

  // Filter and sort decks
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

  // Derived data
  const subjects = useMemo(
    () => [...new Set(decks.map((deck) => deck.subject))],
    [decks]
  );

  const categories = useMemo(
    () => [...new Set(decks.map((deck) => deck.category))],
    [decks]
  );

  // Handlers
  const handlePageChange = (_, value) => {
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

    const deckData = {
      id: deckManagement.editingDeck?.id,
      title: deckManagement.deckTitle,
      description: deckManagement.deckDescription,
      subject: deckManagement.deckSubject,
      category: deckManagement.deckCategory,
      difficulty: deckManagement.deckDifficulty,
    };

    const success = await handleCreateOrUpdate(
      deckData,
      !!deckManagement.editingDeck
    );
    if (success) {
      deckManagement.handleCloseModal();
    }
  };

  // Auth redirect
  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [userLoading, isAuthenticated, navigate]);

  // Loading state
  if (userLoading || loading) {
    return <MyDecksSkeleton isMobile={isMobile} />;
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
        sx={{ mt: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}
      >
        <Header
          onCreateDeck={() => deckManagement.setModalOpen(true)}
          isMobile={isMobile}
        />

        <ErrorHandler
          error={decksError || formError}
          onClose={() => {
            setFormError("");
            // If you have a way to reset deck error, add here
          }}
        />

        <FilterSort
          subjects={subjects}
          categories={categories}
          filter={filter}
          setFilter={handleFilterChange}
          sortBy={sortBy}
          setSortBy={handleSortChange}
          isMobile={isMobile}
        />

        <DecksGrid
          decks={decks}
          filteredDecks={filteredAndSortedDecks}
          currentPage={currentPage}
          totalPages={totalPages}
          isMobile={isMobile}
          onEdit={deckManagement.handleEditDeck}
          onDelete={deckManagement.handleDeleteDeck}
          onStudy={handleStudyDeck}
          onPageChange={handlePageChange}
          onCreateDeck={() => deckManagement.setModalOpen(true)}
          theme={theme}
          navigate={navigate}
        />

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
          error={formError}
          onSave={handleCreateOrUpdateDeck}
          isMobile={isMobile}
        />

        <ConfirmationDialog
          open={deckManagement.deleteConfirmationOpen}
          onClose={deckManagement.handleDeleteCancel}
          onConfirm={() => deckManagement.handleDeleteConfirm(handleDelete)}
          title="Delete Deck"
          message="Are you sure you want to delete this deck? This action cannot be undone."
        />
      </Container>
    </Box>
  );
};

export default MyDecks;
