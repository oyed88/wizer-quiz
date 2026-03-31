// ════════════════════════════════════════════════
//  FILE: src/hooks/useQuiz.js  (UPDATED)
//  PURPOSE: Quiz state machine — now supports
//           both General and JAMB/WAEC modes
//
//  New settings fields:
//    mode:    "general" | "jamb"
//    subject: "mathematics" | "physics" | etc.
// ════════════════════════════════════════════════
import { useState, useCallback } from "react";
import { getQuestions } from "../services/triviaApi";

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

const INIT = {
  screen: "home",
  questions: [],
  currentIndex: 0,
  selectedAnswers: [],
  score: 0,
  error: null,
  settings: {
    mode:       "general",   // "general" | "jamb"
    amount:     10,
    category:   0,
    difficulty: "",
    type:       "multiple",
    subject:    "mathematics",
  },
};

export function useQuiz() {
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
        // JAMB questions carry subject + year; general carry category
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
      setState(prev => ({
        ...prev,
        screen: "home",
        error: err.message,
      }));
    }
  }, []);

  const handleAnswer = useCallback((answer) => {
    if (lockedAnswer !== null) return;
    setState(prev => {
      const q        = prev.questions[prev.currentIndex];
      const isCorrect = answer === q.correct_answer;
      return {
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        selectedAnswers: [
          ...prev.selectedAnswers,
          {
            question: q.question,
            selected: answer,
            correct:  q.correct_answer,
            isCorrect,
            year:     q.year,
          },
        ],
      };
    });
    setLocked(answer);
  }, [lockedAnswer]);

  const handleNext = useCallback(() => {
    setLocked(null);
    setState(prev => {
      const next = prev.currentIndex + 1;
      return {
        ...prev,
        currentIndex: next,
        screen: next >= prev.questions.length ? "results" : "quiz",
      };
    });
  }, []);

  const restart = useCallback(() => {
    setLocked(null);
    setState(prev => ({ ...INIT, settings: prev.settings }));
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
