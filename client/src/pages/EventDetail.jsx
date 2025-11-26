// src/pages/EventDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
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
  Share2,
} from "lucide-react";
import API from "../utils/api";

/* =========================================================
   THEME — shared Passiify gradient tokens
   ======================================================== */
const THEME = {
  accentFrom: "#2563EB", // blue-600
  accentMid: "#0EA5E9",  // sky-500
  accentTo: "#F97316",   // orange-500
};

const primaryGradient = `linear-gradient(120deg, ${THEME.accentFrom}, ${THEME.accentMid}, ${THEME.accentTo})`;
const primaryGradient90 = `linear-gradient(90deg, ${THEME.accentFrom}, ${THEME.accentMid}, ${THEME.accentTo})`;

/* =========================================================
   HELPER FUNCTIONS — match EventsPage + backend shape
========================================================= */

// Flexible start date from multiple fields
const getEventStartDate = (event) => {
  const raw =
    event?.startTime ||
    event?.startDate ||
    event?.date ||
    event?.start_at ||
    null;

  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

// Match backend event pricing & EventsPage getPrice
const getEventPrice = (event) => {
  if (!event) return null;

  const raw =
    event.price ??
    event.passPrice ??
    event.amount ??
    (event.pricing && event.pricing.price);

  const n = Number(raw);
  if (!raw || Number.isNaN(n) || n <= 0) return null;
  return n;
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ─────────────────────────────────────────
  // Fetch event details
  // ─────────────────────────────────────────
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get(`/events/${id}`);
        const ev = res.data?.event || res.data;
        setEvent(ev);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("We couldn’t load this experience. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  // ─────────────────────────────────────────
  // Derived values
  // ─────────────────────────────────────────
  const eventDate = event ? getEventStartDate(event) : null;

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const diffDays =
    eventDate && !Number.isNaN(eventDate.getTime())
      ? Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))
      : null;

  const isPast = eventDate ? eventDate < today : false;

  const dateLabel = eventDate
    ? eventDate.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date TBA";

  const eventPrice = useMemo(() => getEventPrice(event), [event]);

  const baseCapacity =
    typeof event?.capacity === "number"
      ? event.capacity
      : typeof event?.totalSlots === "number"
      ? event.totalSlots
      : null;

  const remainingSeats =
    typeof event?.remainingSeats === "number"
      ? event.remainingSeats
      : baseCapacity;

  const capacityLabel =
    typeof baseCapacity === "number" && baseCapacity > 0
      ? `${baseCapacity} spots`
      : "Limited spots";

  const ratingLabel =
    event?.rating && Number(event.rating) > 0
      ? Number(event.rating).toFixed(1)
      : "4.7";

  const ratingCountLabel =
    typeof event?.ratingCount === "number" && event.ratingCount > 0
      ? `${event.ratingCount}+ guests`
      : "New on Passiify";

  const languages =
    event?.languages && event.languages.length
      ? event.languages
      : ["English", "Hindi"];

  const tags =
    event?.tags && event.tags.length
      ? event.tags
      : ["Outdoor", "Community", "Fitness", "Travel Friendly"];

  const stats = event?.stats || {};
  const cancellationPolicy = event?.cancellationPolicy || {};

  const cancellationSummary = useMemo(() => {
    const type = cancellationPolicy.type || "flexible";
    const freeHours =
      typeof cancellationPolicy.freeCancellationHours === "number"
        ? cancellationPolicy.freeCancellationHours
        : 24;
    const refundBefore =
      typeof cancellationPolicy.refundPercentBefore === "number"
        ? cancellationPolicy.refundPercentBefore
        : 100;
    const refundAfter =
      typeof cancellationPolicy.refundPercentAfter === "number"
        ? cancellationPolicy.refundPercentAfter
        : 0;

    if (type === "none") {
      return "This experience is non-refundable once booked.";
    }

    if (refundBefore === 100 && refundAfter === 0) {
      return `Free cancellation until ${freeHours} hours before start. No refund after that window.`;
    }

    return `Up to ${freeHours} hours before start: ${refundBefore}% refund. Closer than that: ${refundAfter}% refund.`;
  }, [cancellationPolicy]);

  // 📝 Host special notes from meetingInstructions (split into bullets)
  const hostNotes = useMemo(() => {
    if (!event?.meetingInstructions) return [];
    return event.meetingInstructions
      .split(/\n|•|-\s/gi)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [event]);

  const bookingDisabled =
    isPast ||
    remainingSeats === 0 ||
    (typeof remainingSeats === "number" && remainingSeats < 0) ||
    !eventPrice ||
    event?.isSoldOut;

  // ─────────────────────────────────────────
  // Booking handler – send to Razorpay checkout page
  // ─────────────────────────────────────────
  const handleBookEvent = () => {
    if (!event || bookingDisabled) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to book this experience.");
      navigate("/login");
      return;
    }

    // Let BookEvent.jsx handle Razorpay integration + verification
    navigate(`/book-event/${event._id}`, {
      state: { from: "event-detail" },
    });
  };

  // ─────────────────────────────────────────
  // Simple share handler (nice for Gen-Z)
  // ─────────────────────────────────────────
  const handleShare = async () => {
    if (!event) return;

    const shareData = {
      title: event.name,
      text: `Join me at "${event.name}" on Passiify 🚀`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard ✨");
      } else {
        alert("Share this link with your friends:\n" + window.location.href);
      }
    } catch {
      // user cancelled or unsupported – silently ignore
    }
  };

  // ─────────────────────────────────────────
  // Loading / error states
  // ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-sky-400 animate-spin mb-3" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Loading this Passiify experience for you...
        </p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 text-center">
        <p className="text-lg text-slate-700 dark:text-slate-100 mb-3">
          {error || "We couldn’t find this event."}
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md hover:shadow-xl hover:scale-[1.03] transition"
          style={{ backgroundImage: primaryGradient }}
        >
          Browse other experiences
        </Link>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // Main UI
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50 pb-20">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-orange-300 transition"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Passiify · Experience
          </span>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 shadow-sm hover:shadow-md hover:scale-[1.03] transition"
          >
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
        <div className="relative rounded-[28px] overflow-hidden shadow-[0_28px_90px_rgba(15,23,42,0.35)] border border-slate-100 dark:border-slate-800 bg-slate-900">
          <div className="relative h-[320px] sm:h-[420px] md:h-[460px]">
            <img
              src={
                event.bannerImage ||
                event.image ||
                (Array.isArray(event.images) && event.images[0]) ||
                "/images/default-event.jpg"
              }
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-transparent to-slate-900/50" />

            {/* Hero content */}
            <div className="absolute bottom-6 sm:bottom-10 left-5 sm:left-8 right-5 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div
                  className="inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full border border-white/30 mb-3 backdrop-blur-sm"
                  style={{ backgroundImage: primaryGradient }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                  <span className="uppercase tracking-[0.18em] text-slate-50">
                    Move & Roam by Passiify
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-1 text-white">
                  {event.name}
                </h1>
                <p className="flex flex-wrap items-center gap-3 text-sm text-slate-100">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-orange-300" />
                    {event.location || event.city || "Location shared later"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-900/60 border border-white/20">
                    <CalendarDays size={14} className="text-sky-300" />
                    {dateLabel}
                  </span>
                </p>
              </div>

              <div className="text-right space-y-2">
                <div className="inline-flex items-baseline gap-1 px-4 py-2 rounded-2xl bg-slate-900/80 border border-white/15">
                  <span className="text-xs text-slate-200">from</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-orange-300">
                    {eventPrice ? `₹${eventPrice}` : "Price TBA"}
                  </span>
                  {eventPrice && (
                    <span className="text-[11px] text-slate-300 ml-1">
                      / person
                    </span>
                  )}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/25 text-[11px] text-slate-50">
                  <Star
                    size={14}
                    className="text-yellow-300 fill-yellow-300"
                  />
                  <span>
                    {ratingLabel} · {ratingCountLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Top-right pills */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
              <div className="text-[11px] px-3 py-1 rounded-full bg-slate-950/80 border border-white/25 text-slate-100 flex items-center gap-1.5">
                <Users size={14} className="text-sky-300" />
                <span>{capacityLabel}</span>
              </div>
              {typeof remainingSeats === "number" && (
                <div
                  className={`text-[11px] px-3 py-1 rounded-full border text-slate-100 flex items-center gap-1.5 ${
                    remainingSeats > 0
                      ? "bg-emerald-600/70 border-emerald-300/60"
                      : "bg-rose-600/70 border-rose-300/60"
                  }`}
                >
                  <Info size={14} className="text-white" />
                  <span>
                    {remainingSeats > 0
                      ? `${remainingSeats} seats left`
                      : "Sold out"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 grid md:grid-cols-3 gap-8 lg:gap-10">
        {/* LEFT: Details */}
        <section className="md:col-span-2 space-y-8">
          {/* Quick meta + tags + social proof */}
          <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div className="grid sm:grid-cols-3 gap-4 text-xs sm:text-sm mb-4">
              <div className="flex items-start gap-2">
                <CalendarDays className="w-4 h-4 mt-0.5 text-blue-500 dark:text-sky-400" />
                <div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Date & time
                  </p>
                  <p className="text-slate-900 dark:text-slate-50 font-medium">
                    {dateLabel}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-0.5 text-orange-500" />
                <div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Group size
                  </p>
                  <p className="text-slate-900 dark:text-slate-50 font-medium">
                    {capacityLabel}
                    {typeof remainingSeats === "number" &&
                      remainingSeats >= 0 && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-1">
                          · {remainingSeats} left
                        </span>
                      )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe2 className="w-4 h-4 mt-0.5 text-emerald-500" />
                <div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Perfect for
                  </p>
                  <p className="text-slate-900 dark:text-slate-50 font-medium">
                    Travellers & locals who want to move and meet people
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck
                    size={14}
                    className="text-emerald-500 dark:text-emerald-400"
                  />
                  Verified by Passiify
                </span>
                <span className="flex items-center gap-1.5">
                  <HeartHandshake
                    size={14}
                    className="text-orange-500 dark:text-orange-400"
                  />
                  Traveller-friendly host
                </span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-3">
              About this experience
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">
              {event.description ||
                "A curated fitness experience designed for travellers and locals to move, connect and explore the city together — without any long-term membership."}
            </p>
          </div>

          {/* Host story + host special notes */}
          <div className="grid md:grid-cols-[1.2fr,1fr] gap-5">
            {/* Host story */}
            <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] flex gap-4">
              <div className="w-14 h-14 rounded-full border border-orange-300/60 dark:border-orange-400/70 bg-gradient-to-br from-orange-400 to-blue-500 flex items-center justify-center text-lg font-semibold text-white shrink-0">
                {event.organizer?.[0]?.toUpperCase() ||
                  event.hostName?.[0]?.toUpperCase() ||
                  "H"}
              </div>
              <div className="space-y-2">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Hosted by{" "}
                  <span className="text-blue-700 dark:text-sky-300">
                    {event.organizer ||
                      event.hostName ||
                      event.host?.name ||
                      "Passiify host"}
                  </span>
                  <ShieldCheck className="text-emerald-500 dark:text-emerald-400 w-4 h-4" />
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verified host · Part of the Passiify community network
                </p>
                {event.personalNote && event.personalNote.trim() !== "" && (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic bg-gradient-to-r from-orange-50/80 via-sky-50/80 to-transparent dark:from-slate-800/60 dark:via-slate-800/30 rounded-lg px-3 py-2 border border-orange-100/70 dark:border-slate-700">
                    “{event.personalNote}”
                  </p>
                )}
              </div>
            </div>

            {/* Host special instructions */}
            <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500 dark:text-sky-400" />
                From your host
              </h3>
              {hostNotes.length > 0 ? (
                <ul className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                  {hostNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your host will share exact meetup tips and any special
                  requirements on your digital ticket after booking.
                </p>
              )}
            </div>
          </div>

          {/* Who is it for / What you'll experience */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                Who is this for?
              </h3>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
                <li>Travellers who want to meet people through movement.</li>
                <li>Locals exploring new fitness communities in their city.</li>
                <li>Beginners & intermediates — all levels welcome.</li>
              </ul>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500 dark:text-sky-400" />
                What you’ll experience
              </h3>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
                <li>A structured session led by a passionate host/trainer.</li>
                <li>Warm-up, main workout/activity & cool-down.</li>
                <li>Time to talk, share stories and connect afterwards.</li>
              </ul>
            </div>
          </div>

          {/* Languages & Good to know */}
          <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="grid sm:grid-cols-2 gap-5 text-sm">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2">
                  <Languages className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  Languages & vibe
                </h3>
                <p className="text-slate-700 dark:text-slate-300 mb-2">
                  This experience usually runs in{" "}
                  <span className="font-semibold">
                    {languages.join(", ")}
                  </span>
                  . Travellers are always welcome, and the host keeps things
                  beginner-friendly.
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Exact contact and meeting details are shared on your Passiify
                  ticket & email after booking.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500 dark:text-sky-400" />
                  Good to know
                </h3>
                <ul className="text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5">
                  <li>Arrive 10–15 minutes before start time.</li>
                  <li>Bring water, comfortable clothes and valid ID.</li>
                  <li>
                    Exact meeting point is shared in your booking confirmation.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cancellation policy & stats */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                Cancellation policy
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                {cancellationSummary}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Refunds (if applicable) are processed back to your original
                payment method as per Passiify’s terms.
              </p>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
                <BarMiniIcon />
                Community snapshot
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total bookings
                  </p>
                  <p className="font-semibold">{stats.totalBookings ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total attendees
                  </p>
                  <p className="font-semibold">{stats.totalAttendees ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cancellations
                  </p>
                  <p className="font-semibold">
                    {stats.totalCancellations ?? 0}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                These numbers give you a sense of how many people have already
                joined this experience.
              </p>
            </div>
          </div>

          {/* Traveller questions (tiny FAQ) */}
          <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-[0_18px_55px_rgba(15,23,42,0.1)]">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-3">
              For travellers: quick answers
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div>
                <p className="font-semibold mb-1">Do I need a membership?</p>
                <p>No. This is a one-time experience. Just book and show up.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Is it safe?</p>
                <p>
                  Hosts are verified and bookings are processed securely by
                  Passiify via Razorpay.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Can I come alone?</p>
                <p>
                  Absolutely. Many guests arrive solo and leave with new
                  friends.
                </p>
              </div>
            </div>
          </div>

          {/* Map / meeting point */}
          <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Meeting point
            </h3>
            {event.meetingPoint && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                <strong>Suggested spot:</strong> {event.meetingPoint}
              </p>
            )}
            {event.meetingInstructions && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {event.meetingInstructions}
              </p>
            )}
            <div className="rounded-xl overflow-hidden h-[220px] border border-slate-200 dark:border-slate-700">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  event.location || event.city || ""
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
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-[0_26px_90px_rgba(15,23,42,0.2)] p-6 sm:p-7">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">
              {eventPrice ? `₹${eventPrice}` : "Price TBA"}{" "}
              {eventPrice && (
                <span className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                  / person
                </span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">
              Instant confirmation · No membership · Pay once, join once.
            </p>

            {!eventPrice && (
              <p className="text-[11px] text-rose-600 dark:text-rose-300 mb-3">
                Pricing for this experience is being updated. Please check back
                soon or explore other events.
              </p>
            )}

            {/* Countdown / status */}
            {!isPast ? (
              diffDays !== null && diffDays > 0 ? (
                <p className="flex items-center gap-2 bg-sky-50 dark:bg-sky-900/40 border border-sky-100 dark:border-sky-800 px-4 py-2 rounded-2xl text-xs sm:text-sm text-sky-800 dark:text-sky-200 mb-3">
                  <Clock size={16} className="text-sky-500 dark:text-sky-300" />
                  Starts in{" "}
                  <span className="font-semibold">{diffDays}</span> day
                  {diffDays > 1 ? "s" : ""}.
                </p>
              ) : (
                <p className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800 px-4 py-2 rounded-2xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 mb-3">
                  <Clock
                    size={16}
                    className="text-emerald-500 dark:text-emerald-300"
                  />
                  Happening <span className="font-semibold">today</span>.
                </p>
              )
            ) : (
              <p className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/40 border border-rose-100 dark:border-rose-800 px-4 py-2 rounded-2xl text-xs sm:text-sm text-rose-800 dark:text-rose-200 mb-3">
                <Clock
                  size={16}
                  className="text-rose-500 dark:text-rose-300"
                />
                This experience has already ended.
              </p>
            )}

            {/* Capacity warning */}
            {typeof remainingSeats === "number" &&
              remainingSeats > 0 &&
              remainingSeats <= 10 &&
              !isPast && (
                <p className="text-[11px] text-rose-600 dark:text-rose-300 font-medium mb-3">
                  Only {remainingSeats} spot
                  {remainingSeats > 1 ? "s" : ""} left for this date 🔥
                </p>
              )}

            <button
              onClick={handleBookEvent}
              disabled={bookingDisabled}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm mt-1 transition-transform shadow-md ${
                bookingDisabled
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  : "text-white hover:shadow-lg hover:scale-[1.03]"
              }`}
              style={
                bookingDisabled ? undefined : { backgroundImage: primaryGradient }
              }
            >
              <Ticket size={18} />
              {isPast || remainingSeats === 0
                ? "Not available"
                : "Continue to secure checkout"}
            </button>

            {/* Trust block */}
            <div className="mt-6 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 space-y-2">
              <p className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-emerald-500 dark:text-emerald-400"
                />
                100% secure payments processed via Razorpay (UPI, cards,
                netbanking).
              </p>
              <p className="flex items-center gap-2">
                <RotateCcw
                  size={16}
                  className="text-orange-500 dark:text-orange-400"
                />
                Refunds as per this event’s cancellation policy.
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle
                  size={16}
                  className="text-blue-500 dark:text-sky-400"
                />
                Support from Passiify if you need help before your session.
              </p>
            </div>

            <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
              Just book this one experience, pay via Razorpay, show your
              Passiify ticket at check-in, and you’re in — no complicated
              memberships or hidden fees.
            </p>
          </div>
        </aside>
      </main>

      {/* Footer CTA */}
      <footer
        className="mt-16 py-12 text-center text-white"
        style={{ backgroundImage: primaryGradient90 }}
      >
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">
          Experience. Connect. Move different.
        </h2>
        <p className="text-sm sm:text-base text-blue-50/90 max-w-xl mx-auto mb-6">
          Discover more fight camps, yoga circles and city workouts hosted by
          local communities across India — one pass at a time.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-2.5 rounded-full font-semibold text-sm shadow-lg hover:bg-orange-50 transition"
        >
          Browse more experiences
        </Link>
      </footer>
    </div>
  );
};

// Tiny mini icon for analytics section
const BarMiniIcon = () => (
  <span className="inline-flex items-end gap-0.5">
    <span className="w-1 h-2.5 rounded-sm bg-blue-200 dark:bg-sky-500/60" />
    <span className="w-1 h-3.5 rounded-sm bg-blue-400 dark:bg-sky-400" />
    <span className="w-1 h-5 rounded-sm bg-blue-600 dark:bg-sky-300" />
  </span>
);

export default EventDetail;
