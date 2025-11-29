// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  CalendarDays,
  MapPin,
  Shield,
  ShieldCheck,
  Award,
  Heart,
  Clock,
  Dumbbell,
  Star,
  ArrowRight,
  Globe2,
  Users,
  Ticket,
  CheckCircle2,
} from "lucide-react";
import API from "../utils/api";

/* =========================================================
   GLOBAL THEME — EXACTLY MATCH NAVBAR PATTERN (PASSIIFY)
   ========================================================= */

const THEME = {
  accentFrom: "#2563EB", // main blue
  accentMid: "#0EA5E9", // sky blue
  accentTo: "#F97316", // orange

  light: {
    bg: "#F4F5FB",
    border: "rgba(148,163,184,0.55)",
    textMain: "#020617",
    // slightly darker so text is more visible on light bg
    textMuted: "#4B5563",
    chipBg: "#F9FAFB",
  },
  dark: {
    bg: "#020617",
    border: "rgba(30,64,175,0.75)",
    textMain: "#E5E7EB",
    textMuted: "#D1D5DB",
    chipBg: "#020617",
  },
};

const buildTheme = (mode) => {
  const base = mode === "light" ? THEME.light : THEME.dark;
  return {
    ...base,
    accentFrom: THEME.accentFrom,
    accentMid: THEME.accentMid,
    accentTo: THEME.accentTo,
    // convenience aliases so old UI logic still works
    accentBlue: THEME.accentFrom,
    accentOrange: THEME.accentTo,
    accentMint: "#22C55E",
    borderSoft: base.border,
    shadowStrong:
      mode === "dark"
        ? "0 32px 120px rgba(0,0,0,0.95)"
        : "0 28px 90px rgba(15,23,42,0.18)",
    shadowSoft:
      mode === "dark"
        ? "0 20px 80px rgba(15,23,42,0.85)"
        : "0 18px 60px rgba(15,23,42,0.12)",
  };
};

/* =========================================================
   PRICE HELPERS — always prefer 1-day pass
   ========================================================= */

function getGymDayPassPrice(gym) {
  if (!gym) return null;

  const rawPasses =
    gym.passes || gym.membershipPlans || gym.plans || gym.memberships || [];

  const numericGymPrice = (() => {
    const n = Number(gym.price);
    return Number.isFinite(n) && n > 0 ? n : null;
  })();

  if (!Array.isArray(rawPasses) || rawPasses.length === 0) {
    return numericGymPrice;
  }

  const passes = rawPasses
    .map((p) => {
      const price = Number(p.price ?? p.amount ?? p.rate);
      const duration =
        p.duration ??
        p.durationDays ??
        p.days ??
        p.validityDays ??
        p.passDuration;
      const unit = (
        p.unit ||
        p.durationUnit ||
        p.durationType ||
        p.validityUnit ||
        ""
      )
        .toString()
        .toLowerCase();
      const label = (
        (p.name || "") +
        " " +
        (p.label || "") +
        " " +
        (p.type || "") +
        " " +
        (p.title || "")
      )
        .toString()
        .toLowerCase();

      return {
        raw: p,
        price: Number.isFinite(price) && price > 0 ? price : null,
        duration,
        unit,
        label,
      };
    })
    .filter((p) => p.price !== null);

  if (passes.length === 0) {
    return numericGymPrice;
  }

  // 1️⃣ Prefer an exact 1-day pass
  const oneDayPass =
    passes.find(
      (p) =>
        Number(p.duration) === 1 &&
        (p.unit.includes("day") || p.label.includes("1 day"))
    ) ||
    passes.find((p) => p.label.includes("day pass") || p.label.includes("1-day"));

  if (oneDayPass) {
    return oneDayPass.price;
  }

  // 2️⃣ Otherwise choose the cheapest pass
  const cheapest = passes.reduce((min, p) => (p.price < min.price ? p : min));
  return cheapest.price ?? numericGymPrice;
}

function getEventDisplayPrice(event) {
  if (!event) return null;

  const direct = Number(event.price);
  if (Number.isFinite(direct) && direct > 0) return direct;

  const ticketOptions =
    event.ticketOptions || event.tickets || event.pricingOptions || [];
  if (!Array.isArray(ticketOptions) || ticketOptions.length === 0) {
    return null;
  }

  const prices = ticketOptions
    .map((t) => Number(t.price ?? t.amount ?? t.rate))
    .filter((p) => Number.isFinite(p) && p > 0);

  if (prices.length === 0) return null;
  return Math.min(...prices);
}

/* =========================================================
   FALLBACK IMAGES
   ========================================================= */

const fallbackEventImage = () =>
  "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=1400&q=80&auto=format&fit=crop";

const fallbackGymImage = () =>
  "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1400";

/* =========================================================
   HERO SECTION — fully Passiify themed
   ========================================================= */

function Hero({
  theme,
  mode,
  topEvent,
  featuredGym,
  onSearch,
  startingDayPrice,
  eventsCount,
  gymsCount,
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const isDark = mode === "dark";

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
  const heroGymPrice =
    getGymDayPassPrice(featuredGym) ?? startingDayPrice ?? null;

  const heroEventPrice = getEventDisplayPrice(topEvent);

  return (
    <header className="relative w-full pt-4 sm:pt-6">
      {/* Ambient blobs tuned to Passiify accents */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-24 -left-16 w-72 h-72 rounded-full blur-3xl"
          style={{ backgroundColor: `${theme.accentBlue}4D` }}
        />
        <div
          className="absolute -bottom-24 -right-10 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${theme.accentOrange}4D` }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: `${theme.accentMid}33` }}
        />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Shell hero card */}
        <div
          className="relative w-full rounded-[26px] sm:rounded-[32px] border overflow-hidden backdrop-blur-md md:backdrop-blur-2xl transition-all duration-300"
          style={{
            borderColor: theme.borderSoft,
            boxShadow: theme.shadowStrong,
            background:
              mode === "dark"
                ? "radial-gradient(circle at top, rgba(15,23,42,1), rgba(15,23,42,0.96))"
                : "radial-gradient(circle at top, rgba(255,255,255,1), rgba(241,245,249,0.96))",
          }}
        >
          {/* subtle grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* radial glow using Passiify gradient */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at top, rgba(37,99,235,0.18), transparent 55%),
                radial-gradient(circle at bottom, rgba(249,115,22,0.20), transparent 55%)
              `,
            }}
          />

          <div className="relative px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 grid gap-6 lg:gap-10 items-center md:grid-cols-[1.6fr,1.1fr]">
            {/* LEFT — copy + search + trust */}
            <div className="space-y-4 sm:space-y-5">
              {/* micro trust strip */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 rounded-full border backdrop-blur-xl"
                style={{
                  borderColor: theme.borderSoft,
                  background: isDark
                    ? "rgba(15,23,42,0.95)"
                    : "rgba(255,255,255,0.98)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span
                  className="text-[10px] sm:text-[11px] md:text-xs uppercase tracking-[0.22em]"
                  style={{ color: theme.textMuted }}
                >
                  one-day passes · verified hosts · travel-first
                </span>
              </div>

              <h1
                className="text-[1.55rem] xs:text-[1.7rem] sm:text-[2rem] md:text-[2.3rem] lg:text-[2.6rem] font-extrabold leading-tight tracking-tight"
                style={{ color: theme.textMain }}
              >
                One-day{" "}
                <span
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`,
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  gym passes & events
                </span>{" "}
                for how Gen-Z actually trains.
              </h1>

              <p
                className="text-xs sm:text-sm md:text-[15px] max-w-xl"
                style={{ color: theme.textMuted }}
              >
                Tap into MMA gyms, rooftop yoga, dance studios or strength clubs
                in any city. Book clean, honest 1-day passes — no sales tours,
                no lock-ins, no cringe.
              </p>

              {/* Search bar */}
              <form
                onSubmit={handleSubmit}
                className="mt-3 sm:mt-4 max-w-xl w-full"
                aria-label="Search fitness experiences"
              >
                <div
                  className="flex flex-col xs:flex-row items-stretch rounded-2xl border backdrop-blur-md md:backdrop-blur-xl"
                  style={{
                    borderColor: isDark
                      ? "rgba(51,65,85,0.9)"
                      : "rgba(148,163,184,0.7)",
                    background: isDark
                      ? "rgba(2,6,23,0.94)"
                      : "rgba(255,255,255,0.98)",
                    boxShadow:
                      mode === "dark"
                        ? "0 16px 45px rgba(15,23,42,0.85)"
                        : "0 12px 32px rgba(15,23,42,0.16)",
                  }}
                >
                  {/* type selector */}
                  <div
                    className="flex items-center px-3 border-b xs:border-b-0 xs:border-r rounded-t-2xl xs:rounded-tr-none xs:rounded-l-2xl"
                    style={{
                      borderColor: isDark
                        ? "rgba(51,65,85,1)"
                        : "rgba(226,232,240,1)",
                      background: isDark
                        ? "rgba(15,23,42,0.98)"
                        : THEME.light.chipBg,
                    }}
                  >
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="bg-transparent text-[11px] sm:text-xs md:text-sm outline-none pr-2 w-full cursor-pointer"
                      style={{ color: theme.textMain }}
                    >
                      <option value="all">All</option>
                      <option value="events">Events</option>
                      <option value="gyms">Gyms & Studios</option>
                    </select>
                  </div>

                  {/* input + button row */}
                  <div className="flex flex-1">
                    {/* input */}
                    <div className="flex-1 flex items-center px-3">
                      <Search
                        size={16}
                        className="hidden sm:block"
                        style={{ color: theme.textMuted }}
                      />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent text-xs md:text-sm px-1.5 sm:px-2 py-2.5 sm:py-3 outline-none placeholder:text-slate-400"
                        style={{ color: theme.textMain }}
                        placeholder="Search MMA, yoga, dance or a city — e.g. Goa"
                      />
                    </div>

                    {/* submit (Passiify gradient) */}
                    <button
                      type="submit"
                      className="px-4 md:px-6 py-2.5 text-[11px] sm:text-sm font-semibold rounded-br-2xl xs:rounded-r-2xl xs:rounded-bl-none flex items-center gap-1.5 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                      style={{
                        backgroundImage: `linear-gradient(120deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`,
                        color: "#020617",
                      }}
                    >
                      <span>Search</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>

                {/* quick chips + price highlight */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] sm:text-xs">
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
                        className="px-3 py-1.5 rounded-full border transition cursor-pointer"
                        style={{
                          borderColor: theme.borderSoft,
                          background: isDark
                            ? THEME.dark.chipBg
                            : THEME.light.chipBg,
                          color: theme.textMain,
                        }}
                      >
                        #{chip.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full border font-medium text-xs"
                      style={{
                        borderColor:
                          mode === "dark"
                            ? `${theme.accentFrom}66`
                            : `${theme.accentFrom}55`,
                        background:
                          mode === "dark"
                            ? "rgba(15,23,42,0.9)"
                            : "rgba(239,246,255,0.96)",
                        color: theme.accentFrom,
                      }}
                    >
                      Day-pass from ₹{dayPassFrom}
                    </span>
                    <span className="text-xs" style={{ color: theme.textMuted }}>
                      across select partner gyms
                    </span>
                  </div>
                </div>
              </form>

              {/* trust badges */}
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-4 text-[11px] sm:text-xs">
                <div className="flex items-center gap-2">
                  <Shield size={16} style={{ color: theme.accentFrom }} />
                  <span style={{ color: theme.textMuted }}>
                    Verified hosts & venues
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-yellow-300" />
                  <span style={{ color: theme.textMuted }}>
                    Secure UPI / card payments
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart size={16} style={{ color: theme.accentTo }} />
                  <span style={{ color: theme.textMuted }}>
                    Built for travellers & Gen-Z
                  </span>
                </div>
              </div>

              {/* compact metrics row */}
              <div className="mt-3 flex flex-wrap gap-4 text-[11px] sm:text-xs">
                <div
                  className="px-3 py-2 rounded-xl border"
                  style={{
                    borderColor: theme.borderSoft,
                    background:
                      mode === "dark"
                        ? "rgba(15,23,42,0.96)"
                        : "rgba(255,255,255,0.96)",
                  }}
                >
                  <span
                    className="text-xs font-medium"
                    style={{ color: theme.textMuted }}
                  >
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
                        ? "rgba(15,23,42,0.96)"
                        : "rgba(255,255,255,0.96)",
                  }}
                >
                  <span
                    className="text-xs font-medium"
                    style={{ color: theme.textMuted }}
                  >
                    Events listed right now
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

            {/* RIGHT — dual highlight card (event + gym) */}
            <div className="relative w-full">
              {/* floating halos */}
              <div
                className="pointer-events-none absolute -top-10 right-4 w-28 h-28 sm:w-32 sm:h-32 rounded-full blur-3xl"
                style={{ backgroundColor: `${theme.accentMid}55` }}
              />
              <div
                className="pointer-events-none absolute -bottom-10 -left-4 w-32 h-32 sm:w-40 sm:h-40 rounded-full blur-3xl"
                style={{ backgroundColor: `${theme.accentOrange}55` }}
              />

              <div
                className="relative rounded-3xl border backdrop-blur-md md:backdrop-blur-2xl overflow-hidden w-full"
                style={{
                  borderColor: theme.borderSoft,
                  background: isDark
                    ? "rgba(15,23,42,0.96)"
                    : "rgba(255,255,255,0.98)",
                  boxShadow: theme.shadowStrong,
                }}
              >
                {/* TOP: hero event */}
                <div className="relative h-52 sm:h-60 md:h-64">
                  <img
                    src={
                      topEvent?.image ||
                      topEvent?.bannerImage ||
                      topEvent?.images?.[0] ||
                      fallbackEventImage()
                    }
                    alt={topEvent?.name || "Passiify event"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] uppercase tracking-[0.18em]"
                      style={{
                        borderColor: "rgba(148,163,184,0.6)",
                        background: "rgba(15,23,42,0.9)",
                        color: "#F9FAFB",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Event spotlight
                    </span>
                  </div>

                  <div className="absolute left-3 right-3 bottom-3 sm:left-4 sm:right-4 sm:bottom-4">
                    <div
                      className="rounded-2xl border px-3.5 sm:px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 shadow-[0_18px_50px_rgba(15,23,42,0.9)]"
                      style={{
                        borderColor: "rgba(148,163,184,0.7)",
                        background: "rgba(15,23,42,0.96)",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-semibold line-clamp-1 text-slate-50">
                          {topEvent?.name || "Upcoming fitness experiences"}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-2.5 text-[11px] md:text-xs text-slate-300">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={12} />
                            {topEvent?.date
                              ? new Date(topEvent.date).toLocaleDateString(
                                  "en-IN",
                                  { day: "numeric", month: "short" }
                                )
                              : "New dates every week"}
                          </span>
                          {topEvent && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={12} />
                              {topEvent.location || topEvent.city || "TBA"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <div className="text-[11px] text-slate-300">From</div>
                        <div
                          className="text-lg md:text-2xl font-extrabold"
                          style={{
                            backgroundImage: `linear-gradient(120deg, ${theme.accentOrange}, ${theme.accentBlue})`,
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                          }}
                        >
                          {topEvent && (heroEventPrice ?? null)
                            ? `₹${heroEventPrice}`
                            : "₹399"}
                        </div>
                        <div className="mt-1 flex gap-1.5 sm:gap-2">
                          {topEvent ? (
                            <>
                              <Link
                                to={`/events/${topEvent._id}`}
                                className="px-2.5 sm:px-3 py-1 rounded-full border text-[11px] md:text-xs text-slate-100 hover:bg-slate-800/80 transition cursor-pointer"
                                style={{
                                  borderColor: "rgba(148,163,184,0.7)",
                                }}
                              >
                                Details
                              </Link>
                              <Link
                                to={`/book-event/${topEvent._id}`}
                                className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold shadow-md hover:shadow-lg hover:translate-y-[-1px] transition cursor-pointer"
                                style={{
                                  backgroundImage: `linear-gradient(120deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`,
                                  color: "#020617",
                                }}
                              >
                                Book now
                              </Link>
                            </>
                          ) : (
                            <Link
                              to="/events"
                              className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold shadow-md hover:shadow-lg hover:translate-y-[-1px] transition cursor-pointer"
                              style={{
                                backgroundImage: `linear-gradient(120deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`,
                                color: "#020617",
                              }}
                            >
                              Browse events
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider line */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/80 to-transparent" />

                {/* BOTTOM: hero gym */}
                <div className="p-4 md:p-5 flex flex-col sm:flex-row gap-4 items-center">
                  <div
                    className="w-full sm:w-40 h-28 sm:h-32 rounded-2xl overflow-hidden border"
                    style={{
                      borderColor: theme.borderSoft,
                      background: isDark
                        ? "rgba(15,23,42,0.7)"
                        : "rgba(15,23,42,0.1)",
                    }}
                  >
                    <img
                      src={
                        featuredGym?.images?.[0] ||
                        featuredGym?.coverImage ||
                        featuredGym?.image ||
                        fallbackGymImage()
                      }
                      alt={featuredGym?.name || "Featured gym"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="text-sm font-semibold line-clamp-1"
                        style={{ color: theme.textMain }}
                      >
                        {featuredGym?.name || "Premium day-pass gyms"}
                      </h3>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                        style={{
                          background: isDark
                            ? "rgba(37,99,235,0.2)"
                            : "rgba(37,99,235,0.08)",
                          color: theme.accentBlue,
                        }}
                      >
                        <Dumbbell size={11} />
                        Day-pass
                      </span>
                    </div>
                    <p
                      className="text-xs line-clamp-2"
                      style={{ color: theme.textMuted }}
                    >
                      {featuredGym?.description ||
                        "Drop in once, no awkward membership pitches at the desk. Clean, transparent pricing every time."}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-3">
                        {featuredGym && (
                          <span
                            className="inline-flex items-center gap-1"
                            style={{ color: theme.textMuted }}
                          >
                            <MapPin size={12} />
                            {featuredGym.city || "City TBA"}
                          </span>
                        )}
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ color: theme.textMuted }}
                        >
                          <Star
                            size={12}
                            className="text-yellow-300 fill-yellow-300"
                          />
                          {featuredGym?.rating ?? "4.7"} rating
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <span
                            className="block text-[11px]"
                            style={{ color: theme.textMuted }}
                          >
                            From
                          </span>
                          <span
                            className="text-sm font-bold"
                            style={{ color: theme.textMain }}
                          >
                            ₹{heroGymPrice ?? "—"}
                            <span
                              className="text-[11px] font-normal ml-1"
                              style={{ color: theme.textMuted }}
                            >
                              / day-pass
                            </span>
                          </span>
                        </div>
                        <Link
                          to={
                            featuredGym?._id
                              ? `/booking/${featuredGym._id}`
                              : "/explore"
                          }
                          className="px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-md hover:shadow-lg hover:translate-y-[-1px] transition cursor-pointer"
                          style={{
                            backgroundImage: `linear-gradient(120deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`,
                            color: "#020617",
                          }}
                        >
                          Book pass
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* tiny bottom tags under card */}
              <div className="hidden sm:flex mt-3 flex-wrap gap-3 text-[11px]">
                <div
                  className="px-3 py-1.5 rounded-full border backdrop-blur flex items-center gap-1.5"
                  style={{
                    borderColor: theme.borderSoft,
                    background: isDark
                      ? "rgba(15,23,42,0.95)"
                      : "rgba(255,255,255,0.96)",
                    color: theme.textMuted,
                  }}
                >
                  <Users size={13} />
                  <span>Solo, group & community sessions</span>
                </div>
                <div
                  className="px-3 py-1.5 rounded-full border backdrop-blur flex items-center gap-1.5"
                  style={{
                    borderColor: theme.borderSoft,
                    background: isDark
                      ? "rgba(15,23,42,0.95)"
                      : "rgba(255,255,255,0.96)",
                    color: theme.textMuted,
                  }}
                >
                  <Globe2 size={13} />
                  <span>Perfect for travellers & expats</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   STATS STRIP + TRUSTED BY
   ========================================================= */

function StatsStrip({
  theme,
  mode,
  gymsCount,
  globalRating,
  globalRatingCount,
}) {
  const stats = [
    { label: "Day-pass sessions booked", value: "5k+" },
    {
      label: "Gyms & studios onboarded",
      value: gymsCount ? `${gymsCount}` : "150+",
    },
  ];

  if (globalRating) {
    stats.push({
      label: "Community rating",
      value: `${globalRating.toFixed(1)}/5`,
      extra: globalRatingCount ? `${globalRatingCount}+ reviews` : "",
    });
  } else {
    stats.push({
      label: "Cities explored by movers",
      value: "40+",
    });
  }

  return (
    <section className="w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 -mt-6 space-y-4">
        <div
          className="rounded-2xl border px-5 py-4 grid sm:grid-cols-3 gap-4 backdrop-blur-md md:backdrop-blur-xl transition-all duration-300"
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
              <span className="text-xs" style={{ color: theme.textMuted }}>
                {item.label}
              </span>
              {item.extra && (
                <span className="text-xs" style={{ color: theme.textMuted }}>
                  {item.extra}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* trusted by row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p
            className="text-[11px] uppercase tracking-[0.25em] font-semibold"
            style={{ color: theme.textMuted }}
          >
            Trusted by people training on the move
          </p>
          <div className="flex flex-wrap gap-4 text-xs">
            {[
              "Remote founders",
              "Digital nomads",
              "Exchange students",
              "Weekend travellers",
            ].map((label) => (
              <span
                key={label}
                className="px-3 py-1.5 rounded-full border"
                style={{
                  borderColor: theme.borderSoft,
                  color: theme.textMuted,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FOR YOU STRIP — pulls from /event-bookings/me
   ========================================================= */

function ForYouStrip({ theme, mode, bookings, loading, events }) {
  if (loading) return null;

  const now = new Date();
  const upcomingRaw = (bookings || []).filter((b) => {
    if (!b) return false;
    if (b.status && ["cancelled", "expired"].includes(b.status)) return false;

    const eventObj = b.event && typeof b.event === "object" ? b.event : null;
    const eventDate = b.eventDate || (eventObj && eventObj.date) || null;
    if (!eventDate) return false;
    const d = new Date(eventDate);
    if (Number.isNaN(d.getTime())) return false;
    return d >= now;
  });

  if (upcomingRaw.length === 0) return null;

  const eventsById = new Map(
    (events || []).map((ev) => [ev._id?.toString(), ev])
  );

  const upcoming = upcomingRaw
    .slice()
    .sort((a, b) => {
      const dateA = new Date(
        a.eventDate ||
          (a.event && typeof a.event === "object" ? a.event.date : null) ||
          0
      );
      const dateB = new Date(
        b.eventDate ||
          (b.event && typeof b.event === "object" ? b.event.date : null) ||
          0
      );
      return dateA - dateB;
    })
    .slice(0, 3);

  return (
    <section className="w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6">
        <div
          className="rounded-2xl border px-4 py-4 md:px-5 md:py-5 backdrop-blur-md md:backdrop-blur-xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between transition-all duration-300"
          style={{
            borderColor: theme.borderSoft,
            background:
              mode === "dark"
                ? "rgba(15,23,42,0.96)"
                : "rgba(255,255,255,0.98)",
            boxShadow: theme.shadowSoft,
          }}
        >
          <div className="flex items-start gap-2 md:gap-3">
            <div className="mt-0.5">
              <Ticket size={18} style={{ color: theme.accentBlue }} />
            </div>
            <div>
              <p
                className="text-[11px] uppercase tracking-[0.25em] font-semibold mb-1"
                style={{ color: theme.textMuted }}
              >
                For you
              </p>
              <h3
                className="text-sm md:text-base font-semibold"
                style={{ color: theme.textMain }}
              >
                Your upcoming tickets
              </h3>
              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                These are the next events you&apos;re booked into. Save them to
                your calendar and just show your Passiify ticket at the gate.
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 md:gap-1">
            {upcoming.map((b) => {
              const eventObj =
                b.event && typeof b.event === "object"
                  ? b.event
                  : eventsById.get(b.event?.toString?.() || b.event) || null;

              const title = eventObj?.name || "Upcoming event";
              const location =
                eventObj?.location || eventObj?.city || "Location TBA";
              const rawDate =
                b.eventDate || eventObj?.date || b.bookingDate || b.createdAt;
              let dateLabel = "TBA";
              if (rawDate) {
                const d = new Date(rawDate);
                if (!Number.isNaN(d.getTime())) {
                  dateLabel = d.toLocaleString();
                }
              }

              return (
                <div
                  key={b._id || b.id || b.bookingCode}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
                  style={{
                    background:
                      mode === "dark"
                        ? "rgba(15,23,42,0.85)"
                        : "rgba(248,250,252,0.98)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: theme.textMain }}
                    >
                      {title}
                    </p>
                    <p
                      className="text-[11px] truncate mt-0.5"
                      style={{ color: theme.textMuted }}
                    >
                      {dateLabel} · {location}
                    </p>
                    {b.bookingCode && (
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: theme.textMuted }}
                      >
                        Code: {b.bookingCode}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="inline-flex items-center gap-1 text-[11px]"
                      style={{ color: theme.accentMint }}
                    >
                      <CheckCircle2 size={12} />
                      {b.tickets || 1} ticket
                      {b.tickets > 1 ? "s" : ""}
                    </span>
                    {eventObj?._id && (
                      <Link
                        to={`/events/${eventObj._id}`}
                        className="text-[11px] font-semibold hover:underline cursor-pointer"
                        style={{ color: theme.accentBlue }}
                      >
                        View event
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="flex justify-end mt-1">
              <Link
                to="/my-bookings"
                className="text-[11px] font-semibold hover:underline cursor-pointer"
                style={{ color: theme.textMuted }}
              >
                View all bookings →
              </Link>
            </div>
          </div>
        </div>
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
    <section className="w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2
            className="text-xl font-semibold"
            style={{ color: theme.textMain }}
          >
            Landing in a new city soon?
          </h2>
          <p className="text-sm max-w-md" style={{ color: theme.textMuted }}>
            Line up a gym or event before you arrive. No more &quot;I&apos;ll
            start next week&quot; energy.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cities.map((c) => (
            <Link
              key={c.name}
              to={`/explore?query=${encodeURIComponent(c.name)}`}
              className="rounded-2xl border transition-all p-4 flex flex-col justify-between backdrop-blur-md md:backdrop-blur-xl cursor-pointer"
              style={{
                borderColor: theme.borderSoft,
                background:
                  mode === "dark"
                    ? "rgba(15,23,42,0.96)"
                    : "rgba(255,255,255,0.98)",
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
                <div className="mt-2 text-xs" style={{ color: theme.textMuted }}>
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
    <section className="w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-2xl font-semibold"
              style={{ color: theme.textMain }}
            >
              Upcoming events & experiences
            </h2>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
              Runs, bootcamps, retreats and fight nights — all bookable in a few
              taps.
            </p>
          </div>
          <Link
            to="/events"
            className="text-xs font-semibold hover:underline cursor-pointer"
            style={{ color: theme.textMuted }}
          >
            See all events →
          </Link>
        </div>

        {loading ? (
          <div className="text-sm" style={{ color: theme.textMuted }}>
            Loading events…
          </div>
        ) : visible.length === 0 ? (
          <div className="text-sm" style={{ color: theme.textMuted }}>
            No events live right now — check back soon or explore gyms instead.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((ev) => {
              const price = getEventDisplayPrice(ev) ?? ev.price ?? null;
              const date = ev.date ? new Date(ev.date) : null;
              const dateLabel =
                date && !Number.isNaN(date.getTime())
                  ? date.toLocaleDateString()
                  : "Date TBA";

              return (
                <article key={ev._id} className="relative group">
                  {/* Ambient halo behind event card */}
                  <div
                    className="pointer-events-none absolute -inset-1 rounded-3xl opacity-40 blur-2xl group-hover:opacity-60 transition"
                    style={{
                      background: `radial-gradient(circle at top, ${theme.accentFrom}33, transparent 55%), radial-gradient(circle at bottom, ${theme.accentTo}26, transparent 60%)`,
                    }}
                  />
                  <div
                    className="relative rounded-2xl overflow-hidden border transition-all backdrop-blur-md md:backdrop-blur-xl"
                    style={{
                      borderColor: theme.borderSoft,
                      background:
                        mode === "dark"
                          ? "rgba(15,23,42,0.96)"
                          : "rgba(255,255,255,0.98)",
                      boxShadow: theme.shadowSoft,
                    }}
                  >
                    <div className="relative h-44 sm:h-48">
                      <img
                        src={
                          ev.image ||
                          ev.bannerImage ||
                          ev.images?.[0] ||
                          fallbackEventImage()
                        }
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
                            background: "rgba(15,23,42,0.95)",
                            color: "#F9FAFB",
                          }}
                        >
                          Event
                        </span>
                      </div>
                      {typeof ev.rating === "number" && (
                        <div className="absolute top-3 right-3">
                          <span
                            className="px-2 py-1 rounded-full text-[11px] inline-flex items-center gap-1"
                            style={{
                              background: "rgba(15,23,42,0.9)",
                              color: "#EAB308",
                            }}
                          >
                            <Star size={12} />
                            {ev.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col gap-3">
                      <div>
                        <h3
                          className="text-sm md:text-base font-semibold line-clamp-2"
                          style={{ color: theme.textMain }}
                        >
                          {ev.name}
                        </h3>
                        <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                          {ev.location || ev.city || "Location TBA"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ color: theme.textMuted }}
                        >
                          <CalendarDays size={14} />
                          {dateLabel}
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
                            {price ? `₹${price}` : "₹—"}
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
                            className="px-3 py-1.5 rounded-full border text-[11px] cursor-pointer"
                            style={{
                              borderColor: theme.borderSoft,
                              color: theme.textMain,
                            }}
                          >
                            Details
                          </Link>
                          <Link
                            to={`/book-event/${ev._id}`}
                            className="px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-md hover:shadow-lg hover:translate-y-[-1px] transition cursor-pointer"
                            style={{
                              backgroundImage: `linear-gradient(120deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`,
                              color: "#020617",
                            }}
                          >
                            Book
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
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
    <section className="w-full py-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-2xl font-semibold"
              style={{ color: theme.textMain }}
            >
              Day-pass gyms & studios
            </h2>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
              Tap in today, leave tomorrow. No long forms, no binding contracts.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold hover:underline cursor-pointer"
            style={{ color: theme.textMuted }}
          >
            Browse all gyms →
          </Link>
        </div>

        {loading ? (
          <div className="text-sm" style={{ color: theme.textMuted }}>
            Loading gyms…
          </div>
        ) : visible.length === 0 ? (
          <div className="text-sm" style={{ color: theme.textMuted }}>
            No partner gyms live yet — we&apos;re onboarding hosts in your
            region.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Featured gym row */}
            {featured && (
              <article className="relative group">
                {/* Ambient halo behind featured gym card */}
                <div
                  className="pointer-events-none absolute -inset-1 rounded-[32px] opacity-40 blur-2xl group-hover:opacity-60 transition"
                  style={{
                    background: `radial-gradient(circle at top left, ${theme.accentFrom}33, transparent 55%), radial-gradient(circle at bottom right, ${theme.accentTo}26, transparent 60%)`,
                  }}
                />
                <div
                  className="relative rounded-3xl overflow-hidden border flex flex-col md:flex-row backdrop-blur-md md:backdrop-blur-xl"
                  style={{
                    borderColor: theme.borderSoft,
                    background:
                      mode === "dark"
                        ? "rgba(15,23,42,0.98)"
                        : "rgba(255,255,255,0.98)",
                    boxShadow: theme.shadowStrong,
                  }}
                >
                  <div className="relative md:w-1/2 h-52 md:h-64">
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
                            ? "linear-gradient(to top right, rgba(15,23,42,1), rgba(15,23,42,0.3))"
                            : "linear-gradient(to top right, rgba(15,23,42,0.9), rgba(15,23,42,0.25))",
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className="px-2 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em]"
                        style={{
                          borderColor: "rgba(255,255,255,0.25)",
                          background: "rgba(15,23,42,0.95)",
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
                      <p className="text-xs" style={{ color: theme.textMuted }}>
                        {featured.city || "City TBA"}
                      </p>
                      <p
                        className="mt-2 text-xs line-clamp-2"
                        style={{ color: theme.textMuted }}
                      >
                        {featured.description ||
                          "A clean, well-equipped space with trainers who get that you&apos;re just passing through — but still serious about your training."}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ color: theme.textMuted }}
                        >
                          <Star size={13} className="text-yellow-300" />
                          {featured.rating ?? "4.7"} rating
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
                          ₹{getGymDayPassPrice(featured) ?? "—"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/gyms/${featured._id}`}
                          className="px-3 py-1.5 rounded-full border text-[11px] cursor-pointer"
                          style={{
                            borderColor: theme.borderSoft,
                            color: theme.textMain,
                          }}
                        >
                          View
                        </Link>
                        <Link
                          to={`/booking/${featured._id}`}
                          className="px-4 py-1.5 rounded-full text-[11px] font-semibold shadow-md hover:shadow-lg hover:translate-y-[-1px] transition cursor-pointer"
                          style={{
                            backgroundImage: `linear-gradient(120deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`,
                            color: "#020617",
                          }}
                        >
                          Book day-pass
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Other gyms grid */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {rest.map((g) => {
                  const price = getGymDayPassPrice(g);
                  return (
                    <article key={g._id} className="relative group">
                      {/* Ambient halo behind gym card */}
                      <div
                        className="pointer-events-none absolute -inset-1 rounded-3xl opacity-40 blur-2xl group-hover:opacity-60 transition"
                        style={{
                          background: `radial-gradient(circle at top, ${theme.accentFrom}33, transparent 55%), radial-gradient(circle at bottom, ${theme.accentTo}26, transparent 60%)`,
                        }}
                      />
                      <div
                        className="relative rounded-2xl overflow-hidden border transition-all backdrop-blur-md md:backdrop-blur-xl"
                        style={{
                          borderColor: theme.borderSoft,
                          background:
                            mode === "dark"
                              ? "rgba(15,23,42,0.96)"
                              : "rgba(255,255,255,0.98)",
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
                                background: "rgba(15,23,42,0.95)",
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
                                ₹{price ?? "—"}
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
                                className="px-3 py-1.5 rounded-full border text-[11px] cursor-pointer"
                                style={{
                                  borderColor: theme.borderSoft,
                                  color: theme.textMain,
                                }}
                              >
                                View
                              </Link>
                              <Link
                                to={`/booking/${g._id}`}
                                className="px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-md hover:shadow-lg hover:translate-y-[-1px] transition cursor-pointer"
                                style={{
                                  backgroundImage: `linear-gradient(120deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`,
                                  color: "#020617",
                                }}
                              >
                                Book
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   CATEGORY STRIP — Explore by vibe
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
    <section className="w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-2">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-sm uppercase tracking-[0.25em] font-semibold"
            style={{ color: theme.textMuted }}
          >
            Explore by vibe
          </h2>
          <Link
            to="/explore"
            className="text-xs font-semibold hover:underline cursor-pointer"
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
              className="group relative overflow-hidden rounded-2xl border transition-all p-4 flex flex-col items-start backdrop-blur-md md:backdrop-blur-xl cursor-pointer"
              style={{
                borderColor: theme.borderSoft,
                background:
                  mode === "dark"
                    ? "rgba(15,23,42,0.96)"
                    : "rgba(255,255,255,0.98)",
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
                className="mt-2 text-[11px] group-hover:underline"
                style={{ color: theme.textMuted }}
              >
                Tap to explore
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   WHY PASSIIFY & GEN-Z ANGLE
   ========================================================= */

function WhyPassiifySection({ theme, mode }) {
  const items = [
    {
      title: "No contracts. Ever.",
      desc: "Commit to the workout, not a 12-month plan. Every pass is clean, short and flexible.",
    },
    {
      title: "Travel-first design.",
      desc: "Swap between fight clubs, yoga rooftops and strength clubs in any city with zero friction.",
    },
    {
      title: "Verified hosts only.",
      desc: "We vet every partner so the vibes, safety and quality feel worth your time and money.",
    },
  ];

  return (
    <section className="w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="rounded-3xl border p-6 md:p-8 backdrop-blur-md md:backdrop-blur-xl transition-all duration-300"
          style={{
            borderColor: theme.borderSoft,
            background:
              mode === "dark"
                ? "radial-gradient(circle at top left, rgba(37,99,235,0.22), transparent 55%), rgba(15,23,42,0.98)"
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
                booking. No awkward sales desk chats. No guilt when you travel.
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
                        ? "rgba(15,23,42,0.98)"
                        : "rgba(255,255,255,0.98)",
                  }}
                >
                  <div
                    className="text-[11px] uppercase tracking-[0.25em] mb-2"
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
                  <p className="mt-2 text-xs" style={{ color: theme.textMuted }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PARTNER STRIP (for gyms / organisers)
   ========================================================= */

function PartnerStrip({ theme, mode }) {
  return (
    <section className="w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="rounded-3xl border px-5 py-6 md:px-7 md:py-8 flex flex-col md:flex-row gap-5 md:items-center md:justify-between backdrop-blur-md md:backdrop-blur-xl transition-all duration-300"
          style={{
            borderColor: theme.borderSoft,
            background:
              mode === "dark"
                ? "rgba(15,23,42,0.98)"
                : "rgba(255,255,255,0.98)",
            boxShadow: theme.shadowSoft,
          }}
        >
          <div className="max-w-md">
            <p
              className="text-[11px] uppercase tracking-[0.25em] font-semibold mb-2"
              style={{ color: theme.textMuted }}
            >
              For gyms, studios & event organisers
            </p>
            <h3
              className="text-xl md:text-2xl font-semibold"
              style={{ color: theme.textMain }}
            >
              Bring high-intent travellers and locals into your space — no sales
              calls needed.
            </h3>
            <p
              className="text-xs md:text-sm mt-2"
              style={{ color: theme.textMuted }}
            >
              List your gym or event on Passiify and get paid for one-day
              passes, drop-ins and curated events. You control capacity, pricing
              and availability.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-[11px] md:text-xs max-w-xs">
            <ul className="space-y-1.5" style={{ color: theme.textMuted }}>
              <li>• Transparent payouts (UPI/card)</li>
              <li>• Simple dashboard for passes, events & revenue</li>
              <li>• Trusted by young travellers & digital nomads</li>
            </ul>
            <div className="mt-3 flex gap-3 flex-wrap">
              <Link
                to="/partner"
                className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                style={{
                  backgroundImage: `linear-gradient(120deg, ${theme.accentBlue}, ${theme.accentOrange})`,
                  color: "#020617",
                }}
              >
                Become a partner
              </Link>
              <Link
                to="/partner?tab=events"
                className="px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer"
                style={{
                  borderColor: theme.borderSoft,
                  color: theme.textMain,
                }}
              >
                Host an event
              </Link>
            </div>
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
      desc: "Choose your city or next trip spot.",
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
    <section className="w-full" id="how-it-works">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
              className="rounded-2xl border p-4 flex flex-col backdrop-blur-md md:backdrop-blur-xl transition-all duration-300"
              style={{
                borderColor: theme.borderSoft,
                background:
                  mode === "dark"
                    ? "rgba(15,23,42,0.96)"
                    : "rgba(255,255,255,0.98)",
              }}
            >
              <div className="text-2xl mb-2">{step.emoji}</div>
              <div
                className="text-sm font-semibold"
                style={{ color: theme.textMain }}
              >
                {step.title}
              </div>
              <div className="mt-2 text-xs" style={{ color: theme.textMuted }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
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
    <section className="w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div
          className="rounded-2xl border px-5 py-6 backdrop-blur-md md:backdrop-blur-xl transition-all duration-300"
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
            <p className="text-xs max-w-xs" style={{ color: theme.textMuted }}>
              Quick filters that work anywhere — perfect for last-minute plans
              after work or while travelling.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => handleClick(c)}
                className="px-3 py-1.5 rounded-full border text-xs transition cursor-pointer"
                style={{
                  borderColor: theme.borderSoft,
                  background:
                    mode === "dark"
                      ? "rgba(15,23,42,0.94)"
                      : "rgba(248,250,252,0.98)",
                  color: theme.textMain,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CTA SECTION — NOW USING PASSIIFY THEME TOKENS
   ========================================================= */

function CTASection({ theme }) {
  return (
    <section
      className="w-full mt-4 py-10 text-center"
      style={{
        backgroundImage: `linear-gradient(90deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`,
        color: "#F9FAFB",
      }}
    >
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2">
        Experience. Connect. Move different.
      </h2>
      <p className="text-xs sm:text-sm md:text-base text-blue-50/90 max-w-xl mx-auto mb-6 px-4">
        Pick one session in the city you&apos;re visiting and build the rest of
        your day around it. Book fight clubs, rooftops and strength clubs in a
        few taps.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-2.5 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition cursor-pointer"
        >
          Explore events
          <ArrowRight size={16} />
        </Link>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 bg-slate-950/20 border border-white/60 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-slate-950/30 transition cursor-pointer"
        >
          Find gyms & studios
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
   FOOTER
   ========================================================= */

function Footer({ theme, mode }) {
  const borderColor =
    mode === "dark" ? "rgba(30,41,59,1)" : "rgba(226,232,240,1)";
  const bgColor =
    mode === "dark" ? "rgba(15,23,42,0.98)" : "rgba(248,250,252,0.98)";

  return (
    <footer
      className="w-full border-t mt-16"
      style={{
        borderColor,
        background: bgColor,
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h4
              className="text-xl font-bold tracking-tight"
              style={{ color: theme.textMain }}
            >
              Passiify
            </h4>
            <p
              className="text-xs mt-3 max-w-xs"
              style={{ color: theme.textMuted }}
            >
              One-day fitness passes and curated events for travellers, expats
              and locals who hate long-term contracts and hidden extras.
            </p>
            <p
              className="text-[11px] mt-3"
              style={{ color: theme.textMuted }}
            >
              Built for people who treat every city like a playground.
            </p>
          </div>

          {/* Product */}
          <div>
            <h5
              className="text-sm font-semibold mb-2"
              style={{ color: theme.textMain }}
            >
              Product
            </h5>
            <ul className="text-xs space-y-1.5">
              <li>
                <Link
                  to="/explore"
                  className="hover:underline"
                  style={{ color: theme.textMuted }}
                >
                  Explore gyms & studios
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="hover:underline"
                  style={{ color: theme.textMuted }}
                >
                  Fitness events
                </Link>
              </li>
              <li>
                <Link
                  to="/my-dashboard"
                  className="hover:underline"
                  style={{ color: theme.textMuted }}
                >
                  My dashboard
                </Link>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:underline"
                  style={{ color: theme.textMuted }}
                >
                  How it works
                </a>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:underline"
                  style={{ color: theme.textMuted }}
                >
                  About Passiify
                </Link>
              </li>
            </ul>
          </div>

          {/* Hosts & partners */}
          <div>
            <h5
              className="text-sm font-semibold mb-2"
              style={{ color: theme.textMain }}
            >
              For hosts & partners
            </h5>
            <ul className="text-xs space-y-1.5">
              <li>
                <Link
                  to="/partner"
                  className="hover:underline"
                  style={{ color: theme.textMuted }}
                >
                  List your gym / studio
                </Link>
              </li>
              <li>
                <Link
                  to="/partner?tab=events"
                  className="hover:underline"
                  style={{ color: theme.textMuted }}
                >
                  Host an event
                </Link>
              </li>
              <li>
                <Link
                  to="/partner/dashboard"
                  className="hover:underline"
                  style={{ color: theme.textMuted }}
                >
                  Partner dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="hover:underline"
                  style={{ color: theme.textMuted }}
                >
                  Admin panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Support / legal */}
          <div>
            <h5
              className="text-sm font-semibold mb-2"
              style={{ color: theme.textMain }}
            >
              Support & legal
            </h5>
            <p className="text-xs" style={{ color: theme.textMuted }}>
              Drop us a mail any time:
            </p>
            <p
              className="text-xs mt-1 font-medium"
              style={{ color: theme.textMain }}
            >
              support@passiify.com
            </p>

            <div className="mt-4 text-xs space-y-1.5">
              <Link
                to="/terms"
                className="hover:underline block font-medium"
                style={{ color: theme.textMain }}
              >
                Terms & Conditions
              </Link>
              <Link
                to="/privacy"
                className="hover:underline block font-medium"
                style={{ color: theme.textMain }}
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 border-t"
          style={{
            borderColor,
          }}
        >
          <p
            className="text-[11px]"
            style={{ color: theme.textMuted }}
          >
            © {new Date().getFullYear()} Passiify. All rights reserved.
          </p>
          <p
            className="text-[11px]"
            style={{ color: theme.textMuted }}
          >
            Made for travellers, students & wanderers who still need a serious
            workout.
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
  const [mode, setMode] = useState("light"); // follow device

  const [eventBookings, setEventBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Theme: follow device color scheme only
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.matchMedia) {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        setMode(mq.matches ? "dark" : "light");
      } else {
        setMode("light");
      }
    } catch {
      setMode("light");
    }
  }, []);

  // React to system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setMode(e.matches ? "dark" : "light");
    };

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const theme = buildTheme(mode);

  // Fetch events & gyms from backend
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

        // compute starting day-pass price using 1-day/cheapest pass logic
        const dayPassPrices = gymArr
          .map((g) => getGymDayPassPrice(g))
          .filter(
            (p) => typeof p === "number" && !Number.isNaN(p) && p > 0
          );
        if (dayPassPrices.length > 0) {
          setStartingDayPrice(Math.min(...dayPassPrices));
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

  // Fetch personal event bookings
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await API.get("/event-bookings/me");
        if (!mounted) return;

        const data = res.data?.bookings || res.data || [];
        const arr = Array.isArray(data) ? data : [];
        setEventBookings(arr);
      } catch (err) {
        if (!mounted) return;
        setEventBookings([]);
      } finally {
        if (!mounted) return;
        setLoadingBookings(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = (q, t) => {
    console.log("Passiify search", { query: q, type: t });
  };

  const featuredGym = gyms[0] || null;

  // Aggregate global rating from gyms + events
  let ratingSum = 0;
  let ratingN = 0;

  gyms.forEach((g) => {
    const r = typeof g.rating === "number" ? g.rating : null;
    const c = typeof g.ratingCount === "number" ? g.ratingCount : 0;
    if (r && r > 0) {
      const weight = c > 0 ? c : 1;
      ratingSum += r * weight;
      ratingN += weight;
    }
  });

  events.forEach((ev) => {
    const r = typeof ev.rating === "number" ? ev.rating : null;
    const c = typeof ev.ratingCount === "number" ? ev.ratingCount : 0;
    if (r && r > 0) {
      const weight = c > 0 ? c : 1;
      ratingSum += r * weight;
      ratingN += weight;
    }
  });

  const globalAvgRating = ratingN > 0 ? ratingSum / ratingN : null;
  const globalRatingCount = ratingN;

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden pb-16 pt-16 md:pt-20 transition-colors duration-300 bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
      style={{
        color: theme.textMain,
        touchAction: "manipulation", // ensure taps/scrolls work nicely on mobile
      }}
    >
      {/* TOP TRUST STRIP (sits below fixed navbar thanks to pt-16 above) */}
      <div
        className="w-full border-b backdrop-blur-xl transition-all duration-300"
        style={{
          borderColor: theme.borderSoft,
          background:
            mode === "dark"
              ? "rgba(2,6,23,0.9)"
              : "rgba(255,255,255,0.85)",
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-[11px] md:text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span style={{ color: theme.textMuted }}>
              Curated day-pass gyms & fitness experiences across Indian cities.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck
                className="w-4 h-4"
                style={{ color: theme.accentFrom }}
              />
              <span style={{ color: theme.textMuted }}>Verified hosts only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2
                className="w-4 h-4"
                style={{ color: theme.accentTo }}
              />
              <span style={{ color: theme.textMuted }}>
                Transparent pricing · No lock-ins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* HERO */}
      <Hero
        theme={theme}
        mode={mode}
        topEvent={topEvent}
        featuredGym={featuredGym}
        onSearch={handleSearch}
        startingDayPrice={startingDayPrice}
        eventsCount={events.length}
        gymsCount={gyms.length}
      />

      {/* MAIN CONTENT */}
      <main className="w-full space-y-4">
        <StatsStrip
          theme={theme}
          mode={mode}
          gymsCount={gyms.length}
          globalRating={globalAvgRating}
          globalRatingCount={globalRatingCount}
        />
        <ForYouStrip
          theme={theme}
          mode={mode}
          bookings={eventBookings}
          loading={loadingBookings}
          events={events}
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
        <PartnerStrip theme={theme} mode={mode} />
        <HowItWorksSection theme={theme} mode={mode} />
        <LocalDiscoveryInline theme={theme} mode={mode} />
        <CTASection theme={theme} />
      </main>

      {/* FOOTER (with visible Terms & Privacy links) */}
      <Footer theme={theme} mode={mode} />
    </div>
  );
}
