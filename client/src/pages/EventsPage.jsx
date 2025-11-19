// src/pages/EventsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  CalendarDays,
  Star,
  Loader2,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  ShieldCheck,
  Users,
  Clock3,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

/* =========================================================
   THEME TOKENS — Match EventDetail blue/orange look
   ========================================================= */
const THEME = {
  accentBlue: "#2563EB", // blue-600
  accentSky: "#0EA5E9", // sky-500
  accentOrange: "#F97316", // orange-500
};

/* =========================================================
   BACKEND HELPERS — safe with your upgraded models
   ========================================================= */

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

const formatEventDate = (value) => {
  if (!value) return "Date TBA";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatEventTime = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getLocationLabel = (event) => {
  const city =
    event?.city ||
    event?.gym?.city ||
    event?.gym?.location ||
    event?.gym?.area ||
    null;

  const baseLoc = event?.location || event?.address || null;

  if (city && baseLoc) return `${city}, ${baseLoc}`;
  if (city) return city;
  if (baseLoc) return baseLoc;
  return "Location shared after booking";
};

const getSpotsLeft = (event) => {
  if (typeof event?.remainingSeats === "number") {
    return Math.max(event.remainingSeats, 0);
  }

  const capacity = Number(event?.capacity || event?.totalSlots || 0);
  const booked = Number(event?.bookedCount || event?.bookingsCount || 0);

  if (!capacity) return null;
  return Math.max(capacity - booked, 0);
};

const getCancellationLabel = (event) => {
  const policy = event?.cancellationPolicy;
  const simpleFlag =
    typeof event?.cancellable === "boolean"
      ? event.cancellable
      : event?.isCancellable;

  if (policy && typeof policy === "object") {
    const type = policy.type || "flexible";
    const freeHours =
      typeof policy.freeCancellationHours === "number"
        ? policy.freeCancellationHours
        : event?.freeCancellationHours;

    if (type === "none") return "Non-refundable after booking";
    if (type === "strict") return "Strict cancellation";
    if (type === "moderate") return "Moderate cancellation";

    if (type === "flexible" && freeHours) {
      return `Free cancellation up to ${freeHours}h before`;
    }
    if (type === "flexible") return "Flexible cancellation";
  }

  if (simpleFlag) return "Free cancellation (limited window)";
  return null;
};

const difficultyLabel = (event) => {
  const d = (event?.difficulty || "").toLowerCase();
  if (!d) return null;
  if (d.includes("easy") || d.includes("beginner")) return "Beginner-friendly";
  if (d.includes("intermediate")) return "Intermediate";
  if (d.includes("hard") || d.includes("advanced")) return "Advanced";
  return event.difficulty;
};

const getPrice = (event) => {
  return Number(event?.price || event?.passPrice || event?.amount || 0);
};

const getRating = (event) => {
  const rating = Number(event?.avgRating || event?.rating || 0);
  const ratingCount = Number(event?.ratingCount || event?.reviewsCount || 0);
  return { rating, ratingCount };
};

const getStatsSnapshot = (event) => {
  const stats = event?.stats || {};
  const totalBookings = Number(stats.totalBookings || event?.totalBookings || 0);
  const totalAttendees = Number(
    stats.totalAttendees || event?.totalAttendees || 0
  );
  return { totalBookings, totalAttendees };
};

/* =========================================================
   MAIN PAGE
   ========================================================= */

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /* Fetch events from backend */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get("/events");
        const data = res.data?.events || res.data || [];
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading events:", err);
        setError(
          err?.response?.data?.message ||
            "We couldn’t load events right now. Please try again in a bit."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  /* Filter + sort aligned with backend fields */
  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events
      .filter((e) => {
        const startDate = getEventStartDate(e);

        const rawCategory =
          e.category ||
          e.type ||
          (Array.isArray(e.tags) && e.tags[0]) ||
          "";
        const cat = rawCategory.toString().toLowerCase();

        const categoryMatch =
          selectedCategory === "all" ||
          cat === selectedCategory.toLowerCase();

        if (upcomingOnly && startDate && startDate < now) {
          return false;
        }

        const q = searchQuery.toLowerCase().trim();
        if (!q) return categoryMatch;

        const name = e.name?.toLowerCase() || "";
        const loc = (getLocationLabel(e) || "").toLowerCase();
        const desc = e.description?.toLowerCase() || "";
        const hostName =
          e.hostName?.toLowerCase() ||
          e.host?.name?.toLowerCase() ||
          e.organizer?.toLowerCase() ||
          e.gym?.name?.toLowerCase() ||
          "";

        const searchMatch =
          name.includes(q) ||
          loc.includes(q) ||
          desc.includes(q) ||
          hostName.includes(q);

        return categoryMatch && searchMatch;
      })
      .sort((a, b) => {
        const priceA = getPrice(a);
        const priceB = getPrice(b);

        const dateA = getEventStartDate(a);
        const dateB = getEventStartDate(b);
        const tsA = dateA ? dateA.getTime() : 0;
        const tsB = dateB ? dateB.getTime() : 0;

        const { rating: ratingA } = getRating(a);
        const { rating: ratingB } = getRating(b);

        if (sortBy === "priceLow") return priceA - priceB;
        if (sortBy === "priceHigh") return priceB - priceA;
        if (sortBy === "dateSoon") return tsA - tsB;

        const scoreA = (ratingA || 4.5) * 2 - priceA / 400 + (tsA ? 1 / tsA : 0);
        const scoreB = (ratingB || 4.5) * 2 - priceB / 400 + (tsB ? 1 / tsB : 0);
        return scoreB - scoreA;
      });
  }, [events, selectedCategory, searchQuery, sortBy, upcomingOnly]);

  const totalCount = events.length;
  const visibleCount = filteredEvents.length;

  /* Loading skeleton */
  const SkeletonCard = () => (
    <div className="bg-white/90 dark:bg-slate-900/80 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_18px_50px_rgba(15,23,42,0.2)] overflow-hidden animate-pulse">
      <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/5" />
        <div className="flex gap-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        </div>
        <div className="flex justify-between gap-2 mt-2">
          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-full w-24" />
          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-full w-20" />
        </div>
      </div>
    </div>
  );

  /* Smooth scroll to events grid */
  const scrollToEvents = () => {
    const el = document.getElementById("events-grid");
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50 pb-16">
      {/* TOP TRUST STRIP */}
      <div className="border-b border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-[11px] md:text-xs text-slate-500 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Curated workout & wellness experiences across Indian cities.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Verified hosts only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-orange-400" />
              <span>Transparent pricing · No lock-ins</span>
            </div>
          </div>
        </div>
      </div>

      {/* HERO — premium glass, ambient lighting */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 md:pt-10">
        {/* ambient blobs behind the hero */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="absolute -bottom-24 -right-10 w-80 h-80 rounded-full bg-orange-500/30 blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-sky-400/20 blur-3xl" />
        </div>

        {/* main glass shell */}
        <div className="relative rounded-[32px] border border-slate-100/70 dark:border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden shadow-[0_30px_90px_rgba(15,23,42,0.75)]">
          {/* subtle grid / texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18)_0,_transparent_55%),radial-gradient(circle_at_bottom,_rgba(249,115,22,0.18)_0,_transparent_55%)]" />

          {/* content grid */}
          <div className="relative px-5 sm:px-8 py-7 sm:py-9 md:py-11 grid md:grid-cols-[1.6fr,1fr] gap-6 lg:gap-10 items-center">
            {/* LEFT — copy + CTAs */}
            <div className="space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/70 backdrop-blur-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-slate-200">
                  curated fight camps · runs · community classes
                </span>
              </div>

              <h1 className="text-[1.55rem] sm:text-[1.9rem] md:text-[2.2rem] lg:text-[2.4rem] font-extrabold leading-tight tracking-tight text-white">
                Book{" "}
                <span
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${THEME.accentBlue}, ${THEME.accentOrange})`,
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  verified fitness experiences
                </span>{" "}
                in every city you land.
              </h1>

              <p className="text-[11px] sm:text-sm md:text-[15px] text-slate-300 max-w-xl">
                Rooftop yoga, brutal fight nights, lakeside runs and more. No
                memberships, no weird lock-ins — just one-time sessions with
                hosts travellers already trust.
              </p>

              {/* chips row */}
              <div className="flex flex-wrap gap-2 text-[10px] sm:text-[11px] text-slate-200">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/80">
                  <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  Traveller-rated hosts & gyms
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/80">
                  <Clock3 className="w-3 h-3 text-sky-400" />
                  Instant confirmation & QR pass
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/80">
                  <Users className="w-3 h-3 text-orange-300" />
                  Built for solo travellers & locals
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={scrollToEvents}
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-[11px] sm:text-sm font-semibold text-white shadow-[0_22px_60px_rgba(37,99,235,0.9)] hover:shadow-[0_26px_80px_rgba(37,99,235,1)] hover:scale-[1.03] transition"
                  style={{
                    backgroundImage: `linear-gradient(120deg, ${THEME.accentBlue}, ${THEME.accentOrange})`,
                  }}
                >
                  Explore live events
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => navigate("/create-event")}
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-[11px] sm:text-sm font-semibold border border-slate-600 text-slate-100 bg-slate-900/60 hover:bg-slate-800/80 transition"
                >
                  Host an experience
                </button>
              </div>

              {/* tiny trust line */}
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Passiify handles passes, QR check-ins and cancellations — you
                just show up and move.
              </p>
            </div>

            {/* RIGHT — glass image card + ambient lighting */}
            <div className="relative">
              {/* floating halo */}
              <div className="pointer-events-none absolute -top-10 right-4 w-32 h-32 rounded-full bg-sky-400/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-4 w-40 h-40 rounded-full bg-orange-500/35 blur-3xl" />

              {/* main glass card */}
              <div className="relative rounded-3xl border border-slate-700/80 bg-slate-900/70 backdrop-blur-2xl shadow-[0_24px_80px_rgba(15,23,42,0.9)] overflow-hidden">
                <div className="relative w-full aspect-[4/3]">
                  <img
                    src="https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt="Sample Passiify experience"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-900/70" />

                  {/* top pill */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-slate-950/80 border border-slate-700 text-slate-100 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-orange-300" />
                      Tonight in Bandra, Mumbai
                    </span>
                  </div>

                  {/* bottom meta */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-slate-100">
                        Sundown Combat & Conditioning
                      </p>
                      <p className="text-[10px] text-slate-300 flex items-center gap-1.5">
                        <Clock3 className="w-3 h-3 text-sky-400" />
                        7:00 PM · High-energy, beginner-friendly
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-300 mb-0.5">From</p>
                      <p className="text-sm font-bold text-orange-300">₹799</p>
                    </div>
                  </div>
                </div>

                {/* bottom stats strip (glass) */}
                <div className="px-4 py-3 flex items-center justify-between gap-3 bg-slate-950/80 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                    <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                    <span>4.8 avg · 120+ guests</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Passiify host</span>
                  </div>
                </div>
              </div>

              {/* tiny floating chip under card */}
              <div className="hidden sm:inline-flex mt-3 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-[10px] text-slate-300 backdrop-blur-xl">
                Drop in, scan your Passiify QR, move with strangers who won’t
                feel like strangers after.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS + SEARCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 shadow-[0_18px_60px_rgba(15,23,42,0.2)] flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
              <Filter size={18} className="text-blue-500 dark:text-sky-400" />
              <span>Filter experiences</span>
            </div>

            {/* sort + upcoming toggle */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] md:text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-[11px] md:text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  <option value="recommended">Recommended</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="dateSoon">Date: Soonest</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setUpcomingOnly((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] transition ${
                  upcomingOnly
                    ? "bg-sky-50 dark:bg-sky-900/40 border-sky-200 dark:border-sky-700 text-sky-700 dark:text-sky-200"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                <Clock3 className="w-3 h-3" />
                <span>Upcoming only</span>
              </button>
            </div>
          </div>

          {/* categories */}
          <div className="flex flex-wrap gap-2 text-[11px] md:text-xs">
            {[
              "all",
              "yoga",
              "strength",
              "cardio",
              "combat",
              "mindfulness",
              "outdoor",
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full font-medium capitalize transition ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-md"
                    : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {cat === "all" ? "All events" : cat}
              </button>
            ))}
          </div>

          {/* search bar + meta */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2">
              <Search size={18} className="text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search by event name, city, host or vibe (e.g. Goa, boxing, rooftop yoga)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-xs md:text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] md:text-xs text-slate-500 dark:text-slate-400">
              <span>
                Showing{" "}
                <span className="text-slate-900 dark:text-slate-50 font-semibold">
                  {visibleCount}
                </span>{" "}
                of{" "}
                <span className="text-slate-900 dark:text-slate-50 font-semibold">
                  {totalCount}
                </span>{" "}
                experiences
              </span>
              <span>
                Instant confirmation · No membership · Pay once, join once
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS GRID */}
      <section
        id="events-grid"
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-10"
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
          Featured this week
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xl">
          Hosts running sessions travellers keep coming back for. Spots are
          limited — especially for fight camps and sunrise classes.
        </p>

        {error && (
          <div className="mb-6 text-xs sm:text-sm text-rose-700 dark:text-rose-200 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700 rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p className="text-sm text-slate-900 dark:text-slate-50">
              No events match your filters yet.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Try resetting filters or searching something broader like “run”,
              “yoga”, “MMA” or just a city name. New experiences are added
              frequently as hosts go live.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setSortBy("recommended");
                setUpcomingOnly(true);
              }}
              className="mt-2 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-md hover:shadow-lg hover:scale-[1.03] transition"
            >
              Clear filters & show all events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredEvents.map((event, idx) => {
              const id = event._id || event.id;
              const price = getPrice(event);
              const { rating, ratingCount } = getRating(event);
              const startDate = getEventStartDate(event);
              const now = new Date();
              const isSoon =
                startDate &&
                (startDate.getTime() - now.getTime()) /
                  (1000 * 60 * 60 * 24) <=
                  7 &&
                startDate > now;
              const isPast = startDate && startDate < now;
              const isTopPick = idx < 3;
              const locationLabel = getLocationLabel(event);
              const spotsLeft = getSpotsLeft(event);
              const isSoldOut = event.isSoldOut || spotsLeft === 0;
              const isVerifiedHost =
                event.isVerifiedHost ||
                event.verifiedHost ||
                event.gym?.isVerified ||
                (rating && rating >= 4.6);
              const cancelLabel = getCancellationLabel(event);
              const diffLabel = difficultyLabel(event);
              const duration =
                event.durationLabel ||
                event.duration ||
                (event.durationMinutes
                  ? `${event.durationMinutes} min`
                  : null);
              const timeLabel = formatEventTime(
                event.startTime || event.time
              );
              const rawCategory =
                event.category ||
                event.type ||
                (Array.isArray(event.tags) && event.tags[0]);
              const { totalAttendees } = getStatsSnapshot(event);

              const image =
                event.bannerImage ||
                event.image ||
                (Array.isArray(event.images) && event.images[0]) ||
                "/images/default-event.jpg";

              return (
                <article
                  key={id || idx}
                  className="group bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_18px_60px_rgba(15,23,42,0.25)] hover:shadow-[0_26px_80px_rgba(37,99,235,0.35)] overflow-hidden flex flex-col transition-shadow"
                >
                  {/* IMAGE */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
                    <img
                      src={image}
                      alt={event.name}
                      className="h-full w-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

                    {/* price + spots */}
                    <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold text-white bg-gradient-to-r from-blue-600 to-orange-500 shadow-[0_10px_35px_rgba(37,99,235,0.8)]">
                        {price > 0 ? `From ₹${price}` : "Included in pass"}
                      </span>
                      {spotsLeft !== null && !isSoldOut && !isPast && (
                        <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[10px] text-amber-200 font-medium">
                          {spotsLeft <= 5
                            ? `Last ${spotsLeft} spots`
                            : `${spotsLeft} spots left`}
                        </span>
                      )}
                      {isSoldOut && (
                        <span className="px-3 py-1 rounded-full bg-rose-600 text-[10px] font-semibold text-white uppercase tracking-[0.18em]">
                          Sold out
                        </span>
                      )}
                    </div>

                    {/* badges bottom left */}
                    <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-2">
                      {rawCategory && (
                        <span className="px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-[10px] uppercase tracking-[0.18em] text-slate-50">
                          {rawCategory}
                        </span>
                      )}
                      {isTopPick && !isPast && !isSoldOut && (
                        <span className="px-3 py-1 rounded-full bg-amber-400 text-[10px] font-semibold text-slate-900 uppercase tracking-[0.18em]">
                          Top pick
                        </span>
                      )}
                      {isSoon && !isPast && !isSoldOut && (
                        <span className="px-3 py-1 rounded-full bg-orange-500 text-[10px] font-semibold text-white uppercase tracking-[0.18em]">
                          Few spots left
                        </span>
                      )}
                      {isVerifiedHost && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-[10px] font-semibold text-slate-900 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Verified host
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
                    {/* title + host + desc */}
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-50 line-clamp-2">
                        {event.name}
                      </h3>
                      {event.hostName ||
                      event.host?.name ||
                      event.organizer ||
                      event.gym?.name ? (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Hosted by{" "}
                          <span className="text-slate-900 dark:text-slate-50 font-medium">
                            {event.hostName ||
                              event.host?.name ||
                              event.organizer ||
                              event.gym?.name}
                          </span>
                        </p>
                      ) : null}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {event.shortDescription ||
                          event.description ||
                          "A curated fitness experience designed for travellers and locals to move, connect and explore together."}
                      </p>
                    </div>

                    {/* location + date */}
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 gap-2">
                      <span className="flex items-center gap-1 min-w-0">
                        <MapPin size={14} />
                        <span className="truncate">{locationLabel}</span>
                      </span>
                      <span className="flex items-center gap-1 text-right">
                        <CalendarDays size={14} />
                        <span>
                          {formatEventDate(startDate)}
                          {timeLabel ? ` · ${timeLabel}` : ""}
                        </span>
                      </span>
                    </div>

                    {/* meta pills */}
                    <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-slate-600 dark:text-slate-300">
                      {diffLabel && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          {diffLabel}
                        </span>
                      )}
                      {duration && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <Clock3 className="w-3 h-3" />
                          {duration}
                        </span>
                      )}
                      {(event.capacity || event.totalSlots) && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Up to {event.capacity || event.totalSlots} guests
                        </span>
                      )}
                      {cancelLabel && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-200">
                          {cancelLabel}
                        </span>
                      )}
                      {totalAttendees > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          Joined by {totalAttendees}+ guests
                        </span>
                      )}
                    </div>

                    {/* rating + actions */}
                    <div className="flex items-center justify-between mt-3 gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center text-yellow-500 gap-1 text-xs">
                          <Star
                            size={14}
                            className="fill-yellow-400 stroke-yellow-400"
                          />
                          <span>
                            {rating ? rating.toFixed(1) : "4.7"}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            ·{" "}
                            {ratingCount
                              ? `${ratingCount}+ ratings`
                              : "New on Passiify"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Real reviews from travellers & locals
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1 w-[40%] sm:w-auto">
                        <button
                          onClick={() => id && navigate(`/events/${id}`)}
                          className="w-full sm:w-auto px-3 py-1.5 rounded-full text-[11px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          View details
                        </button>
                        <button
                          disabled={isSoldOut || isPast || !id}
                          onClick={() => id && navigate(`/book-event/${id}`)}
                          className={`w-full sm:w-auto px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition ${
                            isSoldOut || isPast || !id
                              ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none"
                              : "bg-gradient-to-r from-blue-600 to-orange-500 text-white"
                          }`}
                        >
                          {isPast
                            ? "Event ended"
                            : isSoldOut
                            ? "Join waitlist"
                            : "Book pass"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* WHY BOOK ON PASSIIFY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-100 dark:border-slate-800 rounded-3xl px-5 py-6 md:px-8 md:py-7 shadow-[0_18px_60px_rgba(15,23,42,0.25)] flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h2 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
              Why travellers book{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${THEME.accentBlue}, ${THEME.accentOrange})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                events
              </span>{" "}
              on Passiify.
            </h2>
            <p className="mt-1 text-[11px] md:text-xs text-slate-500 dark:text-slate-400 max-w-md">
              Curated experiences that respect your time and freedom – from
              drop-in workshops to full-day retreats. No long-term commitments,
              just memorable sweat and stories in every city.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] md:text-xs text-slate-700 dark:text-slate-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-[2px]" />
              <div>
                <div className="font-semibold">Instant confirmation</div>
                <div className="text-slate-500 dark:text-slate-400">
                  Book in a few taps and get your digital pass instantly.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mt-[2px]" />
              <div>
                <div className="font-semibold">Verified hosts</div>
                <div className="text-slate-500 dark:text-slate-400">
                  Hosts and gyms are screened for quality and safety.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-[2px]" />
              <div>
                <div className="font-semibold">Zero lock-ins</div>
                <div className="text-slate-500 dark:text-slate-400">
                  Join one event today, something totally different tomorrow.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FOOTER — matches EventDetail energy */}
      <section className="mt-4 bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 dark:from-sky-500 dark:via-blue-700 dark:to-orange-500 py-10 text-center text-white">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2">
          Experience. Connect. Move different.
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-blue-50/90 max-w-xl mx-auto mb-6">
          Pick one session in the city you’re visiting and build the rest of
          your day around it. You’ll remember the crew, the sweat and the
          sunrise more than another café.
        </p>
        <button
          onClick={scrollToEvents}
          className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-2.5 rounded-full font-semibold text-sm shadow-lg hover:bg-orange-50 transition"
        >
          Browse this week’s events
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default EventsPage;
