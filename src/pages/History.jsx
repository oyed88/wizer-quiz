// ════════════════════════════════════════════════
//  FILE: src/pages/History.jsx  (NEW FILE)
//  PURPOSE: Shows the user's personal score history
//           and the global leaderboard
//  Two tabs: My History | Leaderboard
// ════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { getHistory, getLeaderboard, clearHistory } from "../hooks/useQuiz";

// ── Helpers ───────────────────────────────────────
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function ratingColor(pct) {
  if (pct >= 90) return "text-[#C8F135]";
  if (pct >= 70) return "text-green-400";
  if (pct >= 50) return "text-yellow-400";
  if (pct >= 30) return "text-orange-400";
  return "text-red-400";
}

function ratingLabel(pct) {
  if (pct >= 90) return "Outstanding 🏆";
  if (pct >= 70) return "Great 🎉";
  if (pct >= 50) return "Not Bad 👍";
  if (pct >= 30) return "Keep Going 💪";
  return "Try Again 🔄";
}

function SubjectBadge({ subject, mode }) {
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded-full
      ${mode === "jamb"
        ? "bg-[#C8F135]/10 border border-[#C8F135]/30 text-[#C8F135] capitalize"
        : "bg-blue-900/40 border border-blue-700 text-blue-300"}`}>
      {mode === "jamb" ? subject : "General"}
    </span>
  );
}

// ── Score Card ─────────────────────────────────────
function ScoreCard({ entry, index, showName = false }) {
  const pct = entry.pct ?? Math.round((entry.score / entry.total) * 100);
  return (
    <div className="bg-[#111122] border border-[#2A2A4A] rounded-xl p-4
                    flex items-center gap-4 hover:border-[#C8F135]/30 transition-colors">
      {/* Rank number */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center
                       justify-center text-sm font-bold font-mono
                       ${index === 0 ? "bg-[#C8F135] text-[#0D0D0D]" :
                         index === 1 ? "bg-gray-400 text-[#0D0D0D]" :
                         index === 2 ? "bg-amber-700 text-white" :
                         "bg-[#1A1A2E] text-gray-400"}`}>
        {index + 1}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {showName && (
          <p className="text-white text-sm font-bold truncate">
            {entry.name}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          <SubjectBadge subject={entry.subject} mode={entry.mode} />
          {entry.difficulty && entry.difficulty !== "any" && (
            <span className="text-xs text-gray-500 font-mono capitalize">
              {entry.difficulty}
            </span>
          )}
          {entry.timer && (
            <span className="text-xs text-gray-600 font-mono">
              ⏱ {entry.timer}s
            </span>
          )}
        </div>
        <p className="text-gray-600 text-xs mt-1">{formatDate(entry.date)}</p>
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-right">
        <p className={`text-2xl font-extrabold ${ratingColor(pct)}`}
           style={{ fontFamily: "'Syne',sans-serif" }}>
          {pct}%
        </p>
        <p className="text-gray-500 text-xs font-mono">
          {entry.score}/{entry.total}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────
export default function History({ user, onBack }) {
  const [tab, setTab]         = useState("history"); // "history" | "leaderboard"
  const [history, setHistory] = useState([]);
  const [board, setBoard]     = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user?.email) setHistory(getHistory(user.email));
    setBoard(getLeaderboard());
  }, [user]);

  const handleClear = () => {
    clearHistory(user.email);
    setHistory([]);
    setShowConfirm(false);
  };

  // ── Stats summary ─────────────────────────────────
  const avgPct = history.length
    ? Math.round(history.reduce((s, e) => s + (e.pct ?? 0), 0) / history.length)
    : null;
  const bestPct = history.length
    ? Math.max(...history.map(e => e.pct ?? 0))
    : null;
  const totalQuizzes = history.length;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-[#C8F135]
                       transition-colors text-sm font-mono"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-extrabold text-white"
              style={{ fontFamily: "'Syne',sans-serif" }}>
            Wizer<span className="text-[#C8F135]">Quiz</span>
          </h1>
          <div className="w-16" /> {/* spacer */}
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-[#2A2A4A] mb-6">
          {[
            { id: "history",     label: "📋 My History" },
            { id: "leaderboard", label: "🏆 Leaderboard" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-bold transition-all duration-200
                ${tab === t.id
                  ? "bg-[#C8F135] text-[#0D0D0D]"
                  : "bg-transparent text-gray-400 hover:text-white"}`}
              style={{ fontFamily: "'Syne',sans-serif" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── MY HISTORY TAB ── */}
        {tab === "history" && (
          <>
            {/* Stats summary */}
            {history.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Quizzes",  value: totalQuizzes, color: "text-white" },
                  { label: "Average",  value: `${avgPct}%`, color: ratingColor(avgPct) },
                  { label: "Best",     value: `${bestPct}%`, color: ratingColor(bestPct) },
                ].map(s => (
                  <div key={s.label}
                       className="bg-[#111122] border border-[#2A2A4A] rounded-xl p-4 text-center">
                    <p className={`text-2xl font-extrabold ${s.color}`}
                       style={{ fontFamily: "'Syne',sans-serif" }}>
                      {s.value}
                    </p>
                    <p className="text-gray-500 text-xs font-mono mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* History list */}
            {history.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">📭</p>
                <p className="text-gray-400 text-lg font-bold"
                   style={{ fontFamily: "'Syne',sans-serif" }}>
                  No quizzes yet
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Complete a quiz to see your history here.
                </p>
                <button
                  onClick={onBack}
                  className="mt-6 bg-[#C8F135] text-[#0D0D0D] font-bold px-6 py-3
                             rounded-xl hover:bg-[#d6f55a] transition-all"
                  style={{ fontFamily: "'Syne',sans-serif" }}
                >
                  Start a Quiz ⚡
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {history.map((entry, i) => (
                    <ScoreCard key={i} entry={entry} index={i} showName={false} />
                  ))}
                </div>

                {/* Clear history */}
                {!showConfirm ? (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full border border-red-800 text-red-500 hover:bg-red-900/20
                               py-3 rounded-xl text-sm font-mono transition-all"
                  >
                    🗑 Clear My History
                  </button>
                ) : (
                  <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-center">
                    <p className="text-red-300 text-sm mb-3">
                      Are you sure? This cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleClear}
                        className="bg-red-700 hover:bg-red-600 text-white font-bold
                                   px-5 py-2 rounded-lg text-sm transition-all"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="border border-[#2A2A4A] text-gray-400 hover:text-white
                                   px-5 py-2 rounded-lg text-sm transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {tab === "leaderboard" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm font-mono">
                Top scores from all users on this device
              </p>
            </div>

            {board.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">🏆</p>
                <p className="text-gray-400 text-lg font-bold"
                   style={{ fontFamily: "'Syne',sans-serif" }}>
                  No scores yet
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Be the first to complete a quiz!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Top 3 podium highlight */}
                {board.length >= 3 && (
                  <div className="bg-[#C8F135]/5 border border-[#C8F135]/20
                                  rounded-2xl p-4 mb-6">
                    <p className="text-[#C8F135] text-xs font-mono uppercase
                                  tracking-widest mb-3 text-center">
                      🏆 Top 3 All Time
                    </p>
                    <div className="flex items-end justify-center gap-3">
                      {/* 2nd place */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center
                                        justify-center text-[#0D0D0D] font-bold text-sm mb-1">
                          2
                        </div>
                        <p className="text-white text-xs font-bold truncate max-w-[70px] text-center">
                          {board[1]?.name?.split(" ")[0]}
                        </p>
                        <p className="text-gray-400 text-xs">{board[1]?.pct}%</p>
                        <div className="w-16 h-14 bg-gray-700 rounded-t-lg mt-1 flex items-center
                                        justify-center text-gray-300 font-bold">
                          🥈
                        </div>
                      </div>
                      {/* 1st place */}
                      <div className="flex flex-col items-center -mb-2">
                        <div className="w-10 h-10 rounded-full bg-[#C8F135] flex items-center
                                        justify-center text-[#0D0D0D] font-bold mb-1">
                          1
                        </div>
                        <p className="text-white text-xs font-bold truncate max-w-[80px] text-center">
                          {board[0]?.name?.split(" ")[0]}
                        </p>
                        <p className="text-[#C8F135] text-xs font-bold">{board[0]?.pct}%</p>
                        <div className="w-20 h-20 bg-[#C8F135]/20 border border-[#C8F135]/40
                                        rounded-t-lg mt-1 flex items-center justify-center
                                        text-2xl">
                          🥇
                        </div>
                      </div>
                      {/* 3rd place */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center
                                        justify-center text-white font-bold text-sm mb-1">
                          3
                        </div>
                        <p className="text-white text-xs font-bold truncate max-w-[70px] text-center">
                          {board[2]?.name?.split(" ")[0]}
                        </p>
                        <p className="text-gray-400 text-xs">{board[2]?.pct}%</p>
                        <div className="w-16 h-10 bg-amber-900/40 rounded-t-lg mt-1 flex items-center
                                        justify-center text-amber-600 font-bold">
                          🥉
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full list */}
                {board.map((entry, i) => (
                  <ScoreCard key={i} entry={entry} index={i} showName={true} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
 