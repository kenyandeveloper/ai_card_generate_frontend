import { useState } from "react";

export default function useDeckManagement() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [deckTitle, setDeckTitle] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [deckSubject, setDeckSubject] = useState("");
  const [deckCategory, setDeckCategory] = useState("");
  const [deckDifficulty, setDeckDifficulty] = useState(3);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState(null);

  const handleEditDeck = (event, deck) => {
    event.stopPropagation();
    setEditingDeck(deck);
    setDeckTitle(deck.title);
    setDeckDescription(deck.description);
    setDeckSubject(deck.subject);
    setDeckCategory(deck.category);
    setDeckDifficulty(deck.difficulty);
    setModalOpen(true);
  };

  const handleDeleteDeck = (event, deckId) => {
    event.stopPropagation();
    setDeckToDelete(deckId);
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirm = async (deleteHandler) => {
    if (!deckToDelete) return;

    try {
      await deleteHandler(deckToDelete);
    } finally {
      setDeleteConfirmationOpen(false);
      setDeckToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(false);
    setDeckToDelete(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingDeck(null);
    setDeckTitle("");
    setDeckDescription("");
    setDeckSubject("");
    setDeckCategory("");
    setDeckDifficulty(3);
  };

  return {
    modalOpen,
    editingDeck,
    deckTitle,
    deckDescription,
    deckSubject,
    deckCategory,
    deckDifficulty,
    deleteConfirmationOpen,
    setDeckTitle,
    setDeckDescription,
    setDeckSubject,
    setDeckCategory,
    setDeckDifficulty,
    setModalOpen,
    handleEditDeck,
    handleDeleteDeck,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleCloseModal,
  };
}
