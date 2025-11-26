// src/pages/MyDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";
import {
  MapPin,
  CalendarDays,
  Ticket,
  Loader2,
  LogOut,
  ArrowRight,
  Dumbbell,
  Sparkles,
} from "lucide-react";

/* ==========================================
   GLOBAL BRAND THEME — Passiify blue / sky / orange
========================================== */
const BRAND = {
  accentFrom: "#2563EB", // blue-600
  accentMid: "#0EA5E9", // sky-500
  accentTo: "#F97316", // orange-500
};

const PRIMARY_GRADIENT_120 = `linear-gradient(120deg, ${BRAND.accentFrom}, ${BRAND.accentMid}, ${BRAND.accentTo})`;
const PRIMARY_GRADIENT_135 = `linear-gradient(135deg, ${BRAND.accentFrom}, ${BRAND.accentMid}, ${BRAND.accentTo})`;

/* ==========================================
   THEME TOKENS — match Passiify (light/dark)
========================================== */
const LIGHT_THEME = {
  mode: "light",
  bg: "#F4F5FB",
  card: "rgba(255,255,255,0.96)",
  cardAlt: "rgba(248,250,252,0.98)",
  textMain: "#020617",
  textMuted: "#6B7280",
  accentBlue: BRAND.accentFrom,
  accentOrange: BRAND.accentTo,
  borderSoft: "rgba(148,163,184,0.38)",
  shadowStrong: "0 34px 110px rgba(15,23,42,0.22)",
  shadowSoft: "0 20px 70px rgba(15,23,42,0.12)",
};

const DARK_THEME = {
  mode: "dark",
  bg: "#020617",
  card: "rgba(15,23,42,0.96)",
  cardAlt: "rgba(15,23,42,0.92)",
  textMain: "#E5E7EB",
  textMuted: "#9CA3AF",
  accentBlue: BRAND.accentFrom,
  accentOrange: BRAND.accentTo,
  borderSoft: "rgba(148,163,184,0.55)",
  shadowStrong: "0 40px 140px rgba(0,0,0,0.9)",
  shadowSoft: "0 24px 90px rgba(15,23,42,0.9)",
};

/* ==========================================
   SYSTEM THEME HELPER — auto follow device
========================================== */
const getSystemMode = () => {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/* ==========================================
   VIBE OPTIONS — local only (no backend change)
========================================== */
const VIBE_GOALS = [
  "Strength & muscle",
  "Combat sports",
  "Yoga & mobility",
  "Cardio / running",
  "Just staying active",
];

const VIBE_TIMES = ["Early morning", "Evenings", "Weekends", "Flexible"];

/* ==========================================
   MEMBER TIERS — competition-style flex levels
========================================== */
const MEMBER_TIERS = [
  { limit: 0, name: "Just getting started" },
  { limit: 3, name: "Weekend Warrior" },
  { limit: 8, name: "Consistency Crew" },
  { limit: 15, name: "City Hopper" },
  { limit: 25, name: "Passiify Regular" },
  { limit: 40, name: "Never Not Moving" },
];

/* ==========================================
   MAIN COMPONENT
========================================== */
const MyDashboard = () => {
  // 🌗 Theme: follow device automatically (no localStorage lock)
  const [mode, setMode] = useState(getSystemMode);
  const theme = mode === "light" ? LIGHT_THEME : DARK_THEME;

  const [user, setUser] = useState(null);

  const [gymBookings, setGymBookings] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);

  // 🎛 user vibe (local only)
  const [vibe, setVibe] = useState({
    primaryGoal: "",
    preferredTime: "",
    homeCity: "",
    travelCities: "",
  });
  const [savingVibe, setSavingVibe] = useState(false);
  const [vibeSaved, setVibeSaved] = useState(false);

  const navigate = useNavigate();

  /* ===============================
     Theme: listen to system changes
  =============================== */
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e) => setMode(e.matches ? "dark" : "light");

    listener(mq); // sync once on mount too
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  /* ===============================
     Fetch user + bookings
  =============================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (!token || !rawUser) {
      setLoading(false);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(rawUser);
    } catch (e) {
      parsed = null;
    }

    const userData = parsed?.user || parsed;
    if (!userData) {
      setLoading(false);
      return;
    }

    setUser(userData);

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // ✔ Match existing backend routes
        const [gymsRes, eventsRes] = await Promise.all([
          API.get("/bookings/user", { headers }), // bookingController.getBookingsByUser
          API.get("/event-bookings/me", { headers }), // eventBookingController.getMyEventBookings
        ]);

        const gymData = Array.isArray(gymsRes.data)
          ? gymsRes.data
          : gymsRes.data.bookings || [];

        const eventData = Array.isArray(eventsRes.data)
          ? eventsRes.data
          : eventsRes.data.bookings || [];

        setGymBookings(gymData);
        setEventBookings(eventData);
      } catch (err) {
        console.error(
          "❌ Error loading dashboard data:",
          err.response?.data || err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ===============================
     Load stored vibe (local only)
  =============================== */
  useEffect(() => {
    const stored = localStorage.getItem("passiifyVibe");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        setVibe((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch {
      // ignore parse errors silently
    }
  }, []);

  /* ===============================
     Derived stats
  =============================== */
  const today = new Date();

  const upcomingGymBookings = gymBookings.filter((b) => {
    if (!b.date) return false;
    return new Date(b.date) >= today;
  });

  const pastGymBookings = gymBookings.filter((b) => {
    if (!b.date) return false;
    return new Date(b.date) < today;
  });

  const upcomingEventBookings = eventBookings.filter((b) => {
    const eventDate = b.event?.date || b.eventDate;
    if (!eventDate) return false;
    return new Date(eventDate) >= today;
  });

  const pastEventBookings = eventBookings.filter((b) => {
    const eventDate = b.event?.date || b.eventDate;
    if (!eventDate) return false;
    return new Date(eventDate) < today;
  });

  const totalPasses = gymBookings.length;
  const totalEvents = eventBookings.length;
  const totalUpcoming =
    upcomingGymBookings.length + upcomingEventBookings.length;

  // 🌍 Million-dollar feel: your "training footprint"
  const trainingCities = Array.from(
    new Set([
      ...gymBookings.map((b) => b.gym?.city).filter(Boolean),
      ...eventBookings.map((b) => b.event?.location).filter(Boolean),
    ])
  );

  const hasVibe =
    vibe.primaryGoal ||
    vibe.preferredTime ||
    vibe.homeCity ||
    vibe.travelCities;
  const vibeComplete = Boolean(vibe.primaryGoal && vibe.preferredTime);

  const totalSessions = totalPasses + totalEvents;

  // Sessions this month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const monthGymSessions = gymBookings.filter((b) => {
    if (!b.date) return false;
    const d = new Date(b.date);
    return !Number.isNaN(d.getTime()) && d >= monthStart;
  }).length;

  const monthEventSessions = eventBookings.filter((b) => {
    const eventDate = b.event?.date || b.eventDate;
    if (!eventDate) return false;
    const d = new Date(eventDate);
    return !Number.isNaN(d.getTime()) && d >= monthStart;
  }).length;

  const monthSessions = monthGymSessions + monthEventSessions;

  // Tier logic
  let currentTier = MEMBER_TIERS[0];
  let nextTier = MEMBER_TIERS[MEMBER_TIERS.length - 1];

  for (let i = 0; i < MEMBER_TIERS.length; i++) {
    const tier = MEMBER_TIERS[i];
    if (totalSessions >= tier.limit) {
      currentTier = tier;
      nextTier = MEMBER_TIERS[i + 1] || tier;
    } else {
      nextTier = tier;
      break;
    }
  }

  const sessionsToNextTier =
    nextTier && nextTier.limit > currentTier.limit
      ? Math.max(nextTier.limit - totalSessions, 0)
      : 0;

  const progressToNextTier =
    nextTier && nextTier.limit > currentTier.limit
      ? (totalSessions - currentTier.limit) /
        (nextTier.limit - currentTier.limit)
      : 1;

  const backgroundImage =
    mode === "dark"
      ? `radial-gradient(circle at top, rgba(37,99,235,0.32), transparent 55%),
         radial-gradient(circle at bottom right, rgba(249,115,22,0.23), transparent 60%)`
      : `radial-gradient(circle at top, rgba(37,99,235,0.12), transparent 55%),
         radial-gradient(circle at bottom right, rgba(249,115,22,0.12), transparent 60%)`;

  /* ===============================
     Actions
  =============================== */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSaveVibe = () => {
    try {
      setSavingVibe(true);
      localStorage.setItem("passiifyVibe", JSON.stringify(vibe));
      setVibeSaved(true);
      setTimeout(() => setVibeSaved(false), 1800);
    } finally {
      setSavingVibe(false);
    }
  };

  const avatarLetter = user?.name?.[0]?.toUpperCase() || "U";

  /* ===============================
     Loading state
  =============================== */
  if (loading) {
    return (
      <div className={mode === "dark" ? "dark" : ""}>
        <div
          className="min-h-screen flex items-center justify-center w-full"
          style={{
            backgroundColor: theme.bg,
            backgroundImage,
            color: theme.textMain,
          }}
        >
          <div
            className="rounded-3xl px-6 py-5 flex items-center gap-3 backdrop-blur-xl border"
            style={{
              background: theme.card,
              borderColor: theme.borderSoft,
              boxShadow: theme.shadowStrong,
            }}
          >
            <Loader2
              className="w-5 h-5 animate-spin"
              style={{ color: theme.accentBlue }}
            />
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Loading your Passiify dashboard…
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     Not logged in state
  =============================== */
  if (!user) {
    return (
      <div className={mode === "dark" ? "dark" : ""}>
        <div
          className="min-h-screen flex items-center justify-center w-full px-4"
          style={{
            backgroundColor: theme.bg,
            backgroundImage,
            color: theme.textMain,
          }}
        >
          <div
            className="max-w-md w-full rounded-3xl p-6 text-center border backdrop-blur-xl"
            style={{
              background: theme.card,
              borderColor: theme.borderSoft,
              boxShadow: theme.shadowStrong,
            }}
          >
            <h1 className="text-xl sm:text-2xl font-bold">
              You’re not logged in
            </h1>
            <p
              className="mt-2 text-xs sm:text-sm"
              style={{ color: theme.textMuted }}
            >
              Log in to see your passes, event tickets and your travel fitness
              history across cities.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-[0_20px_70px_rgba(15,23,42,0.8)] hover:scale-[1.03] transition-transform"
              style={{
                backgroundImage: PRIMARY_GRADIENT_120,
                color: "#020617",
              }}
            >
              Go to login
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     Main dashboard
  =============================== */

  return (
    <div className={mode === "dark" ? "dark" : ""}>
      <div
        className="min-h-screen w-full relative overflow-hidden"
        style={{
          backgroundColor: theme.bg,
          backgroundImage,
          color: theme.textMain,
        }}
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-48 -left-40 w-[320px] h-[320px] bg-sky-500/20 dark:bg-sky-500/28 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-[360px] h-[360px] bg-orange-500/18 dark:bg-orange-500/24 rounded-full blur-3xl" />
        </div>

        <main className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-16">
          {/* HEADER CARD */}
          <section
            className="rounded-3xl backdrop-blur-xl px-5 sm:px-7 py-5 sm:py-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
            style={{
              background: theme.card,
              border: `1px solid ${theme.borderSoft}`,
              boxShadow: theme.shadowStrong,
            }}
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold shadow-[0_20px_70px_rgba(15,23,42,0.8)]"
                style={{
                  backgroundImage: PRIMARY_GRADIENT_135,
                  color: "#020617",
                }}
              >
                {avatarLetter}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-1">
                  Passiify · Member dashboard
                </p>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {user?.name || "Passiify Member"}
                </h1>
                <p
                  className="text-xs sm:text-sm"
                  style={{ color: theme.textMuted }}
                >
                  {user?.email}
                </p>
                <p
                  className="text-[11px] mt-1 max-w-md"
                  style={{ color: theme.textMuted }}
                >
                  All your day passes and event tickets in one place. Land in
                  any city with a workout already planned.
                </p>

                {/* Flex tier + brag line */}
                <p
                  className="mt-2 text-[11px] flex flex-wrap items-center gap-1.5"
                  style={{ color: theme.textMuted }}
                >
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px]"
                    style={{
                      borderColor: theme.borderSoft,
                      background: theme.cardAlt,
                    }}
                  >
                    <Sparkles
                      className="w-3 h-3"
                      style={{ color: theme.accentBlue }}
                    />
                    Flex tier:
                    <span className="font-semibold">{currentTier.name}</span>
                  </span>
                  {totalSessions > 0 && (
                    <span>
                      · {totalSessions} total session
                      {totalSessions === 1 ? "" : "s"} (
                      {monthSessions} this month)
                    </span>
                  )}
                </p>

                {vibeComplete && (
                  <p className="mt-2 text-[11px] flex items-center gap-1.5">
                    <Sparkles
                      className="w-3.5 h-3.5"
                      style={{ color: theme.accentBlue }}
                    />
                    <span style={{ color: theme.textMuted }}>
                      You’re in{" "}
                      <span className="font-semibold">
                        {vibe.primaryGoal.toLowerCase()}
                      </span>{" "}
                      mode, mostly training in{" "}
                      <span className="font-semibold">
                        {vibe.homeCity || "your current city"}
                      </span>{" "}
                      with a preference for{" "}
                      <span className="font-semibold">
                        {vibe.preferredTime.toLowerCase()}
                      </span>{" "}
                      sessions.
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => setActiveTab("gyms")}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] sm:text-xs font-semibold border backdrop-blur shadow-sm transition"
                style={{
                  borderColor: theme.borderSoft,
                  background: theme.cardAlt,
                  color: theme.textMain,
                }}
              >
                <Dumbbell size={14} />
                View passes
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] sm:text-xs font-semibold shadow-[0_22px_80px_rgba(15,23,42,0.9)] hover:scale-[1.03] transition-transform"
                style={{
                  backgroundImage: PRIMARY_GRADIENT_120,
                  color: "#020617",
                }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </section>

          {/* SUMMARY CARDS — responsive to any screen */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-8 text-xs sm:text-sm">
            <div
              className="rounded-2xl px-4 py-3 flex flex-col justify-between backdrop-blur"
              style={{
                background: theme.card,
                border: `1px solid ${theme.borderSoft}`,
                boxShadow: theme.shadowSoft,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px]"
                  style={{ color: theme.textMuted }}
                >
                  Total passes
                </span>
                <Dumbbell
                  className="w-4 h-4"
                  style={{ color: theme.accentOrange }}
                />
              </div>
              <div
                className="mt-1 text-xl font-bold"
                style={{ color: theme.textMain }}
              >
                {totalPasses}
              </div>
              <p
                className="text-[11px] mt-1"
                style={{ color: theme.textMuted }}
              >
                Gym & studio day passes used.
              </p>
            </div>

            <div
              className="rounded-2xl px-4 py-3 flex flex-col justify-between backdrop-blur"
              style={{
                background: theme.card,
                border: `1px solid ${theme.borderSoft}`,
                boxShadow: theme.shadowSoft,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px]"
                  style={{ color: theme.textMuted }}
                >
                  Events joined
                </span>
                <Ticket
                  className="w-4 h-4"
                  style={{ color: theme.accentOrange }}
                />
              </div>
              <div
                className="mt-1 text-xl font-bold"
                style={{ color: theme.textMain }}
              >
                {totalEvents}
              </div>
              <p
                className="text-[11px] mt-1"
                style={{ color: theme.textMuted }}
              >
                Marathons, retreats, festivals & more.
              </p>
            </div>

            <div
              className="rounded-2xl px-4 py-3 flex flex-col justify-between backdrop-blur"
              style={{
                background: theme.card,
                border: `1px solid ${theme.borderSoft}`,
                boxShadow: theme.shadowSoft,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px]"
                  style={{ color: theme.textMuted }}
                >
                  Upcoming
                </span>
                <Sparkles
                  className="w-4 h-4"
                  style={{ color: theme.accentOrange }}
                />
              </div>
              <div
                className="mt-1 text-xl font-bold"
                style={{ color: theme.textMain }}
              >
                {totalUpcoming}
              </div>
              <p
                className="text-[11px] mt-1"
                style={{ color: theme.textMuted }}
              >
                Passes & event tickets lined up.
              </p>
            </div>
          </section>

          {/* FLEX STATUS / COMPETITION STRIP */}
          <section className="mb-8">
            <div
              className="rounded-2xl px-4 sm:px-5 py-4 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm"
              style={{
                background: theme.cardAlt,
                borderColor: theme.borderSoft,
                boxShadow: theme.shadowSoft,
              }}
            >
              <div>
                <p
                  className="text-[11px] uppercase tracking-[0.16em] mb-1"
                  style={{ color: theme.textMuted }}
                >
                  Your Passiify flex score
                </p>
                <p className="text-sm sm:text-base font-semibold">
                  {currentTier.name}
                  {trainingCities.length >= 3 && (
                    <>
                      {" "}
                      · {trainingCities.length} city
                      {trainingCities.length > 1 ? " streak" : ""}
                    </>
                  )}
                </p>
                <p
                  className="text-[11px] mt-1"
                  style={{ color: theme.textMuted }}
                >
                  You’ve completed{" "}
                  <span className="font-semibold">{totalSessions}</span> total
                  session{totalSessions === 1 ? "" : "s"}{" "}
                  {monthSessions > 0 && (
                    <>
                      (<span className="font-semibold">{monthSessions}</span>{" "}
                      this month).
                    </>
                  )}{" "}
                  {sessionsToNextTier > 0 ? (
                    <>
                      Book{" "}
                      <span className="font-semibold">
                        {sessionsToNextTier}
                      </span>{" "}
                      more{" "}
                      {sessionsToNextTier === 1 ? "session" : "sessions"} to
                      unlock{" "}
                      <span className="font-semibold">{nextTier.name}</span>.
                    </>
                  ) : (
                    <>You’re at the top tier for this account — keep the streak going.</>
                  )}
                </p>
              </div>
              <div className="w-full sm:w-56">
                <div
                  className="flex justify-between mb-1 text-[10px]"
                  style={{ color: theme.textMuted }}
                >
                  <span>{currentTier.name}</span>
                  <span>
                    {nextTier && nextTier.limit !== currentTier.limit
                      ? nextTier.name
                      : "Maxed"}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200/60 dark:bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        Math.max(progressToNextTier * 100, 8),
                        100
                      )}%`,
                      backgroundImage: PRIMARY_GRADIENT_120,
                    }}
                  />
                </div>
                <p
                  className="mt-1 text-[10px]"
                  style={{ color: theme.textMuted }}
                >
                  Imagine this bar when your friends open their dashboard.
                </p>
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="flex flex-wrap gap-3 mb-8 text-[11px] sm:text-xs">
            <button
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border shadow-sm backdrop-blur transition"
              style={{
                borderColor: theme.borderSoft,
                background: theme.cardAlt,
                color: theme.textMain,
              }}
            >
              Discover new gyms
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate("/events")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border shadow-sm backdrop-blur transition"
              style={{
                borderColor: theme.borderSoft,
                background: theme.cardAlt,
                color: theme.textMain,
              }}
            >
              Explore events
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </section>

          {/* TABS */}
          <section className="flex justify-center flex-wrap gap-3 mb-8 text-xs sm:text-sm">
            {[
              { id: "profile", label: "Overview" },
              { id: "gyms", label: "Gym Passes" },
              { id: "events", label: "Event Tickets" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-5 py-2.5 rounded-full font-semibold transition-all"
                style={
                  activeTab === tab.id
                    ? {
                        backgroundImage: PRIMARY_GRADIENT_120,
                        color: "#020617",
                        boxShadow: "0 20px 70px rgba(15,23,42,0.7)",
                      }
                    : {
                        background: theme.cardAlt,
                        color: theme.textMain,
                        border: `1px solid ${theme.borderSoft}`,
                      }
                }
              >
                {tab.label}
              </button>
            ))}
          </section>

          {/* TAB CONTENT CARD */}
          <section
            className="border rounded-3xl backdrop-blur-xl p-5 sm:p-7 shadow-[0_24px_90px_rgba(15,23,42,0.6)]"
            style={{
              background: theme.card,
              borderColor: theme.borderSoft,
            }}
          >
            {/* Overview */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-[0_20px_70px_rgba(15,23,42,0.8)]"
                    style={{
                      backgroundImage: PRIMARY_GRADIENT_135,
                      color: "#020617",
                    }}
                  >
                    {avatarLetter}
                  </div>
                  <h2 className="text-lg sm:text-2xl font-semibold mt-4">
                    {user?.name}
                  </h2>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: theme.textMuted }}
                  >
                    {user?.email}
                  </p>
                  <p
                    className="text-[11px] mt-2 max-w-md"
                    style={{ color: theme.textMuted }}
                  >
                    This is your Passiify trail — every city you train in, every
                    event you join, all stitched into one flexible story.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div
                    className="rounded-2xl px-4 py-3 border"
                    style={{
                      background: theme.cardAlt,
                      borderColor: theme.borderSoft,
                    }}
                  >
                    <p
                      className="text-[11px] mb-1"
                      style={{ color: theme.textMuted }}
                    >
                      Training style
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: theme.textMain }}
                    >
                      Explorer mode
                    </p>
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: theme.textMuted }}
                    >
                      You use passes and events instead of long memberships —
                      pure flexibility.
                    </p>
                  </div>
                  <div
                    className="rounded-2xl px-4 py-3 border"
                    style={{
                      background: theme.cardAlt,
                      borderColor: theme.borderSoft,
                    }}
                  >
                    <p
                      className="text-[11px] mb-1"
                      style={{ color: theme.textMuted }}
                    >
                      Most active category
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: theme.textMain }}
                    >
                      {totalPasses >= totalEvents ? "Gyms & Studios" : "Events"}
                    </p>
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: theme.textMuted }}
                    >
                      Rotate between MMA, yoga, runs, hikes and more whenever
                      you feel like it.
                    </p>
                  </div>
                  <div
                    className="rounded-2xl px-4 py-3 border"
                    style={{
                      background: theme.cardAlt,
                      borderColor: theme.borderSoft,
                    }}
                  >
                    <p
                      className="text-[11px] mb-1"
                      style={{ color: theme.textMuted }}
                    >
                      Next step
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: theme.textMain }}
                    >
                      Lock your next city session
                    </p>
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: theme.textMuted }}
                    >
                      Book in advance so you land with a workout already on your
                      calendar.
                    </p>
                  </div>
                </div>

                {/* 🌍 Training footprint — million dollar feel */}
                {trainingCities.length > 0 && (
                  <div
                    className="rounded-2xl px-4 sm:px-5 py-3 sm:py-4 border"
                    style={{
                      background: theme.cardAlt,
                      borderColor: theme.borderSoft,
                      boxShadow: theme.shadowSoft,
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                      <div>
                        <p
                          className="text-[11px] mb-1"
                          style={{ color: theme.textMuted }}
                        >
                          Your training footprint
                        </p>
                        <p className="text-sm sm:text-base font-semibold">
                          You’ve trained in {trainingCities.length}{" "}
                          {trainingCities.length === 1 ? "city" : "cities"} with
                          Passiify.
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Dumbbell
                          className="w-3.5 h-3.5"
                          style={{ color: theme.accentOrange }}
                        />
                        <span style={{ color: theme.textMuted }}>
                          Keep exploring — we’ll keep the streak flexible.
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {trainingCities.map((city) => (
                        <span
                          key={city}
                          className="px-3 py-1 rounded-full text-[11px] border"
                          style={{
                            borderColor: theme.borderSoft,
                            background:
                              mode === "dark"
                                ? "rgba(15,23,42,0.96)"
                                : "rgba(255,255,255,0.95)",
                            color: theme.textMain,
                          }}
                        >
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Your Passiify vibe */}
                <div
                  className="rounded-2xl px-4 sm:px-5 py-4 sm:py-5 border text-xs sm:text-sm"
                  style={{
                    background: theme.cardAlt,
                    borderColor: theme.borderSoft,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles
                          className="w-4 h-4"
                          style={{ color: theme.accentBlue }}
                        />
                        <h3 className="text-sm sm:text-base font-semibold">
                          Your Passiify vibe
                        </h3>
                      </div>
                      <p
                        className="text-[11px] mt-1 max-w-md"
                        style={{ color: theme.textMuted }}
                      >
                        Tell Passiify what kind of movement you love. We’ll use
                        this to surface better gyms and events for your vibe.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      {vibeComplete ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-600 dark:text-emerald-300">
                            Vibe set
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span style={{ color: theme.textMuted }}>
                            Not fully set
                          </span>
                        </span>
                      )}
                      {vibeSaved && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-300">
                          Saved
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Goal */}
                    <div>
                      <p
                        className="text-[11px] mb-2"
                        style={{ color: theme.textMuted }}
                      >
                        Primary goal
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {VIBE_GOALS.map((goal) => {
                          const active = vibe.primaryGoal === goal;
                          return (
                            <button
                              key={goal}
                              type="button"
                              onClick={() =>
                                setVibe((prev) => ({
                                  ...prev,
                                  primaryGoal:
                                    prev.primaryGoal === goal ? "" : goal,
                                }))
                              }
                              className="px-3 py-1.5 rounded-full text-[11px] border transition"
                              style={
                                active
                                  ? {
                                      backgroundImage: PRIMARY_GRADIENT_120,
                                      color: "#020617",
                                      borderColor: "transparent",
                                    }
                                  : {
                                      background: theme.card,
                                      borderColor: theme.borderSoft,
                                      color: theme.textMain,
                                    }
                              }
                            >
                              {goal}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time */}
                    <div>
                      <p
                        className="text-[11px] mb-2"
                        style={{ color: theme.textMuted }}
                      >
                        Usual training time
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {VIBE_TIMES.map((label) => {
                          const active = vibe.preferredTime === label;
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() =>
                                setVibe((prev) => ({
                                  ...prev,
                                  preferredTime:
                                    prev.preferredTime === label ? "" : label,
                                }))
                              }
                              className="px-3 py-1.5 rounded-full text-[11px] border transition"
                              style={
                                active
                                  ? {
                                      background:
                                        mode === "dark"
                                          ? "rgba(37,99,235,0.2)"
                                          : "rgba(191,219,254,0.9)",
                                      borderColor: theme.accentBlue,
                                      color: theme.textMain,
                                    }
                                  : {
                                      background: theme.card,
                                      borderColor: theme.borderSoft,
                                      color: theme.textMain,
                                    }
                              }
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cities */}
                    <div className="space-y-2">
                      <div>
                        <p
                          className="text-[11px] mb-1"
                          style={{ color: theme.textMuted }}
                        >
                          Home city
                        </p>
                        <input
                          type="text"
                          value={vibe.homeCity}
                          onChange={(e) =>
                            setVibe((prev) => ({
                              ...prev,
                              homeCity: e.target.value,
                            }))
                          }
                          placeholder="e.g. Delhi, Goa"
                          className="w-full border rounded-xl px-3 py-2 text-[11px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/50"
                          style={{
                            background: theme.card,
                            borderColor: theme.borderSoft,
                            color: theme.textMain,
                          }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-[11px] mb-1"
                          style={{ color: theme.textMuted }}
                        >
                          Cities you often visit
                        </p>
                        <input
                          type="text"
                          value={vibe.travelCities}
                          onChange={(e) =>
                            setVibe((prev) => ({
                              ...prev,
                              travelCities: e.target.value,
                            }))
                          }
                          placeholder="Comma-separated · e.g. Mumbai, Bangalore"
                          className="w-full border rounded-xl px-3 py-2 text-[11px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/50"
                          style={{
                            background: theme.card,
                            borderColor: theme.borderSoft,
                            color: theme.textMain,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 justify-between">
                    <p
                      className="text-[11px] max-w-md"
                      style={{ color: theme.textMuted }}
                    >
                      We keep this on your device and use it to prioritise
                      experiences that match how and when you like to move.
                    </p>
                    <button
                      type="button"
                      onClick={handleSaveVibe}
                      disabled={savingVibe}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold shadow-[0_16px_60px_rgba(15,23,42,0.8)] hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100"
                      style={{
                        backgroundImage: PRIMARY_GRADIENT_120,
                        color: "#020617",
                      }}
                    >
                      {savingVibe ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving vibe…
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Save your vibe
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Tiny summary if vibe exists */}
                {hasVibe && (
                  <p
                    className="text-[11px] mt-2"
                    style={{ color: theme.textMuted }}
                  >
                    Based on your vibe, we’ll lean into{" "}
                    <span className="font-semibold">
                      {vibe.primaryGoal || "mixed disciplines"}
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold">
                      {vibe.preferredTime || "flexible timings"}
                    </span>{" "}
                    around{" "}
                    <span className="font-semibold">
                      {vibe.homeCity || "your home base"}
                    </span>
                    .
                  </p>
                )}
              </div>
            )}

            {/* Gym passes */}
            {activeTab === "gyms" && (
              <section className="space-y-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold">
                    Gym & Studio Passes
                  </h2>
                  <p
                    className="text-[11px]"
                    style={{ color: theme.textMuted }}
                  >
                    Track your one-day and short-term passes across cities.
                  </p>
                </div>

                {gymBookings.length === 0 ? (
                  <div
                    className="text-center text-sm py-10"
                    style={{ color: theme.textMuted }}
                  >
                    <p>No gym bookings yet.</p>
                    <button
                      onClick={() => navigate("/explore")}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border shadow-sm text-[11px] transition backdrop-blur"
                      style={{
                        borderColor: theme.borderSoft,
                        background: theme.cardAlt,
                        color: theme.textMain,
                      }}
                    >
                      Discover your first gym
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    {upcomingGymBookings.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-3">
                          Upcoming passes
                        </h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {upcomingGymBookings.map((b) => (
                            <div
                              key={b._id}
                              className="rounded-2xl p-4 text-xs sm:text-sm border shadow-[0_18px_60px_rgba(15,23,42,0.35)] hover:-translate-y-[2px] hover:shadow-[0_22px_80px_rgba(15,23,42,0.5)] transition backdrop-blur"
                              style={{
                                background: theme.cardAlt,
                                borderColor: theme.borderSoft,
                              }}
                            >
                              <h3 className="text-sm font-semibold mb-1 line-clamp-1">
                                {b.gym?.name || "Gym / Studio"}
                              </h3>
                              <p
                                className="flex items-center gap-1"
                                style={{ color: theme.textMuted }}
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                {b.gym?.city || "City"}
                              </p>
                              <p
                                className="flex items-center gap-1 mt-1"
                                style={{ color: theme.textMuted }}
                              >
                                <CalendarDays className="w-3.5 h-3.5" />
                                {b.date
                                  ? new Date(b.date).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "Date"}
                              </p>
                              <p className="mt-2">
                                ₹{b.price} · {b.duration} day
                                {b.duration > 1 ? "s" : ""}
                              </p>
                              <Link
                                to={`/booking-success/${b._id}`}
                                state={{ type: "gym" }}
                                className="inline-flex items-center gap-1 mt-3 text-[11px] px-3 py-1.5 rounded-full shadow-sm"
                                style={{
                                  backgroundImage: PRIMARY_GRADIENT_120,
                                  color: "#020617",
                                }}
                              >
                                View pass
                                <Ticket className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pastGymBookings.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold mb-3">
                          Past sessions
                        </h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pastGymBookings.map((b) => (
                            <div
                              key={b._id}
                              className="rounded-2xl p-4 text-xs sm:text-sm border"
                              style={{
                                background: theme.cardAlt,
                                borderColor: theme.borderSoft,
                              }}
                            >
                              <h3 className="text-sm font-semibold mb-1 line-clamp-1">
                                {b.gym?.name || "Gym / Studio"}
                              </h3>
                              <p
                                className="flex items-center gap-1"
                                style={{ color: theme.textMuted }}
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                {b.gym?.city || "City"}
                              </p>
                              <p
                                className="flex items-center gap-1 mt-1"
                                style={{ color: theme.textMuted }}
                              >
                                <CalendarDays className="w-3.5 h-3.5" />
                                {b.date
                                  ? new Date(b.date).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "Date"}
                              </p>
                              <p className="mt-2">
                                ₹{b.price} · {b.duration} day
                                {b.duration > 1 ? "s" : ""}
                              </p>
                              <Link
                                to={`/booking-success/${b._id}`}
                                state={{ type: "gym" }}
                                className="inline-flex items-center gap-1 mt-3 text-[11px] px-3 py-1.5 rounded-full border backdrop-blur-sm"
                                style={{
                                  borderColor: theme.borderSoft,
                                  background: theme.card,
                                  color: theme.textMain,
                                }}
                              >
                                View ticket
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            {/* Event tickets */}
            {activeTab === "events" && (
              <section className="space-y-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold">
                    Event Tickets
                  </h2>
                  <p
                    className="text-[11px]"
                    style={{ color: theme.textMuted }}
                  >
                    Track marathons, retreats, treks & community workouts.
                  </p>
                </div>

                {eventBookings.length === 0 ? (
                  <div
                    className="text-center text-sm py-10"
                    style={{ color: theme.textMuted }}
                  >
                    <p>No event bookings yet.</p>
                    <button
                      onClick={() => navigate("/events")}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border shadow-sm text-[11px] transition backdrop-blur"
                      style={{
                        borderColor: theme.borderSoft,
                        background: theme.cardAlt,
                        color: theme.textMain,
                      }}
                    >
                      Discover events
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    {upcomingEventBookings.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-3">
                          Upcoming events
                        </h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {upcomingEventBookings.map((b) => {
                            const eventDate = b.event?.date || b.eventDate;
                            return (
                              <div
                                key={b._id}
                                className="rounded-2xl p-4 text-xs sm:text-sm border shadow-[0_18px_60px_rgba(15,23,42,0.35)] hover:-translate-y-[2px] hover:shadow-[0_22px_80px_rgba(15,23,42,0.5)] transition backdrop-blur"
                                style={{
                                  background: theme.cardAlt,
                                  borderColor: theme.borderSoft,
                                }}
                              >
                                <h3 className="text-sm font-semibold mb-1 line-clamp-1">
                                  {b.event?.name || "Event"}
                                </h3>
                                <p
                                  className="flex items-center gap-1"
                                  style={{ color: theme.textMuted }}
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  {b.event?.location || "Location"}
                                </p>
                                <p
                                  className="flex items-center gap-1 mt-1"
                                  style={{ color: theme.textMuted }}
                                >
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  {eventDate
                                    ? new Date(eventDate).toLocaleDateString(
                                        "en-IN"
                                      )
                                    : "Date"}
                                </p>
                                <p className="mt-2">
                                  🎟 {b.tickets} ticket
                                  {b.tickets > 1 ? "s" : ""} · ₹
                                  {b.totalPrice}
                                </p>
                                <Link
                                  to={`/booking-success/${b._id}`}
                                  state={{ type: "event" }}
                                  className="inline-flex items-center gap-1 mt-3 text-[11px] px-3 py-1.5 rounded-full shadow-sm"
                                  style={{
                                    backgroundImage: PRIMARY_GRADIENT_120,
                                    color: "#020617",
                                  }}
                                >
                                  View ticket
                                  <Ticket className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {pastEventBookings.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold mb-3">
                          Past events
                        </h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pastEventBookings.map((b) => {
                            const eventDate = b.event?.date || b.eventDate;
                            return (
                              <div
                                key={b._id}
                                className="rounded-2xl p-4 text-xs sm:text-sm border"
                                style={{
                                  background: theme.cardAlt,
                                  borderColor: theme.borderSoft,
                                }}
                              >
                                <h3 className="text-sm font-semibold mb-1 line-clamp-1">
                                  {b.event?.name || "Event"}
                                </h3>
                                <p
                                  className="flex items-center gap-1"
                                  style={{ color: theme.textMuted }}
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  {b.event?.location || "Location"}
                                </p>
                                <p
                                  className="flex items-center gap-1 mt-1"
                                  style={{ color: theme.textMuted }}
                                >
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  {eventDate
                                    ? new Date(eventDate).toLocaleDateString(
                                        "en-IN"
                                      )
                                    : "Date"}
                                </p>
                                <p className="mt-2">
                                  🎟 {b.tickets} ticket
                                  {b.tickets > 1 ? "s" : ""} · ₹
                                  {b.totalPrice}
                                </p>
                                <Link
                                  to={`/booking-success/${b._id}`}
                                  state={{ type: "event" }}
                                  className="inline-flex items-center gap-1 mt-3 text-[11px] px-3 py-1.5 rounded-full border backdrop-blur-sm"
                                  style={{
                                    borderColor: theme.borderSoft,
                                    background: theme.card,
                                    color: theme.textMain,
                                  }}
                                >
                                  View ticket
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default MyDashboard;
