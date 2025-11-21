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
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl md:flex">
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-300 text-sm font-black tracking-tight shadow-lg shadow-orange-500/40">
            P
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">
              Passiify Partner
            </div>
            <div className="text-[11px] text-gray-400">
              {isEventHost
                ? "Host your events & tickets"
                : "Manage your gym, passes & revenue"}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 py-4 overflow-y-auto">
          <div className="px-3">
            <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-gray-500">
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
                        "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-all",
                        isActive
                          ? "border-orange-500/60 bg-orange-500/15 text-white shadow shadow-orange-500/30"
                          : "border-transparent text-gray-300 hover:bg-white/5",
                      ].join(" ")
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/5 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-[13px] font-semibold">
            {gym?.name?.[0]?.toUpperCase() || "P"}
          </div>
          <div className="flex-1">
            <p className="truncate text-xs font-medium">
              {gym?.name || "Your Space"}
            </p>
            <p className="flex items-center gap-1 truncate text-[11px] text-gray-400">
              {isVerified && (
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
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
      <main className="min-w-0 flex-1">
        {/* Top bar (mobile) */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/70 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-300 text-xs font-bold">
              P
            </div>
            <div>
              <p className="text-xs font-semibold">Passiify Partner</p>
              <p className="text-[11px] text-gray-400">
                {gym?.name || "Your Space"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] text-gray-400 hover:text-gray-200"
          >
            Log out
          </button>
        </div>

        {/* Mobile nav pills */}
        <div className="md:hidden border-b border-white/10 bg-black/60 px-4 pb-2 pt-2 backdrop-blur-xl">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-1 rounded-full px-3 py-1 text-[11px] whitespace-nowrap border transition-all",
                      isActive
                        ? "border-orange-500/70 bg-orange-500/20 text-white"
                        : "border-white/10 text-gray-300 bg-white/5",
                    ].join(" ")
                  }
                >
                  <Icon className="h-3 w-3" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Content area */}
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {loadingGym ? (
            <div className="flex items-center justify-center gap-3 py-20 text-gray-300">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading your dashboard…</span>
            </div>
          ) : noGym ? (
            // ✅ Friendly empty state when 404 (no gym for this account)
            <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-black/40 px-5 py-6 text-center shadow-xl shadow-black/40">
              <h2 className="mb-2 text-lg font-semibold">
                No gym linked to this account yet
              </h2>
              <p className="mb-4 text-xs text-gray-400">
                To use Passiify Partner, first submit your gym or event space
                via the Partner form. Once approved, it will appear here
                automatically.
              </p>
              {errorGym && (
                <p className="mb-3 text-[11px] text-gray-500">{errorGym}</p>
              )}
              <button
                onClick={() => navigate("/partner")}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 text-xs font-medium text-black shadow shadow-orange-500/40"
              >
                Go to Partner form
              </button>
            </div>
          ) : errorGym ? (
            <div className="mx-auto max-w-md rounded-2xl border border-red-500/40 bg-red-500/5 px-4 py-6 text-center">
              <p className="mb-2 text-sm text-red-300">{errorGym}</p>
              <button
                onClick={fetchGym}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
              >
                Retry
              </button>
            </div>
          ) : (
            // 👇 children pages get full control of card layout, but with context
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
