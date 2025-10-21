import { useEffect } from "react";
import { useDecksContext } from "../contexts/DecksContext";

const noop = () => {};

export const useDecks = (options = {}) => {
  const { skip = false, enabled = true, ttl } = options;
  const {
    decks,
    pagination,
    loading,
    error,
    fetchDecks,
    fetchDeckById,
    createDeck,
    updateDeck,
    deleteDeck,
    invalidateCache,
    isCacheFresh,
  } = useDecksContext();

  useEffect(() => {
    if (skip || !enabled || loading) return noop;
    const fresh = isCacheFresh(ttl);
    if (!fresh) {
      fetchDecks().catch(() => {});
    }
    return noop;
  }, [skip, enabled, loading, ttl, isCacheFresh, fetchDecks]);

  const refetch = (params = {}) => fetchDecks(params, { force: true });

  return {
    decks,
    pagination,
    loading,
    error,
    fetchDecks,
    fetchDeckById,
    createDeck,
    updateDeck,
    deleteDeck,
    invalidateCache,
    refetch,
  };
};
