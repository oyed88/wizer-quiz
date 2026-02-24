// ════════════════════════════════════════════════
//  FILE: src/main.jsx
//  PURPOSE: Vite entry point — mounts React app
// ════════════════════════════════════════════════
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
