// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  LogIn,
} from "lucide-react";

/* -------------------------------------------------------
   Helper: resolve correct OAuth base URL
   - Local dev  → http://localhost:5000/api
   - Live site  → https://passiify.onrender.com/api
   ------------------------------------------------------- */
const resolveAuthBaseURL = () => {
  let base =
    (API && API.defaults && API.defaults.baseURL) ||
    process.env.REACT_APP_API_BASE_URL ||
    "";

  // If nothing from API/env, infer from window
  if (!base && typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.endsWith(".local");

    base = isLocal
      ? "http://localhost:5000/api"
      : "https://passiify.onrender.com/api";
  }

  // SAFETY: if base still points to localhost but we are NOT on a local host,
  // force it to Render so phones/tablets don't try to hit their own localhost.
  if (
    typeof window !== "undefined" &&
    base.includes("localhost")
  ) {
    const host = window.location.hostname;
    const isLocalHost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.endsWith(".local");

    if (!isLocalHost) {
      base = "https://passiify.onrender.com/api";
    }
  }

  return base.replace(/\/+$/, ""); // remove trailing slashes
};

export default function LoginPage() {
  const navigate = useNavigate();

  // -------------------------------------------------------
  // LOCAL STATE
  // -------------------------------------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Prefill remembered email if available
  useEffect(() => {
    const storedEmail = localStorage.getItem("passiify_remember_email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  // Show any OAuth error from backend redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");

    if (!oauthError) return;

    if (oauthError === "google_auth_failed") {
      setError("Google sign-in failed. Please try again or use email login.");
    } else if (oauthError === "google_not_configured") {
      setError("Google sign-in is not configured yet. Please use email login.");
    } else if (oauthError === "missing_google_code") {
      setError("Missing Google authorization code. Please try again.");
    } else if (oauthError === "no_email_from_google") {
      setError(
        "We could not read your email from Google. Please try a different account or use email login."
      );
    } else if (
      oauthError === "no_id_token_from_google" ||
      oauthError === "no_tokens_from_google"
    ) {
      setError(
        "We couldn’t get your Google account details. Please try again or use email login."
      );
    } else {
      setError("Something went wrong with Google sign-in. Please try again.");
    }
  }, []);

  // -------------------------------------------------------
  // GOOGLE LOGIN — use safe base URL
  // -------------------------------------------------------
  const handleGoogleLogin = () => {
    setError("");
    setGoogleLoading(true);

    try {
      const base = resolveAuthBaseURL();
      const redirectUrl = `${base}/auth/google`;

      console.log("▶️ Redirecting to Google OAuth (login):", redirectUrl);
      window.location.href = redirectUrl;
    } catch (err) {
      console.error("Error starting Google login:", err);
      setGoogleLoading(false);
      setError(
        "Could not start Google sign-in. Please try again or use email login."
      );
    }
  };

  // -------------------------------------------------------
  // HANDLE LOGIN — backend route unchanged
  // -------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });

      const token = res.data?.token;
      const userPayload = res.data?.user || res.data;

      if (token) {
        localStorage.setItem("token", token);
      }

      if (userPayload) {
        // Works with MyDashboard reading: parsed?.user || parsed
        localStorage.setItem("user", JSON.stringify(userPayload));
      }

      if (rememberMe) {
        localStorage.setItem("passiify_remember_email", email);
      } else {
        localStorage.removeItem("passiify_remember_email");
      }

      navigate("/"); // home/dashboard
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err?.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen 
        bg-gradient-to-b from-sky-50 via-white to-slate-50 
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 
        flex items-center justify-center 
        px-4 sm:px-6 
        pt-16 sm:pt-20
        relative overflow-hidden
      "
    >
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
          <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)] gap-8 md:gap-10 items-start">
            {/* Left: form */}
            <div>
              <div className="mb-5">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-700/40 mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">
                    Secure login · Encrypted
                  </span>
                </div>
                <h2 className="text-2xl sm:text-[1.7rem] font-semibold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
                  Log in to Passiify
                  <LogIn className="w-5 h-5 text-sky-500" />
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  Access your passes, event tickets and training history in one
                  place. One account for every city you move in.
                </p>
              </div>

              {/* Social login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-950 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 shadow-sm hover:border-sky-400/70 dark:hover:border-sky-400/70 transition mb-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt=""
                  className="w-4 h-4"
                />
                {googleLoading ? "Opening Google…" : "Continue with Google"}
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Or log in with email
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
              <form onSubmit={handleLogin} className="space-y-4">
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
                      placeholder="Your password"
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
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <label className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-sky-500 focus:ring-sky-400"
                    />
                    <span>Remember this device</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sky-600 dark:text-sky-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-950 py-2.5 shadow-[0_16px_60px_rgba(15,23,42,0.9)] disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 hover:brightness-105 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging you in…
                    </>
                  ) : (
                    <>
                      Log in
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* New to Passiify */}
              <p className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400">
                New to Passiify?{" "}
                <Link
                  to="/register"
                  className="text-sky-600 dark:text-sky-300 font-semibold hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* Right: trust / value panel */}
            <div className="hidden md:flex flex-col justify-between border-l border-slate-200/80 dark:border-slate-800/80 pl-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-slate-900/90 dark:bg-slate-900 border border-slate-700/80 mb-4 shadow-[0_16px_60px_rgba(15,23,42,0.8)]">
                  <Sparkles className="w-3.5 h-3.5 text-orange-300" />
                  <span className="text-[10px] font-medium text-slate-200">
                    See your entire training trail
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  Your fitness passport, not a contract
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Logging in connects your past passes and upcoming events so
                  you can plan workouts in any city like a local.
                </p>
                <ul className="space-y-3 text-xs text-slate-500 dark:text-slate-300">
                  <li className="flex gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-sky-400" />
                    <span>
                      View all your{" "}
                      <span className="font-semibold">day passes</span> and{" "}
                      <span className="font-semibold">event tickets</span> in
                      one simple dashboard.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>
                      Instant access to QR passes, dates and locations without
                      digging through emails.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-orange-400" />
                    <span>
                      Switch between{" "}
                      <span className="font-semibold">
                        gyms, studios and events
                      </span>{" "}
                      whenever your plans change.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-violet-400" />
                    <span>
                      Built for travellers, students and movers who{" "}
                      <span className="font-semibold">hate lock-ins</span> but
                      love training.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 text-[11px] text-slate-500 dark:text-slate-500">
                <p>
                  “Log in, pick a city, book your next session. That&apos;s all
                  fitness should require from you.”
                </p>
                <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">
                  — Team Passiify
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tiny footer line */}
        <p className="mt-3 text-[10px] text-center text-slate-500 dark:text-slate-500 max-w-xl mx-auto">
          Secure by design. Your login details are encrypted and never shared
          with gyms or event hosts.
        </p>
      </div>
    </div>
  );
}
