// ════════════════════════════════════════════════
//  FILE: src/pages/History.jsx  (FIREBASE VERSION)
//  REPLACES: the localStorage-based History.jsx
//
//  Changes:
//  — Fetches score history from Firestore
//  — Fetches leaderboard from Firestore (all users)
//  — Shows real registered user names on leaderboard
// ════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import {
  getHistoryFromFirestore,
  getLeaderboardFromFirestore,
} from "../hooks/useQuiz";

// ── Helpers ───────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = iso?.toDate ? iso.toDate() : new Date(iso);
    return d.toLocaleDateString("en-NG", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

function ratingColor(pct) {
  if (pct >= 90) return "text-[#C8F135]";
  if (pct >= 70) return "text-green-400";
  if (pct >= 50) return "text-yellow-400";
  if (pct >= 30) return "text-orange-400";
  return "text-red-400";
}

function SubjectBadge({ subject, mode }) {
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded-full capitalize
      ${mode === "jamb"
        ? "bg-[#C8F135]/10 border border-[#C8F135]/30 text-[#C8F135]"
        : "bg-blue-900/40 border border-blue-700 text-blue-300"}`}>
      {mode === "jamb" ? subject : "General"}
    </span>
  );
}

function ScoreCard({ entry, index, showName }) {
  const pct = entry.pct ?? Math.round((entry.score / entry.total) * 100);
  return (
    <div className="bg-[#111122] border border-[#2A2A4A] rounded-xl p-4
                    flex items-center gap-4 hover:border-[#C8F135]/30 transition-colors">
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center
                       justify-center text-sm font-bold font-mono
                       ${index === 0 ? "bg-[#C8F135] text-[#0D0D0D]" :
                         index === 1 ? "bg-gray-400 text-[#0D0D0D]" :
                         index === 2 ? "bg-amber-700 text-white" :
                                       "bg-[#1A1A2E] text-gray-400"}`}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        {showName && (
          <p className="text-white text-sm font-bold truncate">
            {entry.userName || "Anonymous"}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          <SubjectBadge subject={entry.subject} mode={entry.mode} />
          {entry.difficulty && entry.difficulty !== "any" && (
            <span className="text-xs text-gray-500 font-mono capitalize">{entry.difficulty}</span>
          )}
          {entry.timer && (
            <span className="text-xs text-gray-600 font-mono">⏱ {entry.timer}s</span>
          )}
        </div>
        <p className="text-gray-600 text-xs mt-1">
          {formatDate(entry.createdAt || entry.date)}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className={`text-2xl font-extrabold ${ratingColor(pct)}`}
           style={{ fontFamily: "'Syne',sans-serif" }}>
          {pct}%
        </p>
        <p className="text-gray-500 text-xs font-mono">{entry.score}/{entry.total}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────
export default function History({ user, onBack }) {
  const [tab,     setTab]     = useState("history");
  const [history, setHistory] = useState([]);
  const [board,   setBoard]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (user?.uid) {
        const [h, b] = await Promise.all([
          getHistoryFromFirestore(user.uid),
          getLeaderboardFromFirestore(),
        ]);
        setHistory(h);
        setBoard(b);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const avgPct  = history.length
    ? Math.round(history.reduce((s, e) => s + (e.pct ?? 0), 0) / history.length) : null;
  const bestPct = history.length
    ? Math.max(...history.map(e => e.pct ?? 0)) : null;

  const Spinner = () => (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-[#C8F135] border-t-transparent
                      rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack}
                  className="text-gray-400 hover:text-[#C8F135] transition-colors text-sm font-mono">
            ← Back
          </button>
          <h1 className="text-2xl font-extrabold"
              style={{ fontFamily: "'Syne',sans-serif" }}>
            Wizer<span className="text-[#C8F135]">Quiz</span>
          </h1>
          <div className="w-16" />
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-[#2A2A4A] mb-6">
          {[{ id: "history", label: "📋 My History" }, { id: "leaderboard", label: "🏆 Leaderboard" }]
            .map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                      className={`flex-1 py-3 text-sm font-bold transition-all
                        ${tab === t.id ? "bg-[#C8F135] text-[#0D0D0D]" : "bg-transparent text-gray-400 hover:text-white"}`}
                      style={{ fontFamily: "'Syne',sans-serif" }}>
                {t.label}
              </button>
            ))}
        </div>

        {loading ? <Spinner /> : (
          <>
            {/* ── MY HISTORY ── */}
            {tab === "history" && (
              <>
                {history.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: "Quizzes", value: history.length, color: "text-white" },
                      { label: "Average", value: `${avgPct}%`,   color: ratingColor(avgPct) },
                      { label: "Best",    value: `${bestPct}%`,  color: ratingColor(bestPct) },
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

                {history.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-4xl mb-4">📭</p>
                    <p className="text-gray-400 text-lg font-bold"
                       style={{ fontFamily: "'Syne',sans-serif" }}>No quizzes yet</p>
                    <p className="text-gray-600 text-sm mt-2">Complete a quiz to see your history here.</p>
                    <button onClick={onBack}
                            className="mt-6 bg-[#C8F135] text-[#0D0D0D] font-bold px-6 py-3
                                       rounded-xl hover:bg-[#d6f55a] transition-all"
                            style={{ fontFamily: "'Syne',sans-serif" }}>
                      Start a Quiz ⚡
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((entry, i) => (
                      <ScoreCard key={entry.id || i} entry={entry} index={i} showName={false} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── LEADERBOARD ── */}
            {tab === "leaderboard" && (
              <>
                <p className="text-gray-500 text-xs font-mono mb-4">
                  Top scores from all registered users
                </p>

                {board.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-4xl mb-4">🏆</p>
                    <p className="text-gray-400 text-lg font-bold"
                       style={{ fontFamily: "'Syne',sans-serif" }}>No scores yet</p>
                    <p className="text-gray-600 text-sm mt-2">Be the first to complete a quiz!</p>
                  </div>
                ) : (
                  <>
                    {/* Top 3 podium */}
                    {board.length >= 3 && (
                      <div className="bg-[#C8F135]/5 border border-[#C8F135]/20 rounded-2xl p-4 mb-6">
                        <p className="text-[#C8F135] text-xs font-mono uppercase tracking-widest mb-3 text-center">
                          🏆 Top 3 All Time
                        </p>
                        <div className="flex items-end justify-center gap-3">
                          {/* 2nd */}
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-[#0D0D0D] font-bold text-sm mb-1">2</div>
                            <p className="text-white text-xs font-bold truncate max-w-[70px] text-center">
                              {board[1]?.userName?.split(" ")[0]}
                            </p>
                            <p className="text-gray-400 text-xs">{board[1]?.pct}%</p>
                            <div className="w-16 h-14 bg-gray-700 rounded-t-lg mt-1 flex items-center justify-center text-gray-300 font-bold">🥈</div>
                          </div>
                          {/* 1st */}
                          <div className="flex flex-col items-center -mb-2">
                            <div className="w-10 h-10 rounded-full bg-[#C8F135] flex items-center justify-center text-[#0D0D0D] font-bold mb-1">1</div>
                            <p className="text-white text-xs font-bold truncate max-w-[80px] text-center">
                              {board[0]?.userName?.split(" ")[0]}
                            </p>
                            <p className="text-[#C8F135] text-xs font-bold">{board[0]?.pct}%</p>
                            <div className="w-20 h-20 bg-[#C8F135]/20 border border-[#C8F135]/40 rounded-t-lg mt-1 flex items-center justify-center text-2xl">🥇</div>
                          </div>
                          {/* 3rd */}
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-sm mb-1">3</div>
                            <p className="text-white text-xs font-bold truncate max-w-[70px] text-center">
                              {board[2]?.userName?.split(" ")[0]}
                            </p>
                            <p className="text-gray-400 text-xs">{board[2]?.pct}%</p>
                            <div className="w-16 h-10 bg-amber-900/40 rounded-t-lg mt-1 flex items-center justify-center text-amber-600 font-bold">🥉</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {board.map((entry, i) => (
                        <ScoreCard key={entry.id || i} entry={entry} index={i} showName={true} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
