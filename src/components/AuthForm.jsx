// ════════════════════════════════════════════════
//  FILE: src/components/AuthForm.jsx
//  PURPOSE: Shared auth UI — Sign Up, Log In,
//           Forgot Password, Reset Password screens
// ════════════════════════════════════════════════
import React, { useState } from "react";

// ── Shared input style ────────────────────────────
const INPUT =
  "w-full bg-[#0D0D1A] border border-[#2A2A4A] text-gray-200 rounded-xl px-4 py-3 " +
  "focus:outline-none focus:border-[#C8F135] focus:ring-1 focus:ring-[#C8F135] " +
  "transition-colors placeholder-gray-600 text-sm";

// ── Reusable labelled input ───────────────────────
function Field({ label, name, type = "text", value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="block text-gray-400 text-xs mb-1.5 font-mono uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          type={isPassword ? (show ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={INPUT}
          autoComplete="off"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#C8F135] text-xs transition-colors"
          >
            {show ? "HIDE" : "SHOW"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Volt button ───────────────────────────────────
function VoltBtn({ children, loading, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="w-full bg-[#C8F135] hover:bg-[#d6f55a] active:bg-[#9FBF1A] disabled:opacity-60
                 text-[#0D0D0D] font-extrabold text-base py-3.5 rounded-xl
                 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      style={{ fontFamily: "'Syne',sans-serif" }}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

// ── Logo header ───────────────────────────────────
function Logo() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-extrabold" style={{ fontFamily: "'Syne',sans-serif" }}>
        Wizer<span className="text-[#C8F135]">Quiz</span> ⚡
      </h1>
      <p className="text-gray-500 text-sm mt-1">Test your knowledge. Beat the clock.</p>
    </div>
  );
}

// ── Alert box ─────────────────────────────────────
function Alert({ type, text }) {
  const styles = {
    error:   "bg-red-900/40 border-red-700 text-red-300",
    success: "bg-green-900/40 border-green-700 text-green-300",
    info:    "bg-blue-900/40 border-blue-700 text-blue-300",
  };
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm mb-5 ${styles[type]}`}>
      {text}
    </div>
  );
}

// ════════════════════════════════════════════════
//  SCREEN 1: Login
// ════════════════════════════════════════════════
export function LoginForm({ onLogin, onGoSignUp, onGoForgot, error, loading }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div>
      <Logo />
      <div className="bg-[#111122] border border-[#2A2A4A] rounded-2xl p-8 shadow-2xl">
        <h2 className="text-white font-bold text-xl mb-6" style={{ fontFamily: "'Syne',sans-serif" }}>
          Welcome back
        </h2>

        {error && <Alert type="error" text={error} />}

        <div className="space-y-4 mb-6">
          <Field label="Email" name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" />
          <Field label="Password" name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" />
        </div>

        <div className="flex justify-end mb-5">
          <button onClick={onGoForgot} className="text-[#C8F135] text-xs hover:underline font-mono">
            Forgot password?
          </button>
        </div>

        <VoltBtn loading={loading} onClick={() => onLogin(form)}>
          Log In ⚡
        </VoltBtn>

        <p className="text-center text-gray-500 text-sm mt-5">
          No account?{" "}
          <button onClick={onGoSignUp} className="text-[#C8F135] hover:underline font-semibold">
            Sign up free
          </button>
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
//  SCREEN 2: Sign Up
// ════════════════════════════════════════════════
export function SignUpForm({ onSignUp, onGoLogin, error, loading }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Live password strength
  const strength =
    form.password.length === 0 ? null :
    form.password.length < 6  ? { label: "Too short", color: "#f87171", w: "25%" } :
    form.password.length < 10 ? { label: "Fair",      color: "#facc15", w: "55%" } :
                                 { label: "Strong",    color: "#4ade80", w: "100%" };

  return (
    <div>
      <Logo />
      <div className="bg-[#111122] border border-[#2A2A4A] rounded-2xl p-8 shadow-2xl">
        <h2 className="text-white font-bold text-xl mb-6" style={{ fontFamily: "'Syne',sans-serif" }}>
          Create account
        </h2>

        {error && <Alert type="error" text={error} />}

        <div className="space-y-4 mb-4">
          <Field label="Full Name"      name="name"     value={form.name}     onChange={handle} placeholder="John Doe" />
          <Field label="Email"          name="email"    type="email" value={form.email}    onChange={handle} placeholder="you@example.com" />
          <Field label="Password"       name="password" type="password" value={form.password} onChange={handle} placeholder="Min. 6 characters" />
          <Field label="Confirm Password" name="confirm" type="password" value={form.confirm}  onChange={handle} placeholder="Re-enter password" />
        </div>

        {/* Password strength bar */}
        {strength && (
          <div className="mb-5">
            <div className="h-1 bg-[#1A1A2E] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                   style={{ width: strength.w, backgroundColor: strength.color }} />
            </div>
            <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
          </div>
        )}

        <VoltBtn loading={loading} onClick={() => onSignUp(form)}>
          Create Account ⚡
        </VoltBtn>

        <p className="text-center text-gray-500 text-sm mt-5">
          Already have an account?{" "}
          <button onClick={onGoLogin} className="text-[#C8F135] hover:underline font-semibold">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
//  SCREEN 3: Forgot Password
// ════════════════════════════════════════════════
export function ForgotPasswordForm({ onSubmit, onGoLogin, error, message, loading }) {
  const [email, setEmail] = useState("");

  return (
    <div>
      <Logo />
      <div className="bg-[#111122] border border-[#2A2A4A] rounded-2xl p-8 shadow-2xl">
        <h2 className="text-white font-bold text-xl mb-2" style={{ fontFamily: "'Syne',sans-serif" }}>
          Reset Password
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        {error   && <Alert type="error"   text={error} />}
        {message && <Alert type="success" text={message} />}

        <div className="mb-6">
          <Field label="Email" name="email" type="email" value={email}
                 onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <VoltBtn loading={loading} onClick={() => onSubmit({ email })}>
          Send Reset Link
        </VoltBtn>

        <p className="text-center text-gray-500 text-sm mt-5">
          Remember it?{" "}
          <button onClick={onGoLogin} className="text-[#C8F135] hover:underline font-semibold">
            Back to login
          </button>
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
//  SCREEN 4: Reset Password (enter new password)
// ════════════════════════════════════════════════
export function ResetPasswordForm({ onSubmit, onGoLogin, prefillToken, error, message }) {
  const [form, setForm] = useState({ token: prefillToken || "", newPassword: "", confirm: "" });
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div>
      <Logo />
      <div className="bg-[#111122] border border-[#2A2A4A] rounded-2xl p-8 shadow-2xl">
        <h2 className="text-white font-bold text-xl mb-2" style={{ fontFamily: "'Syne',sans-serif" }}>
          Set New Password
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Paste your reset token and choose a new password.
        </p>

        {error   && <Alert type="error"   text={error} />}
        {message && <Alert type="success" text={message} />}

        <div className="space-y-4 mb-6">
          <Field label="Reset Token"    name="token"       value={form.token}       onChange={handle} placeholder="Paste token here" />
          <Field label="New Password"   name="newPassword" type="password" value={form.newPassword} onChange={handle} placeholder="Min. 6 characters" />
          <Field label="Confirm Password" name="confirm"   type="password" value={form.confirm}     onChange={handle} placeholder="Re-enter password" />
        </div>

        <VoltBtn onClick={() => onSubmit(form)}>
          Reset Password ⚡
        </VoltBtn>

        <p className="text-center text-gray-500 text-sm mt-5">
          <button onClick={onGoLogin} className="text-[#C8F135] hover:underline font-semibold">
            Back to login
          </button>
        </p>
      </div>
    </div>
  );
}
