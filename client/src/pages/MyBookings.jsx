import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Dumbbell,
  Calendar as CalendarIcon,
  Loader2,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import API from "../utils/api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You need to login to view your bookings.");
          setLoading(false);
          return;
        }

        const res = await API.get("/bookings/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data) ? res.data : res.data.bookings || [];
        setBookings(data);
      } catch (err) {
        console.error("❌ Error fetching bookings:", err.response?.data || err);
        setError(err.response?.data?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // 🔎 Helpers
  const isUpcoming = (dateStr) => {
    const today = new Date();
    const d = new Date(dateStr);
    // compare only date portion
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  };

  const getDateLabel = (dateStr) => {
    const d = new Date(dateStr);
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
    const d = new Date(dateStr);

    // auto “completed” if date is in the past
    const past = d < now && base === "confirmed";

    if (base === "cancelled") {
      return {
        label: "Cancelled",
        className:
          "bg-red-500/10 border-red-400/60 text-red-300",
      };
    }

    if (past || base === "completed") {
      return {
        label: "Completed",
        className:
          "bg-emerald-500/10 border-emerald-400/60 text-emerald-300",
      };
    }

    return {
      label: "Confirmed",
      className:
        "bg-sky-500/10 border-sky-400/60 text-sky-300",
    };
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-sm sm:text-base text-gray-200"
        style={{
          backgroundColor: "#050308",
          backgroundImage:
            "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
        }}
      >
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-sky-400" />
        Loading your bookings...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 text-gray-200"
        style={{
          backgroundColor: "#050308",
          backgroundImage:
            "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
        }}
      >
        <p className="text-red-300 font-medium mb-4">{error}</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-orange-400 text-gray-900 px-6 py-2.5 rounded-full text-sm font-semibold shadow-[0_16px_60px_rgba(0,0,0,0.9)] hover:scale-[1.02] transition-transform"
        >
          Login Again <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 text-gray-200"
        style={{
          backgroundColor: "#050308",
          backgroundImage:
            "radial-gradient(circle at top, rgba(248,216,181,0.2), transparent 55%)",
        }}
      >
        <div className="mb-6 w-24 h-24 rounded-full border border-dashed border-white/25 grid place-items-center">
          <Dumbbell className="w-10 h-10 text-orange-300" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">
          No passes… yet.
        </h2>
        <p className="text-sm sm:text-base text-gray-400 max-w-md mb-6">
          You haven’t booked any 1-day passes. Explore gyms, MMA boxes and
          studios around you and start your first drop-in.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-orange-400 text-gray-900 px-6 py-2.5 rounded-full text-sm font-semibold shadow-[0_16px_60px_rgba(0,0,0,0.9)] hover:scale-[1.02] transition-transform"
        >
          Explore Gyms <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const upcoming = bookings.filter((b) => isUpcoming(b.date));
  const past = bookings.filter((b) => !isUpcoming(b.date));

  return (
    <div
      className="min-h-screen py-14 sm:py-16 px-4 sm:px-6"
      style={{
        backgroundColor: "#050308",
        backgroundImage:
          "radial-gradient(circle at top, rgba(248,216,181,0.2), transparent 55%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            My <span className="text-orange-300">Bookings</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
            All your day passes in one place. Scan, train, repeat — wherever
            you are in the world.
          </p>
        </header>

        <div className="space-y-10">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-400" />
                  Upcoming Passes
                </h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
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
                  return (
                    <article
                      key={booking._id}
                      className="relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-[0_18px_70px_rgba(0,0,0,0.95)] hover:border-orange-400/60 hover:shadow-[0_24px_90px_rgba(0,0,0,1)] transition-all"
                    >
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={
                            gym.image ||
                            gym.images?.[0] ||
                            "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800"
                          }
                          alt={gym.name}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        <div className="absolute top-3 left-3 text-[11px] px-2.5 py-1 rounded-full bg-black/60 border border-white/15 text-gray-100 flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-orange-300" />
                          <span>{getDateLabel(booking.date)}</span>
                        </div>
                        <div
                          className={`absolute top-3 right-3 text-[11px] px-2.5 py-1 rounded-full border ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4.5 sm:p-5 text-gray-100 text-sm">
                        <h3 className="text-base sm:text-lg font-semibold mb-1 line-clamp-1">
                          {gym.name || "Gym / Studio"}
                        </h3>
                        <p className="flex items-center text-[12px] text-gray-400 mb-1">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-orange-300" />
                          {gym.city || "City"}
                        </p>
                        <p className="flex items-center text-[12px] text-gray-400 mb-2">
                          <Dumbbell className="w-3.5 h-3.5 mr-1 text-sky-300" />
                          {booking.duration
                            ? `${booking.duration}-Day Pass`
                            : "1-Day Pass"}
                        </p>

                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-semibold text-orange-200">
                            ₹{booking.price || gym.price || 499}
                          </p>
                          <Link
                            to={`/booking-success/${booking._id}`}
                            state={{ type: "gym", name: gym.name }}
                            className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-white text-gray-900 font-semibold shadow-sm hover:shadow-md"
                          >
                            View Pass
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Past bookings */}
          {past.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Past Visits
                </h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
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
                  return (
                    <article
                      key={booking._id}
                      className="relative bg-white/3 border border-white/8 rounded-2xl overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.85)]"
                    >
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={
                            gym.image ||
                            gym.images?.[0] ||
                            "https://images.pexels.com/photos/7031707/pexels-photo-7031707.jpeg?auto=compress&cs=tinysrgb&w=800"
                          }
                          alt={gym.name}
                          className="w-full h-full object-cover grayscale-[0.25]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        <div
                          className={`absolute top-3 right-3 text-[11px] px-2.5 py-1 rounded-full border ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </div>
                      </div>

                      <div className="p-4.5 sm:p-5 text-gray-100 text-sm">
                        <h3 className="text-base font-semibold mb-1 line-clamp-1">
                          {gym.name || "Gym / Studio"}
                        </h3>
                        <p className="flex items-center text-[12px] text-gray-400 mb-1">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-orange-300" />
                          {gym.city || "City"}
                        </p>
                        <p className="flex items-center text-[12px] text-gray-400 mb-1">
                          <CalendarIcon className="w-3.5 h-3.5 mr-1 text-sky-300" />
                          {getDateLabel(booking.date)}
                        </p>
                        <p className="flex items-center text-[12px] text-gray-400 mb-2">
                          <Dumbbell className="w-3.5 h-3.5 mr-1 text-sky-300" />
                          {booking.duration
                            ? `${booking.duration}-Day Pass`
                            : "1-Day Pass"}
                        </p>

                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-orange-200">
                            ₹{booking.price || gym.price || 499}
                          </p>
                          <Link
                            to={`/booking-success/${booking._id}`}
                            state={{ type: "gym", name: gym.name }}
                            className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-white/5 border border-white/20 text-gray-100 hover:bg-white/10"
                          >
                            View Pass
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
