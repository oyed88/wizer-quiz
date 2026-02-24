// ════════════════════════════════════════════════
//  FILE: src/services/triviaApi.js
//  PURPOSE: All API calls to Open Trivia Database
// ════════════════════════════════════════════════

const BASE = "https://opentdb.com";

/**
 * Fetch trivia categories
 * Returns: [{ id, name }, ...]
 */
export async function getCategories() {
  const res = await fetch(`${BASE}/api_category.php`);
  if (!res.ok) throw new Error("Failed to load categories.");
  const data = await res.json();
  return data.trivia_categories;
}

/**
 * Fetch quiz questions
 * @param {number} amount     - e.g. 10
 * @param {number} category   - category ID, 0 = any
 * @param {string} difficulty - "easy" | "medium" | "hard" | ""
 * @param {string} type       - "multiple" | "boolean" | ""
 */
export async function getQuestions({ amount = 10, category = 0, difficulty = "", type = "multiple" } = {}) {
  const p = new URLSearchParams({ amount });
  if (category)   p.set("category",   category);
  if (difficulty) p.set("difficulty", difficulty);
  if (type)       p.set("type",       type);

  const res = await fetch(`${BASE}/api.php?${p}`);
  if (!res.ok) throw new Error(`Network error (${res.status})`);

  const data = await res.json();

  // API response codes
  if (data.response_code === 1) throw new Error("Not enough questions for that selection. Try different settings.");
  if (data.response_code !== 0) throw new Error("API error. Please try again.");

  return data.results; // raw question objects
}
