// ════════════════════════════════════════════════
//  FILE: src/services/authService.js
//  PURPOSE: Auth logic using localStorage
//  (No backend needed — simulates real auth flow)
//  In production, replace with real API calls.
// ════════════════════════════════════════════════

const USERS_KEY = "wizerquiz_users";
const SESSION_KEY = "wizerquiz_session";

// ── Helpers ──────────────────────────────────────
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ── Sign Up ───────────────────────────────────────
export function signUp({ name, email, password }) {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    throw new Error("An account with this email already exists.");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  const user = { id: Date.now(), name, email, password };
  saveUsers([...users, user]);
  // Auto-login after sign up
  const session = { id: user.id, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

// ── Log In ────────────────────────────────────────
export function logIn({ email, password }) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (!user) throw new Error("No account found with that email.");
  if (user.password !== password) throw new Error("Incorrect password.");
  const session = { id: user.id, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

// ── Log Out ───────────────────────────────────────
export function logOut() {
  localStorage.removeItem(SESSION_KEY);
}

// ── Get Current Session ───────────────────────────
export function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

// ── Forgot Password (simulated) ───────────────────
// In a real app this would send an email.
// Here we just verify the email exists and allow reset.
export function requestPasswordReset(email) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (!user) throw new Error("No account found with that email.");
  // Simulate: store a reset token
  const token = Math.random().toString(36).slice(2);
  const resets = JSON.parse(localStorage.getItem("wizerquiz_resets") || "{}");
  resets[email] = token;
  localStorage.setItem("wizerquiz_resets", JSON.stringify(resets));
  // Return token so we can simulate "clicking the link"
  return token;
}

export function resetPassword(email, token, newPassword) {
  const resets = JSON.parse(localStorage.getItem("wizerquiz_resets") || "{}");
  if (resets[email] !== token) throw new Error("Invalid or expired reset link.");
  if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
  const users = getUsers();
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) throw new Error("Account not found.");
  users[idx].password = newPassword;
  saveUsers(users);
  delete resets[email];
  localStorage.setItem("wizerquiz_resets", JSON.stringify(resets));
}
