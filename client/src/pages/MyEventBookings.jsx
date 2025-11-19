// src/pages/MyEventBookings.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  CalendarDays,
  Loader2,
  ArrowRight,
  Clock,
  Users,
  Ticket,
  QrCode,
  Sparkles,
} from "lucide-react";
import API from "../utils/api";

export default function MyEventBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     🔄 Fetch event bookings for logged in user
     GET /event-bookings/me → { success, bookings }
  ========================================================= */
  useEffect(() => {
    const fetchEventBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You need to log in to view your experience tickets.");
          setLoading(false);
          return;
        }

        const res = await API.get("/event-bookings/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.bookings || [];

        setBookings(data);
      } catch (err) {
        console.error("❌ Error fetching event bookings:", err?.response || err);
        setError(
          err?.response?.data?.message ||
            "Failed to load your experience tickets."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventBookings();
  }, []);

  /* =========================================================
     🧠 Helpers
  ========================================================= */
  const getEventDate = (booking) => {
    if (!booking) return null;
    const raw = booking.eventDate || booking.event?.date;
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const isUpcoming = (booking) => {
    const d = getEventDate(booking);
    if (!d) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  };

  const getDateLabel = (booking) => {
    const d = getEventDate(booking);
    if (!d) return "Date not set";

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

  const getStatusBadge = (status = "active", booking) => {
    const base = status.toLowerCase();
    const d = getEventDate(booking);
    const now = new Date();
    const isPast = d && d < now;

    if (base === "cancelled") {
      return {
        label: "Cancelled",
        className:
          "bg-rose-500/10 text-rose-500 border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/60",
      };
    }

    if (base === "checked-in") {
      return {
        label: "Checked-in",
        className:
          "bg-emerald-500/10 text-emerald-500 border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/60",
      };
    }

    if (base === "expired" || base === "no-show" || isPast) {
      return {
        label: "Completed",
        className:
          "bg-slate-500/10 text-slate-600 border-slate-500/40 dark:bg-slate-600/15 dark:text-slate-200 dark:border-slate-500/60",
      };
    }

    return {
      label: "Active",
      className:
        "bg-sky-500/10 text-sky-500 border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-400/60",
    };
  };

  const splitBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return { upcoming: [], past: [] };

    const upcoming = [];
    const past = [];

    bookings.forEach((b) => {
      if (isUpcoming(b)) upcoming.push(b);
      else past.push(b);
    });

    return { upcoming, past };
  }, [bookings]);

  /* =========================================================
     🌀 Loading
  ========================================================= */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-700 dark:text-slate-100">
        <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin mb-3 text-blue-600 dark:text-sky-400" />
        <p className="text-sm sm:text-base">
          Fetching your Passiify experience tickets…
        </p>
      </div>
    );
  }

  /* =========================================================
     ⚠️ Error
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
     🕳 Empty
  ========================================================= */
  if (!bookings || bookings.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mb-6 w-24 h-24 rounded-3xl border border-dashed border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center shadow-sm">
          <Sparkles className="w-10 h-10 text-orange-500 dark:text-orange-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 mb-2 tracking-tight">
          No experiences booked yet.
        </h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mb-6">
          Browse retreats, treks, yoga mornings and more. Your next story might
          start with a single ticket.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-white shadow-[0_18px_55px_rgba(15,23,42,0.7)] hover:scale-[1.03] hover:shadow-[0_22px_70px_rgba(15,23,42,0.85)] transition-transform"
        >
          Explore experiences
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-14 relative">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-36 w-[320px] h-[320px] bg-sky-500/22 dark:bg-sky-500/28 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -right-40 w-[360px] h-[360px] bg-orange-500/20 dark:bg-orange-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {/* Header */}
        <header className="mb-8 sm:mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500 mb-1">
              Passiify · Experience tickets
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              My{" "}
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 bg-clip-text text-transparent">
                experiences
              </span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl">
              Hikes, retreats, workouts and pop-ups you’ve booked with Passiify.
              All your tickets, one clean view.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <span>
              {upcoming.length} upcoming · {past.length} past
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
                    Upcoming experiences
                  </h2>
                </div>
                <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 text-slate-600 dark:text-slate-300">
                  {upcoming.length} active
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((booking) => {
                  const evt = booking.event || {};
                  const statusBadge = getStatusBadge(booking.status, booking);
                  const ticketsCount = booking.tickets || 1;

                  const image =
                    evt.image ||
                    "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=900&auto=format&fit=crop&q=80";

                  const shortCode =
                    (booking.bookingCode || booking._id || "")
                      .toString()
                      .slice(-6)
                      .toUpperCase() || "TICKET";

                  return (
                    <article
                      key={booking._id}
                      className="relative bg-white/80 dark:bg-slate-950/85 border border-slate-200/70 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_22px_80px_rgba(15,23,42,0.45)] hover:shadow-[0_26px_90px_rgba(15,23,42,0.6)] hover:-translate-y-0.5 transition-all backdrop-blur-xl"
                    >
                      {/* Image */}
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={image}
                          alt={evt.name || "Experience"}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />

                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          <span className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-full bg-black/55 border border-white/20 text-white">
                            <CalendarDays className="w-3.5 h-3.5 mr-1 text-orange-300" />
                            {getDateLabel(booking)}
                          </span>
                          <span className="inline-flex items-center text-[10px] px-2.5 py-1 rounded-full bg-black/40 border border-white/20 text-slate-100">
                            <Users className="w-3 h-3 mr-1" />
                            {ticketsCount} ticket
                            {ticketsCount > 1 ? "s" : ""}
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
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold leading-snug line-clamp-1">
                              {evt.name || "Passiify Experience"}
                            </h3>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                              Hosted by{" "}
                              <span className="font-medium">
                                {evt.organizer || "Passiify Community"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <p className="flex items-center text-[12px] text-slate-500 dark:text-slate-400 mb-2">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-orange-500 dark:text-orange-400" />
                          {evt.location || "Location TBA"}
                        </p>

                        {/* Footer row */}
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            ₹{booking.totalPrice || evt.price || 0}
                          </p>

                          <div className="flex items-center gap-2">
                            {booking.qrCode && (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                <QrCode className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                              </div>
                            )}
                            <Link
                              to={`/booking-success/${booking._id}`}
                              state={{ type: "event", name: evt.name }}
                              className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400 text-white font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] transition"
                            >
                              View ticket
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
                  <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
                    Past experiences
                  </h2>
                </div>
                <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 text-slate-600 dark:text-slate-300">
                  {past.length} completed
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map((booking) => {
                  const evt = booking.event || {};
                  const statusBadge = getStatusBadge(booking.status, booking);
                  const image =
                    evt.image ||
                    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&auto=format&fit=crop&q=80";

                  return (
                    <article
                      key={booking._id}
                      className="relative bg-white/70 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800/70 rounded-3xl overflow-hidden shadow-[0_16px_60px_rgba(15,23,42,0.35)] backdrop-blur-xl"
                    >
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={image}
                          alt={evt.name || "Experience"}
                          className="w-full h-full object-cover grayscale-[0.25]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent" />
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
                          {evt.name || "Passiify Experience"}
                        </h3>
                        <p className="flex items-center text-[12px] text-slate-500 dark:text-slate-400 mb-1">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-orange-500 dark:text-orange-400" />
                          {evt.location || "Location"}
                        </p>
                        <p className="flex items-center text-[12px] text-slate-500 dark:text-slate-400 mb-1">
                          <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-sky-500 dark:text-sky-400" />
                          {getDateLabel(booking)}
                        </p>
                        <p className="flex items-center text-[12px] text-slate-500 dark:text-slate-400 mb-3">
                          <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-500 dark:text-emerald-400" />
                          {booking.tickets || 1} ticket
                          {(booking.tickets || 1) > 1 ? "s" : ""}
                        </p>

                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            ₹{booking.totalPrice || evt.price || 0}
                          </p>
                          <Link
                            to={`/booking-success/${booking._id}`}
                            state={{ type: "event", name: evt.name }}
                            className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                          >
                            View ticket
                          </Link>
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
