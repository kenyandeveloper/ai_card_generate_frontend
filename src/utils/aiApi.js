import api from "./apiClient";

export async function aiGenerate({ text, count = 12, deck_id }) {
  const { data } = await api.post("/ai/generate", { text, count, deck_id });
  return data; // { deck_id?, cards, inserted_count, generation_id }
}
