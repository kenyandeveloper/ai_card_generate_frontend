import { useState, useEffect } from "react";
import {
  fetchDecks,
  createOrUpdateDeck,
  deleteDeck,
} from "../../utils/deckApi";

export default function useDecks(user, currentPage, decksPerPage) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const loadDecks = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("authToken");
        const { decks, pagination } = await fetchDecks(
          token,
          currentPage,
          decksPerPage
        );
        setDecks(Array.isArray(decks) ? decks : []);
        setTotalPages(pagination.total_pages);
        setTotalItems(pagination.total_items);
      } catch (error) {
        console.error("Error fetching decks:", error);
        setError("An error occurred while loading decks.");
        setDecks([]);
      } finally {
        setLoading(false);
      }
    };

    loadDecks();
  }, [user, currentPage, decksPerPage]);

  const handleCreateOrUpdate = async (deckData, isUpdate) => {
    try {
      const updatedDeck = await createOrUpdateDeck(deckData, isUpdate);
      setDecks((prev) =>
        isUpdate
          ? prev.map((d) => (d.id === updatedDeck.id ? updatedDeck : d))
          : [...prev, updatedDeck]
      );
      return true;
    } catch (error) {
      console.error("Error saving deck:", error);
      setError("An error occurred while saving the deck.");
      return false;
    }
  };

  const handleDelete = async (deckId) => {
    try {
      await deleteDeck(deckId);
      setDecks((prev) => prev.filter((deck) => deck.id !== deckId));
      return true;
    } catch (error) {
      console.error("Error deleting deck:", error);
      setError("An error occurred while deleting the deck.");
      return false;
    }
  };

  return {
    decks,
    loading,
    error,
    totalPages,
    totalItems,
    handleCreateOrUpdate,
    handleDelete,
    setError,
  };
}
