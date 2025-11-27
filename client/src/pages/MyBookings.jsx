// src/pages/MyBookings.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Dumbbell,
  CalendarDays,
  Loader2,
  ArrowRight,
  Clock,
  CheckCircle2,
  QrCode,
  Ticket,
} from "lucide-react";
import API from "../utils/api";

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     🔄 Fetch user gym bookings from new backend
     GET /api/bookings/user  → { success, bookings }
  ========================================================= */
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You need to log in to view your passes.");
          setLoading(false);
          return;
        }

        const res = await API.get("/bookings/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.bookings || [];

        setBookings(data);
      } catch (err) {
        console.error("❌ Error fetching bookings:", err?.response || err);
        setError(
          err?.response?.data?.message || "Failed to load your passes."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  /* =========================================================
     🧠 Helpers
  ========================================================= */
  const isUpcoming = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return false;

    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    return d >= today;
  };

  const getDateLabel = (dateStr) => {
    if (!dateStr) return "Date not set";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "Date not set";

    const today = new Date();
    const tomorrow = new Date();
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(today.getDate() + 1);

    const dd = new Date(d);
    dd.setHours(0, 0, 0, 0);

    if (dd.getTime() === today.getTime()) return "Today";
    if (dd.getTime() === tomorrow.getTime()) return "Tomorrow";

    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status = "confirmed", dateStr) => {
    const base = status.toLowerCase();
    const now = new Date();
    const d = dateStr ? new Date(dateStr) : null;
    const isPast = d && d < now;

    if (base === "cancelled") {
      return {
        label: "Cancelled",
        className:
          "bg-rose-500/10 text-rose-400 border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/50",
      };
    }

    if (base === "checked-in" || base === "completed" || isPast) {
      return {
        label: base === "checked-in" ? "Checked-in" : "Completed",
        className:
          "bg-emerald-500/10 text-emerald-500 border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/50",
      };
    }

    return {
      label: "Active",
      className:
        "bg-sky-500/10 text-sky-500 border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-400/50",
    };
  };

  const splitBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return { upcoming: [], past: [] };
    const upcoming = [];
    const past = [];

    bookings.forEach((b) => {
      if (isUpcoming(b.date)) upcoming.push(b);
      else past.push(b);
    });

    return { upcoming, past };
  }, [bookings]);

  /* =========================================================
     🌀 Loading state
  ========================================================= */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-700 dark:text-slate-100">
        <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin mb-3 text-blue-600 dark:text-sky-400" />
        <p className="text-sm sm:text-base">
          Fetching your Passiify gym passes…
        </p>
      </div>
    );
  }

  /* =========================================================
     ⚠️ Error state
  ========================================================= */
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-sm sm:text-base text-rose-600 dark:text-rose-400 mb-4 max-w-md">
          {error}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500 transition"
          >
            Go back
          </button>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-white shadow-[0_18px_55px_rgba(15,23,42,0.65)] hover:scale-[1.02] hover:shadow-[0_22px_70px_rgba(15,23,42,0.8)] transition-transform"
          >
            Login again
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================================
     🕳 Empty state
  ========================================================= */
  if (!bookings || bookings.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mb-6 w-24 h-24 rounded-3xl border border-dashed border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center shadow-sm">
          <Dumbbell className="w-10 h-10 text-orange-500 dark:text-orange-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 mb-2 tracking-tight">
          No passes yet.
        </h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mb-6">
          You haven’t booked any 1-day passes yet. Discover gyms, boxes and
          studios near you and start your first drop-in with Passiify.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-white shadow-[0_18px_55px_rgba(15,23,42,0.7)] hover:scale-[1.03] hover:shadow-[0_22px_70px_rgba(15,23,42,0.85)] transition-transform"
        >
          Explore gyms
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const { upcoming, past } = splitBookings;

  /* =========================================================
     ✅ Main premium layout
  ========================================================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-14">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-36 w-[320px] h-[320px] bg-sky-500/20 dark:bg-sky-500/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -right-40 w-[360px] h-[360px] bg-orange-500/20 dark:bg-orange-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {/* Header */}
        <header className="mb-8 sm:mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500 mb-1">
              Passiify · Gym passes
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              My{" "}
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 bg-clip-text text-transparent">
                passes
              </span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl">
              Every gym visit in one place. Scan, train, shower, move on — no
              memberships, no drama.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <span>
              {upcoming.length} active · {past.length} completed
            </span>
          </div>
        </header>

        <div className="space-y-10">
          {/* Upcoming section */}
          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
                    Upcoming passes
                  </h2>
                </div>
                <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 text-slate-600 dark:text-slate-300">
                  {upcoming.length} active
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((booking) => {
                  const gym = booking.gym || {};
                  const statusBadge = getStatusBadge(
                    booking.status,
                    booking.date
                  );
                  const image =
                    gym.image ||
                    (Array.isArray(gym.images) && gym.images[0]) ||
                    "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800";

                  const shortCode =
                    (booking.bookingCode || booking._id || "")
                      .toString()
                      .slice(-6)
                      .toUpperCase() || "PASS";

                  return (
                    <article
                      key={booking._id}
                      className="relative bg-white/80 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_22px_80px_rgba(15,23,42,0.45)] hover:shadow-[0_26px_90px_rgba(15,23,42,0.6)] hover:-translate-y-0.5 transition-all backdrop-blur-xl"
                    >
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={image}
                          alt={gym.name || "Gym"}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-full bg-black/50 border border-white/20 text-white">
                            <CalendarDays className="w-3.5 h-3.5 mr-1 text-orange-300" />
                            {getDateLabel(booking.date)}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                          <span
                            className={`inline-flex items-center text-[11px] px-2.5 py-1 rounded-full border backdrop-blur-sm ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-black/40 border border-white/20 text-slate-100 font-mono">
                            <Ticket className="w-3 h-3" />
                            {shortCode}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5 text-sm text-slate-800 dark:text-slate-100">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold leading-snug line-clamp-1">
                            {gym.name || "Gym / Studio"}
                          </h3>
                        </div>

                        <p className="flex items-center text-[12px] text-slate-500 dark:text-slate-400 mb-1">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-orange-500 dark:text-orange-400" />
                          {gym.city || "City"}
                        </p>

                        <p className="flex items-center text-[12px] text-slate-500 dark:text-slate-400 mb-3">
                          <Dumbbell className="w-3.5 h-3.5 mr-1.5 text-sky-500 dark:text-sky-400" />
                          {booking.duration
                            ? `${booking.duration}-day pass`
                            : "1-day pass"}
                        </p>

                        {/* Footer row */}
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            ₹{booking.price || gym.price || 499}
                          </p>

                          <div className="flex items-center gap-2">
                            {booking.qrCode && (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                <QrCode className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                              </div>
                            )}

                            {/* 🎟 Ticket button – opens same premium ticket view as BookingSuccess */}
                            <button
                              onClick={() =>
                                navigate(`/booking-success/${booking._id}`, {
                                  state: { type: "gym", name: gym.name },
                                })
                              }
                              className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              Ticket
                            </button>

                            <Link
                              to={`/booking-success/${booking._id}`}
                              state={{ type: "gym", name: gym.name }}
                              className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400 text-white font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] transition"
                            >
                              View pass
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Past section */}
          {past.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
                    Past visits
                  </h2>
                </div>
                <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 text-slate-600 dark:text-slate-300">
                  {past.length} completed
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map((booking) => {
                  const gym = booking.gym || {};
                  const statusBadge = getStatusBadge(
                    booking.status,
                    booking.date
                  );
                  const image =
                    gym.image ||
                    (Array.isArray(gym.images) && gym.images[0]) ||
                    "https://images.pexels.com/photos/7031707/pexels-photo-7031707.jpeg?auto=compress&cs=tinysrgb&w=800";

                  return (
                    <article
                      key={booking._id}
                      className="relative bg-white/70 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800/70 rounded-3xl overflow-hidden shadow-[0_16px_60px_rgba(15,23,42,0.35)] backdrop-blur-xl"
                    >
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={image}
                          alt={gym.name || "Gym"}
                          className="w-full h-full object-cover grayscale-[0.3]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute top-3 right-3">
                          <span
                            className={`inline-flex items-center text-[11px] px-2.5 py-1 rounded-full border backdrop-blur-sm ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 text-sm text-slate-800 dark:text-slate-100">
                        <h3 className="text-base font-semibold mb-1 line-clamp-1">
                          {gym.name || "Gym / Studio"}
                        </h3>
                        <p className="flex items-center text-[12px] text-slate-500 dark:text-slate-400 mb-1">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-orange-500 dark:text-orange-400" />
                          {gym.city || "City"}
                        </p>
                        <p className="flex items-center text-[12px] text-slate-500 dark:text-slate-400 mb-1">
                          <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-sky-500 dark:text-sky-400" />
                          {getDateLabel(booking.date)}
                        </p>
                        <p className="flex items-center text-[12px] text-slate-500 dark:text-slate-400 mb-3">
                          <Dumbbell className="w-3.5 h-3.5 mr-1.5 text-sky-500 dark:text-sky-400" />
                          {booking.duration
                            ? `${booking.duration}-day pass`
                            : "1-day pass"}
                        </p>

                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            ₹{booking.price || gym.price || 499}
                          </p>
                          <div className="flex items-center gap-2">
                            {/* 🎟 Ticket button for past visits as well */}
                            <button
                              onClick={() =>
                                navigate(`/booking-success/${booking._id}`, {
                                  state: { type: "gym", name: gym.name },
                                })
                              }
                              className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              Ticket
                            </button>

                            <Link
                              to={`/booking-success/${booking._id}`}
                              state={{ type: "gym", name: gym.name }}
                              className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                            >
                              View pass
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
