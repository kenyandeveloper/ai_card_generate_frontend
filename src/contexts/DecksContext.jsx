import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { deckApi } from "../utils/apiClient";
import { handleApiError } from "../services/errorHandler";

const DecksContext = createContext(null);

const DEFAULT_PARAMS = { page: 1, per_page: 1000 };
const FIVE_MINUTES = 5 * 60 * 1000;

const normalizeDeckResponse = (data) => {
  if (!data) {
    return { decks: [], pagination: null };
  }

  if (Array.isArray(data)) {
    return { decks: data, pagination: null };
  }

  if (Array.isArray(data.items)) {
    return { decks: data.items, pagination: data.pagination ?? null };
  }

  if (Array.isArray(data.decks)) {
    return { decks: data.decks, pagination: data.pagination ?? null };
  }

  return { decks: [], pagination: data.pagination ?? null };
};

export const DecksProvider = ({ children }) => {
  const [decks, setDecks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cacheTimestamp, setCacheTimestamp] = useState(0);
  const [lastParams, setLastParams] = useState(DEFAULT_PARAMS);

  const isCacheFresh = useCallback(
    (ttl = FIVE_MINUTES) => {
      if (!cacheTimestamp) return false;
      return Date.now() - cacheTimestamp < ttl;
    },
    [cacheTimestamp]
  );

  const fetchDecks = useCallback(
    async (params = {}, { force = false } = {}) => {
      const mergedParams = { ...DEFAULT_PARAMS, ...params };
      const shouldUseCache =
        !force &&
        isCacheFresh() &&
        decks.length > 0 &&
        mergedParams.per_page === lastParams.per_page &&
        mergedParams.page === lastParams.page;

      if (shouldUseCache) {
        return { decks, pagination };
      }

      setLoading(true);
      setError(null);
      try {
        const response = await deckApi.list(mergedParams);
        const { decks: fetchedDecks, pagination: fetchedPagination } =
          normalizeDeckResponse(response);

        setDecks(fetchedDecks);
        setPagination(fetchedPagination);
        setCacheTimestamp(Date.now());
        setLastParams(mergedParams);

        return { decks: fetchedDecks, pagination: fetchedPagination };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [decks, isCacheFresh, lastParams, pagination]
  );

  const fetchDeckById = useCallback(
    async (deckId, { force = false } = {}) => {
      const numericId = Number(deckId);
      if (!force) {
        const cached = decks.find((deck) => deck.id === numericId);
        if (cached) return cached;
      }

      setLoading(true);
      setError(null);
      try {
        const deck = await deckApi.get(numericId);
        setDecks((prev) => {
          const exists = prev.some((d) => d.id === numericId);
          return exists
            ? prev.map((d) => (d.id === numericId ? deck : d))
            : [...prev, deck];
        });
        return deck;
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [decks]
  );

  const createDeck = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      try {
        const deck = await deckApi.create(payload);
        await fetchDecks(lastParams, { force: true });
        return deck;
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchDecks, lastParams]
  );

  const updateDeck = useCallback(
    async (deckId, payload) => {
      setLoading(true);
      setError(null);
      try {
        const deck = await deckApi.update(deckId, payload);
        await fetchDecks(lastParams, { force: true });
        return deck;
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchDecks, lastParams]
  );

  const deleteDeck = useCallback(
    async (deckId) => {
      setLoading(true);
      setError(null);
      try {
        await deckApi.remove(deckId);
        await fetchDecks(lastParams, { force: true });
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchDecks, lastParams]
  );

  const invalidateCache = useCallback(() => {
    setCacheTimestamp(0);
  }, []);

  useEffect(() => {
    const handleAuthReset = () => {
      setDecks([]);
      setPagination(null);
      setCacheTimestamp(0);
    };

    window.addEventListener("auth:unauthorized", handleAuthReset);
    return () => {
      window.removeEventListener("auth:unauthorized", handleAuthReset);
    };
  }, []);

  const value = useMemo(
    () => ({
      decks,
      pagination,
      loading,
      error,
      cacheTimestamp,
      fetchDecks,
      fetchDeckById,
      createDeck,
      updateDeck,
      deleteDeck,
      invalidateCache,
      isCacheFresh,
    }),
    [
      decks,
      pagination,
      loading,
      error,
      cacheTimestamp,
      fetchDecks,
      fetchDeckById,
      createDeck,
      updateDeck,
      deleteDeck,
      invalidateCache,
      isCacheFresh,
    ]
  );

  return (
    <DecksContext.Provider value={value}>{children}</DecksContext.Provider>
  );
};

export const useDecksContext = () => {
  const context = useContext(DecksContext);
  if (!context) {
    throw new Error("useDecksContext must be used within a DecksProvider");
  }
  return context;
};
