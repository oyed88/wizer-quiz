// ════════════════════════════════════════════════
//  FILE: src/hooks/useAuth.js  (FIREBASE VERSION)
//  REPLACES: the old localStorage-based useAuth.js
//
//  Features:
//  — Sign up with email & password
//  — Log in / Log out
//  — Forgot password (sends real email via Firebase)
//  — Saves user profile to Firestore on signup
//  — Tracks lastSeen on every login
// ════════════════════════════════════════════════
import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";

export function useAuth() {
  const [user,       setUser]       = useState(null);   // Firebase user object
  const [authScreen, setAuthScreen] = useState("login");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [message,    setMessage]    = useState(null);
  const [appReady,   setAppReady]   = useState(false);  // waits for Firebase to check session

  // ── Listen for auth state changes ──────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extra profile data from Firestore
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        const profile = snap.exists() ? snap.data() : {};

        setUser({
          uid:         firebaseUser.uid,
          email:       firebaseUser.email,
          name:        firebaseUser.displayName || profile.name || "User",
          ...profile,
        });

        // Update last seen
        await updateDoc(doc(db, "users", firebaseUser.uid), {
          lastSeen: serverTimestamp(),
        }).catch(() => {});
      } else {
        setUser(null);
      }
      setAppReady(true);
    });
    return unsub;
  }, []);

  const clearMessages = () => { setError(null); setMessage(null); };

  // ── Sign Up ────────────────────────────────────
  const handleSignUp = async ({ name, email, password }) => {
    clearMessages();
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Set display name on Firebase Auth profile
      await updateProfile(cred.user, { displayName: name });

      // Save user document in Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        uid:         cred.user.uid,
        name,
        email,
        createdAt:   serverTimestamp(),
        lastSeen:    serverTimestamp(),
        totalQuizzes: 0,
        bestScore:   0,
      });

      // onAuthStateChanged will fire and set user automatically
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Log In ─────────────────────────────────────
  const handleLogIn = async ({ email, password }) => {
    clearMessages();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged handles setting user
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Log Out ────────────────────────────────────
  const handleLogOut = async () => {
    await signOut(auth);
    setUser(null);
    setAuthScreen("login");
  };

  // ── Forgot Password ────────────────────────────
  // Firebase sends a real password reset email
  const handleForgotPassword = async ({ email }) => {
    clearMessages();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(`Password reset email sent to ${email}. Check your inbox.`);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    authScreen,
    setAuthScreen,
    loading,
    error,
    message,
    appReady,
    handleSignUp,
    handleLogIn,
    handleLogOut,
    handleForgotPassword,
  };
}

// ── Human-readable error messages ─────────────────
function friendlyError(code) {
  const map = {
    "auth/email-already-in-use":    "That email is already registered. Try logging in.",
    "auth/invalid-email":           "Please enter a valid email address.",
    "auth/weak-password":           "Password must be at least 6 characters.",
    "auth/user-not-found":          "No account found with that email.",
    "auth/wrong-password":          "Incorrect password. Please try again.",
    "auth/invalid-credential":      "Incorrect email or password. Please try again.",
    "auth/too-many-requests":       "Too many attempts. Please wait a few minutes.",
    "auth/network-request-failed":  "Network error. Check your connection.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
