// ════════════════════════════════════════════════
//  FILE: src/pages/AdminDashboard.jsx  (NEW)
//  PURPOSE: Admin-only dashboard showing:
//  — Total registered users
//  — Users active today / this week
//  — Total quizzes played
//  — Most popular subjects
//  — Recent sign-ups list
//
//  ACCESS: Only visible to your admin email.
//  Change ADMIN_EMAIL below to your email address.
// ════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";

// ── 🔐 SET YOUR ADMIN EMAIL HERE ─────────────────
const ADMIN_EMAIL = "oyed88@gmail.com";
// ─────────────────────────────────────────────────

export function isAdmin(user) {
  return user?.email === ADMIN_EMAIL;
}

// ── Stat Card ──────────────────────────────────────
function StatCard({ label, value, sub, color = "text-[#C8F135]", icon }) {
  return (
    <div className="bg-[#111122] border border-[#2A2A4A] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500 text-xs font-mono uppercase tracking-wider">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-4xl font-extrabold ${color}`}
         style={{ fontFamily: "'Syne',sans-serif" }}>
        {value}
      </p>
      {sub && <p className="text-gray-600 text-xs mt-1 font-mono">{sub}</p>}
    </div>
  );
}

// ── Main Component ────────────────────────────────
export default function AdminDashboard({ user, onBack }) {

  // Guard — only admin can see this
  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🔐</p>
          <p className="text-white text-xl font-bold">Access Denied</p>
          <p className="text-gray-500 text-sm mt-2">This page is for admins only.</p>
          <button onClick={onBack}
                  className="mt-6 bg-[#C8F135] text-[#0D0D0D] font-bold px-6 py-3 rounded-xl"
                  style={{ fontFamily: "'Syne',sans-serif" }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const [stats,       setStats]       = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [subjects,    setSubjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        // ── 1. Total registered users ──────────────
        const usersSnap  = await getDocs(collection(db, "users"));
        const totalUsers = usersSnap.size;

        // ── 2. Users active today ──────────────────
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const todayTs = Timestamp.fromDate(startOfDay);

        const activeToday = usersSnap.docs.filter(d => {
          const ls = d.data().lastSeen;
          return ls && ls.toDate && ls.toDate() >= startOfDay;
        }).length;

        // ── 3. Users active this week ──────────────
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        const activeWeek = usersSnap.docs.filter(d => {
          const ls = d.data().lastSeen;
          return ls && ls.toDate && ls.toDate() >= startOfWeek;
        }).length;

        // ── 4. Total quizzes played ────────────────
        const leaderSnap   = await getDocs(collection(db, "leaderboard"));
        const totalQuizzes = leaderSnap.size;

        // ── 5. Subject popularity ──────────────────
        const subjectCount = {};
        leaderSnap.docs.forEach(d => {
          const s = d.data().subject || "General";
          subjectCount[s] = (subjectCount[s] || 0) + 1;
        });
        const subjectList = Object.entries(subjectCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        // ── 6. Average score ──────────────────────
        const allPcts = leaderSnap.docs.map(d => d.data().pct || 0);
        const avgScore = allPcts.length
          ? Math.round(allPcts.reduce((a, b) => a + b, 0) / allPcts.length)
          : 0;

        // ── 7. Recent sign-ups ────────────────────
        const recentQ  = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(10));
        const recentSnap = await getDocs(recentQ);
        const recent = recentSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setStats({ totalUsers, activeToday, activeWeek, totalQuizzes, avgScore });
        setSubjects(subjectList);
        setRecentUsers(recent);
      } catch (err) {
        console.error("Admin dashboard error:", err);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  const Spinner = () => (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#C8F135] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  function formatDate(ts) {
    if (!ts) return "—";
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return "—"; }
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack}
                  className="text-gray-400 hover:text-[#C8F135] transition-colors text-sm font-mono">
            ← Back
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-white"
                style={{ fontFamily: "'Syne',sans-serif" }}>
              Admin <span className="text-[#C8F135]">Dashboard</span>
            </h1>
            <p className="text-gray-600 text-xs font-mono mt-0.5">wizerquizapp · Firebase</p>
          </div>
          <div className="w-16" />
        </div>

        {loading ? <Spinner /> : stats && (
          <>
            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatCard label="Total Users"    value={stats.totalUsers}   icon="👥" sub="Registered accounts" />
              <StatCard label="Active Today"   value={stats.activeToday}  icon="🟢" sub="Played or logged in today" color="text-green-400" />
              <StatCard label="Active 7 Days"  value={stats.activeWeek}   icon="📅" sub="Last 7 days" color="text-blue-400" />
              <StatCard label="Total Quizzes"  value={stats.totalQuizzes} icon="📝" sub="All time" color="text-purple-400" />
              <StatCard label="Avg Score"      value={`${stats.avgScore}%`} icon="📊" sub="Across all quizzes" color="text-yellow-400" />
              <StatCard label="Quizzes/User"   icon="⚡"
                value={stats.totalUsers > 0
                  ? (stats.totalQuizzes / stats.totalUsers).toFixed(1)
                  : "0"}
                sub="Average per user" color="text-[#C8F135]" />
            </div>

            {/* ── Subject Popularity ── */}
            {subjects.length > 0 && (
              <div className="bg-[#111122] border border-[#2A2A4A] rounded-2xl p-6 mb-6">
                <h2 className="text-white font-bold mb-4 text-sm"
                    style={{ fontFamily: "'Syne',sans-serif" }}>
                  📚 Most Popular Subjects
                </h2>
                <div className="space-y-3">
                  {subjects.map((s, i) => {
                    const maxCount = subjects[0].count;
                    const barWidth = Math.round((s.count / maxCount) * 100);
                    return (
                      <div key={s.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300 capitalize font-mono">{s.name}</span>
                          <span className="text-gray-500 font-mono">{s.count} quizzes</span>
                        </div>
                        <div className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C8F135] rounded-full transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Recent Sign-ups ── */}
            {recentUsers.length > 0 && (
              <div className="bg-[#111122] border border-[#2A2A4A] rounded-2xl p-6">
                <h2 className="text-white font-bold mb-4 text-sm"
                    style={{ fontFamily: "'Syne',sans-serif" }}>
                  🆕 Recent Sign-ups
                </h2>
                <div className="space-y-3">
                  {recentUsers.map(u => (
                    <div key={u.id}
                         className="flex items-center justify-between py-2
                                    border-b border-[#1A1A2E] last:border-0">
                      <div>
                        <p className="text-white text-sm font-bold">{u.name}</p>
                        <p className="text-gray-500 text-xs font-mono">{u.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs font-mono">
                          {formatDate(u.createdAt)}
                        </p>
                        <p className="text-gray-600 text-xs font-mono">
                          Last seen: {formatDate(u.lastSeen)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
