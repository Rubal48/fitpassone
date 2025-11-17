// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  CalendarDays,
  MapPin,
  Shield,
  Award,
  Heart,
  Clock,
  Dumbbell,
  Star,
} from "lucide-react";
import API from "../utils/api";

/* =========================================================
   THEME / DESIGN TOKENS — "SUNSET NOMAD"
   Warm, cinematic, travel-friendly but still edgy
   ========================================================= */

const THEME = {
  bg: "#050308", // deep plum-black
  bgSoft: "#0A0812",
  card: "rgba(15, 10, 24, 0.96)",
  cardAlt: "rgba(12, 8, 20, 0.96)",
  accent1: "#FF4B5C", // coral red
  accent2: "#FF9F68", // warm peach
  accent3: "#FFC857", // soft golden
  textMain: "#FDFCFB",
  textMuted: "#A3A3B5",
  borderSoft: "rgba(245, 213, 189, 0.24)",
};

/* =========================================================
   FALLBACK IMAGES (keep backend compatible)
   ========================================================= */

const fallbackEventImage = () =>
  "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=1400&q=80&auto=format&fit=crop";

const fallbackGymImage = () =>
  "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1400";

/* =========================================================
   HERO SECTION
   - Main sunset nomad / traveller + fighter intro
   ========================================================= */

function Hero({ topEvent, onSearch }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query, type);

    const params = new URLSearchParams();
    if (query?.trim()) params.set("query", query.trim());
    if (type && type !== "all") params.set("type", type);

    navigate(`/explore?${params.toString()}`);
  };

  const quickSearch = (value) => {
    const params = new URLSearchParams();
    params.set("query", value);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <header className="relative overflow-hidden">
      {/* Background warm glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -left-36 w-96 h-96 rounded-full blur-3xl opacity-40"
          style={{ background: THEME.accent1 }}
        />
        <div
          className="absolute -bottom-40 -right-36 w-[420px] h-[420px] rounded-full blur-3xl opacity-35"
          style={{ background: THEME.accent2 }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 lg:pt-28 lg:pb-24">
        <div className="grid lg:grid-cols-[1.1fr,1fr] gap-10 items-center">
          {/* LEFT: copy + search */}
          <div>
            {/* tiny brand pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-gray-200 uppercase tracking-[0.2em]">
                Built for travellers & movers
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.3rem] font-black tracking-tight text-white">
              Train{" "}
              <span
                className="px-2 rounded-lg"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${THEME.accent1}, ${THEME.accent2})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                anywhere
              </span>
              . No contracts.
            </h1>

            <p className="mt-4 text-base md:text-lg text-gray-300 max-w-xl">
              Bounce between MMA gyms, rooftop yoga, dance studios or strength
              clubs in any city. Book 1-day passes & events — no long-term
              membership, no small talk at the front desk.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 max-w-xl"
              aria-label="Search fitness experiences"
            >
              <div
                className="flex items-stretch rounded-2xl border backdrop-blur shadow-xl"
                style={{
                  borderColor: THEME.borderSoft,
                  background:
                    "radial-gradient(circle at 0 0, rgba(248,250,252,0.08), transparent 60%), rgba(10,10,18,0.9)",
                }}
              >
                {/* type selector */}
                <div className="flex items-center px-3 border-r border-white/10">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="bg-transparent text-xs md:text-sm text-gray-200 outline-none pr-2"
                  >
                    <option value="all" className="bg-slate-900 text-gray-100">
                      All
                    </option>
                    <option value="events" className="bg-slate-900 text-gray-100">
                      Events
                    </option>
                    <option value="gyms" className="bg-slate-900 text-gray-100">
                      Gyms & Studios
                    </option>
                  </select>
                </div>

                {/* input */}
                <div className="flex-1 flex items-center px-3">
                  <Search size={18} className="text-gray-500 hidden sm:block" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm md:text-base text-gray-100 placeholder:text-gray-500 px-2 py-3 outline-none"
                    placeholder="Search MMA, yoga, dance or a city — e.g. Goa"
                  />
                </div>

                {/* submit */}
                <button
                  type="submit"
                  className="px-4 md:px-6 py-3 text-sm md:text-base font-semibold rounded-r-2xl flex items-center gap-2"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${THEME.accent1}, ${THEME.accent2})`,
                    boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
                    color: "#1B0B0C",
                  }}
                >
                  <span>Search</span>
                </button>
              </div>

              {/* quick chips */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs md:text-sm">
                {["MMA", "Sunrise yoga", "Dance studio", "CrossFit", "Bootcamp"].map(
                  (chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => quickSearch(chip)}
                      className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 transition"
                    >
                      #{chip}
                    </button>
                  )
                )}
              </div>
            </form>

            {/* trust badges */}
            <div className="mt-6 flex flex-wrap gap-4 text-gray-300 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-emerald-400" />
                <span>Verified hosts & venues</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-yellow-300" />
                <span>Secure, instant booking</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-rose-400" />
                <span>100% flexible, 1-day passes</span>
              </div>
            </div>
          </div>

          {/* RIGHT: hero visual + top event */}
          <div className="relative">
            <div
              className="rounded-[28px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.95)] border"
              style={{ borderColor: "rgba(248, 236, 220, 0.25)" }}
            >
              <div className="relative h-80 md:h-[420px] bg-black">
                <img
                  src={topEvent?.image || fallbackEventImage()}
                  alt={topEvent?.name || "Passiify Experience"}
                  className="w-full h-full object-cover transform hover:scale-[1.03] transition duration-700"
                />

                {/* overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

                {/* label */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 text-[10px] text-gray-100 border border-white/15 uppercase tracking-[0.18em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Top pick this week
                  </span>
                </div>

                {/* top event info card */}
                {topEvent && (
                  <div className="absolute left-4 right-4 bottom-4">
                    <div className="flex gap-3 sm:gap-4 items-stretch">
                      <div className="hidden sm:block w-20 h-20 rounded-2xl overflow-hidden border border-white/15 bg-black/40">
                        <img
                          src={topEvent.image || fallbackEventImage()}
                          alt={topEvent.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 rounded-2xl bg-black/70 backdrop-blur border border-white/15 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1">
                          <h3 className="text-sm md:text-base font-semibold text-white line-clamp-1">
                            {topEvent.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-3 text-[11px] md:text-xs text-gray-300">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays size={13} />
                              {new Date(topEvent.date).toLocaleDateString()}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={13} />
                              {topEvent.location || topEvent.city || "TBA"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock size={13} />
                              1-day access
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between">
                          <div className="text-xs text-gray-400">From</div>
                          <div className="text-lg md:text-xl font-extrabold text-white">
                            ₹{topEvent.price}
                          </div>
                          <div className="mt-1 flex gap-2">
                            <Link
                              to={`/events/${topEvent._id}`}
                              className="px-3 py-1 rounded-full bg-white/5 border border-white/20 text-[11px] md:text-xs text-gray-100 hover:bg-white/10"
                            >
                              View
                            </Link>
                            <Link
                              to={`/book-event/${topEvent._id}`}
                              className="px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold"
                              style={{
                                backgroundImage: `linear-gradient(90deg, ${THEME.accent1}, ${THEME.accent2})`,
                                color: "#1B0B0C",
                              }}
                            >
                              Book
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* fallback when no topEvent */}
                {!topEvent && (
                  <div className="absolute left-4 right-4 bottom-4">
                    <div className="rounded-2xl bg-black/75 backdrop-blur border border-white/10 px-4 py-3 text-center">
                      <div className="text-sm font-semibold text-white">
                        New experiences dropping soon
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        Hosts are lining up their next retreats, runs and
                        fight-camps.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* mini pills */}
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-200 flex items-center gap-1.5">
                <Dumbbell size={14} />
                Day-pass gyms
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-200 flex items-center gap-1.5">
                <Star size={14} className="text-yellow-300" />
                Traveler-approved studios
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   STATS STRIP
   - Quick social proof band below hero
   ========================================================= */

function StatsStrip() {
  const stats = [
    { label: "Day-pass sessions booked", value: "5k+" },
    { label: "Gyms & studios onboarded", value: "150+" },
    { label: "Cities explored by movers", value: "40+" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 pb-6 -mt-6">
      <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 grid sm:grid-cols-3 gap-4">
        {stats.map((item) => (
          <div key={item.label} className="flex flex-col">
            <span className="text-sm font-semibold text-gray-50">
              {item.value}
            </span>
            <span className="text-[11px] text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   TRAVEL CITY STRIP
   - Curated “tourist” cities
   ========================================================= */

function TravelCityStrip() {
  const cities = [
    { name: "Goa", tag: "Sunrise yoga & beach gyms" },
    { name: "Bangkok", tag: "Muay Thai fight camps" },
    { name: "Mumbai", tag: "Dance & boxing clubs" },
    { name: "Bali", tag: "Retreats & surf strength" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-gray-50">
          Landing in a new city soon?
        </h2>
        <p className="text-sm text-gray-400 max-w-md">
          Browse curated fitness experiences in popular traveller hubs. Lock in
          your next session before you land.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cities.map((c) => (
          <Link
            key={c.name}
            to={`/explore?query=${encodeURIComponent(c.name)}`}
            className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all p-4 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
                City
              </div>
              <div className="mt-1 text-lg font-semibold text-gray-50">
                {c.name}
              </div>
              <div className="mt-2 text-xs text-gray-300">{c.tag}</div>
            </div>
            <div className="mt-4 text-xs text-gray-400">Tap to explore →</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   UPCOMING EVENTS SECTION
   - Uses /events from backend
   ========================================================= */

function UpcomingEventsSection({ events, loading }) {
  const visible = (events || []).slice(0, 6);

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-50">
            Upcoming events & experiences
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Curated runs, workshops, retreats and fight nights for your next
            trip.
          </p>
        </div>
        <Link
          to="/events"
          className="text-xs font-semibold text-gray-300 hover:text-white"
        >
          See all events →
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">Loading events…</div>
      ) : visible.length === 0 ? (
        <div className="text-sm text-gray-500">
          No events live right now — hosts are setting up the next drop.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((ev) => (
            <article
              key={ev._id}
              className="rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 via-white/0 to-white/5 hover:border-white/40 hover:shadow-[0_20px_70px_rgba(0,0,0,0.9)] transition-all"
            >
              <div className="relative h-48">
                <img
                  src={ev.image || fallbackEventImage()}
                  alt={ev.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 rounded-full bg-black/60 border border-white/20 text-[10px] uppercase tracking-[0.2em] text-gray-100">
                    Event
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-50 line-clamp-2">
                    {ev.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {ev.location || ev.city || "Location TBA"}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={14} />
                    {new Date(ev.date).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} />
                    1-day entry
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="text-sm font-bold text-gray-50">
                    ₹{ev.price}
                    <span className="text-[11px] text-gray-400 font-normal">
                      {" "}
                      / pass
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/events/${ev._id}`}
                      className="px-3 py-1.5 rounded-full border border-white/15 text-[11px] text-gray-100 hover:bg-white/10"
                    >
                      Details
                    </Link>
                    <Link
                      to={`/book-event/${ev._id}`}
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
                      style={{
                        backgroundImage: `linear-gradient(90deg, ${THEME.accent1}, ${THEME.accent2})`,
                        color: "#1B0B0C",
                      }}
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   DAY-PASS GYMS & STUDIOS
   - Uses /gyms from backend
   ========================================================= */

function DayPassGymsSection({ gyms, loading }) {
  const visible = (gyms || []).slice(0, 8);

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-50">
              Day-pass gyms & studios
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Drop into premium facilities without locking into a monthly
              membership.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-gray-300 hover:text-white"
          >
            Browse all gyms →
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-gray-400">Loading gyms…</div>
        ) : visible.length === 0 ? (
          <div className="text-sm text-gray-500">
            No gyms added yet — we’re onboarding hosts in your region.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visible.map((g) => (
              <article
                key={g._id}
                className="rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 via-white/0 to-white/5 hover:border-white/40 hover:shadow-[0_20px_70px_rgba(0,0,0,0.9)] transition-all"
              >
                <div className="relative h-40">
                  <img
                    src={g.images?.[0] || g.image || fallbackGymImage()}
                    alt={g.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded-full bg-black/60 border border-white/20 text-[10px] uppercase tracking-[0.2em] text-gray-100">
                      Gym
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-50 line-clamp-1">
                      {g.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {g.city || "City TBA"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span className="inline-flex items-center gap-1">
                      <Dumbbell size={14} />
                      Day-pass
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star size={14} className="text-yellow-300" />
                      {g.rating ?? "4.6"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm font-bold text-gray-50">
                      ₹{g.price ?? "—"}
                      <span className="text-[11px] text-gray-400 font-normal">
                        {" "}
                        / day
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/gyms/${g._id}`}
                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/15 text-[11px] text-gray-100 hover:bg-white/10"
                      >
                        View
                      </Link>
                      <Link
                        to={`/booking/${g._id}`}
                        className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white text-gray-900"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   CATEGORY STRIP
   - “Explore by vibe” chips/cards
   ========================================================= */

function CategoryStrip() {
  const categories = [
    { name: "MMA & Fight Clubs", emoji: "🥊" },
    { name: "Yoga & Breathwork", emoji: "🧘" },
    { name: "Dance Studios", emoji: "💃" },
    { name: "Strength & Gym", emoji: "💪" },
    { name: "CrossFit & HIIT", emoji: "🏋️" },
    { name: "Outdoor & Trails", emoji: "⛰️" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 pb-6 pt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm uppercase tracking-[0.25em] text-gray-400 font-semibold">
          Explore by vibe
        </h2>
        <Link
          to="/explore"
          className="text-xs font-semibold text-gray-300 hover:text-white"
        >
          View all experiences →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((c) => (
          <Link
            key={c.name}
            to={`/explore?query=${encodeURIComponent(c.name)}`}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/10 hover:border-white/40 hover:shadow-[0_18px_60px_rgba(0,0,0,0.7)] transition-all p-4 flex flex-col items-start"
          >
            <span className="text-2xl mb-2">{c.emoji}</span>
            <span className="text-xs font-semibold text-gray-100 leading-snug">
              {c.name}
            </span>
            <span className="mt-2 text-[10px] text-gray-500 group-hover:text-gray-300">
              Tap to explore
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   WHY PASSIIFY (VALUE PROP SECTION)
   ========================================================= */

function WhyPassiifySection() {
  const items = [
    {
      title: "No contracts. Ever.",
      desc: "Commit to the workout, not the membership. Every pass is flexible and short-term.",
    },
    {
      title: "Travel-first design.",
      desc: "Discover authentic local gyms, fight clubs and wellness spots in seconds.",
    },
    {
      title: "Verified hosts.",
      desc: "We manually review every partner so your experience feels safe and premium.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/10 p-6 md:p-8">
        <div className="grid lg:grid-cols-[1.1fr,1.2fr] gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-50">
              For movers, travellers & Gen-Z who want to{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${THEME.accent2}, ${THEME.accent1})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                try everything once.
              </span>
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-300 max-w-lg">
              Passiify lets you experiment with new disciplines — from Muay Thai
              to rooftop yoga — without locking into long plans or awkward sales
              tours.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 flex flex-col justify-between"
              >
                <div className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">
                  PASSIIFY
                </div>
                <h3 className="text-sm font-semibold text-gray-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   HOW IT WORKS (4 STEPS)
   ========================================================= */

function HowItWorksSection() {
  const steps = [
    {
      emoji: "🌍",
      title: "Drop a pin",
      desc: "Choose your city or let Passiify find where you are.",
    },
    {
      emoji: "🧾",
      title: "Pick your vibe",
      desc: "Filter by MMA, yoga, dance, strength or outdoor.",
    },
    {
      emoji: "💳",
      title: "Book your pass",
      desc: "Instant checkout. No subscriptions. No lock-ins.",
    },
    {
      emoji: "🏁",
      title: "Show up & move",
      desc: "Flash your pass at the venue and enjoy the experience.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold text-gray-50 mb-6">
        How Passiify works
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col"
          >
            <div className="text-2xl mb-2">{step.emoji}</div>
            <div className="text-sm font-semibold text-gray-50">
              {step.title}
            </div>
            <div className="mt-2 text-xs text-gray-300">{step.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   LOCAL DISCOVERY INLINE (chips section)
   ========================================================= */

function LocalDiscoveryInline() {
  const chips = [
    "Morning yoga",
    "Evening MMA",
    "Beach workout",
    "Dance cardio",
    "Pilates",
    "Strength club",
  ];

  const handleClick = (q) => {
    window.location.href = `/explore?query=${encodeURIComponent(q)}`;
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-50">
            Discover something close tonight
          </h3>
          <p className="text-xs text-gray-400 max-w-xs">
            Quick filters that work anywhere — perfect for last-minute plans.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => handleClick(c)}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-100 hover:bg-white/10 transition"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CTA SECTION
   ========================================================= */

function CTASection() {
  return (
    <section className="relative overflow-hidden mt-4">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
          opacity: 0.97,
        }}
      />
      <div className="relative max-w-4xl mx-auto px-6 py-16 text-center text-gray-900">
        <h2 className="text-3xl font-black mb-3">
          Ready to move differently on your next trip?
        </h2>
        <p className="text-sm md:text-base text-black/80 mb-7 max-w-2xl mx-auto">
          Join travellers who treat every new city like a playground — book
          fight clubs, studios and workouts in a few taps.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/events"
            className="px-6 py-3 bg-black text-white font-semibold rounded-xl text-sm md:text-base"
          >
            Explore events
          </Link>
          <Link
            to="/explore"
            className="px-6 py-3 border border-black/40 text-black font-semibold rounded-xl text-sm md:text-base bg-white/40"
          >
            Find gyms & studios
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FOOTER
   ========================================================= */

function Footer() {
  return (
    <footer className="border-t border-white/10 mt-12 bg-black/40">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6">
        <div>
          <h4 className="text-xl font-bold text-gray-50">Passiify</h4>
          <p className="text-xs text-gray-400 mt-2 max-w-xs">
            One-day fitness passes and curated events for travellers, expats
            and locals who hate long-term contracts.
          </p>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-gray-200 mb-2">
            Quick links
          </h5>
          <ul className="text-xs text-gray-400 space-y-1.5">
            <li>
              <Link to="/explore" className="hover:text-white">
                Explore
              </Link>
            </li>
            <li>
              <Link to="/partner" className="hover:text-white">
                Partner with us
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-gray-200 mb-2">
            Contact
          </h5>
          <p className="text-xs text-gray-400">support@passiify.com</p>
          <p className="text-xs text-gray-500 mt-3">
            © {new Date().getFullYear()} Passiify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   PAGE ASSEMBLY (DEFAULT EXPORT)
   - Fetches /events and /gyms once and passes data to sections
   ========================================================= */

export default function Home() {
  const [events, setEvents] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingGyms, setLoadingGyms] = useState(true);
  const [topEvent, setTopEvent] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [evRes, gymRes] = await Promise.all([
          API.get("/events"),
          API.get("/gyms"),
        ]);

        if (!mounted) return;

        const evData = evRes.data?.events || evRes.data || evRes;
        const gymData = gymRes.data || gymRes;

        const evArr = Array.isArray(evData) ? evData : [];
        const gymArr = Array.isArray(gymData) ? gymData : [];

        setEvents(evArr);
        setGyms(gymArr);

        // pick earliest upcoming or first as hero top event
        const sorted = [...evArr].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        const upcoming =
          sorted.find((e) => new Date(e.date) >= new Date()) || sorted[0] || null;
        setTopEvent(upcoming);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        if (!mounted) return;
        setLoadingEvents(false);
        setLoadingGyms(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = (q, t) => {
    // central place if you add analytics later
    console.log("Passiify search", { query: q, type: t });
  };

  return (
    <div
      className="min-h-screen text-gray-100"
      style={{
        backgroundColor: THEME.bg,
        backgroundImage:
          "radial-gradient(circle at top, rgba(248, 216, 181, 0.16), transparent 55%)",
      }}
    >
      {/* HERO */}
      <Hero topEvent={topEvent} onSearch={handleSearch} />

      {/* MAIN CONTENT */}
      <main className="space-y-4">
        <StatsStrip />
        <TravelCityStrip />
        <UpcomingEventsSection events={events} loading={loadingEvents} />
        <DayPassGymsSection gyms={gyms} loading={loadingGyms} />
        <CategoryStrip />
        <WhyPassiifySection />
        <HowItWorksSection />
        <LocalDiscoveryInline />
        <CTASection />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
