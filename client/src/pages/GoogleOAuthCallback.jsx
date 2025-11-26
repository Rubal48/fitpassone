// src/pages/GoogleOAuthPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";

const GoogleOAuthPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finishing your Google sign-in…");

  useEffect(() => {
    const finalizeGoogleLogin = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          // No token in URL → bounce back to login with error
          navigate("/login?error=google_token_missing", { replace: true });
          return;
        }

        // 1) Save token
        localStorage.setItem("token", token);

        // 2) Fetch current user from backend
        try {
          const res = await API.get("/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const userPayload = res.data?.user || res.data;
          if (userPayload) {
            localStorage.setItem("user", JSON.stringify(userPayload));
          }
        } catch (err) {
          console.error("Failed to fetch user from /auth/me:", err);
          // Still continue — user can be loaded later via token if needed
        }

        // 3) Redirect to home
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Error finalizing Google login:", err);
        setMessage("Something went wrong while finishing Google sign-in.");
        setTimeout(() => {
          navigate("/login?error=google_auth_failed", { replace: true });
        }, 1500);
      }
    };

    finalizeGoogleLogin();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[360px] h-[360px] bg-sky-500/20 dark:bg-sky-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[380px] h-[380px] bg-orange-500/20 dark:bg-orange-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/90 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-[0_26px_90px_rgba(15,23,42,0.9)] backdrop-blur-2xl px-6 py-7 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-slate-900/90 dark:bg-slate-900 border border-slate-700/80 mb-4 shadow-[0_16px_60px_rgba(15,23,42,0.8)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-medium text-slate-200">
              Secure Google sign-in
            </span>
          </div>

          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-1">
            Connecting your Passiify account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {message}
          </p>

          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-orange-300" />
            <span>
              This usually takes just a second. Please don&apos;t close this tab.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthPage;
