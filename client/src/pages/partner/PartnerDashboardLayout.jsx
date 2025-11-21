// src/pages/partner/PartnerDashboardLayout.jsx
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  CalendarDays,
  ListChecks,
  BarChart3,
  Star,
  UserCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import API from "../../utils/api";

const THEME = {
  bg: "#050308",
  bgSoft: "#0A0812",
  card: "rgba(15, 10, 24, 0.96)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
  accent: "#F97316",
  accentSoft: "rgba(249, 115, 22, 0.15)",
  textMain: "#F9FAFB",
  textMuted: "#9CA3AF",
};

const PartnerDashboardLayout = () => {
  const [gym, setGym] = useState(null);
  const [loadingGym, setLoadingGym] = useState(true);
  const [errorGym, setErrorGym] = useState("");
  const [noGym, setNoGym] = useState(false); // ✅ specifically track 404
  const navigate = useNavigate();

  const fetchGym = async () => {
    setLoadingGym(true);
    setErrorGym("");
    setNoGym(false);

    try {
      const res = await API.get("/gyms/me");
      const gymData = res.data?.gym || res.data;
      setGym(gymData);
    } catch (err) {
      console.error("Error loading gym profile:", err);

      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        "Unable to load your gym profile. Please try again.";

      if (status === 404) {
        // ❗ no gym linked to this account
        setNoGym(true);
      }

      setErrorGym(message);
    } finally {
      setLoadingGym(false);
    }
  };

  useEffect(() => {
    // 🔐 Guard: require login
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login?redirect=/partner/dashboard");
      return;
    }

    fetchGym();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("partnerToken");
    navigate("/login");
  };

  const businessType = gym?.businessType;
  const isEventHost = businessType === "event";
  const isGym =
    businessType === "gym" ||
    businessType === "mma" ||
    businessType === "yoga" ||
    (!businessType && !isEventHost);

  const isVerified = gym?.status === "approved" || gym?.verified;

  const navItems = [
    { to: "", label: "Overview", icon: LayoutDashboard, end: true },
    ...(isGym ? [{ to: "passes", label: "Passes", icon: Ticket }] : []),
    ...(isEventHost
      ? [{ to: "events", label: "My Events", icon: CalendarDays }]
      : [{ to: "events", label: "Events", icon: CalendarDays }]),
    {
      to: "bookings",
      label: isEventHost ? "Ticket Sales" : "Bookings",
      icon: ListChecks,
    },
    { to: "revenue", label: "Revenue", icon: BarChart3 },
    { to: "reviews", label: "Reviews", icon: Star },
    { to: "profile", label: "Profile", icon: UserCircle2 },
  ];

  return (
    <div
      style={{
        background: `radial-gradient(circle at top, rgba(249,115,22,0.12), transparent 55%), ${THEME.bg}`,
        minHeight: "100vh",
        color: THEME.textMain,
      }}
      className="flex"
    >
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl hidden md:flex flex-col">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-white/5">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-300 flex items-center justify-center shadow-lg shadow-orange-500/40">
            <span className="font-black text-sm tracking-tight">P</span>
          </div>
          <div>
            <div className="font-semibold tracking-tight text-sm">
              Passiify Partner
            </div>
            <div className="text-[11px] text-gray-400">
              {isEventHost
                ? "Host your events & tickets"
                : "Manage your gym, passes & revenue"}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          <div className="px-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">
              main
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all",
                        isActive
                          ? "bg-orange-500/15 text-white border border-orange-500/60 shadow shadow-orange-500/30"
                          : "text-gray-300 hover:bg-white/5 border border-transparent",
                      ].join(" ")
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="px-4 py-4 border-t border-white/5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-[13px] font-semibold">
            {gym?.name?.[0]?.toUpperCase() || "P"}
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium truncate">
              {gym?.name || "Your Space"}
            </p>
            <p className="text-[11px] text-gray-400 truncate flex items-center gap-1">
              {isVerified && (
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              )}
              {isVerified
                ? isEventHost
                  ? "Verified Event Partner"
                  : "Verified Gym Partner"
                : "Pending verification"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] text-gray-400 hover:text-gray-200"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar for mobile */}
        <div className="md:hidden px-4 py-3 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/70 backdrop-blur-xl z-20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-300 flex items-center justify-center text-xs font-bold">
              P
            </div>
            <div>
              <p className="text-xs font-semibold">Passiify Partner</p>
              <p className="text-[11px] text-gray-400">
                {gym?.name || "Your Space"}
              </p>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">
          {loadingGym ? (
            <div className="flex items-center justify-center py-20 text-gray-300 gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading your dashboard…</span>
            </div>
          ) : noGym ? (
            // ✅ Friendly empty state when 404 (no gym for this account)
            <div className="max-w-lg mx-auto border border-white/10 bg-black/40 rounded-2xl px-5 py-6 text-center">
              <h2 className="text-lg font-semibold mb-2">
                No gym linked to this account yet
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                To use Passiify Partner, first submit your gym or event space
                via the Partner form. Once approved, it will appear here
                automatically.
              </p>
              {errorGym && (
                <p className="text-[11px] text-gray-500 mb-3">{errorGym}</p>
              )}
              <button
                onClick={() => navigate("/partner")}
                className="px-4 py-2 rounded-xl text-xs bg-gradient-to-r from-orange-500 to-amber-400 text-black font-medium shadow shadow-orange-500/40"
              >
                Go to Partner form
              </button>
            </div>
          ) : errorGym ? (
            <div className="max-w-md mx-auto text-center border border-red-500/40 bg-red-500/5 rounded-2xl px-4 py-6">
              <p className="text-sm text-red-300 mb-2">{errorGym}</p>
              <button
                onClick={fetchGym}
                className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
              >
                Retry
              </button>
            </div>
          ) : (
            <Outlet
              context={{
                gym,
                loadingGym,
                refetchGym: fetchGym,
                isGym,
                isEventHost,
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default PartnerDashboardLayout;
