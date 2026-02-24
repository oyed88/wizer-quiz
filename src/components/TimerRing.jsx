// ════════════════════════════════════════════════
//  FILE: src/components/TimerRing.jsx
//  PURPOSE: Animated SVG countdown ring
//  Props: timeLeft, pct (0-100), color
// ════════════════════════════════════════════════
import React from "react";

export default function TimerRing({ timeLeft, pct, color, total }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  // Pulse animation when <= 5s
  const urgent = timeLeft <= 5;

  return (
    <div className={`relative flex-shrink-0 ${urgent ? "animate-pulse" : ""}`}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        {/* Track */}
        <circle cx="32" cy="32" r={r} fill="none" stroke="#1A1A2E" strokeWidth="5" />
        {/* Progress */}
        <circle
          cx="32" cy="32" r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
          style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.3s ease" }}
        />
        {/* Number */}
        <text
          x="32" y="37"
          textAnchor="middle"
          fill={color}
          fontSize="16"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="700"
        >
          {timeLeft}
        </text>
      </svg>
      {urgent && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      )}
    </div>
  );
}
