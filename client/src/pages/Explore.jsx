// src/pages/Explore.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Loader2,
  Dumbbell,
  SlidersHorizontal,
  CheckCircle2,
  ShieldCheck,
  Globe2,
} from "lucide-react";
import API from "../utils/api";

/* =========================================================
   GLOBAL PASSIIFY THEME — MIRROR Home + BookingPage
   ========================================================= */

const THEME = {
  accentFrom: "#2563EB", // blue-600
  accentMid: "#0EA5E9", // sky-500
  accentTo: "#F97316", // orange-500,

  light: {
    bg: "#F4F5FB",
    border: "rgba(148,163,184,0.45)",
    textMain: "#020617",
    textMuted: "#6B7280",
    chipBg: "#F9FAFB",
    card: "rgba(255,255,255,0.96)",
    cardAlt: "rgba(248,250,252,0.98)",
  },
  dark: {
    bg: "#020617",
    border: "rgba(31,41,55,0.9)",
    textMain: "#E5E7EB",
    textMuted: "#9CA3AF",
    chipBg: "#020617",
    card: "rgba(15,23,42,0.96)",
    cardAlt: "rgba(15,23,42,0.92)",
  },
};

const buildTheme = (mode) => {
  const base = mode === "light" ? THEME.light : THEME.dark;
  return {
    ...base,
    accentFrom: THEME.accentFrom,
    accentMid: THEME.accentMid,
    accentTo: THEME.accentTo,
    accentBlue: THEME.accentFrom,
    accentOrange: THEME.accentTo,
    accentMint: "#22C55E",
    borderSoft: base.border,
    shadowStrong:
      mode === "dark"
        ? "0 40px 140px rgba(0,0,0,0.9)"
        : "0 34px 110px rgba(15,23,42,0.22)",
    shadowSoft:
      mode === "dark"
        ? "0 24px 90px rgba(15,23,42,0.9)"
        : "0 20px 70px rgba(15,23,42,0.12)",
  };
};

/* =========================================================
   QUICK FILTERS / UTILITIES
   ========================================================= */

const quickChips = [
  "MMA",
  "Yoga",
  "CrossFit",
  "Dance studio",
  "Powerlifting",
  "Pilates",
];

const topCityChips = ["Goa", "Bali", "Bangkok", "Mumbai"];

/* ---------- 🔗 Media URL builder (backend + CDN) ---------- */

const buildMediaUrl = (raw) => {
  if (!raw) return null;

  // Already a full URL
  if (typeof raw === "string" && raw.startsWith("http")) return raw;

  // Relative path from backend (e.g. "/uploads/gyms/xyz.jpg")
  try {
    const base = (API?.defaults?.baseURL || "").replace(/\/$/, "");
    const cleanPath = String(raw).replace(/^\//, ""); // remove starting '/'
    if (!base) return `/${cleanPath}`;
    return `${base}/${cleanPath}`;
  } catch {
    return null;
  }
};

const fallbackImages = [
  "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/7031707/pexels-photo-7031707.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/4754142/pexels-photo-4754142.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const getGymImage = (gym) => {
  const raw =
    gym.coverImage ||
    gym.image ||
    (Array.isArray(gym.images) && gym.images[0]) ||
    (Array.isArray(gym.media) && gym.media[0]) ||
    gym.thumbnail;

  const url = buildMediaUrl(raw);
  if (url) return url;

  // fallback (deterministic by id to avoid flicker)
  const key = gym._id || gym.id || Math.random();
  const index =
    Math.abs(
      typeof key === "string"
        ? key.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
        : key
    ) % fallbackImages.length;
  return fallbackImages[index];
};

/* ---------- 🧮 Helper for safe numbers ---------- */

const pickNumber = (...values) => {
  for (let i = 0; i < values.length; i += 1) {
    const raw = values[i];
    if (raw !== undefined && raw !== null && raw !== "") {
      const num = Number(raw);
      if (!Number.isNaN(num)) return num;
    }
  }
  return 0;
};

/* ---------- 🧮 Pricing meta from passes (discount-aware) ---------- */

const getGymPricingMeta = (gym) => {
  const passes = Array.isArray(gym.passes) ? gym.passes : [];

  // pick the cheapest pass by salePrice (or price/basePrice as fallback)
  let primaryPass = null;
  if (passes.length > 0) {
    primaryPass = passes.reduce((best, current) => {
      const currentSale = pickNumber(
        current.salePrice,
        current.price,
        current.basePrice
      );

      if (!best) return current;

      const bestSale = pickNumber(
        best.salePrice,
        best.price,
        best.basePrice
      );

      if (!bestSale && currentSale) return current;
      return currentSale && currentSale < bestSale ? current : best;
    }, null);
  }

  const baseFromPass = primaryPass
    ? pickNumber(
        primaryPass.basePrice,
        primaryPass.price,
        gym.basePrice,
        gym.price
      )
    : 0;

  const basePrice =
    baseFromPass || pickNumber(gym.basePrice, gym.price) || 0;

  let salePrice;
  if (primaryPass) {
    salePrice = pickNumber(
      primaryPass.salePrice,
      primaryPass.price,
      basePrice
    );
  } else {
    salePrice = pickNumber(
      gym.salePrice,
      gym.price,
      basePrice
    );
  }

  if (!salePrice && basePrice) salePrice = basePrice;

  let discountPercent =
    primaryPass && typeof primaryPass.discountPercent === "number"
      ? primaryPass.discountPercent
      : 0;

  let hasDiscount = false;
  let savings = 0;

  if (basePrice && salePrice && salePrice < basePrice) {
    hasDiscount = true;
    savings = basePrice - salePrice;
    if (!discountPercent) {
      discountPercent = Math.round((savings / basePrice) * 100);
    }
  } else {
    discountPercent = 0;
  }

  return {
    basePrice: basePrice || 0,
    salePrice: salePrice || 0,
    hasDiscount,
    discountPercent,
    savings,
    durationDays:
      primaryPass && primaryPass.duration ? primaryPass.duration : 1,
    offerLabel:
      (primaryPass && primaryPass.offerLabel) || gym.offerLabel || "",
  };
};

/* =========================================================
   TOP TRUST STRIP — unified with Home
   ========================================================= */

function TopTrustStrip({ theme, mode }) {
  return (
    <div
      className="w-full border-b backdrop-blur-xl"
      style={{
        borderColor: theme.borderSoft,
        background:
          mode === "dark" ? "rgba(2,6,23,0.9)" : "rgba(255,255,255,0.88)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-[11px] md:text-xs">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span style={{ color: theme.textMuted }}>
            Curated day-pass gyms & studios for travellers, expats & Gen-Z.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span style={{ color: theme.textMuted }}>Verified hosts only</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-orange-400" />
            <span style={{ color: theme.textMuted }}>
              Transparent pricing · No lock-ins
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HERO SECTION — TRAIN ANYTHING ANYWHERE
   ========================================================= */

function ExploreHero({
  theme,
  mode,
  query,
  setQuery,
  cityFilter,
  setCityFilter,
  uniqueCities,
}) {
  const allCityOptions = ["Anywhere", ...uniqueCities];
  const primaryGradient = `linear-gradient(120deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`;

  return (
    <section className="relative overflow-hidden">
      {/* Ambient blobs / background image / grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[420px] h-[420px] rounded-full blur-3xl"
          style={{
            opacity: mode === "dark" ? 0.55 : 0.35,
            background: theme.accentBlue,
          }}
        />
        <div
          className="absolute -bottom-40 -left-36 w-[420px] h-[420px] rounded-full blur-3xl"
          style={{
            opacity: mode === "dark" ? 0.5 : 0.35,
            background: theme.accentOrange,
          }}
        />
        <div
          className="absolute inset-0 mix-blend-soft-light bg-cover bg-center"
          style={{
            opacity: mode === "dark" ? 0.2 : 0.12,
            backgroundImage:
              "url('https://images.pexels.com/photos/4162443/pexels-photo-4162443.jpeg?auto=compress&cs=tinysrgb&w=1600')",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            opacity: mode === "dark" ? 0.14 : 0.1,
            mixBlendMode: "soft-light",
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.26) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.22) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-14 md:pt-24 md:pb-20 lg:pt-28 lg:pb-20">
        {/* Brand pill */}
        <div className="flex justify-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.5)]"
            style={{
              borderColor: theme.borderSoft,
              background:
                mode === "dark"
                  ? "rgba(15,23,42,0.95)"
                  : "rgba(255,255,255,0.98)",
            }}
          >
            <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
            <span
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: theme.textMuted }}
            >
              Train anything · anywhere · on your terms
            </span>
          </div>
        </div>

        {/* Copy */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-[2.7rem] font-black tracking-tight leading-tight">
            <span
              style={{
                backgroundImage: primaryGradient,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter:
                  mode === "dark"
                    ? "drop-shadow(0 0 22px rgba(0,0,0,0.9))"
                    : "drop-shadow(0 0 20px rgba(255,255,255,0.95))",
              }}
            >
              Train anything, anywhere with day-pass access.
            </span>
          </h1>

          <p
            className="mt-3 text-sm md:text-base max-w-2xl mx-auto"
            style={{ color: theme.textMuted }}
          >
            Drop into boxing, lifting, yoga or MMA in any city. One tap, one QR,
            zero contracts — built for travellers, students and founders who
            hate long-term gym deals.
          </p>
        </div>

        {/* Search + city row */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-8 max-w-3xl mx-auto"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* City selector */}
            <div
              className="flex items-center justify-between rounded-2xl border px-3 py-2 text-left sm:w-40 backdrop-blur-xl"
              style={{
                borderColor: theme.borderSoft,
                background: theme.card,
                boxShadow: theme.shadowSoft,
              }}
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} style={{ color: theme.accentOrange }} />
                <div className="flex flex-col">
                  <span
                    className="text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: theme.textMuted }}
                  >
                    City
                  </span>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="bg-transparent text-xs md:text-sm outline-none"
                    style={{ color: theme.textMain }}
                  >
                    {allCityOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Globe2 size={16} style={{ color: theme.textMuted }} />
            </div>

            {/* Search bar */}
            <div
              className="flex-1 flex items-stretch rounded-2xl border backdrop-blur-xl overflow-hidden"
              style={{
                borderColor: theme.borderSoft,
                background: theme.cardAlt,
                boxShadow: theme.shadowStrong,
              }}
            >
              <div className="flex items-center px-3">
                <Search size={18} style={{ color: theme.textMuted }} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search MMA, yoga, gym or neighbourhood"
                className="flex-1 bg-transparent px-1 py-3 text-sm md:text-base outline-none"
                style={{
                  color: theme.textMain,
                  caretColor: theme.accentBlue,
                }}
              />
              <button
                type="button"
                className="px-4 md:px-6 py-2.5 text-xs md:text-sm font-semibold shadow-[0_20px_70px_rgba(15,23,42,0.9)] hover:scale-[1.02] active:scale-[0.99] transition-transform"
                style={{
                  backgroundImage: primaryGradient,
                  color: "#020617",
                }}
              >
                See matches
              </button>
            </div>
          </div>

          {/* quick chips */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {quickChips.map((chip) => (
              <button
                type="button"
                key={chip}
                onClick={() => setQuery(chip)}
                className="px-3 py-1.5 rounded-full border text-[11px] md:text-xs transition hover:-translate-y-[1px]"
                style={{
                  borderColor: theme.borderSoft,
                  background: theme.card,
                  color: theme.textMain,
                }}
              >
                #{chip}
              </button>
            ))}
          </div>

          {/* top cities */}
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-[11px]">
            {topCityChips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCityFilter("Anywhere");
                  setQuery(c);
                }}
                className="px-3 py-1 rounded-full border backdrop-blur-sm"
                style={{
                  borderColor: "rgba(148,163,184,0.4)",
                  background:
                    mode === "dark"
                      ? "rgba(15,23,42,0.9)"
                      : "rgba(255,255,255,0.96)",
                  color: theme.textMuted,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </form>

        {/* trust strip under hero */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-[11px] md:text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} style={{ color: "#22C55E" }} />
            <span style={{ color: theme.textMuted }}>
              Hosts reviewed for vibe, safety & cleanliness
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={16} className="fill-yellow-300 text-yellow-300" />
            <span style={{ color: theme.textMuted }}>
              Transparent 1-day pricing, no hidden fees
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: "#22C55E" }} />
            <span style={{ color: theme.textMuted }}>
              Instant QR passes — just show up & train
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CONTROLS BAR — chips + sort
   ========================================================= */

function ExploreControls({
  theme,
  mode,
  query,
  activeFilter,
  setActiveFilter,
  sortBy,
  setSortBy,
  total,
  loading,
  cityFilter,
}) {
  if (loading) return null;

  const primaryGradient = `linear-gradient(120deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Summary */}
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium">
            <span style={{ color: theme.textMain }}>
              {total}{" "}
              <span style={{ color: theme.textMuted }}>
                spaces ready for a 1-day pass
              </span>
            </span>
          </div>
          <div className="text-[11px]" style={{ color: theme.textMuted }}>
            {query
              ? `Filtered by “${query}”${
                  cityFilter !== "Anywhere" ? ` in ${cityFilter}` : ""
                }. Tune vibe, price or rating for your perfect match.`
              : cityFilter !== "Anywhere"
              ? `Showing gyms & studios in ${cityFilter}. Adjust filters for budget, rating and vibe.`
              : "Showing recommended gyms & studios. Use filters to tune by budget, rating and training style."}
          </div>
        </div>

        {/* Filters + sort */}
        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="flex flex-wrap gap-2 text-[11px] md:text-xs">
            {[
              { key: "all", label: "All" },
              { key: "budget", label: "Budget friendly" },
              { key: "premium", label: "Premium clubs" },
              { key: "highRating", label: "Top rated" },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
                className="px-3 py-1.5 rounded-full border transition hover:-translate-y-[1px]"
                style={{
                  borderColor:
                    activeFilter === f.key ? "transparent" : theme.borderSoft,
                  background:
                    activeFilter === f.key ? primaryGradient : theme.card,
                  color: activeFilter === f.key ? "#020617" : theme.textMain,
                  boxShadow:
                    activeFilter === f.key
                      ? "0 18px 60px rgba(15,23,42,0.8)"
                      : "none",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] md:text-xs">
            <SlidersHorizontal
              className="w-4 h-4"
              style={{ color: theme.textMuted }}
            />
            <span
              className="hidden sm:inline"
              style={{ color: theme.textMuted }}
            >
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full px-3 py-1 text-[11px] md:text-xs outline-none border"
              style={{
                borderColor: theme.borderSoft,
                background:
                  mode === "dark"
                    ? "rgba(15,23,42,0.96)"
                    : "rgba(248,250,252,0.96)",
                color: theme.textMain,
              }}
            >
              <option value="recommended">Recommended</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   GYMS GRID — premium cards
   ========================================================= */

function GymsGrid({ theme, mode, gyms, loading, error }) {
  const primaryGradient = `linear-gradient(120deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`;

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2
            className="w-6 h-6 animate-spin"
            style={{ color: theme.accentOrange }}
          />
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Loading gyms & studios near you…
          </p>
        </div>
      </section>
    );
  }

  if (error && gyms.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p
            className="text-sm text-center"
            style={{ color: theme.accentOrange }}
          >
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (gyms.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold" style={{ color: theme.textMain }}>
          Gyms, studios & fight clubs
        </h2>
        <p className="text-[11px]" style={{ color: theme.textMuted }}>
          Tap a card to see photos, rules and check-in details.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {gyms.map((gym, index) => {
          const pricing = getGymPricingMeta(gym);
          const effectivePrice =
            pricing.salePrice ||
            pricing.basePrice ||
            Number(gym.price) ||
            499;

          const rating = Number(gym.rating) || 4.7;
          const isTrending = index < 3;
          const isBudget = effectivePrice <= 500;
          const isPremium = effectivePrice >= 900;

          return (
            <article
              key={gym._id}
              className="group rounded-2xl overflow-hidden border transition-all backdrop-blur-xl hover:-translate-y-1"
              style={{
                borderColor: theme.borderSoft,
                background:
                  mode === "dark"
                    ? `radial-gradient(circle at top, rgba(37,99,235,0.22), transparent 55%), ${theme.card}`
                    : `radial-gradient(circle at top, rgba(37,99,235,0.06), transparent 55%), ${theme.card}`,
                boxShadow: theme.shadowSoft,
              }}
            >
              {/* IMAGE */}
              <div className="relative h-44">
                <img
                  src={getGymImage(gym)}
                  alt={gym.name}
                  loading="lazy"
                  className="w-full h-full object-cover transform group-hover:scale-[1.04] transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800";
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      mode === "dark"
                        ? "linear-gradient(to top, rgba(15,23,42,0.98), rgba(15,23,42,0.2))"
                        : "linear-gradient(to top, rgba(15,23,42,0.9), rgba(15,23,42,0.18))",
                  }}
                />

                {/* price / offer pill */}
                <div className="absolute top-3 left-3">
                  <div
                    className="inline-flex flex-col gap-0.5 px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
                    style={{
                      backgroundImage: primaryGradient,
                      color: "#020617",
                    }}
                  >
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold">
                        ₹{effectivePrice}
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.18em]">
                        / {pricing.durationDays || 1}-day pass
                      </span>
                    </div>
                    {pricing.hasDiscount && pricing.basePrice > 0 && (
                      <div className="flex items-center gap-1 text-[9px]">
                        <span className="line-through opacity-80">
                          ₹{pricing.basePrice}
                        </span>
                        <span>
                          · Save ₹{pricing.savings} (
                          {pricing.discountPercent}% OFF)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* labels bottom-left */}
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] uppercase tracking-[0.18em]"
                    style={{
                      borderColor: "rgba(255,255,255,0.25)",
                      background: "rgba(15,23,42,0.9)",
                      color: "#F9FAFB",
                    }}
                  >
                    <Dumbbell className="w-3 h-3" />
                    Gym · Studio
                  </span>
                  {isTrending && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        background: "rgba(250,204,21,0.95)",
                        color: "#1F2937",
                      }}
                    >
                      Hot this week
                    </span>
                  )}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4 flex flex-col gap-3 text-left">
                <div>
                  <h3
                    className="text-sm md:text-base font-semibold truncate"
                    style={{ color: theme.textMain }}
                  >
                    {gym.name}
                  </h3>
                  <p
                    className="mt-1 text-[11px] flex items-center gap-1"
                    style={{ color: theme.textMuted }}
                  >
                    <MapPin size={13} />
                    {gym.city || "City TBA"}
                  </p>
                </div>

                {/* tags */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {isBudget && (
                    <span
                      className="px-2 py-0.5 rounded-full border"
                      style={{
                        borderColor: theme.borderSoft,
                        color: theme.textMuted,
                      }}
                    >
                      Budget-friendly
                    </span>
                  )}
                  {isPremium && (
                    <span
                      className="px-2 py-0.5 rounded-full border"
                      style={{
                        borderColor: theme.borderSoft,
                        color: theme.textMuted,
                      }}
                    >
                      Premium club
                    </span>
                  )}
                  <span
                    className="px-2 py-0.5 rounded-full border"
                    style={{
                      borderColor: theme.borderSoft,
                      color: theme.textMuted,
                    }}
                  >
                    {pricing.durationDays || 1}-day access
                  </span>
                </div>

                <p
                  className="text-xs line-clamp-2"
                  style={{ color: theme.textMuted }}
                >
                  {gym.description ||
                    "Modern training space with solid equipment, clean changing rooms and traveller-friendly staff."}
                </p>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-xs">
                      <Star
                        size={14}
                        className="fill-yellow-300 text-yellow-300"
                      />
                      <span style={{ color: theme.textMain }}>
                        {rating.toFixed(1)}
                      </span>
                    </div>
                    <span
                      className="text-[10px]"
                      style={{ color: theme.textMuted }}
                    >
                      Traveller-rated
                    </span>
                    {pricing.hasDiscount && pricing.savings > 0 && (
                      <span
                        className="text-[10px] mt-0.5"
                        style={{ color: theme.textMuted }}
                      >
                        You save ₹{pricing.savings} on this pass today
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Link
                      to={`/gyms/${gym._id}`}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full border transition hover:-translate-y-[1px]"
                      style={{
                        borderColor: theme.borderSoft,
                        color: theme.textMain,
                        background:
                          mode === "dark"
                            ? "rgba(15,23,42,0.96)"
                            : "rgba(248,250,252,0.96)",
                      }}
                    >
                      View details
                    </Link>
                    <Link
                      to={`/booking/${gym._id}`}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-[0_16px_50px_rgba(15,23,42,0.95)] hover:scale-[1.03] active:scale-[0.99] transition-transform"
                      style={{
                        backgroundImage: primaryGradient,
                        color: "#020617",
                      }}
                    >
                      Book pass
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================
   CONVERSION BAND — trust + benefits
   ========================================================= */

function WhyPassiifyBand({ theme, mode }) {
  const primaryGradient = `linear-gradient(90deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div
        className="rounded-3xl border px-5 py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4 backdrop-blur-xl"
        style={{
          borderColor: theme.borderSoft,
          background: theme.card,
          boxShadow: theme.shadowSoft,
        }}
      >
        <div>
          <h2
            className="text-sm md:text-base font-semibold"
            style={{ color: theme.textMain }}
          >
            Why movers, expats & Gen-Z locals trust{" "}
            <span
              style={{
                backgroundImage: primaryGradient,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Passiify
            </span>
            .
          </h2>
          <p
            className="mt-1 text-[11px] md:text-xs max-w-md"
            style={{ color: theme.textMuted }}
          >
            One-day passes keep you free. You keep your training streak, even if
            tomorrow you&apos;re in a new city with a new gym.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] md:text-xs">
          <div className="flex items-start gap-2">
            <CheckCircle2
              className="w-4 h-4 mt-[2px]"
              style={{ color: "#22C55E" }}
            />
            <div>
              <div className="font-semibold" style={{ color: theme.textMain }}>
                Instant QR confirmation
              </div>
              <div style={{ color: theme.textMuted }}>
                Book in seconds, show your pass at the door. No sales tour, no
                signup forms.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck
              className="w-4 h-4 mt-[2px]"
              style={{ color: theme.accentBlue }}
            />
            <div>
              <div className="font-semibold" style={{ color: theme.textMain }}>
                Verified hosts only
              </div>
              <div style={{ color: theme.textMuted }}>
                Every space is reviewed for vibe, safety and cleanliness before
                going live.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Globe2
              className="w-4 h-4 mt-[2px]"
              style={{ color: theme.accentOrange }}
            />
            <div>
              <div className="font-semibold" style={{ color: theme.textMain }}>
                Built for travellers
              </div>
              <div style={{ color: theme.textMuted }}>
                Land in a new city, open Passiify, and find somewhere that feels
                like your home gym.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

const getSystemMode = () => {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export default function Explore() {
  const location = useLocation();

  // 👇 always follow device theme
  const [mode, setMode] = useState(getSystemMode);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorGyms, setErrorGyms] = useState("");

  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("Anywhere");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  /* Theme: react to system changes */
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e) => setMode(e.matches ? "dark" : "light");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  /* Fetch gyms once */
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const res = await API.get("/gyms");
        if (!mounted) return;
        const data = res.data || res;
        const arr = Array.isArray(data) ? data : [];
        setGyms(arr);
        setErrorGyms("");
      } catch (err) {
        console.error("❌ Error fetching gyms:", err);
        if (!mounted) return;
        setGyms([]);
        setErrorGyms("Unable to load gyms. Please try again later.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* Apply URL query (?query=Yoga) */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("query");
    if (searchQuery) {
      setQuery(searchQuery);
    }
  }, [location.search]);

  /* Unique cities (for dropdown) */
  const uniqueCities = useMemo(() => {
    const set = new Set();
    (gyms || []).forEach((g) => {
      if (g.city && typeof g.city === "string") {
        set.add(g.city);
      }
    });
    return Array.from(set);
  }, [gyms]);

  /* Filtering + sorting (discount-aware) */
  const filteredGyms = useMemo(() => {
    let list = Array.isArray(gyms) ? [...gyms] : [];

    const q = query.toLowerCase().trim();
    if (q) {
      list = list.filter((gym) => {
        const name = (gym.name || "").toLowerCase();
        const city = (gym.city || "").toLowerCase();
        const desc = (gym.description || "").toLowerCase();
        return name.includes(q) || city.includes(q) || desc.includes(q);
      });
    }

    if (cityFilter !== "Anywhere") {
      const cf = cityFilter.toLowerCase();
      list = list.filter(
        (gym) => (gym.city || "").toLowerCase() === cf
      );
    }

    // filter by price/rating using discounted price
    list = list.filter((gym) => {
      const meta = getGymPricingMeta(gym);
      const price =
        meta.salePrice || meta.basePrice || Number(gym.price) || 0;
      const rating = Number(gym.rating) || 4.5;

      if (activeFilter === "budget") return price && price <= 500;
      if (activeFilter === "premium") return price && price >= 900;
      if (activeFilter === "highRating") return rating >= 4.6;
      return true;
    });

    // sort using discounted price
    list.sort((a, b) => {
      const metaA = getGymPricingMeta(a);
      const metaB = getGymPricingMeta(b);

      const priceA =
        metaA.salePrice || metaA.basePrice || Number(a.price) || 0;
      const priceB =
        metaB.salePrice || metaB.basePrice || Number(b.price) || 0;

      const ratingA = Number(a.rating) || 4.5;
      const ratingB = Number(b.rating) || 4.5;

      if (sortBy === "priceLow") return priceA - priceB;
      if (sortBy === "priceHigh") return priceB - priceA;
      if (sortBy === "rating") return ratingB - ratingA;

      const scoreA = ratingA * 2 - priceA / 500;
      const scoreB = ratingB * 2 - priceB / 500;
      return scoreB - scoreA;
    });

    return list;
  }, [gyms, query, cityFilter, activeFilter, sortBy]);

  const nothingFound =
    !loading && filteredGyms.length === 0 && !errorGyms;

  const backgroundImage =
    mode === "dark"
      ? `radial-gradient(circle at top, rgba(37,99,235,0.32), transparent 55%),
         radial-gradient(circle at bottom right, rgba(249,115,22,0.23), transparent 60%)`
      : `radial-gradient(circle at top, rgba(14,165,233,0.16), transparent 55%),
         radial-gradient(circle at bottom right, rgba(249,115,22,0.14), transparent 60%)`;

  const surfaceGradient =
    mode === "dark"
      ? "linear-gradient(to bottom, #020617, #020617)"
      : "linear-gradient(to bottom, #E0F2FE, #FFFFFF, #F1F5F9)";

  return (
    <div
      className="min-h-screen w-full transition-colors duration-300"
      style={{
        backgroundColor: theme.bg,
        backgroundImage: `${surfaceGradient}, ${backgroundImage}`,
        color: theme.textMain,
      }}
    >
      {/* Unified trust strip */}
      <TopTrustStrip theme={theme} mode={mode} />

      {/* HERO */}
      <ExploreHero
        theme={theme}
        mode={mode}
        query={query}
        setQuery={setQuery}
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        uniqueCities={uniqueCities}
      />

      {/* CONTROLS */}
      <ExploreControls
        theme={theme}
        mode={mode}
        query={query}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        total={filteredGyms.length}
        loading={loading}
        cityFilter={cityFilter}
      />

      {/* Nothing found state */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        {nothingFound && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p
              className="text-sm text-center"
              style={{ color: theme.textMuted }}
            >
              No gyms or studios match your search yet.
            </p>
            <p
              className="text-xs max-w-sm text-center"
              style={{ color: theme.textMuted }}
            >
              Try a broader term like “gym”, “yoga”, “MMA” or just a city name —
              or reset filters to see everything available.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCityFilter("Anywhere");
                setActiveFilter("all");
                setSortBy("recommended");
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold shadow-[0_18px_60px_rgba(15,23,42,0.8)] hover:scale-[1.02] active:scale-[0.99] transition-transform"
              style={{
                backgroundImage: `linear-gradient(120deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`,
                color: "#020617",
              }}
            >
              Clear filters & show all
            </button>
          </div>
        )}
      </section>

      {/* GYMS GRID */}
      <GymsGrid
        theme={theme}
        mode={mode}
        gyms={filteredGyms}
        loading={loading}
        error={errorGyms}
      />

      {/* CONVERSION BAND */}
      <WhyPassiifyBand theme={theme} mode={mode} />
    </div>
  );
}
