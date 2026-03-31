// ════════════════════════════════════════════════
//  FILE: src/pages/Results.jsx  (UPDATED)
//  PURPOSE: Final score screen — now shows
//           subject breakdown for JAMB mode and
//           a motivational JAMB-specific message
// ════════════════════════════════════════════════
import React, { useState } from "react";
import { ScoreDonut } from "../components/QuizUI";

export default function Results({
  score,
  questions,
  selectedAnswers,
  onRestart,
}) {
  const [showReview, setShowReview] = useState(false);
  const total   = questions.length;
  const pct     = total > 0 ? Math.round((score / total) * 100) : 0;
  const isJamb  = questions[0]?.year !== null && questions[0]?.year !== undefined;

  // JAMB-specific motivational message
  const jambMessage =
    pct >= 70 ? "🏆 Excellent! You're on track to ace JAMB!" :
    pct >= 50 ? "👍 Good effort! Keep practicing daily." :
    pct >= 30 ? "💪 You're getting there. Review your weak areas." :
                "📖 More practice needed. Don't give up!";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">

        {/* Header */}
        <h1
          className="text-center text-3xl font-extrabold text-white mb-2"
          style={{ fontFamily: "'Syne',sans-serif" }}
        >
          Wizer<span className="text-[#C8F135]">Quiz</span> — Results
        </h1>
        {isJamb && (
          <p className="text-center text-gray-500 text-sm font-mono mb-6">
            JAMB / WAEC Practice Session
          </p>
        )}

        {/* Score donut */}
        <div className="bg-[#111122] border border-[#2A2A4A] rounded-2xl p-8 text-center mb-4">
          <ScoreDonut score={score} total={total} />

          {/* JAMB motivational message */}
          {isJamb && (
            <p className="mt-4 text-sm font-body text-gray-400 bg-[#1A1A2E]
                          rounded-xl px-4 py-3 border border-[#2A2A4A]">
              {jambMessage}
            </p>
          )}
        </div>

        {/* JAMB breakdown — how many correct vs wrong */}
        {isJamb && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Correct",   value: score,         color: "text-green-400", bg: "bg-green-900/20 border-green-800" },
              { label: "Wrong",     value: total - score, color: "text-red-400",   bg: "bg-red-900/20 border-red-800" },
              { label: "Score",     value: `${pct}%`,     color: "text-[#C8F135]", bg: "bg-[#C8F135]/10 border-[#C8F135]/30" },
            ].map((s) => (
              <div key={s.label}
                   className={`rounded-xl border p-4 text-center ${s.bg}`}>
                <p className={`text-2xl font-extrabold ${s.color}`}
                   style={{ fontFamily: "'Syne',sans-serif" }}>
                  {s.value}
                </p>
                <p className="text-gray-500 text-xs mt-1 font-mono">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={onRestart}
            className="flex-1 bg-[#C8F135] hover:bg-[#d6f55a] text-[#0D0D0D]
                       font-extrabold py-4 rounded-xl transition-all hover:scale-[1.02]"
            style={{ fontFamily: "'Syne',sans-serif" }}
          >
            ⚡ {isJamb ? "Practice Again" : "Play Again"}
          </button>
          <button
            onClick={() => setShowReview(v => !v)}
            className="flex-1 border border-[#2A2A4A] hover:border-[#C8F135]
                       text-gray-300 hover:text-[#C8F135] font-bold py-4 rounded-xl transition-all"
            style={{ fontFamily: "'Syne',sans-serif" }}
          >
            {showReview ? "Hide Review" : "Review Answers"}
          </button>
        </div>

        {/* Answer review */}
        {showReview && (
          <div className="space-y-4">
            {selectedAnswers.map((a, i) => (
              <div
                key={i}
                className={`rounded-xl border p-5
                  ${a.isCorrect
                    ? "border-green-700 bg-green-900/20"
                    : "border-red-700 bg-red-900/20"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-mono text-gray-500">Q{i + 1}</p>
                  {a.year && (
                    <span className="text-xs font-mono bg-[#C8F135]/10
                                     text-[#C8F135] px-2 py-0.5 rounded-full">
                      JAMB {a.year}
                    </span>
                  )}
                </div>
                <p className="text-white text-sm mb-3 leading-snug">{a.question}</p>
                <div className="text-sm space-y-1">
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-gray-500">Your answer:</span>
                    <span className={a.isCorrect ? "text-green-400" : "text-red-400"}>
                      {a.selected === "__TIMEOUT__" ? "⏰ Timed out" : a.selected}
                      {" "}{a.isCorrect ? "✓" : "✗"}
                    </span>
                  </div>
                  {!a.isCorrect && (
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-gray-500">Correct answer:</span>
                      <span className="text-green-400">{a.correct}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
