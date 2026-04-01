// ════════════════════════════════════════════════
//  FILE: src/pages/Home.jsx  (UPDATED)
//  CHANGES:
//  1. Timer duration selector added (10–60 seconds)
//  2. Mode toggle (General / JAMB)
//  3. Personalised greeting with user's name
// ════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { getCategories } from "../services/triviaApi";
import { JAMB_SUBJECTS } from "../data/jambQuestions";

const SELECT =
  "w-full bg-[#0D0D1A] border border-[#2A2A4A] text-gray-200 rounded-xl px-4 py-3 " +
  "focus:outline-none focus:border-[#C8F135] focus:ring-1 focus:ring-[#C8F135] " +
  "transition-colors cursor-pointer appearance-none text-sm";

// Timer options — seconds
const TIMER_OPTIONS = [
  { value: 10,  label: "10 seconds  ⚡ Lightning" },
  { value: 15,  label: "15 seconds  🔥 Fast" },
  { value: 20,  label: "20 seconds  ✅ Standard" },
  { value: 30,  label: "30 seconds  😌 Relaxed" },
  { value: 45,  label: "45 seconds  🐢 Easy" },
  { value: 60,  label: "60 seconds  🧘 No Rush" },
];

export default function Home({ settings, onUpdate, onStart, onGoHistory, error, userName }) {
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {}).finally(() => setCatLoading(false));
  }, []);

  const handle = (e) => {
    const { name, value } = e.target;
    const numericFields = ["amount", "category", "timerSeconds"];
    onUpdate({ [name]: numericFields.includes(name) ? Number(value) : value });
  };

  const isJamb = settings.mode === "jamb";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">

      {/* Hero */}
      <div className="text-center mb-8" style={{ animation: "fadeUp 0.4s ease forwards" }}>
        <span className="inline-flex items-center gap-2 bg-[#C8F135]/10 border
                         border-[#C8F135]/30 text-[#C8F135] text-xs font-mono
                         px-4 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8F135] animate-pulse" />
          {isJamb ? "JAMB / WAEC Mode — 2,311 Questions" : "Powered by Open Trivia DB"}
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}>
          {userName ? `Hey, ${userName.split(" ")[0]}! ⚡` : "WizerQuiz ⚡"}
        </h1>
        <p className="text-gray-400 text-base max-w-sm mx-auto">
          Pick your settings and beat the clock.
        </p>
      </div>

      {/* Settings Card */}
      <div className="w-full max-w-md bg-[#111122] border border-[#2A2A4A]
                      rounded-2xl p-8 shadow-2xl"
           style={{ animation: "fadeUp 0.5s ease forwards" }}>

        {/* Mode Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-[#2A2A4A] mb-6">
          {["general", "jamb"].map(m => (
            <button
              key={m}
              onClick={() => onUpdate({ mode: m })}
              className={`flex-1 py-2.5 text-sm font-bold transition-all duration-200
                ${settings.mode === m
                  ? "bg-[#C8F135] text-[#0D0D0D]"
                  : "bg-transparent text-gray-400 hover:text-white"}`}
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {m === "general" ? "🌍 General" : "🎓 JAMB / WAEC"}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-900/40 border border-red-700
                          text-red-300 rounded-xl px-4 py-3 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">

          {/* JAMB: Subject */}
          {isJamb && (
            <div>
              <label className="block text-gray-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <select name="subject" value={settings.subject} onChange={handle} className={SELECT}>
                {JAMB_SUBJECTS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* General: Category */}
          {!isJamb && (
            <div>
              <label className="block text-gray-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select name="category" value={settings.category} onChange={handle} className={SELECT}>
                <option value={0}>Any Category</option>
                {catLoading
                  ? <option disabled>Loading...</option>
                  : categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                }
              </select>
            </div>
          )}

          {/* Number of Questions */}
          <div>
            <label className="block text-gray-400 text-xs font-mono uppercase tracking-wider mb-1.5">
              Number of Questions
            </label>
            <select name="amount" value={settings.amount} onChange={handle} className={SELECT}>
              {[5, 10, 15, 20].map(n => (
                <option key={n} value={n}>{n} Questions</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-gray-400 text-xs font-mono uppercase tracking-wider mb-1.5">
              Difficulty
            </label>
            <select name="difficulty" value={settings.difficulty} onChange={handle} className={SELECT}>
              <option value="">Any Difficulty</option>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          </div>

          {/* ── NEW: Timer Duration ── */}
          <div>
            <label className="block text-gray-400 text-xs font-mono uppercase tracking-wider mb-1.5">
              Timer Per Question
            </label>
            <select name="timerSeconds" value={settings.timerSeconds} onChange={handle} className={SELECT}>
              {TIMER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Question Type — General only */}
          {!isJamb && (
            <div>
              <label className="block text-gray-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                Question Type
              </label>
              <select name="type" value={settings.type} onChange={handle} className={SELECT}>
                <option value="multiple">Multiple Choice</option>
                <option value="boolean">True / False</option>
                <option value="">Mixed</option>
              </select>
            </div>
          )}
        </div>

        {/* Start Button */}
        <button
          onClick={() => onStart(settings)}
          className="mt-6 w-full bg-[#C8F135] hover:bg-[#d6f55a] active:bg-[#9FBF1A]
                     text-[#0D0D0D] font-extrabold text-lg py-4 rounded-xl
                     transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {isJamb ? "Start JAMB Practice ⚡" : "Start Quiz ⚡"}
        </button>

        {/* History Button */}
        <button
          onClick={onGoHistory}
          className="mt-3 w-full bg-transparent border border-[#2A2A4A]
                     hover:border-[#C8F135] text-gray-400 hover:text-[#C8F135]
                     font-bold py-3 rounded-xl transition-all duration-200 text-sm"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          📊 My Score History & Leaderboard
        </button>
      </div>
    </div>
  );
}
