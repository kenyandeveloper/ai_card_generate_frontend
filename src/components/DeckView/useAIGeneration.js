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
    } catch (e) {
      setError(e?.response?.data?.error || "Generation failed");
      setCards([]);
      setGenerationId(null);
    } finally {
      setLoading(false);
    }
  }

  async function insertIntoDeck(deckId, text, count = 12) {
    setLoading(true);
    setError(null);
    try {
      const res = await aiGenerate({ text, count, deck_id: deckId });
      // server inserts directly; no preview returned is required to proceed
      return {
        inserted: res.inserted_count || 0,
        generationId: res.generation_id,
      };
    } catch (e) {
      setError(e?.response?.data?.error || "Insert failed");
      return { inserted: 0, generationId: null };
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
