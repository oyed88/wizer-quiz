// ════════════════════════════════════════════════
//  FILE: src/components/QuizUI.jsx
//  PURPOSE: Reusable UI primitives for the quiz
//  Contains: ProgressBar, AnswerButton, Badge
// ════════════════════════════════════════════════
import React from "react";

// ── Progress Bar ──────────────────────────────────
export function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between text-xs text-gray-500 font-mono mb-1.5">
        <span>Question {current} of {total}</span>
        <span className="text-[#C8F135] font-bold">{pct}%</span>
      </div>
      <div className="h-1.5 bg-[#1A1A2E] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#C8F135] rounded-full"
          style={{ width: `${pct}%`, transition: "width 0.5s ease" }}
        />
      </div>
    </div>
  );
}

// ── Answer Button ─────────────────────────────────
const LETTER = ["A", "B", "C", "D"];

export function AnswerButton({ option, index, status, onClick, disabled }) {
  // status: null | "correct" | "wrong" | "dim"
  const styles = {
    null:    "bg-[#1A1A2E] border-[#2A2A4A] text-gray-200 hover:border-[#C8F135] hover:bg-[#1e1e3a]",
    correct: "bg-green-900/50 border-green-500 text-green-200",
    wrong:   "bg-red-900/40  border-red-500   text-red-300 opacity-70",
    dim:     "bg-[#1A1A2E]  border-[#1A1A2E]  text-gray-600 opacity-40",
  };
  const badgeStyles = {
    null:    "bg-[#2A2A4A] text-gray-400",
    correct: "bg-green-600 text-white",
    wrong:   "bg-red-700   text-white",
    dim:     "bg-[#1A1A2E] text-gray-700",
  };
  const icon = status === "correct" ? "✓" : status === "wrong" ? "✗" : LETTER[index] ?? "?";
  const s = status ?? "null";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-4 text-left px-5 py-4 rounded-xl border
        font-sans text-sm transition-all duration-200
        disabled:cursor-not-allowed
        ${styles[s]}
        ${!disabled ? "hover:-translate-y-px" : ""}`}
    >
      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-mono ${badgeStyles[s]}`}>
        {icon}
      </span>
      <span className="flex-1 leading-snug">{option}</span>
    </button>
  );
}

// ── Difficulty Badge ──────────────────────────────
export function DiffBadge({ difficulty }) {
  const map = {
    easy:   "bg-green-900/60  text-green-300  border-green-700",
    medium: "bg-yellow-900/60 text-yellow-300 border-yellow-700",
    hard:   "bg-red-900/60    text-red-300    border-red-700",
  };
  return (
    <span className={`text-xs font-mono px-3 py-1 rounded-full border capitalize ${map[difficulty] || "bg-gray-800 text-gray-400 border-gray-600"}`}>
      {difficulty}
    </span>
  );
}

// ── Score Donut ───────────────────────────────────
export function ScoreDonut({ score, total }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  const rating =
    pct >= 90 ? { label: "Outstanding! 🏆", color: "#C8F135" } :
    pct >= 70 ? { label: "Great Job! 🎉",   color: "#4ade80" } :
    pct >= 50 ? { label: "Not Bad! 👍",     color: "#facc15" } :
    pct >= 30 ? { label: "Keep Going! 💪",  color: "#fb923c" } :
                { label: "Try Again! 🔄",   color: "#f87171" };

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={r} fill="none" stroke="#1A1A2E" strokeWidth="12" />
        <circle
          cx="75" cy="75" r={r} fill="none"
          stroke={rating.color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 75 75)"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x="75" y="70"  textAnchor="middle" fill="#F0F0F0" fontSize="28" fontFamily="Syne" fontWeight="800">{pct}%</text>
        <text x="75" y="90" textAnchor="middle" fill="#666"    fontSize="12" fontFamily="DM Sans">{score}/{total} correct</text>
      </svg>
      <p className="text-xl font-bold" style={{ color: rating.color }}>{rating.label}</p>
    </div>
  );
}
