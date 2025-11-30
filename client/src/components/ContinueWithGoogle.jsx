// src/components/auth/ContinueWithGoogle.jsx
import React, { useState } from "react";
import API from "../../utils/api";

// Infer backend base from your Axios baseURL
const rawBase = API.defaults.baseURL || "";
// if baseURL = "http://localhost:5000/api", this becomes "http://localhost:5000"
const backendBase = rawBase.replace(/\/api\/?$/, "");

// 👉 Adjust if your route is different
// backend: router.get("/auth/google", ...);
const GOOGLE_AUTH_URL =
  import.meta.env.VITE_GOOGLE_AUTH_URL ||
  `${backendBase}/api/auth/google`;

const ContinueWithGoogle = ({ fullWidth = true }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = () => {
    console.log("▶️ Continue with Google clicked:", GOOGLE_AUTH_URL);
    try {
      setLoading(true);
      // Full page redirect, no overlay
      window.location.href = GOOGLE_AUTH_URL;
    } catch (err) {
      console.error("Failed to start Google sign-in:", err);
      setLoading(false);
      alert("Could not start Google sign-in. Please try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 border rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
        fullWidth ? "w-full" : ""
      }`}
      style={{
        borderColor: "rgba(148,163,184,0.7)",
        backgroundColor: "#FFFFFF",
        color: "#111827",
      }}
    >
      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white border border-gray-200">
        G
      </span>
      <span>{loading ? "Opening Google…" : "Continue with Google"}</span>
    </button>
  );
};

export default ContinueWithGoogle;
