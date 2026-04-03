// ════════════════════════════════════════════════
//  FILE: src/App.jsx  (FIREBASE VERSION)
//  CHANGES:
//  — Uses Firebase useAuth (real accounts)
//  — Admin Dashboard screen added
//  — Shows admin button in nav for admin user
//  — appReady state prevents flash of login screen
// ════════════════════════════════════════════════
import React from "react";
import { useAuth }   from "./hooks/useAuth";
import { useQuiz }   from "./hooks/useQuiz";
import { LoginForm, SignUpForm, ForgotPasswordForm } from "./components/AuthForm";
import Home           from "./pages/Home";
import Loading        from "./pages/Loading";
import Quiz           from "./pages/Quiz";
import Results        from "./pages/Results";
import History        from "./pages/History";
import AdminDashboard, { isAdmin } from "./pages/AdminDashboard";

function GridBg() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
         style={{
           backgroundImage:
             "linear-gradient(#C8F135 1px,transparent 1px)," +
             "linear-gradient(90deg,#C8F135 1px,transparent 1px)",
           backgroundSize: "40px 40px",
         }} />
  );
}

export default function App() {
  const auth = useAuth();
  const quiz = useQuiz(auth.user);

  // Wait for Firebase to check if the user is already logged in
  if (!auth.appReady) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8F135] border-t-transparent
                        rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <GridBg />
      <div className="relative z-10">

        {/* ════ NOT LOGGED IN → Auth screens ════ */}
        {!auth.user && (
          <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

              {auth.authScreen === "login" && (
                <LoginForm
                  onLogin={auth.handleLogIn}
                  onGoSignUp={() => auth.setAuthScreen("signup")}
                  onGoForgot={() => auth.setAuthScreen("forgot")}
                  error={auth.error}
                  loading={auth.loading}
                />
              )}

              {auth.authScreen === "signup" && (
                <SignUpForm
                  onSignUp={auth.handleSignUp}
                  onGoLogin={() => auth.setAuthScreen("login")}
                  error={auth.error}
                  loading={auth.loading}
                />
              )}

              {auth.authScreen === "forgot" && (
                <ForgotPasswordForm
                  onSubmit={auth.handleForgotPassword}
                  onGoLogin={() => auth.setAuthScreen("login")}
                  error={auth.error}
                  message={auth.message}
                  loading={auth.loading}
                />
              )}
            </div>
          </div>
        )}

        {/* ════ LOGGED IN → Quiz app ════ */}
        {auth.user && (
          <>
            {/* Top Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center
                            justify-between px-6 py-3 bg-[#0D0D0D]/80
                            backdrop-blur border-b border-[#1A1A2E]">
              <span className="font-extrabold text-lg cursor-pointer"
                    onClick={() => quiz.goToScreen("home")}
                    style={{ fontFamily: "'Syne',sans-serif" }}>
                Wizer<span className="text-[#C8F135]">Quiz</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm hidden sm:block">
                  👋 {auth.user.name}
                </span>

                {/* Admin button — only visible to admin */}
                {isAdmin(auth.user) && (
                  <button
                    onClick={() => quiz.goToScreen("admin")}
                    className="text-xs font-mono border border-[#C8F135]/40
                               hover:border-[#C8F135] text-[#C8F135]/70
                               hover:text-[#C8F135] px-3 py-1.5 rounded-lg
                               transition-colors"
                  >
                    📊 Admin
                  </button>
                )}

                <button
                  onClick={auth.handleLogOut}
                  className="text-xs font-mono border border-[#2A2A4A]
                             hover:border-red-500 hover:text-red-400
                             text-gray-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Log out
                </button>
              </div>
            </nav>

            {/* Screens */}
            <div className="pt-14">

              {quiz.screen === "home" && (
                <Home
                  settings={quiz.settings}
                  onUpdate={quiz.updateSettings}
                  onStart={quiz.startQuiz}
                  onGoHistory={() => quiz.goToScreen("history")}
                  error={quiz.error}
                  userName={auth.user.name}
                />
              )}

              {quiz.screen === "loading" && <Loading />}

              {quiz.screen === "quiz" && (
                <Quiz
                  questions={quiz.questions}
                  currentIndex={quiz.currentIndex}
                  lockedAnswer={quiz.lockedAnswer}
                  onAnswer={quiz.handleAnswer}
                  onNext={quiz.handleNext}
                  timerSeconds={quiz.settings.timerSeconds}
                />
              )}

              {quiz.screen === "results" && (
                <Results
                  score={quiz.score}
                  questions={quiz.questions}
                  selectedAnswers={quiz.selectedAnswers}
                  onRestart={quiz.restart}
                  onGoHistory={() => quiz.goToScreen("history")}
                />
              )}

              {quiz.screen === "history" && (
                <History
                  user={auth.user}
                  onBack={() => quiz.goToScreen("home")}
                />
              )}

              {quiz.screen === "admin" && (
                <AdminDashboard
                  user={auth.user}
                  onBack={() => quiz.goToScreen("home")}
                />
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}
