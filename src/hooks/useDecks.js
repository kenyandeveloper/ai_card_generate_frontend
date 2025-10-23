import { useEffect, useRef } from "react";
import { useDecksContext } from "../hooks/useDecksContext";
import { getToken } from "../utils/authToken";

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
    resetRetryCount,
  } = useDecksContext();

  // Track if we've already attempted a fetch
  const hasFetchedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Guard conditions
    if (skip || !enabled || loading) {
      return;
    }

    // Don't fetch without auth token
    if (!getToken()) {
      if (import.meta.env?.DEV) {
        console.debug("[useDecks] No auth token, skipping fetch");
      }
      return;
    }

    // Only fetch once on mount or when cache is stale
    const shouldFetch = !hasFetchedRef.current || !isCacheFresh(ttl);

    if (shouldFetch) {
      hasFetchedRef.current = true;

      fetchDecks().catch((err) => {
        if (import.meta.env?.DEV) {
          console.debug("[useDecks] Fetch failed:", err.message);
        }
        // Don't retry on auth errors
        if (err?.response?.status === 401) {
          hasFetchedRef.current = false; // Allow retry after re-auth
        }
      });
    }
  }, [skip, enabled, loading, fetchDecks, isCacheFresh, ttl]);

  // Reset fetch tracking when authentication changes
  useEffect(() => {
    const handleAuthChange = () => {
      hasFetchedRef.current = false;
      resetRetryCount();
    };

    window.addEventListener("auth:unauthorized", handleAuthChange);
    return () => {
      window.removeEventListener("auth:unauthorized", handleAuthChange);
    };
  }, [resetRetryCount]);

  const refetch = (params = {}) => {
    hasFetchedRef.current = false;
    resetRetryCount();
    return fetchDecks(params, { force: true });
  };

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
