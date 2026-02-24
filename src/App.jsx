// ════════════════════════════════════════════════
//  FILE: src/App.jsx  (UPDATED — with auth gate)
//
//  Flow:
//    Not logged in → Auth screens (login/signup/forgot/reset)
//    Logged in     → Quiz app (home/loading/quiz/results)
// ════════════════════════════════════════════════
import React from "react";
import { useAuth }  from "./hooks/useAuth";
import { useQuiz }  from "./hooks/useQuiz";
import { LoginForm, SignUpForm, ForgotPasswordForm, ResetPasswordForm } from "./components/AuthForm";
import Home    from "./pages/Home";
import Loading from "./pages/Loading";
import Quiz    from "./pages/Quiz";
import Results from "./pages/Results";

// ── Background grid texture ───────────────────────
function GridBg() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
         style={{
           backgroundImage:
             "linear-gradient(#C8F135 1px,transparent 1px),linear-gradient(90deg,#C8F135 1px,transparent 1px)",
           backgroundSize: "40px 40px",
         }} />
  );
}

// ── Auth wrapper (centred card layout) ────────────
function AuthWrapper({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

export default function App() {
  const auth = useAuth();
  const quiz = useQuiz();

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <GridBg />

      <div className="relative z-10">

        {/* ════ NOT LOGGED IN → Auth screens ════ */}
        {!auth.user && (
          <AuthWrapper>
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
            {auth.authScreen === "reset" && (
              <ResetPasswordForm
                onSubmit={auth.handleResetPassword}
                onGoLogin={() => auth.setAuthScreen("login")}
                prefillToken={auth.resetData.token}
                error={auth.error}
                message={auth.message}
              />
            )}
          </AuthWrapper>
        )}

        {/* ════ LOGGED IN → Quiz app ════ */}
        {auth.user && (
          <>
            {/* Top nav bar showing logged-in user */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between
                            px-6 py-3 bg-[#0D0D0D]/80 backdrop-blur border-b border-[#1A1A2E]">
              <span className="font-extrabold text-lg" style={{ fontFamily: "'Syne',sans-serif" }}>
                Wizer<span className="text-[#C8F135]">Quiz</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm hidden sm:block">
                  👋 {auth.user.name}
                </span>
                <button
                  onClick={auth.handleLogOut}
                  className="text-xs font-mono border border-[#2A2A4A] hover:border-red-500
                             hover:text-red-400 text-gray-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Log out
                </button>
              </div>
            </nav>

            {/* Quiz screens with top padding for nav */}
            <div className="pt-14">
              {quiz.screen === "home" && (
                <Home
                  settings={quiz.settings}
                  onUpdate={quiz.updateSettings}
                  onStart={quiz.startQuiz}
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
                />
              )}
              {quiz.screen === "results" && (
                <Results
                  score={quiz.score}
                  questions={quiz.questions}
                  selectedAnswers={quiz.selectedAnswers}
                  onRestart={quiz.restart}
                />
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
