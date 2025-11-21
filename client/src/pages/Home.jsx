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
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import API from "../utils/api";

/* =========================================================
   THEME TOKENS — LIGHT / DARK (BALANCED BLUE x ORANGE)
   ========================================================= */

const LIGHT_THEME = {
  mode: "light",
  bg: "#F4F5FB",
  bgSoft: "#EEF1F7",
  card: "rgba(255,255,255,0.96)",
  cardAlt: "rgba(249,250,252,0.98)",
  textMain: "#0F172A",
  textMuted: "#6B7280",
  accentBlue: "#2563EB",
  accentOrange: "#F97316",
  accentMint: "#14B8A6",
  borderSoft: "rgba(148,163,184,0.35)",
  shadowStrong: "0 30px 90px rgba(15,23,42,0.25)",
  shadowSoft: "0 16px 55px rgba(15,23,42,0.12)",
};

const DARK_THEME = {
  mode: "dark",
  bg: "#020617",
  bgSoft: "#020617",
  card: "rgba(15,23,42,0.96)",
  cardAlt: "rgba(15,23,42,0.92)",
  textMain: "#E5E7EB",
  textMuted: "#9CA3AF",
  accentBlue: "#3B82F6",
  accentOrange: "#FB923C",
  accentMint: "#22D3EE",
  borderSoft: "rgba(148,163,184,0.55)",
  shadowStrong: "0 30px 120px rgba(0,0,0,0.95)",
  shadowSoft: "0 20px 80px rgba(15,23,42,0.9)",
};

/* =========================================================
   FALLBACK IMAGES
   ========================================================= */

const fallbackEventImage = () =>
  "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=1400&q=80&auto=format&fit=crop";

const fallbackGymImage = () =>
  "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1400";

/* =========================================================
   HERO SECTION
   ========================================================= */

function Hero({
  theme,
  mode,
  topEvent,
  onSearch,
  startingDayPrice,
  eventsCount,
  gymsCount,
}) {
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

  const quickSearch = (value, overrideType) => {
    const params = new URLSearchParams();
    params.set("query", value);
    if (overrideType && overrideType !== "all") {
      params.set("type", overrideType);
    }
    navigate(`/explore?${params.toString()}`);
  };

  const dayPassFrom = startingDayPrice ?? 249;

  return (
    <header className="relative overflow-hidden">
      {/* Ambient background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* soft blue blob */}
        <div
          className="absolute -top-40 -left-36 w-96 h-96 rounded-full blur-3xl opacity-50"
          style={{ background: theme.accentBlue }}
        />
        {/* soft orange blob */}
        <div
          className="absolute -bottom-40 -right-36 w-[420px] h-[420px] rounded-full blur-3xl opacity-45"
          style={{ background: theme.accentOrange }}
        />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-10 mix-blend-soft-light"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.2) 1px, transparent 1px)",
            backgroundSize: "38px 38px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 lg:pt-28 lg:pb-24">
        <div className="grid lg:grid-cols-[1.1fr,1fr] gap-10 items-center">
          {/* LEFT: copy + search */}
          <div>
            {/* micro trust pill */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur mb-6"
              style={{
                borderColor: theme.borderSoft,
                background:
                  mode === "dark"
                    ? "rgba(15,23,42,0.9)"
                    : "rgba(255,255,255,0.9)",
                boxShadow: theme.shadowSoft,
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.25em]"
                style={{ color: theme.textMuted }}
              >
                VERIFIED • FLEXIBLE • GEN-Z
              </span>
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-[3.3rem] font-black tracking-tight"
              style={{ color: theme.textMain }}
            >
              One-day{" "}
              <span
                className="px-1.5 rounded-md"
                style={{
                  backgroundImage: `linear-gradient(120deg, ${theme.accentBlue}, ${theme.accentOrange})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                gym passes
              </span>{" "}
              & fitness events. No cringe contracts.
            </h1>

            <p
              className="mt-4 text-base md:text-lg max-w-xl"
              style={{ color: theme.textMuted }}
            >
              Train while you travel — MMA, rooftop yoga, dance, CrossFit,
              strength clubs. Book clean, transparent passes that match how you
              actually live.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 max-w-xl"
              aria-label="Search fitness experiences"
            >
              <div
                className="flex items-stretch rounded-2xl border backdrop-blur-xl"
                style={{
                  borderColor: theme.borderSoft,
                  background:
                    mode === "dark"
                      ? "rgba(15,23,42,0.96)"
                      : "rgba(255,255,255,0.97)",
                  boxShadow: theme.shadowStrong,
                }}
              >
                {/* type selector */}
                <div
                  className="flex items-center px-3 border-r rounded-l-2xl"
                  style={{
                    borderColor:
                      mode === "dark"
                        ? "rgba(51,65,85,0.8)"
                        : "rgba(226,232,240,0.9)",
                    background:
                      mode === "dark"
                        ? "rgba(15,23,42,0.96)"
                        : "rgba(248,250,252,0.96)",
                  }}
                >
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="bg-transparent text-xs md:text-sm outline-none pr-2"
                    style={{ color: theme.textMain }}
                  >
                    <option value="all">All</option>
                    <option value="events">Events</option>
                    <option value="gyms">Gyms & Studios</option>
                  </select>
                </div>

                {/* input */}
                <div className="flex-1 flex items-center px-3">
                  <Search
                    size={18}
                    className="hidden sm:block"
                    style={{ color: theme.textMuted }}
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm md:text-base px-2 py-3 outline-none"
                    style={{
                      color: theme.textMain,
                      caretColor: theme.accentBlue,
                    }}
                    placeholder="Search MMA, yoga, dance or a city — e.g. Goa"
                  />
                </div>

                {/* submit */}
                <button
                  type="submit"
                  className="px-4 md:px-6 py-3 text-sm md:text-base font-semibold rounded-r-2xl flex items-center gap-2"
                  style={{
                    backgroundImage: `linear-gradient(120deg, ${theme.accentBlue}, ${theme.accentOrange})`,
                    color: "#020617",
                  }}
                >
                  <span>Search</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* quick chips + price highlight */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs md:text-sm">
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "MMA gyms", type: "gyms" },
                    { label: "Sunrise yoga", type: "events" },
                    { label: "Dance studio", type: "gyms" },
                    { label: "CrossFit", type: "gyms" },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => quickSearch(chip.label, chip.type)}
                      className="px-3 py-1.5 rounded-full border transition"
                      style={{
                        borderColor: theme.borderSoft,
                        background:
                          mode === "dark"
                            ? "rgba(15,23,42,0.92)"
                            : "rgba(255,255,255,0.96)",
                        color: theme.textMain,
                      }}
                    >
                      #{chip.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs">
                  <span
                    className="px-3 py-1 rounded-full font-semibold"
                    style={{
                      background:
                        mode === "dark"
                          ? "rgba(22,163,74,0.18)"
                          : "rgba(22,163,74,0.08)",
                      color: mode === "dark" ? "#BBF7D0" : "#15803D",
                    }}
                  >
                    Day-pass from ₹{dayPassFrom}
                  </span>
                  <span style={{ color: theme.textMuted }}>
                    in select partner cities
                  </span>
                </div>
              </div>
            </form>

            {/* trust badges */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-emerald-400" />
                <span style={{ color: theme.textMuted }}>
                  Verified hosts & venues
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-yellow-400" />
                <span style={{ color: theme.textMuted }}>
                  Secure UPI/card payments
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-rose-400" />
                <span style={{ color: theme.textMuted }}>
                  Built for travellers & Gen-Z
                </span>
              </div>
            </div>

            {/* compact metrics row */}
            <div className="mt-6 flex flex-wrap gap-4 text-[11px] md:text-xs">
              <div
                className="px-3 py-2 rounded-xl border"
                style={{
                  borderColor: theme.borderSoft,
                  background:
                    mode === "dark"
                      ? "rgba(15,23,42,0.9)"
                      : "rgba(255,255,255,0.96)",
                }}
              >
                <span style={{ color: theme.textMuted }}>
                  Gyms & studios live
                </span>
                <div
                  className="text-sm font-semibold"
                  style={{ color: theme.textMain }}
                >
                  {gymsCount || "—"}
                </div>
              </div>
              <div
                className="px-3 py-2 rounded-xl border"
                style={{
                  borderColor: theme.borderSoft,
                  background:
                    mode === "dark"
                      ? "rgba(15,23,42,0.9)"
                      : "rgba(255,255,255,0.96)",
                }}
              >
                <span style={{ color: theme.textMuted }}>
                  Events listed now
                </span>
                <div
                  className="text-sm font-semibold"
                  style={{ color: theme.textMain }}
                >
                  {eventsCount || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: hero visual + top event card */}
          <div className="relative">
            <div
              className="rounded-[28px] overflow-hidden border backdrop-blur-xl"
              style={{
                borderColor: theme.borderSoft,
                background:
                  mode === "dark"
                    ? "rgba(15,23,42,0.96)"
                    : "rgba(255,255,255,0.96)",
                boxShadow: theme.shadowStrong,
              }}
            >
              <div className="relative h-80 md:h-[420px] bg-black">
                <img
                  src={topEvent?.image || fallbackEventImage()}
                  alt={topEvent?.name || "Passiify Experience"}
                  className="w-full h-full object-cover transform hover:scale-[1.03] transition duration-700"
                  loading="lazy"
                />

                {/* overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      mode === "dark"
                        ? "linear-gradient(to top, rgba(15,23,42,1), rgba(15,23,42,0.2))"
                        : "linear-gradient(to top, rgba(15,23,42,0.9), rgba(15,23,42,0.1))",
                  }}
                />

                {/* label */}
                <div className="absolute top-4 left-4">
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] uppercase tracking-[0.18em]"
                    style={{
                      borderColor: "rgba(255,255,255,0.25)",
                      background: "rgba(15,23,42,0.9)",
                      color: "#F9FAFB",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Top pick this week
                  </span>
                </div>

                {/* top event info card */}
                {topEvent ? (
                  <div className="absolute left-4 right-4 bottom-4">
                    <div className="flex gap-3 sm:gap-4 items-stretch">
                      <div className="hidden sm:block w-20 h-20 rounded-2xl overflow-hidden border border-white/20 bg-black/40">
                        <img
                          src={topEvent.image || fallbackEventImage()}
                          alt={topEvent.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div
                        className="flex-1 rounded-2xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
                        style={{
                          borderColor: "rgba(148,163,184,0.5)",
                          background: "rgba(15,23,42,0.94)",
                          boxShadow: theme.shadowSoft,
                        }}
                      >
                        <div className="flex-1">
                          <h3
                            className="text-sm md:text-base font-semibold line-clamp-1"
                            style={{ color: "#F9FAFB" }}
                          >
                            {topEvent.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-3 text-[11px] md:text-xs">
                            <span
                              className="inline-flex items-center gap-1"
                              style={{ color: theme.textMuted }}
                            >
                              <CalendarDays size={13} />
                              {new Date(topEvent.date).toLocaleDateString()}
                            </span>
                            <span
                              className="inline-flex items-center gap-1"
                              style={{ color: theme.textMuted }}
                            >
                              <MapPin size={13} />
                              {topEvent.location || topEvent.city || "TBA"}
                            </span>
                            <span
                              className="inline-flex items-center gap-1"
                              style={{ color: theme.textMuted }}
                            >
                              <Clock size={13} />
                              1-day entry
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between">
                          <div
                            className="text-[11px]"
                            style={{ color: theme.textMuted }}
                          >
                            From
                          </div>
                          <div
                            className="text-lg md:text-2xl font-extrabold"
                            style={{
                              backgroundImage: `linear-gradient(110deg, ${theme.accentOrange}, ${theme.accentBlue})`,
                              WebkitBackgroundClip: "text",
                              color: "transparent",
                            }}
                          >
                            ₹{topEvent.price}
                          </div>
                          <div className="mt-1 flex gap-2">
                            <Link
                              to={`/events/${topEvent._id}`}
                              className="px-3 py-1 rounded-full border text-[11px] md:text-xs"
                              style={{
                                borderColor: "rgba(148,163,184,0.5)",
                                color: "#E5E7EB",
                              }}
                            >
                              View
                            </Link>
                            <Link
                              to={`/book-event/${topEvent._id}`}
                              className="px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold"
                              style={{
                                backgroundImage: `linear-gradient(120deg, ${theme.accentBlue}, ${theme.accentOrange})`,
                                color: "#020617",
                              }}
                            >
                              Book now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute left-4 right-4 bottom-4">
                    <div
                      className="rounded-2xl border px-4 py-3 text-center"
                      style={{
                        borderColor: "rgba(148,163,184,0.5)",
                        background: "rgba(15,23,42,0.94)",
                      }}
                    >
                      <div
                        className="text-sm font-semibold"
                        style={{ color: "#F9FAFB" }}
                      >
                        New experiences dropping soon
                      </div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: theme.textMuted }}
                      >
                        Hosts are lining up retreats, runs and fight-camps.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* mini pills */}
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <div
                className="px-3 py-1.5 rounded-full border flex items-center gap-1.5 backdrop-blur"
                style={{
                  borderColor: theme.borderSoft,
                  background:
                    mode === "dark"
                      ? "rgba(15,23,42,0.96)"
                      : "rgba(255,255,255,0.96)",
                  color: theme.textMain,
                }}
              >
                <Dumbbell size={14} />
                1-day pass gyms
              </div>
              <div
                className="px-3 py-1.5 rounded-full border flex items-center gap-1.5 backdrop-blur"
                style={{
                  borderColor: theme.borderSoft,
                  background:
                    mode === "dark"
                      ? "rgba(15,23,42,0.96)"
                      : "rgba(255,255,255,0.96)",
                  color: theme.textMain,
                }}
              >
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
   ========================================================= */

function StatsStrip({ theme, mode, eventsCount, gymsCount }) {
  const stats = [
    {
      label: "Day-pass sessions booked",
      value: "5k+",
    },
    {
      label: "Gyms & studios onboarded",
      value: gymsCount ? `${gymsCount}` : "150+",
    },
    {
      label: "Cities explored by movers",
      value: "40+",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 pb-6 -mt-6">
      <div
        className="rounded-2xl border px-5 py-4 grid sm:grid-cols-3 gap-4 backdrop-blur"
        style={{
          borderColor: theme.borderSoft,
          background:
            mode === "dark"
              ? "rgba(15,23,42,0.96)"
              : "rgba(255,255,255,0.96)",
          boxShadow: theme.shadowSoft,
        }}
      >
        {stats.map((item) => (
          <div key={item.label} className="flex flex-col">
            <span
              className="text-sm font-semibold"
              style={{ color: theme.textMain }}
            >
              {item.value}
            </span>
            <span
              className="text-[11px]"
              style={{ color: theme.textMuted }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   TRAVEL CITY STRIP
   ========================================================= */

function TravelCityStrip({ theme, mode }) {
  const cities = [
    { name: "Goa", tag: "Sunrise yoga & beach gyms" },
    { name: "Bangkok", tag: "Muay Thai fight camps" },
    { name: "Mumbai", tag: "Dance & boxing clubs" },
    { name: "Bali", tag: "Retreats & surf strength" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h2
          className="text-xl font-semibold"
          style={{ color: theme.textMain }}
        >
          Landing in a new city soon?
        </h2>
        <p
          className="text-sm max-w-md"
          style={{ color: theme.textMuted }}
        >
          Browse curated gyms and events in popular traveller hubs. Lock your
          training in before you land.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cities.map((c) => (
          <Link
            key={c.name}
            to={`/explore?query=${encodeURIComponent(c.name)}`}
            className="rounded-2xl border transition-all p-4 flex flex-col justify-between backdrop-blur"
            style={{
              borderColor: theme.borderSoft,
              background:
                mode === "dark"
                  ? "rgba(15,23,42,0.96)"
                  : "rgba(255,255,255,0.96)",
              boxShadow: theme.shadowSoft,
            }}
          >
            <div>
              <div
                className="text-[11px] uppercase tracking-[0.2em]"
                style={{ color: theme.textMuted }}
              >
                City
              </div>
              <div
                className="mt-1 text-lg font-semibold"
                style={{ color: theme.textMain }}
              >
                {c.name}
              </div>
              <div
                className="mt-2 text-xs"
                style={{ color: theme.textMuted }}
              >
                {c.tag}
              </div>
            </div>
            <div className="mt-4 text-xs flex items-center gap-1">
              <span
                className="font-medium"
                style={{ color: theme.accentBlue }}
              >
                Tap to explore
              </span>
              <ArrowRight size={12} style={{ color: theme.accentBlue }} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   UPCOMING EVENTS SECTION
   ========================================================= */

function UpcomingEventsSection({ theme, mode, events, loading }) {
  const visible = (events || []).slice(0, 6);

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-2xl font-semibold"
            style={{ color: theme.textMain }}
          >
            Upcoming events & experiences
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: theme.textMuted }}
          >
            Runs, workshops, retreats and fight nights you can book in a few
            taps.
          </p>
        </div>
        <Link
          to="/events"
          className="text-xs font-semibold hover:underline"
          style={{ color: theme.textMuted }}
        >
          See all events →
        </Link>
      </div>

      {loading ? (
        <div
          className="text-sm"
          style={{ color: theme.textMuted }}
        >
          Loading events…
        </div>
      ) : visible.length === 0 ? (
        <div
          className="text-sm"
          style={{ color: theme.textMuted }}
        >
          No events live right now — keep an eye out for the next drop.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((ev) => (
            <article
              key={ev._id}
              className="rounded-2xl overflow-hidden border transition-all backdrop-blur"
              style={{
                borderColor: theme.borderSoft,
                background:
                  mode === "dark"
                    ? "rgba(15,23,42,0.96)"
                    : "rgba(255,255,255,0.96)",
                boxShadow: theme.shadowSoft,
              }}
            >
              <div className="relative h-48">
                <img
                  src={ev.image || fallbackEventImage()}
                  alt={ev.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      mode === "dark"
                        ? "linear-gradient(to top, rgba(15,23,42,0.98), rgba(15,23,42,0.25))"
                        : "linear-gradient(to top, rgba(15,23,42,0.9), rgba(15,23,42,0.25))",
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span
                    className="px-2 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em]"
                    style={{
                      borderColor: "rgba(255,255,255,0.25)",
                      background: "rgba(15,23,42,0.9)",
                      color: "#F9FAFB",
                    }}
                  >
                    Event
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div>
                  <h3
                    className="text-sm md:text-base font-semibold line-clamp-2"
                    style={{ color: theme.textMain }}
                  >
                    {ev.name}
                  </h3>
                  <p
                    className="text-xs mt-1"
                    style={{ color: theme.textMuted }}
                  >
                    {ev.location || ev.city || "Location TBA"}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span
                    className="inline-flex items-center gap-1"
                    style={{ color: theme.textMuted }}
                  >
                    <CalendarDays size={14} />
                    {new Date(ev.date).toLocaleDateString()}
                  </span>
                  <span
                    className="inline-flex items-center gap-1"
                    style={{ color: theme.textMuted }}
                  >
                    <Clock size={14} />
                    1-day entry
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div>
                    <div
                      className="text-[11px]"
                      style={{ color: theme.textMuted }}
                    >
                      From
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{
                        backgroundImage: `linear-gradient(120deg, ${theme.accentOrange}, ${theme.accentBlue})`,
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      ₹{ev.price}
                      <span
                        className="text-[11px] font-normal ml-1"
                        style={{ color: theme.textMuted }}
                      >
                        / ticket
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/events/${ev._id}`}
                      className="px-3 py-1.5 rounded-full border text-[11px]"
                      style={{
                        borderColor: theme.borderSoft,
                        color: theme.textMain,
                      }}
                    >
                      Details
                    </Link>
                    <Link
                      to={`/book-event/${ev._id}`}
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
                      style={{
                        backgroundImage: `linear-gradient(120deg, ${theme.accentBlue}, ${theme.accentOrange})`,
                        color: "#020617",
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
   ========================================================= */

function DayPassGymsSection({ theme, mode, gyms, loading }) {
  const visible = (gyms || []).slice(0, 8);
  const featured = visible[0];
  const rest = visible.slice(1);

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-2xl font-semibold"
              style={{ color: theme.textMain }}
            >
              Day-pass gyms & studios
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: theme.textMuted }}
            >
              Drop into premium facilities without signing up for monthly
              contracts.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold hover:underline"
            style={{ color: theme.textMuted }}
          >
            Browse all gyms →
          </Link>
        </div>

        {loading ? (
          <div
            className="text-sm"
            style={{ color: theme.textMuted }}
          >
            Loading gyms…
          </div>
        ) : visible.length === 0 ? (
          <div
            className="text-sm"
            style={{ color: theme.textMuted }}
          >
            No gyms added yet — we’re onboarding hosts in your region.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Featured gym */}
            {featured && (
              <article
                className="rounded-3xl overflow-hidden border flex flex-col md:flex-row backdrop-blur-xl"
                style={{
                  borderColor: theme.borderSoft,
                  background:
                    mode === "dark"
                      ? "rgba(15,23,42,0.97)"
                      : "rgba(255,255,255,0.98)",
                  boxShadow: theme.shadowStrong,
                }}
              >
                <div className="relative md:w-1/2 h-56 md:h-64">
                  <img
                    src={
                      featured.images?.[0] ||
                      featured.coverImage ||
                      featured.image ||
                      fallbackGymImage()
                    }
                    alt={featured.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        mode === "dark"
                          ? "linear-gradient(to top right, rgba(15,23,42,1), rgba(15,23,42,0.25))"
                          : "linear-gradient(to top right, rgba(15,23,42,0.85), rgba(15,23,42,0.2))",
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className="px-2 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em]"
                      style={{
                        borderColor: "rgba(255,255,255,0.25)",
                        background: "rgba(15,23,42,0.9)",
                        color: "#F9FAFB",
                      }}
                    >
                      Featured gym
                    </span>
                  </div>
                </div>

                <div className="md:w-1/2 p-4 md:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="text-lg font-semibold line-clamp-1"
                        style={{ color: theme.textMain }}
                      >
                        {featured.name}
                      </h3>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                        style={{
                          background:
                            mode === "dark"
                              ? "rgba(37,99,235,0.18)"
                              : "rgba(37,99,235,0.08)",
                          color: theme.accentBlue,
                        }}
                      >
                        <Dumbbell size={12} />
                        Day-pass
                      </span>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      {featured.city || "City TBA"}
                    </p>
                    <p
                      className="mt-2 text-xs line-clamp-2"
                      style={{ color: theme.textMuted }}
                    >
                      {featured.description ||
                        "A clean, well-equipped space for one perfect session while you’re in town."}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
                      <span
                        className="inline-flex items-center gap-1"
                        style={{ color: theme.textMuted }}
                      >
                        <Star size={13} className="text-yellow-300" />
                        {featured.rating ?? "4.6"} rating
                      </span>
                      {featured.openingHours && (
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ color: theme.textMuted }}
                        >
                          <Clock size={13} />
                          {featured.openingHours}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div
                        className="text-[11px]"
                        style={{ color: theme.textMuted }}
                      >
                        Day-pass from
                      </div>
                      <div
                        className="text-2xl font-extrabold"
                        style={{
                          backgroundImage: `linear-gradient(120deg, ${theme.accentOrange}, ${theme.accentBlue})`,
                          WebkitBackgroundClip: "text",
                          color: "transparent",
                        }}
                      >
                        ₹{featured.price ?? "—"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/gyms/${featured._id}`}
                        className="px-3 py-1.5 rounded-full border text-[11px]"
                        style={{
                          borderColor: theme.borderSoft,
                          color: theme.textMain,
                        }}
                      >
                        View
                      </Link>
                      <Link
                        to={`/booking/${featured._id}`}
                        className="px-4 py-1.5 rounded-full text-[11px] font-semibold"
                        style={{
                          backgroundImage: `linear-gradient(120deg, ${theme.accentBlue}, ${theme.accentOrange})`,
                          color: "#020617",
                        }}
                      >
                        Book day-pass
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Remaining gyms */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {rest.map((g) => (
                  <article
                    key={g._id}
                    className="rounded-2xl overflow-hidden border transition-all backdrop-blur"
                    style={{
                      borderColor: theme.borderSoft,
                      background:
                        mode === "dark"
                          ? "rgba(15,23,42,0.96)"
                          : "rgba(255,255,255,0.96)",
                      boxShadow: theme.shadowSoft,
                    }}
                  >
                    <div className="relative h-40">
                      <img
                        src={
                          g.images?.[0] ||
                          g.coverImage ||
                          g.image ||
                          fallbackGymImage()
                        }
                        alt={g.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            mode === "dark"
                              ? "linear-gradient(to top, rgba(15,23,42,0.96), rgba(15,23,42,0.25))"
                              : "linear-gradient(to top, rgba(15,23,42,0.9), rgba(15,23,42,0.25))",
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className="px-2 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em]"
                          style={{
                            borderColor: "rgba(255,255,255,0.25)",
                            background: "rgba(15,23,42,0.9)",
                            color: "#F9FAFB",
                          }}
                        >
                          Gym
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-3">
                      <div>
                        <h3
                          className="text-sm font-semibold line-clamp-1"
                          style={{ color: theme.textMain }}
                        >
                          {g.name}
                        </h3>
                        <p
                          className="text-[11px] mt-1"
                          style={{ color: theme.textMuted }}
                        >
                          {g.city || "City TBA"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ color: theme.textMuted }}
                        >
                          <Dumbbell size={14} />
                          Day-pass
                        </span>
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ color: theme.textMuted }}
                        >
                          <Star size={14} className="text-yellow-300" />
                          {g.rating ?? "4.6"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div>
                          <div
                            className="text-[11px]"
                            style={{ color: theme.textMuted }}
                          >
                            From
                          </div>
                          <div
                            className="text-sm font-bold"
                            style={{ color: theme.textMain }}
                          >
                            ₹{g.price ?? "—"}
                            <span
                              className="text-[11px] font-normal"
                              style={{ color: theme.textMuted }}
                            >
                              {" "}
                              / day
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/gyms/${g._id}`}
                            className="px-3 py-1.5 rounded-full border text-[11px]"
                            style={{
                              borderColor: theme.borderSoft,
                              color: theme.textMain,
                            }}
                          >
                            View
                          </Link>
                          <Link
                            to={`/booking/${g._id}`}
                            className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
                            style={{
                              background:
                                mode === "dark"
                                  ? "#F9FAFB"
                                  : "rgba(15,23,42,0.9)",
                              color:
                                mode === "dark"
                                  ? "#0F172A"
                                  : "#F9FAFB",
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
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   CATEGORY STRIP
   ========================================================= */

function CategoryStrip({ theme, mode }) {
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
        <h2
          className="text-sm uppercase tracking-[0.25em] font-semibold"
          style={{ color: theme.textMuted }}
        >
          Explore by vibe
        </h2>
        <Link
          to="/explore"
          className="text-xs font-semibold hover:underline"
          style={{ color: theme.textMuted }}
        >
          View all experiences →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((c) => (
          <Link
            key={c.name}
            to={`/explore?query=${encodeURIComponent(c.name)}`}
            className="group relative overflow-hidden rounded-2xl border transition-all p-4 flex flex-col items-start backdrop-blur"
            style={{
              borderColor: theme.borderSoft,
              background:
                mode === "dark"
                  ? "rgba(15,23,42,0.96)"
                  : "rgba(255,255,255,0.96)",
              boxShadow: theme.shadowSoft,
            }}
          >
            <span className="text-2xl mb-2">{c.emoji}</span>
            <span
              className="text-xs font-semibold leading-snug"
              style={{ color: theme.textMain }}
            >
              {c.name}
            </span>
            <span
              className="mt-2 text-[10px] group-hover:underline"
              style={{ color: theme.textMuted }}
            >
              Tap to explore
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   WHY PASSIIFY
   ========================================================= */

function WhyPassiifySection({ theme, mode }) {
  const items = [
    {
      title: "No contracts. Ever.",
      desc: "Commit to the workout, not a 12-month plan. Every pass is short, clean and flexible.",
    },
    {
      title: "Travel-first design.",
      desc: "Swap between fight clubs, yoga rooftops and strength clubs in any city without friction.",
    },
    {
      title: "Verified hosts.",
      desc: "We vet every partner so the vibes, safety and quality feel worth your time and money.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div
        className="rounded-3xl border p-6 md:p-8 backdrop-blur-xl"
        style={{
          borderColor: theme.borderSoft,
          background:
            mode === "dark"
              ? "radial-gradient(circle at top left, rgba(37,99,235,0.24), transparent 55%), rgba(15,23,42,0.96)"
              : "radial-gradient(circle at top left, rgba(37,99,235,0.10), transparent 55%), rgba(255,255,255,0.98)",
          boxShadow: theme.shadowSoft,
        }}
      >
        <div className="grid lg:grid-cols-[1.1fr,1.2fr] gap-8 items-center">
          <div>
            <h2
              className="text-2xl md:text-3xl font-semibold"
              style={{ color: theme.textMain }}
            >
              Built for people who want to{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(120deg, ${theme.accentBlue}, ${theme.accentOrange})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                try everything once
              </span>{" "}
              without getting locked in.
            </h2>
            <p
              className="mt-3 text-sm md:text-base max-w-lg"
              style={{ color: theme.textMuted }}
            >
              Passiify lets you experiment with Muay Thai, rooftop yoga, dance
              cardio or strength clubs — with honest pricing and instant
              booking. No awkward sales desk chats.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border px-4 py-4 flex flex-col justify-between"
                style={{
                  borderColor: theme.borderSoft,
                  background:
                    mode === "dark"
                      ? "rgba(15,23,42,0.96)"
                      : "rgba(255,255,255,0.98)",
                }}
              >
                <div
                  className="text-[10px] uppercase tracking-[0.25em] mb-2"
                  style={{ color: theme.textMuted }}
                >
                  PASSIIFY
                </div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: theme.textMain }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-2 text-xs"
                  style={{ color: theme.textMuted }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   HOW IT WORKS
   ========================================================= */

function HowItWorksSection({ theme, mode }) {
  const steps = [
    {
      emoji: "🌍",
      title: "Drop a pin",
      desc: "Choose your city or your next trip spot.",
    },
    {
      emoji: "🧾",
      title: "Pick your vibe",
      desc: "Filter by MMA, yoga, dance, strength or outdoor.",
    },
    {
      emoji: "💳",
      title: "Book your pass",
      desc: "Instant checkout. No subscriptions, no negotiations.",
    },
    {
      emoji: "🏁",
      title: "Show up & move",
      desc: "Flash your Passiify pass at the venue and you’re in.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h2
        className="text-2xl font-semibold mb-6"
        style={{ color: theme.textMain }}
      >
        How Passiify works
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border p-4 flex flex-col backdrop-blur"
            style={{
              borderColor: theme.borderSoft,
              background:
                mode === "dark"
                  ? "rgba(15,23,42,0.96)"
                  : "rgba(255,255,255,0.96)",
            }}
          >
            <div className="text-2xl mb-2">{step.emoji}</div>
            <div
              className="text-sm font-semibold"
              style={{ color: theme.textMain }}
            >
              {step.title}
            </div>
            <div
              className="mt-2 text-xs"
              style={{ color: theme.textMuted }}
            >
              {step.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   LOCAL DISCOVERY INLINE
   ========================================================= */

function LocalDiscoveryInline({ theme, mode }) {
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
      <div
        className="rounded-2xl border px-5 py-6 backdrop-blur"
        style={{
          borderColor: theme.borderSoft,
          background:
            mode === "dark"
              ? "rgba(15,23,42,0.96)"
              : "rgba(255,255,255,0.98)",
          boxShadow: theme.shadowSoft,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3
            className="text-lg font-semibold"
            style={{ color: theme.textMain }}
          >
            Discover something close tonight
          </h3>
          <p
            className="text-xs max-w-xs"
            style={{ color: theme.textMuted }}
          >
            Quick filters that work anywhere — perfect for last-minute plans
            after work or while travelling.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => handleClick(c)}
              className="px-3 py-1.5 rounded-full border text-xs transition"
              style={{
                borderColor: theme.borderSoft,
                background:
                  mode === "dark"
                    ? "rgba(15,23,42,0.92)"
                    : "rgba(248,250,252,0.96)",
                color: theme.textMain,
              }}
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

function CTASection({ theme }) {
  return (
    <section className="relative overflow-hidden mt-4">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(120deg, ${theme.accentBlue}, ${theme.accentOrange})`,
          opacity: 0.97,
        }}
      />
      <div className="relative max-w-4xl mx-auto px-6 py-16 text-center text-gray-900">
        <h2 className="text-3xl font-black mb-3">
          Ready to make your training as flexible as your travel?
        </h2>
        <p className="text-sm md:text-base text-black/80 mb-7 max-w-2xl mx-auto">
          Join travellers and locals who treat every new city as a playground —
          book fight clubs, studios and workouts in a few taps.
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

function Footer({ theme, mode }) {
  return (
    <footer
      className="border-t mt-12"
      style={{
        borderColor:
          mode === "dark"
            ? "rgba(30,41,59,1)"
            : "rgba(226,232,240,1)",
        background:
          mode === "dark"
            ? "rgba(15,23,42,0.98)"
            : "rgba(248,250,252,0.98)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6">
        <div>
          <h4
            className="text-xl font-bold"
            style={{ color: theme.textMain }}
          >
            Passiify
          </h4>
          <p
            className="text-xs mt-2 max-w-xs"
            style={{ color: theme.textMuted }}
          >
            One-day fitness passes and curated events for travellers, expats
            and locals who hate long-term contracts and hidden BS.
          </p>
        </div>

        <div>
          <h5
            className="text-sm font-semibold mb-2"
            style={{ color: theme.textMain }}
          >
            Quick links
          </h5>
          <ul className="text-xs space-y-1.5">
            <li>
              <Link
                to="/explore"
                className="hover:underline"
                style={{ color: theme.textMuted }}
              >
                Explore
              </Link>
            </li>
            <li>
              <Link
                to="/partner"
                className="hover:underline"
                style={{ color: theme.textMuted }}
              >
                Partner with us
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:underline"
                style={{ color: theme.textMuted }}
              >
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5
            className="text-sm font-semibold mb-2"
            style={{ color: theme.textMain }}
          >
            Contact
          </h5>
          <p
            className="text-xs"
            style={{ color: theme.textMuted }}
          >
            support@passiify.com
          </p>
          <p
            className="text-xs mt-3"
            style={{ color: theme.textMuted }}
          >
            © {new Date().getFullYear()} Passiify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   PAGE ASSEMBLY (DEFAULT EXPORT)
   ========================================================= */

export default function Home() {
  const [events, setEvents] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingGyms, setLoadingGyms] = useState(true);
  const [topEvent, setTopEvent] = useState(null);
  const [startingDayPrice, setStartingDayPrice] = useState(null);
  const [mode, setMode] = useState("dark"); // "light" | "dark"

  // Initial theme: respect localStorage, then device preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem("passiify-theme");
      if (stored === "light" || stored === "dark") {
        setMode(stored);
        return;
      }
      if (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches
      ) {
        setMode("light");
      } else {
        setMode("dark");
      }
    } catch {
      setMode("dark");
    }
  }, []);

  // Persist theme choice
  useEffect(() => {
    try {
      localStorage.setItem("passiify-theme", mode);
    } catch {
      // ignore
    }
  }, [mode]);

  const theme = mode === "light" ? LIGHT_THEME : DARK_THEME;

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

        // pick earliest upcoming or first as hero event
        const sorted = [...evArr].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        const now = new Date();
        const upcoming =
          sorted.find((e) => new Date(e.date) >= now) || sorted[0] || null;
        setTopEvent(upcoming);

        // compute starting day-pass price
        const numericPrices = gymArr
          .map((g) => Number(g.price))
          .filter((p) => !Number.isNaN(p) && p > 0);
        if (numericPrices.length > 0) {
          setStartingDayPrice(Math.min(...numericPrices));
        }
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
    // tracking hook if you need analytics later
    console.log("Passiify search", { query: q, type: t });
  };

  const backgroundImage =
    mode === "dark"
      ? `radial-gradient(circle at top, rgba(37,99,235,0.30), transparent 55%),
         radial-gradient(circle at bottom right, rgba(249,115,22,0.20), transparent 60%)`
      : `radial-gradient(circle at top, rgba(37,99,235,0.12), transparent 55%),
         radial-gradient(circle at bottom right, rgba(249,115,22,0.14), transparent 60%)`;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.bg,
        backgroundImage,
        color: theme.textMain,
      }}
    >
      {/* Theme toggle — still respects device, but user can switch */}
      <button
        onClick={() => setMode((prev) => (prev === "dark" ? "light" : "dark"))}
        className="fixed top-4 right-4 z-40 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] backdrop-blur"
        style={{
          borderColor: theme.borderSoft,
          background:
            mode === "dark"
              ? "rgba(15,23,42,0.95)"
              : "rgba(255,255,255,0.95)",
          boxShadow:
            mode === "dark"
              ? "0 12px 40px rgba(0,0,0,0.8)"
              : "0 10px 30px rgba(15,23,42,0.2)",
          color: theme.textMain,
        }}
      >
        {mode === "dark" ? (
          <>
            <Sun size={14} className="text-amber-300" />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon size={14} className="text-slate-700" />
            <span>Dark</span>
          </>
        )}
      </button>

      {/* HERO */}
      <Hero
        theme={theme}
        mode={mode}
        topEvent={topEvent}
        onSearch={handleSearch}
        startingDayPrice={startingDayPrice}
        eventsCount={events.length}
        gymsCount={gyms.length}
      />

      {/* MAIN CONTENT */}
      <main className="space-y-4">
        <StatsStrip
          theme={theme}
          mode={mode}
          eventsCount={events.length}
          gymsCount={gyms.length}
        />
        <TravelCityStrip theme={theme} mode={mode} />
        <UpcomingEventsSection
          theme={theme}
          mode={mode}
          events={events}
          loading={loadingEvents}
        />
        <DayPassGymsSection
          theme={theme}
          mode={mode}
          gyms={gyms}
          loading={loadingGyms}
        />
        <CategoryStrip theme={theme} mode={mode} />
        <WhyPassiifySection theme={theme} mode={mode} />
        <HowItWorksSection theme={theme} mode={mode} />
        <LocalDiscoveryInline theme={theme} mode={mode} />
        <CTASection theme={theme} />
      </main>

      {/* FOOTER */}
      <Footer theme={theme} mode={mode} />
    </div>
  );
}
