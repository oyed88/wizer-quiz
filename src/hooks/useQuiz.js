// ════════════════════════════════════════════════
//  FILE: src/hooks/useQuiz.js  (UPDATED)
//  CHANGES:
//  1. Settings now include timerSeconds (adjustable)
//  2. Score history saved to localStorage per user
//  3. getHistory() and clearHistory() helpers added
// ════════════════════════════════════════════════
import { useState, useCallback } from "react";
import { getQuestions } from "../services/triviaApi";

// ── Helpers ───────────────────────────────────────
function decodeHTML(str) {
  const el = document.createElement("textarea");
  el.innerHTML = str;
  return el.value;
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Score History Helpers ─────────────────────────
const HISTORY_KEY = (userEmail) => `wizerquiz_history_${userEmail}`;

export function saveScore(userEmail, entry) {
  try {
    const key = HISTORY_KEY(userEmail);
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = [entry, ...existing].slice(0, 50); // keep last 50
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save score", e);
  }
}

export function getHistory(userEmail) {
  try {
    const key = HISTORY_KEY(userEmail);
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function clearHistory(userEmail) {
  localStorage.removeItem(HISTORY_KEY(userEmail));
}

// ── Leaderboard Helpers ───────────────────────────
const LEADERBOARD_KEY = "wizerquiz_leaderboard";

export function updateLeaderboard(userName, userEmail, entry) {
  try {
    const board = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
    const newEntry = {
      name:       userName,
      email:      userEmail,
      score:      entry.score,
      total:      entry.total,
      pct:        entry.pct,
      subject:    entry.subject,
      mode:       entry.mode,
      date:       entry.date,
    };
    const updated = [newEntry, ...board]
      .sort((a, b) => b.pct - a.pct)  // sort by percentage descending
      .slice(0, 100);                  // keep top 100
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update leaderboard", e);
  }
}

export function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
  } catch {
    return [];
  }
}

// ── Initial State ─────────────────────────────────
const INIT = {
  screen: "home",         // "home" | "loading" | "quiz" | "results"
  questions: [],
  currentIndex: 0,
  selectedAnswers: [],
  score: 0,
  error: null,
  settings: {
    mode:         "general",   // "general" | "jamb"
    amount:       10,
    category:     0,
    difficulty:   "",
    type:         "multiple",
    subject:      "mathematics",
    timerSeconds: 20,          // ← NEW: adjustable timer (10–60 seconds)
  },
};

// ── Hook ──────────────────────────────────────────
export function useQuiz(user) {
  const [state, setState]         = useState(INIT);
  const [lockedAnswer, setLocked] = useState(null);

  const updateSettings = useCallback((patch) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const startQuiz = useCallback(async (settings) => {
    setState(prev => ({ ...prev, screen: "loading", error: null }));
    setLocked(null);
    try {
      const raw = await getQuestions(settings);
      const questions = raw.map(q => ({
        question:       decodeHTML(q.question),
        correct_answer: decodeHTML(q.correct_answer),
        options: shuffle([
          ...q.incorrect_answers.map(decodeHTML),
          decodeHTML(q.correct_answer),
        ]),
        difficulty: q.difficulty,
        category:   q.subject
          ? `${q.subject.toUpperCase()} — ${q.year || ""}`
          : decodeHTML(q.category || ""),
        type: q.type || "multiple",
        year: q.year || null,
      }));
      setState(prev => ({
        ...prev,
        screen: "quiz",
        questions,
        currentIndex: 0,
        selectedAnswers: [],
        score: 0,
      }));
    } catch (err) {
      setState(prev => ({ ...prev, screen: "home", error: err.message }));
    }
  }, []);

  const handleAnswer = useCallback((answer) => {
    if (lockedAnswer !== null) return;
    setState(prev => {
      const q         = prev.questions[prev.currentIndex];
      const isCorrect = answer === q.correct_answer;
      return {
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        selectedAnswers: [
          ...prev.selectedAnswers,
          { question: q.question, selected: answer, correct: q.correct_answer, isCorrect, year: q.year },
        ],
      };
    });
    setLocked(answer);
  }, [lockedAnswer]);

  const handleNext = useCallback(() => {
    setLocked(null);
    setState(prev => {
      const next = prev.currentIndex + 1;
      const goToResults = next >= prev.questions.length;

      // ── Save score to history & leaderboard when quiz ends ──
      if (goToResults && user) {
        const pct = Math.round(((prev.score + (prev.selectedAnswers.length > prev.currentIndex &&
          prev.selectedAnswers[prev.currentIndex]?.isCorrect ? 0 : 0)) /
          prev.questions.length) * 100);

        const entry = {
          score:      prev.score,
          total:      prev.questions.length,
          pct:        Math.round((prev.score / prev.questions.length) * 100),
          mode:       prev.settings.mode,
          subject:    prev.settings.mode === "jamb" ? prev.settings.subject : "General",
          difficulty: prev.settings.difficulty || "any",
          timer:      prev.settings.timerSeconds,
          date:       new Date().toISOString(),
        };

        saveScore(user.email, entry);
        updateLeaderboard(user.name, user.email, entry);
      }

      return {
        ...prev,
        currentIndex: next,
        screen: goToResults ? "results" : "quiz",
      };
    });
  }, [user]);

  const restart = useCallback(() => {
    setLocked(null);
    setState(prev => ({ ...INIT, settings: prev.settings }));
  }, []);

  const goToScreen = useCallback((screen) => {
    setState(prev => ({ ...prev, screen }));
  }, []);

  return {
    ...state,
    lockedAnswer,
    updateSettings,
    startQuiz,
    handleAnswer,
    handleNext,
    restart,
    goToScreen,
  };
}
