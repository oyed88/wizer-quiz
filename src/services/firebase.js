// ════════════════════════════════════════════════
//  FILE: src/services/firebase.js
//  PURPOSE: Firebase initialisation
//  — Authentication (email/password)
//  — Firestore database (users, scores, leaderboard)
// ════════════════════════════════════════════════
import { initializeApp }              from "firebase/app";
import { getAuth }                    from "firebase/auth";
import { getFirestore }               from "firebase/firestore";
import { getAnalytics, isSupported }  from "firebase/analytics";

const firebaseConfig = {
  apiKey:            "AIzaSyCsgygJ83RbSzkCm3oogxGUwqmXgN9DktY",
  authDomain:        "wizerquizapp.firebaseapp.com",
  projectId:         "wizerquizapp",
  storageBucket:     "wizerquizapp.firebasestorage.app",
  messagingSenderId: "471099166902",
  appId:             "1:471099166902:web:8848e5270d8f17d88e1617",
  measurementId:     "G-BJ1XBQZ4QE",
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Auth & Firestore instances used throughout the app
export const auth = getAuth(app);
export const db   = getFirestore(app);

// Analytics — only load in browser environments that support it
isSupported().then(yes => {
  if (yes) getAnalytics(app);
});

export default app;
