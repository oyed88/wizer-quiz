// ════════════════════════════════════════════════
//  FILE: src/pages/Quiz.jsx  (UPDATED — with timer)
//  PURPOSE: Active quiz question view
//
//  Timer behaviour:
//  • 20-second countdown per question
//  • Timer stops when user selects an answer
//  • Timer hits 0 → auto-selects "TIME'S UP"
//    which counts as wrong, then shows Next button
//  • Timer resets when Next is clicked
// ════════════════════════════════════════════════
import React, { useCallback } from "react";
import { ProgressBar, AnswerButton, DiffBadge } from "../components/QuizUI";
import TimerRing from "../components/TimerRing";
import { useTimer } from "../hooks/useTimer";

const SECONDS_PER_QUESTION = 20;

export default function Quiz({
  questions,
  currentIndex,
  lockedAnswer,
  onAnswer,
  onNext,
}) {
  const currentQuestion = questions[currentIndex];
  const isAnswered      = lockedAnswer !== null;
  const isLast          = currentIndex === questions.length - 1;

  // When timer hits 0, auto-answer with null (counts as wrong)
  const handleTimeUp = useCallback(() => {
    if (!isAnswered) onAnswer("__TIMEOUT__");
  }, [isAnswered, onAnswer]);

  const { timeLeft, pct, color, resetTimer, stopTimer } = useTimer(
    SECONDS_PER_QUESTION,
    handleTimeUp
  );

  // Stop timer when user picks an answer
  const handleSelect = (opt) => {
    if (isAnswered) return;
    stopTimer();
    onAnswer(opt);
  };

  // Reset timer when going to next question
  const handleNext = () => {
    resetTimer();
    onNext();
  };

  // Visual status per option
  const getStatus = (opt) => {
    if (!isAnswered) return null;
    if (opt === currentQuestion.correct_answer) return "correct";
    if (opt === lockedAnswer) return "wrong";
    return "dim";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Header: logo + difficulty + timer */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-2xl font-extrabold" style={{ fontFamily: "'Syne',sans-serif" }}>
            Wizer<span className="text-[#C8F135]">Quiz</span>
          </span>
          <div className="flex items-center gap-3">
            <DiffBadge difficulty={currentQuestion.difficulty} />
            <TimerRing timeLeft={timeLeft} pct={pct} color={color} total={SECONDS_PER_QUESTION} />
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar current={currentIndex + 1} total={questions.length} />

        {/* Category */}
        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-3">
          {currentQuestion.category}
        </p>

        {/* Question card */}
        <div
          key={currentIndex}
          className="bg-[#111122] border border-[#2A2A4A] rounded-2xl px-6 py-8 mb-6"
          style={{ animation: "fadeUp 0.35s ease forwards" }}
        >
          <p className="text-xl md:text-2xl font-semibold text-white leading-snug"
             style={{ fontFamily: "'Syne',sans-serif" }}>
            {currentQuestion.question}
          </p>
        </div>

        {/* Timeout banner */}
        {lockedAnswer === "__TIMEOUT__" && (
          <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm text-center font-mono">
            ⏰ Time's up! The correct answer was highlighted in green.
          </div>
        )}

        {/* Answer options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((opt, i) => (
            <AnswerButton
              key={opt}
              option={opt}
              index={i}
              status={getStatus(opt)}
              disabled={isAnswered}
              onClick={() => handleSelect(opt)}
            />
          ))}
        </div>

        {/* Next button — only after answering */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full bg-[#C8F135] hover:bg-[#d6f55a] active:bg-[#9FBF1A] text-[#0D0D0D]
                       font-extrabold text-lg py-4 rounded-xl transition-all duration-200
                       hover:scale-[1.01] active:scale-[0.99]"
            style={{ fontFamily: "'Syne',sans-serif", animation: "fadeUp 0.3s ease forwards" }}
          >
            {isLast ? "See Results →" : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}
