// ════════════════════════════════════════════════
//  FILE: src/hooks/useTimer.js  (UPDATED)
//  CHANGE: seconds param now comes from settings
//  instead of being hardcoded to 20.
//  Usage: const timer = useTimer(settings.timerSeconds, onTimeUp)
// ════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer(seconds = 20, onTimeUp) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [active, setActive]     = useState(true);
  const intervalRef             = useRef(null);

  // Reset when seconds changes (new question or new game)
  useEffect(() => {
    setTimeLeft(seconds);
    setActive(true);
  }, [seconds]);

  // Countdown tick
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

  // Call when moving to next question
  const resetTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setTimeLeft(seconds);
    setActive(true);
  }, [seconds]);

  // Call when answer is selected — freeze the timer
  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setActive(false);
  }, []);

  const pct = (timeLeft / seconds) * 100;

  const color =
    pct > 50 ? "#4ade80" :
    pct > 25 ? "#facc15" :
               "#f87171";

  return { timeLeft, pct, color, resetTimer, stopTimer };
}
