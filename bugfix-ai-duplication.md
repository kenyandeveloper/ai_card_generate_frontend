# Fix: AI Flashcards Duplication / Leakage Between Decks

## Problem

When creating a new deck and navigating to it, users occasionally saw **AI-generated flashcards from the previous deck appearing inside the new deck**.
This gave the impression that AI cards were "leaking" or duplicating into other decks.

### Symptoms

- After creating a new deck, the deck sometimes **displayed cards from the last viewed deck**.
- Flashcards sometimes appeared **duplicated** (once from local append, once from a server reload).
- The issue was inconsistent but reproducible when creating a deck and navigating into it quickly.

---

## Investigation

We analyzed both the **frontend React code** and the **Flask backend**:

### Backend

- `POST /ai/generate` only inserts cards if a `deck_id` is provided.

  - ✅ In preview mode (no `deck_id`), **no cards are inserted**.

- `GET /flashcards` correctly filters by `deck_id` and enforces ownership.
- `POST /decks` creates an empty deck with **no default flashcards**.

➡️ Backend was working correctly and not the cause of duplication.

### Frontend

The issue came from **race conditions and stale state** in `DeckView.jsx`:

1. **No state reset on deck change**

   - When navigating from Deck A → Deck B, `flashcards` from Deck A remained in memory until the new fetch resolved.
   - Old data "bled over" into the new deck.

2. **No guard against late responses**

   - If Deck A’s `fetchDeckAndFlashcards` finished _after_ navigating to Deck B, its results overwrote Deck B’s state.

3. **Local append + refresh duplication**

   - `handleAddFlashcard` appended a new card locally **and sometimes reloaded**, causing the same card to show up twice.

---

## Solution

We rewrote `DeckView.jsx` with these key changes:

### 1. Clear State on Deck Change

```js
useEffect(() => {
  setDeck(null);
  setFlashcards([]);
  setError("");
  setTotalPages(1);
  setTotalItems(0);
  setCurrentPage(1);
  requestSeq.current += 1; // invalidate old fetches
}, [deckId, user]);
```

- Ensures a clean slate whenever `deckId` changes.
- Prevents old deck’s flashcards from appearing in the new deck.

---

### 2. Guard Against Race Conditions

We added a **request sequence token**:

```js
const requestSeq = useRef(0);

const loadDeckAndFlashcards = useCallback(async () => {
  const seq = ++requestSeq.current; // mark this request
  try {
    const { deckData, flashcardsData, pagination } =
      await fetchDeckAndFlashcards(deckId, currentPage, cardsPerPage);
    if (seq === requestSeq.current) {
      setDeck(deckData);
      setFlashcards(flashcardsData);
      setTotalPages(pagination.total_pages);
    }
  } finally {
    if (seq === requestSeq.current) setLoading(false);
  }
}, [deckId, currentPage, user]);
```

- Only the **latest request** can update state.
- Late responses from previous decks are ignored.

---

### 3. Consistent Add/Delete Handling

- `handleAddFlashcard` and `handleDeleteConfirm` now **reload deck data** instead of appending/removing locally.
- This keeps pagination, counts, and card lists consistent with the server.

---

## Challenges

- **Intermittent bug**: It only showed up when navigating quickly, making it hard to reproduce consistently.
- **Distinguishing frontend vs backend**: At first it looked like the backend was inserting preview cards, but deeper inspection showed the bug was entirely frontend state management.
- **Avoiding over-fetching**: We wanted to fix duplication without adding unnecessary reloads. Using a sequence token let us handle both **deck switching** and **pagination changes** cleanly.

---

## Outcome

- ✅ New decks now always start empty (unless cards are added explicitly).
- ✅ No more leakage of AI-generated cards between decks.
- ✅ No more duplicate flashcards from local append + refresh.
- ✅ Code is more robust against race conditions and fast navigation.

---

## Takeaway

When working with **React state + async fetches**, always:

1. **Clear state immediately** on context changes (`deckId`, `user`, etc.).
2. **Guard against late responses** with a sequence token or `AbortController`.
3. **Choose one source of truth** for list updates (local append _or_ refetch, but not both).

This pattern prevents UI inconsistencies and race condition bugs in data-heavy apps.
