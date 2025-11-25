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
  Edit3,
  X,
  Save,
  ArrowRight,
  TrendingUp,
  Dumbbell,
  Sparkles,
} from "lucide-react";

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
   MAIN COMPONENT
========================================== */
const MyDashboard = () => {
  const [user, setUser] = useState(null);

  const [gymBookings, setGymBookings] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

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
    setUpdatedName(userData.name || "");
    setUpdatedEmail(userData.email || "");

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
        console.error("❌ Error loading dashboard data:", err.response?.data || err);
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

  const totalGymSpend = gymBookings.reduce(
    (sum, b) => sum + (Number(b.price) || 0),
    0
  );
  const totalEventSpend = eventBookings.reduce(
    (sum, b) => sum + (Number(b.totalPrice) || 0),
    0
  );
  const totalSpend = totalGymSpend + totalEventSpend;

  const totalPasses = gymBookings.length;
  const totalEvents = eventBookings.length;
  const totalUpcoming = upcomingGymBookings.length + upcomingEventBookings.length;

  const hasVibe =
    vibe.primaryGoal ||
    vibe.preferredTime ||
    vibe.homeCity ||
    vibe.travelCities;
  const vibeComplete = Boolean(vibe.primaryGoal && vibe.preferredTime);

  /* ===============================
     Actions
  =============================== */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileUpdate = async () => {
    if (!user?._id) return;
    try {
      setUpdatingProfile(true);
      const res = await API.put(
        `/auth/update-profile/${user._id}`,
        { name: updatedName, email: updatedEmail },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200 && res.data?.user) {
        const updatedUser = res.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setUpdatedName(updatedUser.name || "");
        setUpdatedEmail(updatedUser.email || "");
        setEditing(false);
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error.response?.data || error);
    } finally {
      setUpdatingProfile(false);
    }
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

  /* ===============================
     Loading state
  =============================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="bg-white/80 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800/80 rounded-3xl px-6 py-5 shadow-[0_22px_80px_rgba(15,23,42,0.5)] flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Loading your Passiify dashboard…
          </p>
        </div>
      </div>
    );
  }

  /* ===============================
     Not logged in state
  =============================== */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
        <div className="max-w-md w-full bg-white/90 dark:bg-slate-950/85 border border-slate-200/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_22px_80px_rgba(15,23,42,0.55)] text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
            You’re not logged in
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Log in to see your passes, event tickets and your travel fitness
            history across cities.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-slate-950 shadow-[0_20px_70px_rgba(15,23,42,0.8)] hover:scale-[1.03] transition-transform"
          >
            Go to login
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  /* ===============================
     Main dashboard
  =============================== */
  const avatarLetter = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 -left-40 w-[320px] h-[320px] bg-sky-500/20 dark:bg-sky-500/28 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[360px] h-[360px] bg-orange-500/18 dark:bg-orange-500/24 rounded-full blur-3xl" />
      </div>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-16">
        {/* HEADER CARD */}
        <section className="bg-white/90 dark:bg-slate-950/85 border border-slate-200/70 dark:border-slate-800/80 rounded-3xl shadow-[0_24px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl px-5 sm:px-7 py-5 sm:py-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-sky-500 to-orange-500 flex items-center justify-center text-xl sm:text-2xl font-bold text-slate-950 shadow-[0_20px_70px_rgba(15,23,42,0.8)]">
              {avatarLetter}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-1">
                Passiify · Member dashboard
              </p>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {user?.name || "Passiify Member"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {user?.email}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                All your day passes and event tickets in one place. Land in any
                city with a workout already planned.
              </p>
              {vibeComplete && (
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  <span>
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
              onClick={() => setEditing(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] sm:text-xs font-semibold bg-white/80 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-700 hover:border-sky-400/70 dark:hover:border-sky-400/70 text-slate-800 dark:text-slate-100 shadow-sm transition"
            >
              <Edit3 size={14} />
              Edit profile
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] sm:text-xs font-semibold bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-slate-950 shadow-[0_22px_80px_rgba(15,23,42,0.9)] hover:scale-[1.03] transition-transform"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </section>

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 text-xs sm:text-sm">
          <div className="rounded-2xl bg-white/85 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800/80 px-4 py-3 shadow-[0_16px_60px_rgba(15,23,42,0.4)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Total passes
              </span>
              <Dumbbell className="w-4 h-4 text-orange-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">
              {totalPasses}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Gym & studio day passes used.
            </p>
          </div>

          <div className="rounded-2xl bg-white/85 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800/80 px-4 py-3 shadow-[0_16px_60px_rgba(15,23,42,0.4)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Events joined
              </span>
              <Ticket className="w-4 h-4 text-orange-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">
              {totalEvents}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Marathons, retreats, festivals & more.
            </p>
          </div>

          <div className="rounded-2xl bg-white/85 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800/80 px-4 py-3 shadow-[0_16px_60px_rgba(15,23,42,0.4)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Total spend
              </span>
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">
              ₹{totalSpend.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Across gyms & events.
            </p>
          </div>

          <div className="rounded-2xl bg-white/85 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800/80 px-4 py-3 shadow-[0_16px_60px_rgba(15,23,42,0.4)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Upcoming
              </span>
              <Sparkles className="w-4 h-4 text-orange-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">
              {totalUpcoming}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Passes & event tickets lined up.
            </p>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="flex flex-wrap gap-3 mb-8 text-[11px] sm:text-xs">
          <button
            onClick={() => navigate("/explore")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-400/70 dark:hover:border-sky-400/70 text-slate-700 dark:text-slate-100 shadow-sm transition"
          >
            Discover new gyms
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate("/events")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-400/70 dark:hover:border-sky-400/70 text-slate-700 dark:text-slate-100 shadow-sm transition"
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
              className={`px-5 py-2.5 rounded-full font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-slate-950 shadow-[0_20px_70px_rgba(15,23,42,0.7)]"
                  : "bg-white/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-400/70 dark:hover:border-sky-400/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* TAB CONTENT CARD */}
        <section className="bg-white/92 dark:bg-slate-950/88 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-[0_24px_90px_rgba(15,23,42,0.6)] backdrop-blur-xl p-5 sm:p-7">
          {/* Overview */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-blue-600 via-sky-500 to-orange-500 flex items-center justify-center text-2xl sm:text-3xl font-bold text-slate-950 shadow-[0_20px_70px_rgba(15,23,42,0.8)]">
                  {avatarLetter}
                </div>
                <h2 className="text-lg sm:text-2xl font-semibold mt-4">
                  {user?.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                  This is your Passiify trail — every city you train in, every
                  event you join, all stitched into one flexible story.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="rounded-2xl bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 px-4 py-3">
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                    Training style
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    Explorer mode
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    You use passes and events instead of long memberships —
                    pure flexibility.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 px-4 py-3">
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                    Most active category
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {totalPasses >= totalEvents ? "Gyms & Studios" : "Events"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Rotate between MMA, yoga, runs, hikes and more whenever you
                    feel like it.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 px-4 py-3">
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                    Next step
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    Lock your next city session
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Book in advance so you land with a workout already on your
                    calendar.
                  </p>
                </div>
              </div>

              {/* Your Passiify vibe */}
              <div className="rounded-2xl bg-slate-50/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-5 py-4 sm:py-5 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-500" />
                      <h3 className="text-sm sm:text-base font-semibold">
                        Your Passiify vibe
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                      Tell Passiify what kind of movement you love. We’ll use
                      this to surface better gyms and events for your vibe.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    {vibeComplete ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 border border-emerald-200/70 dark:border-emerald-700/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Vibe set
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Not fully set
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
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
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
                            className={`px-3 py-1.5 rounded-full text-[11px] border transition ${
                              active
                                ? "bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-slate-950 border-transparent shadow-sm"
                                : "bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-100 hover:border-sky-400/70 dark:hover:border-sky-400/70"
                            }`}
                          >
                            {goal}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
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
                            className={`px-3 py-1.5 rounded-full text-[11px] border transition ${
                              active
                                ? "bg-sky-50 dark:bg-sky-900/40 text-sky-800 dark:text-sky-100 border-sky-300/80 dark:border-sky-600/80"
                                : "bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-100 hover:border-sky-400/70 dark:hover:border-sky-400/70"
                            }`}
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
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
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
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[11px] sm:text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/50"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
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
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[11px] sm:text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 justify-between">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md">
                    We keep this on your device and use it to prioritise
                    experiences that match how and when you like to move.
                  </p>
                  <button
                    type="button"
                    onClick={handleSaveVibe}
                    disabled={savingVibe}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-slate-950 shadow-[0_16px_60px_rgba(15,23,42,0.8)] hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100"
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
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
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
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Track your one-day and short-term passes across cities.
                </p>
              </div>

              {gymBookings.length === 0 ? (
                <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-10">
                  <p>No gym bookings yet.</p>
                  <button
                    onClick={() => navigate("/explore")}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-400/70 dark:hover:border-sky-400/70 text-[11px] text-slate-700 dark:text-slate-100 shadow-sm transition"
                  >
                    Discover your first gym
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  {upcomingGymBookings.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
                        Upcoming passes
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingGymBookings.map((b) => (
                          <div
                            key={b._id}
                            className="bg-white/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 text-xs sm:text-sm shadow-[0_18px_60px_rgba(15,23,42,0.35)] hover:-translate-y-[2px] hover:shadow-[0_22px_80px_rgba(15,23,42,0.5)] transition"
                          >
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1 line-clamp-1">
                              {b.gym?.name || "Gym / Studio"}
                            </h3>
                            <p className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              <MapPin className="w-3.5 h-3.5" />
                              {b.gym?.city || "City"}
                            </p>
                            <p className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mt-1">
                              <CalendarDays className="w-3.5 h-3.5" />
                              {b.date
                                ? new Date(b.date).toLocaleDateString("en-IN")
                                : "Date"}
                            </p>
                            <p className="mt-2 text-slate-900 dark:text-slate-50">
                              ₹{b.price} · {b.duration} day
                              {b.duration > 1 ? "s" : ""}
                            </p>
                            <Link
                              to={`/booking-success/${b._id}`}
                              state={{ type: "gym" }}
                              className="inline-flex items-center gap-1 mt-3 text-[11px] px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-slate-950 shadow-sm"
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
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
                        Past sessions
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pastGymBookings.map((b) => (
                          <div
                            key={b._id}
                            className="bg-slate-50/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 text-xs sm:text-sm"
                          >
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1 line-clamp-1">
                              {b.gym?.name || "Gym / Studio"}
                            </h3>
                            <p className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              <MapPin className="w-3.5 h-3.5" />
                              {b.gym?.city || "City"}
                            </p>
                            <p className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mt-1">
                              <CalendarDays className="w-3.5 h-3.5" />
                              {b.date
                                ? new Date(b.date).toLocaleDateString("en-IN")
                                : "Date"}
                            </p>
                            <p className="mt-2 text-slate-800 dark:text-slate-200">
                              ₹{b.price} · {b.duration} day
                              {b.duration > 1 ? "s" : ""}
                            </p>
                            <Link
                              to={`/booking-success/${b._id}`}
                              state={{ type: "gym" }}
                              className="inline-flex items-center gap-1 mt-3 text-[11px] px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-400/70 dark:hover:border-sky-400/70 text-slate-800 dark:text-slate-100"
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
                <h2 className="text-lg sm:text-xl font-bold">Event Tickets</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Track marathons, retreats, treks & community workouts.
                </p>
              </div>

              {eventBookings.length === 0 ? (
                <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-10">
                  <p>No event bookings yet.</p>
                  <button
                    onClick={() => navigate("/events")}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-400/70 dark:hover:border-sky-400/70 text-[11px] text-slate-700 dark:text-slate-100 shadow-sm transition"
                  >
                    Discover events
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  {upcomingEventBookings.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
                        Upcoming events
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingEventBookings.map((b) => {
                          const eventDate = b.event?.date || b.eventDate;
                          return (
                            <div
                              key={b._id}
                              className="bg-white/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 text-xs sm:text-sm shadow-[0_18px_60px_rgba(15,23,42,0.35)] hover:-translate-y-[2px] hover:shadow-[0_22px_80px_rgba(15,23,42,0.5)] transition"
                            >
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1 line-clamp-1">
                                {b.event?.name || "Event"}
                              </h3>
                              <p className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3.5 h-3.5" />
                                {b.event?.location || "Location"}
                              </p>
                              <p className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mt-1">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {eventDate
                                  ? new Date(eventDate).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "Date"}
                              </p>
                              <p className="mt-2 text-slate-900 dark:text-slate-50">
                                🎟 {b.tickets} ticket
                                {b.tickets > 1 ? "s" : ""} · ₹
                                {b.totalPrice}
                              </p>
                              <Link
                                to={`/booking-success/${b._id}`}
                                state={{ type: "event" }}
                                className="inline-flex items-center gap-1 mt-3 text-[11px] px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-slate-950 shadow-sm"
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
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
                        Past events
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pastEventBookings.map((b) => {
                          const eventDate = b.event?.date || b.eventDate;
                          return (
                            <div
                              key={b._id}
                              className="bg-slate-50/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 text-xs sm:text-sm"
                            >
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1 line-clamp-1">
                                {b.event?.name || "Event"}
                              </h3>
                              <p className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3.5 h-3.5" />
                                {b.event?.location || "Location"}
                              </p>
                              <p className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mt-1">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {eventDate
                                  ? new Date(eventDate).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "Date"}
                              </p>
                              <p className="mt-2 text-slate-800 dark:text-slate-200">
                                🎟 {b.tickets} ticket
                                {b.tickets > 1 ? "s" : ""} · ₹
                                {b.totalPrice}
                              </p>
                              <Link
                                to={`/booking-success/${b._id}`}
                                state={{ type: "event" }}
                                className="inline-flex items-center gap-1 mt-3 text-[11px] px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-400/70 dark:hover:border-sky-400/70 text-slate-800 dark:text-slate-100"
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

      {/* EDIT PROFILE MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-7 w-full max-w-md relative shadow-[0_26px_100px_rgba(15,23,42,0.95)]">
            <button
              onClick={() => setEditing(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
              <Edit3 size={18} className="text-sky-500" />
              Edit profile
            </h3>
            <div className="flex flex-col gap-3 text-xs sm:text-sm">
              <input
                type="text"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/50"
                placeholder="Name"
              />
              <input
                type="email"
                value={updatedEmail}
                onChange={(e) => setUpdatedEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/50"
                placeholder="Email"
              />
              <button
                onClick={handleProfileUpdate}
                disabled={updatingProfile}
                className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-slate-950 shadow-[0_20px_70px_rgba(15,23,42,0.9)] hover:scale-[1.02] transition-transform disabled:opacity-65 disabled:hover:scale-100"
              >
                {updatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDashboard;
