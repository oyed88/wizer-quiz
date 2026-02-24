// ════════════════════════════════════════════════
//  FILE: src/pages/Home.jsx (UPDATED)
//  Shows personalised greeting when user is logged in
// ════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { getCategories } from "../services/triviaApi";

const SELECT =
  "w-full bg-[#1A1A2E] border border-[#2A2A4A] text-gray-200 rounded-xl px-4 py-3 " +
  "focus:outline-none focus:border-[#C8F135] focus:ring-1 focus:ring-[#C8F135] " +
  "transition-colors cursor-pointer appearance-none";

export default function Home({ settings, onUpdate, onStart, error, userName }) {
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {}).finally(() => setCatLoading(false));
  }, []);

  const handle = e => {
    const { name, value } = e.target;
    onUpdate({ [name]: name === "amount" || name === "category" ? Number(value) : value });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-10" style={{ animation: "fadeUp 0.4s ease forwards" }}>
        <span className="inline-flex items-center gap-2 bg-[#C8F135]/10 border border-[#C8F135]/30
                         text-[#C8F135] text-xs font-mono px-4 py-1.5 rounded-full mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8F135] animate-pulse" />
          Powered by Open Trivia DB
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-3"
            style={{ fontFamily: "'Syne', sans-serif" }}>
          {userName ? `Hey, ${userName.split(" ")[0]}! ⚡` : "WizerQuiz ⚡"}
        </h1>
        <p className="text-gray-400 text-lg max-w-sm mx-auto">
          Pick your settings and beat the clock.
        </p>
      </div>

      {/* Settings card */}
      <div className="w-full max-w-md bg-[#111122] border border-[#2A2A4A] rounded-2xl p-8 shadow-2xl"
           style={{ animation: "fadeUp 0.5s ease forwards" }}>
        <h2 className="text-lg font-bold text-white mb-6" style={{ fontFamily: "'Syne',sans-serif" }}>
          Configure Your Quiz
        </h2>

        {error && (
          <div className="mb-5 bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Number of Questions</label>
            <select name="amount" value={settings.amount} onChange={handle} className={SELECT}>
              {[5, 10, 15, 20, 25].map(n => <option key={n} value={n}>{n} Questions</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Category</label>
            <select name="category" value={settings.category} onChange={handle} className={SELECT}>
              <option value={0}>Any Category</option>
              {catLoading ? <option disabled>Loading...</option>
                : categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Difficulty</label>
            <select name="difficulty" value={settings.difficulty} onChange={handle} className={SELECT}>
              <option value="">Any Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Question Type</label>
            <select name="type" value={settings.type} onChange={handle} className={SELECT}>
              <option value="multiple">Multiple Choice</option>
              <option value="boolean">True / False</option>
              <option value="">Mixed</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => onStart(settings)}
          className="mt-7 w-full bg-[#C8F135] hover:bg-[#d6f55a] active:bg-[#9FBF1A]
                     text-[#0D0D0D] font-extrabold text-lg py-4 rounded-xl
                     transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ fontFamily: "'Syne',sans-serif" }}
        >
          Start Quiz ⚡
        </button>
      </div>
    </div>
  );
}
