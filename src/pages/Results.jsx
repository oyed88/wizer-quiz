// ════════════════════════════════════════════════
//  FILE: src/pages/Results.jsx
//  PURPOSE: Final score screen with answer review
// ════════════════════════════════════════════════
import React, { useState } from "react";
import { ScoreDonut } from "../components/QuizUI";

export default function Results({ score, questions, selectedAnswers, onRestart }) {
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">

        {/* Header */}
        <h1 className="text-center text-3xl font-extrabold text-white mb-8"
            style={{ fontFamily: "'Syne',sans-serif" }}>
          Wizer<span className="text-[#C8F135]">Quiz</span> — Results
        </h1>

        {/* Score donut card */}
        <div className="bg-[#111122] border border-[#2A2A4A] rounded-2xl p-8 text-center mb-6">
          <ScoreDonut score={score} total={questions.length} />
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={onRestart}
            className="flex-1 bg-[#C8F135] hover:bg-[#d6f55a] text-[#0D0D0D] font-extrabold py-4 rounded-xl transition-all hover:scale-[1.02]"
            style={{ fontFamily: "'Syne',sans-serif" }}
          >
            ⚡ Play Again
          </button>
          <button
            onClick={() => setShowReview(v => !v)}
            className="flex-1 border border-[#2A2A4A] hover:border-[#C8F135] text-gray-300 hover:text-[#C8F135] font-bold py-4 rounded-xl transition-all"
            style={{ fontFamily: "'Syne',sans-serif" }}
          >
            {showReview ? "Hide Review" : "Review Answers"}
          </button>
        </div>

        {/* Answer review list */}
        {showReview && (
          <div className="space-y-4">
            {selectedAnswers.map((a, i) => (
              <div key={i}
                   className={`rounded-xl border p-5 ${a.isCorrect ? "border-green-700 bg-green-900/20" : "border-red-700 bg-red-900/20"}`}>
                <p className="text-xs font-mono text-gray-500 mb-2">Q{i + 1}</p>
                <p className="text-white text-sm mb-3 leading-snug">{a.question}</p>
                <div className="text-sm space-y-1">
                  <div className="flex gap-2">
                    <span className="text-gray-500">Your answer:</span>
                    <span className={a.isCorrect ? "text-green-400" : "text-red-400"}>
                      {a.selected} {a.isCorrect ? "✓" : "✗"}
                    </span>
                  </div>
                  {!a.isCorrect && (
                    <div className="flex gap-2">
                      <span className="text-gray-500">Correct:</span>
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
