// src/pages/Explore.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Loader2,
  Dumbbell,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react";
import API from "../utils/api";

/* =========================================================
   THEME TOKENS — match "Sunset Nomad" brand
   ========================================================= */
const THEME = {
  bg: "#050308", // deep plum-black
  bgSoft: "#0A0812",
  card: "rgba(15, 10, 24, 0.96)",
  cardAlt: "rgba(12, 8, 20, 0.96)",
  accent1: "#FF4B5C", // coral red
  accent2: "#FF9F68", // warm peach
  textMain: "#FDFCFB",
  textMuted: "#A3A3B5",
  borderSoft: "rgba(245, 213, 189, 0.22)",
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */
export default function Explore() {
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all | budget | premium | highRating
  const [sortBy, setSortBy] = useState("recommended"); // recommended | priceLow | priceHigh | rating
  const location = useLocation();

  /* -----------------------------------------
     Fetch gyms from backend
     ----------------------------------------- */
  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const res = await API.get("/gyms");
        const data = res.data || res;
        const arr = Array.isArray(data) ? data : [];
        setGyms(arr);
        setError("");
      } catch (err) {
        console.error("❌ Error fetching gyms:", err);
        setError("Unable to load gyms. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, []);

  /* -----------------------------------------
     Apply URL query (?query=Yoga)
     ----------------------------------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("query");
    if (searchQuery) {
      setQuery(searchQuery);
    }
  }, [location.search]);

  /* -----------------------------------------
     Derived filtering + sorting
     ----------------------------------------- */
  useEffect(() => {
    let list = Array.isArray(gyms) ? [...gyms] : [];

    // text query filter
    const q = query.toLowerCase().trim();
    if (q) {
      list = list.filter((gym) => {
        const name = gym.name?.toLowerCase() || "";
        const city = gym.city?.toLowerCase() || "";
        const desc = gym.description?.toLowerCase() || "";
        return name.includes(q) || city.includes(q) || desc.includes(q);
      });
    }

    // filter chips
    list = list.filter((gym) => {
      const price = Number(gym.price) || 0;
      const rating = Number(gym.rating) || 4.5;

      if (activeFilter === "budget") {
        return price && price <= 500;
      }
      if (activeFilter === "premium") {
        return price && price >= 800;
      }
      if (activeFilter === "highRating") {
        return rating >= 4.6;
      }
      return true; // "all"
    });

    // sorting
    list.sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      const ratingA = Number(a.rating) || 4.5;
      const ratingB = Number(b.rating) || 4.5;

      if (sortBy === "priceLow") return priceA - priceB;
      if (sortBy === "priceHigh") return priceB - priceA;
      if (sortBy === "rating") return ratingB - ratingA;

      // "recommended": hybrid of rating + price
      const scoreA = ratingA * 2 - priceA / 500;
      const scoreB = ratingB * 2 - priceB / 500;
      return scoreB - scoreA;
    });

    setFilteredGyms(list);
  }, [gyms, query, activeFilter, sortBy]);

  /* -----------------------------------------
     Fallback / Smart dynamic gym image
     ----------------------------------------- */
  const getGymImage = (gym) => {
    if (gym.image && gym.image.startsWith("http")) return gym.image;
    if (gym.images && gym.images.length > 0 && gym.images[0].startsWith("http"))
      return gym.images[0];

    const pexelsImages = [
      "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/7031707/pexels-photo-7031707.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/4754142/pexels-photo-4754142.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=800",
    ];
    const randomIndex = Math.floor(Math.random() * pexelsImages.length);
    return pexelsImages[randomIndex];
  };

  const quickChips = [
    "MMA",
    "Yoga",
    "CrossFit",
    "Dance",
    "Powerlifting",
    "Pilates",
  ];

  /* =========================================================
     RENDER
     ========================================================= */
  return (
    <div
      className="min-h-screen text-gray-100"
      style={{
        backgroundColor: THEME.bg,
        backgroundImage:
          "radial-gradient(circle at top, rgba(248, 216, 181, 0.16), transparent 55%)",
      }}
    >
      {/* ======================================
         SEARCH HERO
         ====================================== */}
      <section className="relative overflow-hidden">
        {/* warm overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-40 -right-36 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
            style={{ background: THEME.accent1 }}
          />
          <div
            className="absolute -bottom-40 -left-36 w-[420px] h-[420px] rounded-full blur-3xl opacity-35"
            style={{ background: THEME.accent2 }}
          />
        </div>

        {/* subtle background image tint */}
        <div className="absolute inset-0 opacity-20 mix-blend-soft-light bg-[url('https://images.pexels.com/photos/4162443/pexels-photo-4162443.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center" />

        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-16 md:pt-32 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/30 border border-white/15 mb-4">
            <Dumbbell className="w-3.5 h-3.5 text-orange-200" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-gray-100">
              Day-pass gyms · studios · fight clubs
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-black tracking-tight text-white">
            Explore{" "}
            <span
              style={{
                backgroundImage: `linear-gradient(90deg, ${THEME.accent1}, ${THEME.accent2})`,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              gyms & studios
            </span>{" "}
            and book a pass tonight.
          </h1>

          <p className="mt-3 text-sm md:text-base text-gray-200 max-w-2xl mx-auto">
            Find MMA clubs, strength gyms, yoga rooftops and boutique studios
            that actually welcome travellers. Instant confirmation, no contracts.
          </p>

          {/* search box */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 max-w-2xl mx-auto"
          >
            <div
              className="flex items-stretch rounded-2xl border backdrop-blur shadow-[0_22px_70px_rgba(0,0,0,0.9)] overflow-hidden"
              style={{
                borderColor: THEME.borderSoft,
                background:
                  "radial-gradient(circle at 0 0, rgba(248,250,252,0.08), transparent 60%), rgba(10,10,18,0.96)",
              }}
            >
              <div className="hidden sm:flex items-center px-4 border-r border-white/10 text-gray-300 text-xs md:text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                Anywhere
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyUp={() => {}}
                placeholder="Search gyms, studios or city (e.g. Goa, MMA, Delhi)"
                className="flex-1 bg-transparent px-4 py-3 text-sm md:text-base text-gray-100 placeholder:text-gray-500 focus:outline-none"
                onInput={(e) => setQuery(e.target.value)}
                onBlur={() => {}} // no-op, prevents warnings if you modify later
              />
              <button
                type="button"
                onClick={() => setQuery((q) => q.trim())}
                className="flex items-center gap-2 px-5 md:px-7 py-3 text-sm md:text-base font-semibold text-gray-900"
                style={{
                  backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
                }}
              >
                <Search size={18} />
                <span>Search</span>
              </button>
            </div>

            {/* quick chips */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {quickChips.map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => setQuery(chip)}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] md:text-xs text-gray-100 hover:bg-white/10 transition"
                >
                  #{chip}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* ======================================
         CONTROLS + RESULT HEADER
         ====================================== */}
      <section className="max-w-7xl mx-auto px-6 pb-4">
        {!loading && !error && gyms.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* result summary */}
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium text-gray-50">
                {filteredGyms.length}{" "}
                <span className="text-gray-300">
                  place{filteredGyms.length === 1 ? "" : "s"} ready for a
                  day-pass
                </span>
              </div>
              <div className="text-[11px] text-gray-400">
                {query
                  ? `Results filtered by “${query}” — tweak filters if you want more options.`
                  : "Showing recommended gyms & studios. Use filters to adjust vibe and budget."}
              </div>
            </div>

            {/* filters + sort */}
            <div className="flex flex-col items-start md:items-end gap-2">
              {/* filter chips */}
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
                    className={`px-3 py-1.5 rounded-full border text-[11px] md:text-xs transition ${
                      activeFilter === f.key
                        ? "bg-white text-gray-900 border-transparent"
                        : "bg-white/5 text-gray-100 border-white/15 hover:bg-white/10"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* sort select */}
              <div className="flex items-center gap-2 text-[11px] md:text-xs text-gray-300">
                <SlidersHorizontal className="w-4 h-4 text-orange-200" />
                <span className="hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-black/40 border border-white/20 rounded-full px-3 py-1 text-[11px] md:text-xs text-gray-100 focus:outline-none"
                >
                  <option value="recommended">Recommended</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="rating">Rating: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ======================================
         RESULTS SECTION
         ====================================== */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-orange-300" />
            <p className="text-sm text-gray-300">Loading gyms near you…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : filteredGyms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-sm text-gray-300">
              No gyms match your search yet.
            </p>
            <p className="text-xs text-gray-500 max-w-sm text-center">
              Try a broader search term like “gym”, “yoga”, “MMA” or just a city
              name — or reset filters to see everything available.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveFilter("all");
                setSortBy("recommended");
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-gray-900"
            >
              Clear filters & show all
            </button>
          </div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGyms.map((gym, index) => {
              const price = Number(gym.price) || 499;
              const rating = Number(gym.rating) || 4.8;
              const isTrending = index < 3; // top 3 in list
              const isBudget = price <= 500;
              const isPremium = price >= 900;

              return (
                <article
                  key={gym._id}
                  className="group rounded-2xl overflow-hidden border bg-gradient-to-b from-white/5 via-white/0 to-white/5 hover:border-white/40 hover:shadow-[0_24px_80px_rgba(0,0,0,0.95)] transition-all"
                  style={{ borderColor: THEME.borderSoft }}
                >
                  {/* IMAGE */}
                  <div className="relative h-48">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

                    {/* price pill */}
                    <div className="absolute top-3 left-3">
                      <span
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.9)]"
                        style={{
                          backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
                        }}
                      >
                        ₹{price}
                        <span className="text-[9px] uppercase tracking-[0.18em]">
                          / 1-day pass
                        </span>
                      </span>
                    </div>

                    {/* labels bottom left */}
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/55 border border-white/20 text-[10px] uppercase tracking-[0.18em] text-gray-100">
                        <Dumbbell className="w-3 h-3" />
                        Gym · Studio
                      </span>
                      {isTrending && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400/90 text-[10px] font-semibold text-gray-900 uppercase tracking-[0.18em]">
                          Hot this week
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 flex flex-col gap-3 text-left">
                    <div>
                      <h3 className="text-sm md:text-base font-semibold text-gray-50 truncate">
                        {gym.name}
                      </h3>
                      <p className="mt-1 text-[11px] text-gray-400 flex items-center gap-1">
                        <MapPin size={13} className="text-orange-300" />
                        {gym.city || "City TBA"}
                      </p>
                    </div>

                    {/* tags under name */}
                    <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-300">
                      {isBudget && (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                          Budget-friendly
                        </span>
                      )}
                      {isPremium && (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                          Premium Club
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                        1-day access
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-2">
                      {gym.description ||
                        "Modern training space with solid equipment, good energy and traveler-friendly hosts."}
                    </p>

                    <div className="flex items-center justify-between mt-1">
                      {/* rating */}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-xs text-yellow-300">
                          <Star size={14} className="fill-yellow-300" />
                          <span>{rating.toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          Traveler-rated
                        </span>
                      </div>

                      {/* action buttons */}
                      <div className="flex flex-col items-end gap-1">
                        <Link
                          to={`/gyms/${gym._id}`}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/20 text-gray-100 hover:bg-white/12 transition"
                        >
                          View details
                        </Link>
                        <Link
                          to={`/booking/${gym._id}`}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-full text-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
                          style={{
                            backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
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
        )}
      </section>

      {/* ======================================
         WHY BOOK WITH PASSIIFY (CONVERSION BAND)
         ====================================== */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-black/40 px-5 py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-sm md:text-base font-semibold text-gray-50">
              Why travellers book on{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${THEME.accent2}, ${THEME.accent1})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Passiify
              </span>
              .
            </h2>
            <p className="mt-1 text-[11px] md:text-xs text-gray-400 max-w-md">
              One-day passes mean zero pressure. You keep your freedom, but you
              don&apos;t miss a single workout — no matter which city you wake
              up in.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] md:text-xs text-gray-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-[2px]" />
              <div>
                <div className="font-semibold">Instant QR confirmation</div>
                <div className="text-gray-400">
                  Show your pass at the door. No forms. No awkward sales pitch.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-[2px]" />
              <div>
                <div className="font-semibold">Verified hosts only</div>
                <div className="text-gray-400">
                  We onboard and review gyms so travellers feel safe & welcome.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-[2px]" />
              <div>
                <div className="font-semibold">No contracts, ever</div>
                <div className="text-gray-400">
                  Pay just for the session you want. Tomorrow&apos;s plan can be
                  completely different.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
