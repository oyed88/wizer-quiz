// ════════════════════════════════════════════════
//  FILE: src/hooks/useQuiz.js
//  PURPOSE: Central state machine for the quiz
//
//  Flow: "home" → "loading" → "quiz" → "results"
//
//  KEY FIX vs your screenshot:
//  • Answer selection is now SEPARATED from advancing.
//    Selecting an answer locks the question and shows
//    correct/wrong feedback. The user must click "Next"
//    to move forward — so setCurrentIndex is NOT called
//    inside handleAnswer anymore.
// ════════════════════════════════════════════════
import { useState, useCallback } from "react";
import { getQuestions } from "../services/triviaApi";

// ── Helpers ──────────────────────────────────────
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

// ── Initial state ─────────────────────────────────
const INIT = {
  screen: "home",        // "home" | "loading" | "quiz" | "results"
  questions: [],
  currentIndex: 0,
  selectedAnswers: [],   // [{ question, selected, correct }, ...]
  score: 0,
  error: null,
  settings: { amount: 10, category: 0, difficulty: "", type: "multiple" },
};

// ── Hook ──────────────────────────────────────────
export function useQuiz() {
  const [state, setState] = useState(INIT);

  // Locked answer for the CURRENT question (awaiting Next click)
  const [lockedAnswer, setLockedAnswer] = useState(null);

  // Update settings from Home screen
  const updateSettings = useCallback((patch) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  // Fetch questions and enter quiz
  const startQuiz = useCallback(async (settings) => {
    setState((prev) => ({ ...prev, screen: "loading", error: null }));
    setLockedAnswer(null);
    try {
      const raw = await getQuestions(settings);
      const questions = raw.map((q) => ({
        question: decodeHTML(q.question),
        correct_answer: decodeHTML(q.correct_answer),
        options: shuffle([
          ...q.incorrect_answers.map(decodeHTML),
          decodeHTML(q.correct_answer),
        ]),
        difficulty: q.difficulty,
        category: decodeHTML(q.category),
        type: q.type,
      }));
      setState((prev) => ({
        ...prev,
        screen: "quiz",
        questions,
        currentIndex: 0,
        selectedAnswers: [],
        score: 0,
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, screen: "home", error: err.message }));
    }
  }, []);

  // KEY FIX: handleAnswer only LOCKS the answer + updates score.
  // It does NOT advance the index. That happens in handleNext.
  const handleAnswer = useCallback((answer) => {
    if (lockedAnswer !== null) return; // already answered this question

    setState((prev) => {
      const currentQ = prev.questions[prev.currentIndex];
      const isCorrect = answer === currentQ.correct_answer;
      return {
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        selectedAnswers: [
          ...prev.selectedAnswers,
          {
            question: currentQ.question,
            selected: answer,
            correct: currentQ.correct_answer,
            isCorrect,
          },
        ],
      };
    });
    setLockedAnswer(answer);
  }, [lockedAnswer]);

  // Advance to next question — or go to results if last
  const handleNext = useCallback(() => {
    setLockedAnswer(null);
    setState((prev) => {
      const next = prev.currentIndex + 1;
      return {
        ...prev,
        currentIndex: next,
        screen: next >= prev.questions.length ? "results" : "quiz",
      };
    });
  }, []);

  // Go back to home (keep settings)
  const restart = useCallback(() => {
    setLockedAnswer(null);
    setState((prev) => ({ ...INIT, settings: prev.settings }));
  }, []);

  return {
    ...state,
    lockedAnswer,
    updateSettings,
    startQuiz,
    handleAnswer,
    handleNext,
    restart,
  };
}
