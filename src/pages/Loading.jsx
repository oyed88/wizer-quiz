import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <p className="text-3xl font-extrabold mb-10" style={{ fontFamily: "'Syne',sans-serif" }}>
        Wizer<span className="text-[#C8F135]">Quiz</span>
      </p>

      <div className="w-full max-w-lg space-y-4 mb-10">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 rounded-xl"
               style={{
                 background: "linear-gradient(90deg,#1A1A2E 25%,#2A2A4A 50%,#1A1A2E 75%)",
                 backgroundSize: "200% 100%",
                 animation: "shimmer 1.5s infinite",
                 opacity: 1 - i * 0.2,
               }} />
        ))}
      </div>

      <div className="w-10 h-10 border-4 border-[#2A2A4A] border-t-[#C8F135] rounded-full animate-spin mb-3" />
      <p className="text-gray-500 text-sm font-mono">Fetching questions...</p>
    </div>
  );
}