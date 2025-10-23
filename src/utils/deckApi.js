import { deckApi } from "./apiClient";

export const fetchDeckAndFlashcards = async (
  deckId,
  page = 1,
  perPage = 10
) => {
  if (!deckId) {
    throw new Error("Deck ID is required");
  }

  const [deckData, cardsData] = await Promise.all([
    deckApi.get(deckId),
    deckApi.listFlashcards({
      deck_id: deckId,
      page,
      per_page: perPage,
    }),
  ]);

  const flashcardsData = Array.isArray(cardsData)
    ? cardsData
    : Array.isArray(cardsData?.items)
    ? cardsData.items
    : [];

  const pagination = normalizePagination(cardsData?.pagination, {
    page,
    per_page: perPage,
    total_pages: 1,
    total_items: flashcardsData.length,
  });

  return {
    deckData,
    flashcardsData,
    pagination,
  };
};

export const addFlashcard = (deckId, newFlashcard) =>
  deckApi.createFlashcard({
    deck_id: Number.parseInt(deckId, 10),
    front_text: newFlashcard.front_text,
    back_text: newFlashcard.back_text,
  });

export const updateFlashcard = (flashcard) =>
  deckApi.updateFlashcard(flashcard.id, {
    front_text: flashcard.front_text,
    back_text: flashcard.back_text,
  });

export const deleteFlashcard = (flashcardId) =>
  deckApi.deleteFlashcard(flashcardId);

export const createOrUpdateDeck = (deck, isEditing) => {
  if (isEditing && deck?.id) {
    return deckApi.update(deck.id, deck);
  }
  return deckApi.create(deck);
};

const normalizePagination = (pagination, fallback = {}) => {
  const base = {
    current_page: fallback.current_page ?? fallback.page ?? 1,
    page: fallback.page ?? fallback.current_page ?? 1,
    per_page: fallback.per_page ?? 10,
    total_pages: fallback.total_pages ?? 1,
    total_items: fallback.total_items ?? 0,
    has_next: fallback.has_next ?? false,
    has_prev: fallback.has_prev ?? false,
  };

  if (!pagination) {
    return base;
  }

  return {
    ...base,
    ...pagination,
    current_page: pagination.current_page ?? pagination.page ?? base.current_page,
    page: pagination.page ?? pagination.current_page ?? base.page,
    per_page: pagination.per_page ?? base.per_page,
    total_pages: pagination.total_pages ?? base.total_pages,
    total_items: pagination.total_items ?? base.total_items,
  };
};

export const fetchDecks = async (_token, page = 1, perPage = 10) => {
  try {
    const data = await deckApi.list({ page, per_page: perPage });
    const decks = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
      ? data
      : [];
    const pagination = normalizePagination(data?.pagination, {
      page,
      per_page: perPage,
      total_pages: 1,
      total_items: decks.length,
    });

    return {
      decks,
      pagination,
    };
  } catch {
    return {
      decks: [],
      pagination: normalizePagination(null, {
        page: 1,
        per_page: perPage,
        total_pages: 1,
        total_items: 0,
        has_next: false,
        has_prev: false,
      }),
    };
  }
};

export const deleteDeck = (deckId) => deckApi.remove(deckId);
