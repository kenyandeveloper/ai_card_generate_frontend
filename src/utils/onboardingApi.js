// src/utils/onboardingApi.js
import { onboardingApi as onboardingClient } from "./apiClient";

/**
 * Expected backend payloads:
 *  A) { catalog: [ { id, title, ... } ] }
 *  B) [ { id, title, ... } ]
 */
function normalizeCatalog(raw) {
  if (!raw) return [];

  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.catalog)
    ? raw.catalog
    : [];
  if (!list.length) return [];

  return list.map((d) => ({
    id: d.id ?? d.key ?? d.title, // defensive but cheap
    title: d.title ?? "",
    subject: d.subject ?? d.category ?? undefined,
    category: d.category ?? undefined,
    difficulty: d.difficulty ?? undefined,
    description: d.description ?? "",
    flashcard_count: Number.isFinite(d.flashcard_count)
      ? d.flashcard_count
      : Array.isArray(d.flashcards)
      ? d.flashcards.length
      : 0,
  }));
}

/**
 * Fetch curated catalog from backend (source of truth).
 * Returns [] on error or empty backend response.
 */
export async function fetchCatalog({ signal } = {}) {
  try {
    const data = await onboardingClient.fetchCatalog({ signal });
    return normalizeCatalog(data);
  } catch (err) {
    console.warn("fetchCatalog: backend error", err?.message || err);
    return []; // no local fallback
  }
}

/**
 * Seed curated starter decks for the authenticated user.
 */
export async function assignStarterDecks(deckIds = []) {
  if (!Array.isArray(deckIds) || deckIds.length === 0) {
    return { ok: false, created: 0, errors: ["No deck IDs provided"] };
  }

  try {
    const resp = await onboardingClient.seedCatalog({ deck_ids: deckIds });
    const created = resp?.created?.length ?? 0;
    const errors = resp?.errors ?? [];
    return { ok: created > 0, created, errors };
  } catch (err) {
    return {
      ok: false,
      created: 0,
      errors: [err?.response?.data || err?.message || "Unknown error"],
    };
  }
}

/**
 * Quick deck count (guard).
 */
export async function fetchDeckCount() {
  try {
    const resp = await onboardingClient.fetchDeckCount();
    const total =
      resp?.pagination?.total_items ??
      resp?.total ??
      resp?.count ??
      (Array.isArray(resp) ? resp.length : 0);
    return Number.isFinite(total) ? total : 0;
  } catch {
    return 0;
  }
}

/**
 * Choose recommended starters for the compact view.
 */
export function pickRecommended(catalog = [], n = 3) {
  if (!Array.isArray(catalog) || catalog.length === 0) return [];
  return catalog.slice(0, n);
}
