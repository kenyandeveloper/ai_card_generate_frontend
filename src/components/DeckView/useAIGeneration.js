import { useState } from "react";
import { aiGenerate } from "../../utils/aiApi";

export default function useAIGeneration() {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]); // preview mode
  const [error, setError] = useState(null);
  const [generationId, setGenerationId] = useState(null);

  async function preview(text, count = 12) {
    setLoading(true);
    setError(null);
    try {
      const res = await aiGenerate({ text, count }); // no deck_id -> preview
      setCards(res.cards || []);
      setGenerationId(res.generation_id || null);
      return res;
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.detail ||
        e?.message ||
        "Generation failed";
      setError(msg);
      setCards([]);
      setGenerationId(null);
      throw e; // 🔑 bubble up so modal can detect PAYWALL
    } finally {
      setLoading(false);
    }
  }

  async function insertIntoDeck(deckId, text, count = 12) {
    setLoading(true);
    setError(null);
    try {
      const res = await aiGenerate({ text, count, deck_id: deckId });
      return {
        inserted: res.inserted_count || 0,
        generationId: res.generation_id,
      };
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.detail ||
        e?.message ||
        "Insert failed";
      setError(msg);
      throw e; // 🔑 bubble up so modal can detect PAYWALL
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setCards([]);
    setError(null);
    setGenerationId(null);
  }

  return {
    loading,
    error,
    cards,
    generationId,
    preview,
    insertIntoDeck,
    clear,
  };
}
