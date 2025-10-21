import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { deckApi } from "../utils/apiClient";
import { handleApiError } from "../services/errorHandler";
import { getToken } from "../utils/authToken";

const DecksContext = createContext(null);

const DEFAULT_PARAMS = { page: 1, per_page: 1000 };
const FIVE_MINUTES = 5 * 60 * 1000;
const MAX_RETRY_ATTEMPTS = 3;

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

  // Circuit breaker to prevent infinite loops
  const retryCountRef = useRef(0);
  const lastErrorTimeRef = useRef(0);
  const fetchInProgressRef = useRef(false);
  const decksRef = useRef(decks);
  const paginationRef = useRef(pagination);

  const isCacheFresh = useCallback(
    (ttl = FIVE_MINUTES) => {
      if (!cacheTimestamp) return false;
      return Date.now() - cacheTimestamp < ttl;
    },
    [cacheTimestamp]
  );

  useEffect(() => {
    decksRef.current = decks;
  }, [decks]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // Check if we should allow a fetch attempt
  const canAttemptFetch = useCallback(() => {
    // Don't fetch if no auth token
    if (!getToken()) {
      if (import.meta.env?.DEV) {
        console.debug("[DecksContext] No auth token, skipping fetch");
      }
      return false;
    }

    // Don't fetch if already in progress
    if (fetchInProgressRef.current) {
      if (import.meta.env?.DEV) {
        console.debug("[DecksContext] Fetch already in progress, skipping");
      }
      return false;
    }

    // Reset retry count after 1 minute of no errors
    const timeSinceLastError = Date.now() - lastErrorTimeRef.current;
    if (timeSinceLastError > 60000) {
      retryCountRef.current = 0;
    }

    // Circuit breaker: stop after max retries
    if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
      if (import.meta.env?.DEV) {
        console.warn(
          `[DecksContext] Max retry attempts (${MAX_RETRY_ATTEMPTS}) reached, blocking further requests`
        );
      }
      return false;
    }

    return true;
  }, []);

  const fetchDecks = useCallback(
    async (params = {}, { force = false } = {}) => {
      const mergedParams = { ...DEFAULT_PARAMS, ...params };

      // Use refs for cache check instead of state to avoid dependency issues
      const decksSnapshot = decksRef.current;
      const paginationSnapshot = paginationRef.current;
      const shouldUseCache =
        !force &&
        isCacheFresh() &&
        decksSnapshot.length > 0 &&
        mergedParams.per_page === lastParams.per_page &&
        mergedParams.page === lastParams.page;

      if (shouldUseCache) {
        if (import.meta.env?.DEV) {
          console.debug("[DecksContext] Using cached decks");
        }
        return { decks: decksSnapshot, pagination: paginationSnapshot };
      }

      // Check if we can attempt fetch
      if (!canAttemptFetch()) {
        // Return empty result without throwing to prevent error cascades
        return { decks: decksSnapshot, pagination: paginationSnapshot };
      }

      fetchInProgressRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const response = await deckApi.list(mergedParams);
        const { decks: fetchedDecks, pagination: fetchedPagination } =
          normalizeDeckResponse(response);

        setDecks(fetchedDecks);
        decksRef.current = fetchedDecks;
        setPagination(fetchedPagination);
        paginationRef.current = fetchedPagination;
        setCacheTimestamp(Date.now());
        setLastParams(mergedParams);

        // Reset retry count on success
        retryCountRef.current = 0;

        return { decks: fetchedDecks, pagination: fetchedPagination };
      } catch (err) {
        lastErrorTimeRef.current = Date.now();
        retryCountRef.current += 1;

        const apiError = handleApiError(err);

        // Don't set error state for auth errors to prevent UI flicker
        if (err?.response?.status !== 401) {
          setError(apiError.message);
        }

        if (import.meta.env?.DEV) {
          console.error("[DecksContext] Fetch error:", {
            status: err?.response?.status,
            message: apiError.message,
            retryCount: retryCountRef.current,
          });
        }

        throw err;
      } finally {
        setLoading(false);
        fetchInProgressRef.current = false;
      }
    },
    // Remove decks from dependencies to prevent recreation on every state change
    [isCacheFresh, lastParams, canAttemptFetch]
  );

  const fetchDeckById = useCallback(
    async (deckId, { force = false } = {}) => {
      if (!canAttemptFetch()) {
        const cached = decksRef.current.find(
          (deck) => deck.id === Number(deckId)
        );
        if (cached) return cached;
        throw new Error("Authentication required");
      }

      const numericId = Number(deckId);
      if (!force) {
        const cached = decksRef.current.find((deck) => deck.id === numericId);
        if (cached) return cached;
      }

      setLoading(true);
      setError(null);
      try {
        const deck = await deckApi.get(numericId);
        setDecks((prev) => {
          const exists = prev.some((d) => d.id === numericId);
          const next = exists
            ? prev.map((d) => (d.id === numericId ? deck : d))
            : [...prev, deck];
          decksRef.current = next;
          return next;
        });
        return deck;
      } catch (err) {
        const apiError = handleApiError(err);
        if (err?.response?.status !== 401) {
          setError(apiError.message);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [canAttemptFetch]
  );

  const createDeck = useCallback(
    async (payload) => {
      if (!canAttemptFetch()) {
        throw new Error("Authentication required");
      }

      setLoading(true);
      setError(null);
      try {
        const deck = await deckApi.create(payload);
        // Invalidate cache instead of force refetch
        setCacheTimestamp(0);
        return deck;
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [canAttemptFetch]
  );

  const updateDeck = useCallback(
    async (deckId, payload) => {
      if (!canAttemptFetch()) {
        throw new Error("Authentication required");
      }

      setLoading(true);
      setError(null);
      try {
        const deck = await deckApi.update(deckId, payload);
        // Invalidate cache instead of force refetch
        setCacheTimestamp(0);
        return deck;
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [canAttemptFetch]
  );

  const deleteDeck = useCallback(
    async (deckId) => {
      if (!canAttemptFetch()) {
        throw new Error("Authentication required");
      }

      setLoading(true);
      setError(null);
      try {
        await deckApi.remove(deckId);
        // Invalidate cache instead of force refetch
        setCacheTimestamp(0);
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [canAttemptFetch]
  );

  const invalidateCache = useCallback(() => {
    setCacheTimestamp(0);
  }, []);

  const resetRetryCount = useCallback(() => {
    retryCountRef.current = 0;
    lastErrorTimeRef.current = 0;
  }, []);

  useEffect(() => {
    const handleAuthReset = () => {
      if (import.meta.env?.DEV) {
        console.debug("[DecksContext] Auth reset, clearing state");
      }
      setDecks([]);
      setPagination(null);
      decksRef.current = [];
      paginationRef.current = null;
      setCacheTimestamp(0);
      setError(null);
      retryCountRef.current = 0;
      lastErrorTimeRef.current = 0;
      fetchInProgressRef.current = false;
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
      resetRetryCount,
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
      resetRetryCount,
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
