// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";

/* =========================================================
   THEME TOKENS — match Passiify "Sunset Nomad" brand
   ========================================================= */
const THEME = {
  bg: "#050308", // deep plum-black
  accent1: "#FF4B5C", // coral red
  accent2: "#FF9F68", // warm peach
  borderSoft: "rgba(245, 213, 189, 0.22)",
};

export default function SignupPage() {
  const navigate = useNavigate();

  // -------------------------------------------------------
  // LOCAL STATE
  // -------------------------------------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------
  // HANDLE SIGNUP (backend logic unchanged)
  // -------------------------------------------------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/register", { name, email, password });
      alert("🎉 Account created successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Signup failed:", err);
      setError(
        err.response?.data?.message ||
          "User already exists or invalid details"
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: THEME.bg,
        backgroundImage:
          "radial-gradient(circle at top, rgba(248, 216, 181, 0.16), transparent 55%)",
      }}
    >
      {/* Background glow accents */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -left-32 w-[360px] h-[360px] rounded-full blur-3xl opacity-40"
          style={{ background: THEME.accent1 }}
        />
        <div
          className="absolute -bottom-40 -right-32 w-[360px] h-[360px] rounded-full blur-3xl opacity-35"
          style={{ background: THEME.accent2 }}
        />
      </div>

      {/* Card wrapper */}
      <div className="relative w-full max-w-md">
        {/* Brand lockup */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-black/50 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden">
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage: `conic-gradient(from 220deg, ${THEME.accent1}, ${THEME.accent2}, ${THEME.accent1})`,
                  mixBlendMode: "screen",
                }}
              />
              <span className="relative text-xs font-semibold tracking-[0.18em] text-white uppercase">
                Pf
              </span>
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-lg font-black tracking-tight text-white">
                Passiify
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-gray-400">
                Move every city
              </span>
            </div>
          </div>
        </div>

        {/* Main card */}
        <div
          className="relative bg-black/60 backdrop-blur-2xl rounded-3xl border shadow-[0_26px_80px_rgba(0,0,0,0.95)] px-6 py-7 md:px-8 md:py-8"
          style={{ borderColor: THEME.borderSoft }}
        >
          {/* Heading */}
          <div className="mb-6 text-center">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-50">
              Create your Passiify account
            </h2>
            <p className="mt-1 text-xs md:text-sm text-gray-400">
              Join travellers, locals and movers who book gyms & fitness events
              with zero contracts.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name */}
            <div className="text-left">
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Full name
              </label>
              <input
                type="text"
                placeholder="Rubal Saini"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Email */}
            <div className="text-left">
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Password */}
            <div className="text-left">
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/40"
              />
              <p className="mt-1 text-[10px] text-gray-500">
                Tip: Use at least 8 characters with a mix of letters and
                numbers.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 rounded-xl text-sm font-semibold text-gray-900 py-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.9)] disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
              }}
            >
              {loading ? "Creating your account..." : "Create account"}
            </button>
          </form>

          {/* Already have account */}
          <p className="mt-4 text-center text-[11px] text-gray-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-orange-200 hover:text-white font-semibold hover:underline transition"
            >
              Login
            </Link>
          </p>

          {/* Sub copy */}
          <p className="mt-3 text-[10px] text-center text-gray-500">
            By creating an account, you&apos;re joining a community that treats
            fitness like adventure — one day pass, one event, one city at a
            time.
          </p>
        </div>
      </div>
    </div>
  );
}
