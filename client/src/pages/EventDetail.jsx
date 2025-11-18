import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  CalendarDays,
  Users,
  Star,
  Loader2,
  ArrowLeft,
  Ticket,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  Clock,
  Globe2,
  Languages,
  Sparkles,
  HeartHandshake,
  Info,
  Plane,
  Shield,
} from "lucide-react";
import API from "../utils/api";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // 🧠 Fetch event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await API.get(`/events/${id}`);
        setEvent(res.data.event || res.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // 🎫 Handle booking
  const handleBookEvent = async () => {
    if (!event || bookingLoading) return;

    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = eventDate < today;

    if (isPast) {
      alert("This event has already happened. Please choose another one.");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("Please login to book this event.");
        navigate("/login");
        return;
      }

      const parsed = JSON.parse(storedUser);
      const userData = parsed.user || parsed;
      const userId = userData._id;

      if (!userId) {
        alert("User not found. Please log in again.");
        navigate("/login");
        return;
      }

      setBookingLoading(true);

      const res = await API.post("/event-bookings", {
        userId,
        eventId: event._id,
        tickets: 1,
      });

      if (res.data.success && res.data.booking) {
        navigate(`/booking-success/${res.data.booking._id}`, {
          state: { type: "event", name: event.name },
        });
      } else {
        alert(res.data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error booking event:", error);
      alert("Failed to book this event. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-[60vh]"
        style={{
          backgroundColor: "#050308",
          backgroundImage:
            "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
        }}
      >
        <Loader2 className="animate-spin text-sky-400" size={42} />
      </div>
    );
  }

  if (!event) {
    return (
      <div
        className="min-h-screen flex flex-col justify-center items-center text-gray-200 px-6 text-center"
        style={{
          backgroundColor: "#050308",
          backgroundImage:
            "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
        }}
      >
        <p className="mb-4 text-lg">❌ Event not found.</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-orange-400 text-gray-900 px-6 py-2.5 rounded-full text-sm font-semibold shadow-[0_16px_60px_rgba(0,0,0,0.9)] hover:scale-[1.02] transition-transform"
        >
          Browse Events
        </Link>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  const isPast = eventDate < today;

  const dateLabel = eventDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const tags =
    event.tags && event.tags.length
      ? event.tags
      : ["Outdoor", "Community", "Fitness", "Travel Friendly"];

  const capacityLabel =
    typeof event.capacity === "number" && event.capacity > 0
      ? `Up to ${event.capacity} guests`
      : "Small group experience";

  const ratingLabel =
    event.rating && Number(event.rating) > 0
      ? Number(event.rating).toFixed(1)
      : "4.7";

  const isApproved = event.status?.toLowerCase() === "approved";

  return (
    <div
      className="min-h-screen text-gray-100 pb-20"
      style={{
        backgroundColor: "#050308",
        backgroundImage:
          "radial-gradient(circle at top, rgba(248,216,181,0.22), transparent 55%)",
      }}
    >
      {/* Top bar with back + trust marker */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-300 hover:text-orange-300 transition"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back
        </button>
        <div className="flex items-center gap-3">
          {isApproved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-[11px] text-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Passiify Verified Experience
            </span>
          )}
          <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
            Passiify / Event
          </span>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
        <div className="relative rounded-[30px] overflow-hidden shadow-[0_28px_120px_rgba(0,0,0,1)] border border-white/10">
          <div className="relative h-[320px] sm:h-[420px] md:h-[460px]">
            <img
              src={event.image || "/images/default-event.jpg"}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

            {/* Hero content */}
            <div className="absolute bottom-6 sm:bottom-10 left-5 sm:left-8 right-5 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-3 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-orange-300" />
                  <span className="uppercase tracking-[0.18em] text-gray-200">
                    Curated Fitness Experience
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                  {event.name}
                </h1>
                <p className="flex items-center gap-2 text-sm text-gray-200">
                  <MapPin size={16} className="text-orange-300" />
                  {event.location}
                </p>
              </div>

              <div className="text-right space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/25 text-xs sm:text-sm">
                  <CalendarDays size={15} className="text-sky-300" />
                  <span>{dateLabel}</span>
                </div>
                <div className="inline-flex items-baseline gap-1 px-4 py-2 rounded-2xl bg-black/60 border border-white/10">
                  <span className="text-xs text-gray-400">from</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-orange-300">
                    ₹{event.price}
                  </span>
                  <span className="text-[11px] text-gray-300 ml-1">
                    / person
                  </span>
                </div>
              </div>
            </div>

            {/* Top-right pills */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
              <div className="text-[11px] px-3 py-1 rounded-full bg-black/70 border border-white/20 text-gray-100 flex items-center gap-1.5">
                <Users size={14} className="text-sky-300" />
                <span>{capacityLabel}</span>
              </div>
              <div className="text-[11px] px-3 py-1 rounded-full bg-black/70 border border-white/20 text-yellow-300 flex items-center gap-1.5">
                <Star className="fill-yellow-300 text-yellow-300 w-3.5 h-3.5" />
                <span>{ratingLabel} / 5.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 grid md:grid-cols-3 gap-8 lg:gap-10">
        {/* LEFT: Details */}
        <section className="md:col-span-2 space-y-8">
          {/* Quick meta + tags */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <div className="grid sm:grid-cols-3 gap-4 text-xs sm:text-sm mb-4">
              <div className="flex items-start gap-2">
                <CalendarDays className="w-4 h-4 mt-0.5 text-sky-300" />
                <div>
                  <p className="text-gray-400">Date & time</p>
                  <p className="text-gray-100 font-medium">{dateLabel}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-0.5 text-orange-300" />
                <div>
                  <p className="text-gray-400">Group size</p>
                  <p className="text-gray-100 font-medium">{capacityLabel}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe2 className="w-4 h-4 mt-0.5 text-emerald-300" />
                <div>
                  <p className="text-gray-400">Perfect for</p>
                  <p className="text-gray-100 font-medium">
                    Travellers, expats & locals
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
              About this experience
            </h2>
            <p className="text-sm sm:text-[15px] text-gray-200 leading-relaxed">
              {event.description ||
                "A curated fitness experience designed for travellers and locals to move, connect and explore the city together."}
            </p>
          </div>

          {/* Who is this for + Experience */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.9)]">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-orange-300" />
                Who is this for?
              </h3>
              <ul className="text-sm text-gray-200 space-y-2 list-disc pl-5">
                <li>Travellers who want to meet people through movement</li>
                <li>Locals exploring new fitness communities in their city</li>
                <li>Beginners & intermediates — no strict level required</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.9)]">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-300" />
                What you’ll experience
              </h3>
              <ul className="text-sm text-gray-200 space-y-2 list-disc pl-5">
                <li>A structured session led by certified coaches</li>
                <li>Warm-up, main workout, cool-down & recap</li>
                <li>Time to connect and talk with other attendees</li>
              </ul>
            </div>
          </div>

          {/* What's included / What to bring */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.9)]">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-300" />
                What’s included
              </h3>
              <ul className="text-sm text-gray-200 space-y-1.5 list-disc pl-5">
                <li>Entry to the event / facility</li>
                <li>Guided session with host / coach</li>
                <li>Support from Passiify in case of issues</li>
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.9)]">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-orange-300" />
                What to bring
              </h3>
              <ul className="text-sm text-gray-200 space-y-1.5 list-disc pl-5">
                <li>Comfortable workout clothing & shoes</li>
                <li>Water bottle and small towel</li>
                <li>Valid ID (for venue verification if asked)</li>
              </ul>
            </div>
          </div>

          {/* Languages / Good to know */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <div className="grid sm:grid-cols-2 gap-5 text-sm">
              <div>
                <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <Languages className="w-5 h-5 text-emerald-300" />
                  Languages & vibe
                </h3>
                <p className="text-gray-200 mb-2">
                  Most events are hosted in{" "}
                  <span className="font-semibold text-gray-100">
                    English & Hindi
                  </span>{" "}
                  — travellers are always welcome.
                </p>
                <p className="text-gray-400 text-xs">
                  If you’re unsure, you can still book — the host details and
                  exact meeting info are shared on your Passiify ticket and
                  email.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-300" />
                  Good to know
                </h3>
                <ul className="text-gray-200 space-y-1.5 list-disc pl-5">
                  <li>Arrive 10–15 minutes before start time</li>
                  <li>Carry a bottle of water & comfortable clothing</li>
                  <li>Exact meeting point shared on ticket & email</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Organizer block */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border border-orange-300/70 bg-gradient-to-br from-orange-400 to-sky-500 flex items-center justify-center text-lg font-semibold">
                {event.organizer?.[0]?.toUpperCase() || "H"}
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  Hosted by{" "}
                  <span className="text-orange-300">{event.organizer}</span>
                  <ShieldCheck className="text-emerald-300 w-4 h-4" />
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Verified organizer • Identity & details checked by Passiify
                </p>
              </div>
            </div>

            {event.personalNote && event.personalNote.trim() !== "" && (
              <div className="sm:max-w-sm bg-black/40 border border-white/10 rounded-xl p-4 text-xs sm:text-sm text-gray-200 italic">
                “{event.personalNote}”
              </div>
            )}
          </div>

          {/* Traveller FAQ */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Plane className="w-5 h-5 text-sky-300" />
              Travelling from another country?
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 text-xs sm:text-[13px] text-gray-200">
              <div>
                <p className="font-semibold mb-1">Payment</p>
                <p className="text-gray-300">
                  Pay securely in INR. Most foreign cards & UPI-enabled apps
                  work via our payment partners.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Safety</p>
                <p className="text-gray-300">
                  Events are manually approved. Venues and hosts are checked
                  before going live on Passiify.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Support</p>
                <p className="text-gray-300">
                  If something feels off, you can reach Passiify support from
                  your ticket page and we’ll help you out.
                </p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <h3 className="text-base font-semibold text-white mb-3">
              Meeting point
            </h3>
            <div className="rounded-xl overflow-hidden h-[220px] border border-white/10">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  event.location || ""
                )}&output=embed`}
                width="100%"
                height="100%"
                loading="lazy"
                className="rounded-xl"
                title="Event Location"
              ></iframe>
            </div>
          </div>
        </section>

        {/* RIGHT: Booking card */}
        <aside className="md:sticky md:top-24 h-fit">
          <div className="bg-gradient-to-b from-sky-500 via-blue-700 to-gray-900 rounded-3xl shadow-[0_26px_90px_rgba(0,0,0,1)] border border-white/10 p-6 sm:p-7">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              ₹{event.price}{" "}
              <span className="text-sm text-blue-100">/ person</span>
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 mb-4">
              Instant confirmation • No monthly commitment
            </p>

            {/* Countdown / state */}
            {!isPast ? (
              diffDays > 0 ? (
                <p className="flex items-center gap-2 bg-black/25 border border-white/10 px-4 py-2 rounded-2xl text-xs sm:text-sm text-gray-100 mb-4">
                  <Clock size={16} className="text-orange-200" />
                  Starts in <span className="font-semibold">{diffDays}</span>{" "}
                  day{diffDays > 1 ? "s" : ""}
                </p>
              ) : (
                <p className="flex items-center gap-2 bg-black/25 border border-white/10 px-4 py-2 rounded-2xl text-xs sm:text-sm text-emerald-100 mb-4">
                  <Clock size={16} className="text-emerald-200" />
                  Happening <span className="font-semibold">today</span>
                </p>
              )
            ) : (
              <p className="flex items-center gap-2 bg-black/25 border border-red-400/60 px-4 py-2 rounded-2xl text-xs sm:text-sm text-red-100 mb-4">
                <Clock size={16} className="text-red-200" />
                This experience has already ended.
              </p>
            )}

            {/* Capacity warning */}
            {typeof event.capacity === "number" &&
              event.capacity > 0 &&
              event.capacity <= 10 &&
              !isPast && (
                <p className="text-[11px] text-red-100 font-medium mb-3">
                  Only {event.capacity} spots available for this date 🔥
                </p>
              )}

            <button
              onClick={handleBookEvent}
              disabled={isPast || bookingLoading}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm mt-1 transition-transform shadow-[0_18px_60px_rgba(0,0,0,1)] ${
                isPast
                  ? "bg-gray-500/60 text-gray-200 cursor-not-allowed"
                  : "bg-white text-blue-800 hover:scale-[1.02]"
              }`}
            >
              {bookingLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Ticket size={18} />
                  {isPast ? "Event Finished" : "Book this Experience"}
                </>
              )}
            </button>

            {/* Trust block */}
            <div className="mt-6 bg-black/35 border border-white/10 rounded-2xl p-4 text-xs sm:text-[13px] text-blue-50 space-y-2">
              <p className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-300" />
                100% secure payment via Passiify
              </p>
              <p className="flex items-center gap-2">
                <RotateCcw size={16} className="text-orange-200" />
                Full refund if host cancels the event
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle size={16} className="text-sky-200" />
                Support from Passiify team before your session
              </p>
            </div>

            <p className="mt-4 text-[11px] text-blue-100">
              No long-term membership. Just book this one experience, show your
              Passiify ticket at check-in, and you’re in.
            </p>
          </div>
        </aside>
      </main>

      {/* Footer CTA */}
      <footer className="mt-16 bg-gradient-to-r from-sky-600 via-blue-700 to-orange-500 py-12 text-center text-white">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">
          Experience. Connect. Move different.
        </h2>
        <p className="text-sm sm:text-base text-blue-100 mb-6 max-w-xl mx-auto">
          Discover more fight camps, yoga circles and city workouts hosted by
          local communities across India.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-2.5 rounded-full font-semibold text-sm shadow-lg hover:bg-orange-50 transition"
        >
          Browse more events
        </Link>
      </footer>
    </div>
  );
};

export default EventDetail;
