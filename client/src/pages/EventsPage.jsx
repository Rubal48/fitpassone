// src/pages/EventsPage.jsx
import React, { useEffect, useState } from "react";
import {
  MapPin,
  CalendarDays,
  Star,
  Loader2,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

/* Helper for safe date */
const formatEventDate = (dateStr) => {
  if (!dateStr) return "TBA";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "TBA";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const EventsPage = () => {
  /* =========================================================
     STATE
     ========================================================= */
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended"); // recommended | priceLow | priceHigh | dateSoon
  const navigate = useNavigate();

  /* =========================================================
     FETCH EVENTS
     ========================================================= */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/events"); // backend aligned
        const data = res.data?.events || res.data || [];
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  /* =========================================================
     FILTER + SORT
     ========================================================= */
  const filteredEvents = events
    .filter((e) => {
      const cat = e.category?.toLowerCase() || "";
      const categoryMatch =
        selectedCategory === "all" ||
        cat === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      if (!q) return categoryMatch;

      const name = e.name?.toLowerCase() || "";
      const loc = e.location?.toLowerCase() || "";
      const desc = e.description?.toLowerCase() || "";

      const searchMatch =
        name.includes(q) || loc.includes(q) || desc.includes(q);

      return categoryMatch && searchMatch;
    })
    .sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      const ratingA = Number(a.rating) || 4.5;
      const ratingB = Number(b.rating) || 4.5;

      if (sortBy === "priceLow") return priceA - priceB;
      if (sortBy === "priceHigh") return priceB - priceA;
      if (sortBy === "dateSoon") return dateA - dateB;

      // recommended: rating + recency + price
      const scoreA = ratingA * 2 - priceA / 400 + (dateA ? 1 / dateA : 0);
      const scoreB = ratingB * 2 - priceB / 400 + (dateB ? 1 / dateB : 0);
      return scoreB - scoreA;
    });

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
      {/* =====================================================
         HERO SECTION
         ===================================================== */}
      <section className="relative overflow-hidden">
        {/* warm glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
            style={{ background: THEME.accent1 }}
          />
          <div
            className="absolute -bottom-40 -right-40 w-[420px] h-[420px] rounded-full blur-3xl opacity-35"
            style={{ background: THEME.accent2 }}
          />
        </div>

        {/* background image tint */}
        <div className="absolute inset-0 opacity-20 mix-blend-soft-light bg-[url('https://images.pexels.com/photos/799165/pexels-photo-799165.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center" />

        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/30 border border-white/15 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-gray-100">
              curated fight nights · retreats · runs
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-[2.7rem] font-black tracking-tight text-white">
            Book{" "}
            <span
              style={{
                backgroundImage: `linear-gradient(90deg, ${THEME.accent1}, ${THEME.accent2})`,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              unforgettable events
            </span>{" "}
            in every city you land.
          </h1>

          <p className="mt-3 text-sm md:text-base text-gray-200 max-w-2xl mx-auto">
            Sunrise yoga on rooftops, sunset runs by the sea, brutal fight
            camps and community bootcamps. Zero contracts – just show up,
            sweat, and connect.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => window.scrollTo({ top: 420, behavior: "smooth" })}
              className="px-6 py-3 rounded-full text-sm font-semibold text-gray-900 shadow-[0_14px_40px_rgba(0,0,0,0.9)]"
              style={{
                backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
              }}
            >
              Explore live events
            </button>
            <button
              onClick={() => navigate("/create-event")}
              className="px-6 py-3 rounded-full text-sm font-semibold border border-white/40 text-gray-100 bg-white/5 hover:bg-white/10 transition flex items-center gap-2"
            >
              Host an event
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
         FILTERS + SEARCH BAR
         ===================================================== */}
      <section className="max-w-6xl mx-auto -mt-6 px-6">
        <div className="bg-black/60 border border-white/15 rounded-3xl px-5 py-5 md:px-7 md:py-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)] backdrop-blur-xl flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-100">
              <Filter size={18} className="text-orange-200" />
              <span>Filter events</span>
            </div>

            {/* sort select */}
            <div className="flex items-center gap-2 text-[11px] md:text-xs text-gray-300">
              <span className="hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/40 border border-white/20 rounded-full px-3 py-1 text-[11px] md:text-xs text-gray-100 focus:outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="dateSoon">Date: Soonest</option>
              </select>
            </div>
          </div>

          {/* categories */}
          <div className="flex flex-wrap gap-2 text-[11px] md:text-xs">
            {["all", "yoga", "strength", "cardio", "adventure", "mindfulness"].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full font-medium capitalize transition ${
                    selectedCategory === cat
                      ? "bg-white text-gray-900 border border-transparent"
                      : "bg-white/5 text-gray-100 border border-white/15 hover:bg-white/10"
                  }`}
                >
                  {cat === "all" ? "All events" : cat}
                </button>
              )
            )}
          </div>

          {/* search bar */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 mt-1">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by event name, location or vibe (e.g. Goa, run, yoga)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-xs md:text-sm text-gray-100 placeholder:text-gray-500"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
         EVENTS GRID
         ===================================================== */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-16">
        <h2 className="text-2xl font-semibold text-gray-50 mb-4">
          Featured this week
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          These hosts are running sessions that travellers keep coming back
          for. Spots are usually limited — especially for fight camps and
          sunrise classes.
        </p>

        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <Loader2 className="animate-spin text-orange-300" size={32} />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-gray-200">
              No events match your search or category right now.
            </p>
            <p className="text-xs text-gray-500 max-w-sm text-center">
              Try resetting filters or searching by something broader like
              “run”, “yoga”, “MMA” or just a city name. New experiences are
              added frequently.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setSortBy("recommended");
              }}
              className="mt-2 px-4 py-2 rounded-full text-xs font-semibold bg-white text-gray-900"
            >
              Clear filters & show all events
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-7">
            {filteredEvents.map((event, idx) => {
              const price = Number(event.price) || 0;
              const rating = Number(event.rating) || 4.2;
              const date = event.date ? new Date(event.date) : null;
              const now = new Date();
              const isSoon =
                date && (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 7;
              const isPast = date && date < now;
              const isTopPick = idx < 3;

              return (
                <article
                  key={event._id}
                  className="group bg-gradient-to-b from-white/5 via-white/0 to-white/5 rounded-3xl overflow-hidden border hover:border-white/40 shadow-[0_22px_70px_rgba(0,0,0,0.9)] hover:shadow-[0_30px_90px_rgba(0,0,0,1)] transition-all"
                  style={{ borderColor: THEME.borderSoft }}
                >
                  {/* IMAGE */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={
                        event.image ||
                        "https://images.pexels.com/photos/799165/pexels-photo-799165.jpeg?auto=compress&cs=tinysrgb&w=1200"
                      }
                      alt={event.name}
                      className="h-full w-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

                    {/* price pill */}
                    <div className="absolute top-3 right-3">
                      <span
                        className="px-3 py-1 rounded-full text-[11px] font-semibold text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.9)]"
                        style={{
                          backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
                        }}
                      >
                        ₹{price || 0}
                      </span>
                    </div>

                    {/* badges bottom left */}
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                      {event.category && (
                        <span className="px-3 py-1 rounded-full bg-black/60 border border-white/20 text-[10px] uppercase tracking-[0.18em] text-gray-100">
                          {event.category}
                        </span>
                      )}
                      {isTopPick && (
                        <span className="px-3 py-1 rounded-full bg-amber-400/95 text-[10px] font-semibold text-gray-900 uppercase tracking-[0.18em]">
                          Top pick
                        </span>
                      )}
                      {isSoon && !isPast && (
                        <span className="px-3 py-1 rounded-full bg-red-500/90 text-[10px] font-semibold text-gray-50 uppercase tracking-[0.18em]">
                          Few spots left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <h3 className="text-base font-semibold mb-1 text-gray-50 line-clamp-2">
                        {event.name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                        {event.description ||
                          "Join an unforgettable session with locals and travellers in this city."}
                      </p>
                    </div>

                    {/* location + date */}
                    <div className="flex justify-between text-[11px] text-gray-300">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {event.location || "Location TBA"}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        {formatEventDate(event.date)}
                      </span>
                    </div>

                    {/* rating + actions */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-col">
                        <div className="flex items-center text-yellow-300 gap-1 text-xs">
                          <Star
                            size={14}
                            className="fill-yellow-300 stroke-yellow-300"
                          />
                          <span>{rating.toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          Traveler-rated experience
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => navigate(`/events/${event._id}`)}
                          className="bg-white/6 border border-white/20 text-gray-100 px-3 py-1.5 rounded-full text-[11px] font-semibold hover:bg-white/12 transition"
                        >
                          View details
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/book-event/${event._id}`)
                          }
                          className="bg-white text-gray-900 px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.9)] hover:scale-[1.02] transition"
                        >
                          Book pass
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

      {/* =====================================================
         WHY BOOK EVENTS ON PASSIIFY (CONVERSION BAND)
         ===================================================== */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-black/45 px-5 py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h2 className="text-sm md:text-base font-semibold text-gray-50">
              Why travellers book{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${THEME.accent2}, ${THEME.accent1})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                events
              </span>{" "}
              on Passiify.
            </h2>
            <p className="mt-1 text-[11px] md:text-xs text-gray-400 max-w-md">
              We curate events that actually respect your time and freedom –
              from drop-in workshops to full-day experiences. No long-term
              commitments, just meaningful sweat & stories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] md:text-xs text-gray-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-[2px]" />
              <div>
                <div className="font-semibold">Instant confirmation</div>
                <div className="text-gray-400">
                  Book in a few taps and get your event details instantly in
                  your inbox.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-[2px]" />
              <div>
                <div className="font-semibold">Verified hosts</div>
                <div className="text-gray-400">
                  We screen hosts so you don&apos;t end up in random, low-quality
                  events.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-[2px]" />
              <div>
                <div className="font-semibold">Zero long-term lock-ins</div>
                <div className="text-gray-400">
                  Join one event today, something totally different tomorrow.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
         CTA SECTION (LIGHT POP)
         ===================================================== */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
            opacity: 0.97,
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-14 text-center text-gray-900">
          <h2 className="text-2xl md:text-3xl font-black mb-3">
            Ready to anchor your trip around a legendary session?
          </h2>
          <p className="text-xs md:text-sm text-black/75 mb-6 max-w-2xl mx-auto">
            Pick one event in the city you&apos;re visiting and build the rest of
            your plans around it. You&apos;ll remember the workout more than the
            café.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 420, behavior: "smooth" })}
            className="px-6 py-3 rounded-full text-xs md:text-sm font-semibold bg-black text-white"
          >
            View this week&apos;s events
          </button>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
