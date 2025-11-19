import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import {
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await API.post("/admin/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Invalid credentials. Please check email & password.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: "#050308",
        backgroundImage:
          "radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 55%)",
      }}
    >
      <div className="max-w-md w-full">
        {/* Top label */}
        <div className="flex items-center justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-[0.2em] text-gray-300">
            <KeyRound className="w-3.5 h-3.5 text-sky-400" />
            Admin Access Only
          </span>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_22px_80px_rgba(0,0,0,0.95)] px-7 py-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-sky-300 to-orange-300 bg-clip-text text-transparent">
              Passiify Admin Console
            </h1>
            <p className="text-xs text-gray-400 mt-2">
              Secure sign-in for internal team & verified partners.
            </p>
          </div>

          {/* Error banner */}
          {errorMsg && (
            <div className="flex items-start gap-2 mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <p className="text-xs text-red-200">{errorMsg}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Admin Email
              </label>
              <div className="flex items-center border border-white/15 bg-black/30 rounded-lg px-3 py-2 focus-within:border-sky-400/80 focus-within:ring-1 focus-within:ring-sky-400/70 transition">
                <Mail className="w-4 h-4 text-sky-300 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@passiify.com"
                  className="w-full outline-none bg-transparent text-sm text-gray-100 placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password
              </label>
              <div className="flex items-center border border-white/15 bg-black/30 rounded-lg px-3 py-2 focus-within:border-orange-400/80 focus-within:ring-1 focus-within:ring-orange-400/70 transition">
                <Lock className="w-4 h-4 text-orange-300 mr-2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter admin password"
                  className="w-full outline-none bg-transparent text-sm text-gray-100 placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="ml-2 text-gray-400 hover:text-gray-200 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Security hint */}
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Protected by role-based access.</span>
              </div>
              <span className="text-gray-500">
                v1.0 • Internal use only
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center hover:shadow-[0_16px_50px_rgba(56,189,248,0.5)] hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Validating admin access...
                </>
              ) : (
                "Login to Dashboard"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-gray-500">
              If you’re not part of the Passiify team, please{" "}
              <span className="text-gray-300">do not attempt to log in.</span>
            </p>
            <p className="text-[11px] text-gray-600 mt-2">
              © {new Date().getFullYear()} Passiify Admin Portal. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
