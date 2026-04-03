// ════════════════════════════════════════════════
//  FILE: src/hooks/useQuiz.js  (FIREBASE VERSION)
//  REPLACES: the localStorage-based useQuiz.js
//
//  Changes from localStorage version:
//  — Scores saved to Firestore instead of localStorage
//  — Leaderboard reads from Firestore (real users)
//  — getHistory() and getLeaderboard() fetch from Firestore
// ════════════════════════════════════════════════
import { useState, useCallback } from "react";
import { getQuestions }          from "../services/triviaApi";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";

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

// ── Firestore Score Helpers ───────────────────────

// Save a score to Firestore under scores/{uid}/entries
export async function saveScoreToFirestore(uid, userName, entry) {
  try {
    // 1. Add the score entry
    await addDoc(collection(db, "scores", uid, "entries"), {
      ...entry,
      userName,
      createdAt: serverTimestamp(),
    });

    // 2. Update the user's total quiz count and best score
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      totalQuizzes: increment(1),
      lastSeen:     serverTimestamp(),
    });

    // 3. Add to the global leaderboard collection
    await addDoc(collection(db, "leaderboard"), {
      uid,
      userName,
      ...entry,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to save score to Firestore:", err);
  }
}

// Fetch a user's last 50 scores from Firestore
export async function getHistoryFromFirestore(uid) {
  try {
    const q = query(
      collection(db, "scores", uid, "entries"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

// Fetch top 100 from the global leaderboard
export async function getLeaderboardFromFirestore() {
  try {
    const q = query(
      collection(db, "leaderboard"),
      orderBy("pct", "desc"),
      limit(100)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

// ── Initial State ─────────────────────────────────
const INIT = {
  screen: "home",
  questions: [],
  currentIndex: 0,
  selectedAnswers: [],
  score: 0,
  error: null,
  settings: {
    mode:         "general",
    amount:       10,
    category:     0,
    difficulty:   "",
    type:         "multiple",
    subject:      "mathematics",
    timerSeconds: 20,
  },
};

// ── Main Hook ─────────────────────────────────────
export function useQuiz(user) {
  const [state, setState]         = useState(INIT);
  const [lockedAnswer, setLocked] = useState(null);

  const updateSettings = useCallback((patch) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...patch } }));
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
        category: q.subject
          ? `${q.subject.toUpperCase()} — ${q.year || ""}`
          : decodeHTML(q.category || ""),
        type:  q.type || "multiple",
        year:  q.year || null,
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
      const next        = prev.currentIndex + 1;
      const goToResults = next >= prev.questions.length;

      if (goToResults && user) {
        const finalScore = prev.score;
        const total      = prev.questions.length;
        const pct        = Math.round((finalScore / total) * 100);

        const entry = {
          score:      finalScore,
          total,
          pct,
          mode:       prev.settings.mode,
          subject:    prev.settings.mode === "jamb" ? prev.settings.subject : "General",
          difficulty: prev.settings.difficulty || "any",
          timer:      prev.settings.timerSeconds,
          date:       new Date().toISOString(),
        };

        // Save to Firestore (async, fire and forget)
        saveScoreToFirestore(user.uid, user.name, entry);
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
