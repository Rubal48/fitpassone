// src/pages/SignupPage.jsx
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function SignupPage() {
  const navigate = useNavigate();

  // -------------------------------------------------------
  // LOCAL STATE
  // -------------------------------------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // -------------------------------------------------------
  // PASSWORD STRENGTH (simple but useful)
  // -------------------------------------------------------
  const passwordStrength = useMemo(() => {
    if (!password) return { label: "Too weak", score: 0 };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak", score };
    if (score === 2) return { label: "Okay", score };
    if (score === 3) return { label: "Strong", score };
    return { label: "Very strong", score };
  }, [password]);

  // -------------------------------------------------------
  // GOOGLE SIGNUP (frontend only – no errors)
  // -------------------------------------------------------
  const handleGoogleSignup = () => {
    // When your backend Google OAuth is ready, you can do:
    // window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
    alert("Google sign-up will be available soon. You can continue with email for now.");
  };

  // -------------------------------------------------------
  // HANDLE SIGNUP (backend route unchanged)
  // -------------------------------------------------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // basic validation before hitting backend
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password should be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/register", { name, email, password });
      // You can replace this alert with a toast later
      alert("🎉 Account created successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Signup failed:", err);
      setError(
        err?.response?.data?.message ||
          "User already exists or details are invalid."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[360px] h-[360px] bg-sky-500/20 dark:bg-sky-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[380px] h-[380px] bg-orange-500/20 dark:bg-orange-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl">
        {/* Brand lockup */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-950 dark:bg-slate-950 border border-slate-700/60 shadow-[0_18px_60px_rgba(15,23,42,0.8)] overflow-hidden">
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  backgroundImage:
                    "conic-gradient(from 220deg, #0ea5e9, #fb923c, #0ea5e9)",
                  mixBlendMode: "screen",
                }}
              />
              <span className="relative text-[11px] font-semibold tracking-[0.18em] text-slate-50 uppercase">
                Pf
              </span>
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                Passiify
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Move every city
              </span>
            </div>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white/90 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-[0_26px_90px_rgba(15,23,42,0.9)] backdrop-blur-2xl px-5 sm:px-7 md:px-10 py-7 md:py-8">
          <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] gap-8 md:gap-10 items-start">
            {/* Left: form */}
            <div>
              <div className="mb-5">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-sky-50 dark:bg-sky-900/30 border border-sky-100 dark:border-sky-700/40 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-sky-700 dark:text-sky-200">
                    Join free · No contracts
                  </span>
                </div>
                <h2 className="text-2xl sm:text-[1.7rem] font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
                  Create your Passiify account
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  One login for all your day passes and fitness events across
                  cities. Cancel anytime, come back any time.
                </p>
              </div>

              {/* Social signup */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-950 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 shadow-sm hover:border-sky-400/70 dark:hover:border-sky-400/70 transition mb-3"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt=""
                  className="w-4 h-4"
                />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Or continue with email
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-xl border border-red-500/70 bg-red-500/10 px-3 py-2 text-[11px] text-red-200 flex items-start gap-2">
                  <span className="mt-[2px] h-1.5 w-1.5 rounded-full bg-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Name */}
                <div className="text-left">
                  <label className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                    <User className="w-3.5 h-3.5" />
                    Full name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rubal Saini"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/50"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="text-left">
                  <label className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/50"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="text-left">
                  <label className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Strength bar */}
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwordStrength.score <= 1
                            ? "bg-red-400"
                            : passwordStrength.score === 2
                            ? "bg-amber-400"
                            : passwordStrength.score === 3
                            ? "bg-emerald-400"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${(passwordStrength.score / 4) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {password ? `Strength: ${passwordStrength.label}` : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    Use at least 8 characters with a mix of letters, numbers
                    and a symbol.
                  </p>
                </div>

                {/* Confirm password */}
                <div className="text-left">
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                    Confirm password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/50"
                  />
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="mt-[2px] w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-sky-500 focus:ring-sky-400"
                  />
                  <label htmlFor="terms" className="cursor-pointer">
                    I agree to the{" "}
                    <span className="underline hover:text-slate-700 dark:hover:text-slate-200">
                      Terms of Use
                    </span>{" "}
                    and{" "}
                    <span className="underline hover:text-slate-700 dark:hover:text-slate-200">
                      Privacy Policy
                    </span>
                    .
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-950 py-2.5 shadow-[0_16px_60px_rgba(15,23,42,0.9)] disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 hover:brightness-105 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating your account…
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Already have account */}
              <p className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-sky-600 dark:text-sky-300 font-semibold hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>

            {/* Right: trust / benefits panel */}
            <div className="hidden md:flex flex-col justify-between border-l border-slate-200/80 dark:border-slate-800/80 pl-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-slate-900/90 dark:bg-slate-900 border border-slate-700/80 mb-4 shadow-[0_16px_60px_rgba(15,23,42,0.8)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-medium text-slate-200">
                    Built for travellers, students & movers
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  Why people choose Passiify
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Your account unlocks flexible access to gyms, studios and
                  curated fitness events across cities — with zero long-term
                  lock-ins.
                </p>
                <ul className="space-y-3 text-xs text-slate-500 dark:text-slate-300">
                  <li className="flex gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>
                      <span className="font-semibold">One account</span> for all
                      your day passes and event tickets.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-sky-400" />
                    <span>
                      <span className="font-semibold">No sales calls</span>, no
                      annual contracts, no hidden fees.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-orange-400" />
                    <span>
                      Save your{" "}
                      <span className="font-semibold">favourite cities</span>{" "}
                      and discover gyms the moment you land.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-violet-400" />
                    <span>
                      Join <span className="font-semibold">runs, camps</span>{" "}
                      and pop-up events that match your training vibe.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 text-[11px] text-slate-500 dark:text-slate-500">
                <p>
                  “Passiify should feel like a boarding pass for your workouts —
                  wherever you go, you already know where you&apos;re training.”
                </p>
                <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">
                  — Rubal Saini, Founder
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tiny sub copy */}
        <p className="mt-3 text-[10px] text-center text-slate-500 dark:text-slate-500 max-w-xl mx-auto">
          By creating an account, you&apos;re joining a community that treats
          fitness like adventure — one day pass, one event, one city at a time.
        </p>
      </div>
    </div>
  );
}
