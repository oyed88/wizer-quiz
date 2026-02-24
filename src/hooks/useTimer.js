// ════════════════════════════════════════════════
//  FILE: src/hooks/useTimer.js
//  PURPOSE: Per-question countdown timer
//
//  Usage in Quiz.jsx:
//    const { timeLeft, resetTimer } = useTimer(20, onTimeUp);
//    - seconds: time allowed per question (default 20)
//    - onTimeUp: called when timer hits 0
//    - resetTimer(): call when moving to next question
// ════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer(seconds = 20, onTimeUp) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [active, setActive]     = useState(true);
  const intervalRef             = useRef(null);

  // Tick every second
  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setActive(false);
          onTimeUp && onTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active, onTimeUp]);

  // Call this when moving to the next question
  const resetTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setTimeLeft(seconds);
    setActive(true);
  }, [seconds]);

  // Call this to freeze the timer (after answer selected)
  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setActive(false);
  }, []);

  // Percentage remaining for ring animation
  const pct = (timeLeft / seconds) * 100;

  // Color: green → yellow → red
  const color =
    pct > 50 ? "#4ade80" :
    pct > 25 ? "#facc15" :
               "#f87171";

  return { timeLeft, pct, color, resetTimer, stopTimer };
}
