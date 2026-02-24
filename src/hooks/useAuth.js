// ════════════════════════════════════════════════
//  FILE: src/hooks/useAuth.js
//  PURPOSE: Auth state + actions hook
//  Screens: "login" | "signup" | "forgot" | "reset"
// ════════════════════════════════════════════════
import { useState, useCallback } from "react";
import { signUp, logIn, logOut, getSession, requestPasswordReset, resetPassword } from "../services/authService";

export function useAuth() {
  const [user, setUser]         = useState(() => getSession());
  const [authScreen, setAuthScreen] = useState("login"); // login|signup|forgot|reset
  const [error, setError]       = useState(null);
  const [message, setMessage]   = useState(null);
  const [loading, setLoading]   = useState(false);
  // Holds email + token during forgot→reset flow
  const [resetData, setResetData] = useState({ email: "", token: "" });

  const clearMessages = () => { setError(null); setMessage(null); };

  // ── Sign Up ─────────────────────────────────────
  const handleSignUp = useCallback(async ({ name, email, password, confirm }) => {
    clearMessages(); setLoading(true);
    try {
      if (password !== confirm) throw new Error("Passwords do not match.");
      const session = signUp({ name, email, password });
      setUser(session);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Log In ──────────────────────────────────────
  const handleLogIn = useCallback(async ({ email, password }) => {
    clearMessages(); setLoading(true);
    try {
      const session = logIn({ email, password });
      setUser(session);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Log Out ─────────────────────────────────────
  const handleLogOut = useCallback(() => {
    logOut();
    setUser(null);
    setAuthScreen("login");
  }, []);

  // ── Forgot Password ─────────────────────────────
  const handleForgotPassword = useCallback(({ email }) => {
    clearMessages();
    try {
      const token = requestPasswordReset(email);
      setResetData({ email, token });
      setMessage(`Reset link sent! (Demo: token is "${token}") — click Reset Password below.`);
      // Auto-navigate to reset screen after 1.5s
      setTimeout(() => setAuthScreen("reset"), 1500);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // ── Reset Password ──────────────────────────────
  const handleResetPassword = useCallback(({ token, newPassword, confirm }) => {
    clearMessages();
    try {
      if (newPassword !== confirm) throw new Error("Passwords do not match.");
      resetPassword(resetData.email, token, newPassword);
      setMessage("Password reset! You can now log in.");
      setTimeout(() => { setAuthScreen("login"); clearMessages(); }, 2000);
    } catch (e) {
      setError(e.message);
    }
  }, [resetData]);

  return {
    user,
    authScreen,
    setAuthScreen,
    error,
    message,
    loading,
    resetData,
    handleSignUp,
    handleLogIn,
    handleLogOut,
    handleForgotPassword,
    handleResetPassword,
  };
}
