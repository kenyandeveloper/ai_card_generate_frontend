import { aiApi as aiClient } from "./apiClient";

export async function aiGenerate({ text, count = 12, deck_id }) {
  return aiClient.generate({ text, count, deck_id });
}
