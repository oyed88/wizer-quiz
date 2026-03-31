// ════════════════════════════════════════════════
//  FILE: src/services/triviaApi.js  (UPDATED)
//  PURPOSE: Unified API — handles both
//           Open Trivia DB (General) and
//           local JAMB/WAEC question bank
// ════════════════════════════════════════════════
import { JAMB_QUESTIONS } from "../data/jambQuestions";

const BASE = "https://opentdb.com";

// ── Open Trivia DB — General categories ──────────
export async function getCategories() {
  const res = await fetch(`${BASE}/api_category.php`);
  if (!res.ok) throw new Error("Failed to load categories.");
  const data = await res.json();
  return data.trivia_categories;
}

// ── Open Trivia DB — General questions ───────────
export async function getGeneralQuestions({
  amount = 10,
  category = 0,
  difficulty = "",
  type = "multiple",
} = {}) {
  const p = new URLSearchParams({ amount });
  if (category)   p.set("category",   category);
  if (difficulty) p.set("difficulty", difficulty);
  if (type)       p.set("type",       type);

  const res = await fetch(`${BASE}/api.php?${p}`);
  if (!res.ok) throw new Error(`Network error (${res.status})`);
  const data = await res.json();

  if (data.response_code === 1)
    throw new Error("Not enough questions for that selection. Try different settings.");
  if (data.response_code !== 0)
    throw new Error("API error. Please try again.");

  return data.results;
}

// ── JAMB/WAEC — Local question bank ──────────────
export function getJambQuestions({ subject, amount = 10, difficulty = "" }) {
  const pool = JAMB_QUESTIONS[subject];
  if (!pool || pool.length === 0)
    throw new Error("No questions found for that subject.");

  // Filter by difficulty if specified
  const filtered = difficulty
    ? pool.filter(q => q.difficulty === difficulty)
    : pool;

  if (filtered.length === 0)
    throw new Error(`No ${difficulty} questions found for this subject.`);

  // Shuffle and slice to requested amount
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(amount, shuffled.length));
}

// ── Unified fetcher used by useQuiz ──────────────
// mode: "general" | "jamb"
export function getQuestions(settings) {
  if (settings.mode === "jamb") {
    return Promise.resolve(
      getJambQuestions({
        subject:    settings.subject,
        amount:     settings.amount,
        difficulty: settings.difficulty,
      })
    );
  }
  return getGeneralQuestions({
    amount:     settings.amount,
    category:   settings.category,
    difficulty: settings.difficulty,
    type:       settings.type,
  });
}
