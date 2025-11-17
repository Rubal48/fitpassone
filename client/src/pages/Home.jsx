// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  CalendarDays,
  MapPin,
  Dumbbell,
  Star,
  Clock,
  Shield,
  Award,
  Heart,
} from "lucide-react";
import API from "../utils/api";
import HeroRive from "../components/HeroRive"; // adjust path if needed


const COLORS = {
  inkBlack: "#0C0C0C",
  sakuraOffwhite: "#F7F5F2",
  calmGrey: "#C8C8C8",
  warmCoral: "#FF6D5E",
  mossGreen: "#6DA674",
};

// -----------------------------
// Helper: graceful image getters
// -----------------------------
const fallbackEventImage = () =>
  "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=1400&q=80&auto=format&fit=crop";
const fallbackGymImage = () =>
  "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1400";

// -----------------------------
// HERO SECTION
// -----------------------------
function HeroSection({ onSearch }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [riveAvailable, setRiveAvailable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch("/riv/hero.riv", { method: "HEAD" });
        if (!mounted) return;
        setRiveAvailable(res.ok);
      } catch (err) {
        if (!mounted) return;
        setRiveAvailable(false);
      }
    };
    check();
    return () => (mounted = false);
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault?.();
    if (onSearch) onSearch(query.trim(), type);
    // default behaviour: navigate to explore page
    const q = query.trim();
    const params = new URLSearchParams();
    if (q) params.set("query", q);
    if (type && type !== "all") params.set("type", type);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <header className="relative overflow-hidden" style={{ background: COLORS.inkBlack }}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${COLORS.inkBlack} 0%, rgba(12,12,12,0.75) 45%, ${COLORS.sakuraOffwhite} 100%)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* LEFT */}
          <div className="z-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/6 backdrop-blur border border-white/10 mb-6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke={COLORS.warmCoral} strokeWidth={2} />
              </svg>
              <span className="text-sm font-semibold text-white/90">Curated for travellers</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
              Move. Explore. Belong.
              <span
                className="block"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${COLORS.warmCoral}, ${COLORS.mossGreen})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Find experiences that stay with you.
              </span>
            </h1>

            <p className="mt-4 text-lg text-white/80 max-w-xl">
              Handpicked retreats, fight camps, yoga & cultural experiences — trusted local hosts, instant booking, and flexible passes for travellers who want more than a visit.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex gap-3 items-center max-w-xl">
              <div className="flex items-center rounded-xl bg-[rgba(247,245,242,0.95)] p-1 w-full shadow-lg border border-white/10">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  aria-label="Type"
                  className="rounded-lg px-3 py-3 bg-transparent text-black outline-none border-r border-white/10 text-sm font-medium"
                >
                  <option value="all">All</option>
                  <option value="events">Events</option>
                  <option value="gyms">Gyms & Studios</option>
                </select>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search MMA, Yoga, studio, or city — e.g. Rishikesh"
                  aria-label="Search query"
                  className="flex-1 px-4 py-3 bg-transparent text-sm text-black placeholder:text-gray-400 focus:outline-none"
                />

                <button
                  type="submit"
                  onClick={handleSearch}
                  className="ml-2 mr-1 px-5 py-3 rounded-lg font-semibold text-white"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${COLORS.warmCoral}, ${COLORS.mossGreen})`,
                    boxShadow: "0 8px 24px rgba(255,109,94,0.12)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Search size={16} />
                    <span className="hidden sm:inline">Search</span>
                  </div>
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              {["Yoga", "MMA", "Dance", "Pilates", "Hiking"].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setQuery(c);
                    setType("all");
                    const params = new URLSearchParams();
                    params.set("query", c);
                    navigate(`/explore?${params.toString()}`);
                  }}
                  className="px-4 py-1.5 rounded-full bg-white/6 text-white text-sm hover:bg-white/10 transition"
                >
                  #{c}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-6 items-center text-white/90">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-white/90" />
                <div className="text-sm font-medium">Verified hosts</div>
              </div>

              <div className="flex items-center gap-2">
                <Award size={16} className="text-white/90" />
                <div className="text-sm font-medium">Secure payments</div>
              </div>

              <div className="flex items-center gap-2">
                <Heart size={16} className="text-white/90" />
                <div className="text-sm font-medium">Flexible passes</div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative z-10">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              {riveAvailable ? (
                <div className="w-full h-96 md:h-[520px]"><HeroRive src="/riv/hero.riv" autoplay={true} /></div>
              ) : (
                <div className="w-full h-96 md:h-[520px] relative bg-gray-100">
                  <img src={fallbackEventImage()} alt="Featured" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute left-6 bottom-6 right-6 text-white">
                    <div className="text-sm text-white/80">Featured</div>
                    <h3 className="text-2xl font-bold">Himalayan Yoga Retreat</h3>
                    <div className="mt-3 flex gap-3">
                      <div className="p-3 bg-white/90 text-black rounded-xl">
                        <div className="text-sm font-bold">500+</div>
                        <div className="text-xs text-gray-600">Gyms & Studios</div>
                      </div>
                      <div className="p-3 bg-white/90 text-black rounded-xl">
                        <div className="text-sm font-bold">200+</div>
                        <div className="text-xs text-gray-600">Events Monthly</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-3 justify-start">
              <div className="px-3 py-2 bg-white/90 rounded-full text-sm font-semibold text-inkBlack">Local hosts</div>
              <div className="px-3 py-2 bg-white/90 rounded-full text-sm font-semibold text-inkBlack">Instant booking</div>
            </div>
          </div>
        </div>
      </div>

      <div className="-mb-1">
        <svg viewBox="0 0 1440 80" className="w-full h-12">
          <path fill="#fff" d="M0,32L48,26.7C96,21,192,11,288,10.7C384,11,480,21,576,37.3C672,53,768,75,864,64C960,53,1056,11,1152,2.7C1248,-6,1344,3,1392,8L1440,13L1440,80L0,80Z" />
        </svg>
      </div>
    </header>
  );
}

// -----------------------------
// CATEGORIES SECTION (simple, editable)
// -----------------------------
function CategoriesSection() {
  const categories = [
    { name: "MMA", emoji: "🥊" },
    { name: "Yoga", emoji: "🧘" },
    { name: "Gym", emoji: "💪" },
    { name: "Dance", emoji: "💃" },
    { name: "Pilates", emoji: "🤸" },
    { name: "CrossFit", emoji: "🏋️" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Explore By Category</h2>
        <p className="text-gray-600">Find the perfect fitness experience for your journey</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((c) => (
          <Link key={c.name} to={`/explore?query=${encodeURIComponent(c.name)}`} className="group relative p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-3xl mb-2">{c.emoji}</div>
            <div className="font-bold text-gray-900">{c.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// -----------------------------
// ADVENTURE EVENTS SECTION (fetches events)
// -----------------------------
function AdventureEventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchEvents = async () => {
      try {
        const res = await API.get("/events");
        // API may return { events } or array directly
        const data = res.data?.events || res.data || res;
        if (!mounted) return;
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching events:", err);
        if (!mounted) return;
        setError(err);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    fetchEvents();
    return () => (mounted = false);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Adventure Events</h2>
          <p className="text-sm text-gray-500 mt-1">Handpicked outdoor, wellness & adventure experiences for travelers.</p>
        </div>
        <Link to="/events" className="text-sm font-semibold text-orange-500">See all events →</Link>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading events...</div>
      ) : error ? (
        <div className="text-red-500">Failed to load events.</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500">No events available right now.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 6).map((ev) => (
            <article key={ev._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transform hover:-translate-y-1 transition">
              <div className="relative h-56">
                <img src={ev.image || fallbackEventImage()} alt={ev.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold">{ev.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{ev.location}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500 flex items-center gap-2"><CalendarDays size={14} /> {new Date(ev.date).toLocaleDateString()}</div>
                  <div className="text-lg font-bold text-orange-500">₹{ev.price}</div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link to={`/events/${ev._id}`} className="px-3 py-1 rounded-full bg-white border text-sm font-semibold">Details</Link>
                  <Link to={`/book-event/${ev._id}`} className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-400 to-blue-600 text-white text-sm font-semibold">Book</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// -----------------------------
// TOP GYMS SECTION (fetches gyms)
// -----------------------------
function TopGymsSection() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchGyms = async () => {
      try {
        const res = await API.get("/gyms");
        const data = res.data || res;
        if (!mounted) return;
        setGyms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching gyms:", error);
        if (!mounted) return;
        setErr(error);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    fetchGyms();
    return () => (mounted = false);
  }, []);

  return (
    <section className="bg-white/50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Top Gyms, MMA, Dance & Yoga</h2>
            <p className="text-sm text-gray-500 mt-1">Try a studio pass or join a class — no membership needed.</p>
          </div>
          <Link to="/explore" className="text-sm font-semibold text-orange-500">See all gyms →</Link>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading gyms...</div>
        ) : err ? (
          <div className="text-red-500">Failed to load gyms.</div>
        ) : gyms.length === 0 ? (
          <div className="text-gray-500">No gyms available right now.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gyms.slice(0, 8).map((g) => (
              <article key={g._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transform hover:-translate-y-1 transition">
                <div className="relative h-44">
                  <img src={g.images?.[0] || g.image || fallbackGymImage()} alt={g.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold">{g.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{g.city}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-orange-500">₹{g.price ?? "—"}</div>
                    <div className="text-xs text-gray-400">{g.rating ?? "4.6"} ★</div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link to={`/gyms/${g._id}`} className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm">View</Link>
                    <Link to={`/booking/${g._id}`} className="px-3 py-1 rounded-full border border-gray-200 text-sm">Book</Link>
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

// -----------------------------
// TRENDING EXPERIENCES (mix)
// -----------------------------
function TrendingExperiencesSection() {
  const [events, setEvents] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [evRes, gymRes] = await Promise.all([API.get("/events"), API.get("/gyms")]);
        const evData = evRes.data?.events || evRes.data || evRes;
        const gymData = gymRes.data || gymRes;
        if (!mounted) return;
        setEvents(Array.isArray(evData) ? evData : []);
        setGyms(Array.isArray(gymData) ? gymData : []);
      } catch (err) {
        console.error("Error loading trending:", err);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const items = [
    ...events.slice(0, 4).map((e) => ({ type: "event", data: e })),
    ...gyms.slice(0, 4).map((g) => ({ type: "gym", data: g })),
  ].slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Trending Experiences & Cultural Picks</h2>
          <p className="text-sm text-gray-500 mt-1">Local favorites and cultural events loved by travelers.</p>
        </div>
        <Link to="/explore" className="text-sm font-semibold text-orange-500">Explore more →</Link>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <article key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition">
              <div className="relative h-44">
                <img src={(item.type === "event" ? item.data.image : item.data.images?.[0] || item.data.image) || fallbackEventImage()} alt={item.data.name} className="w-full h-full object-cover" />
              </div>

              <div className="p-4">
                <h3 className="font-semibold">{item.data.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.type === "event" ? item.data.location : item.data.city}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-gray-500">{item.type === "event" ? new Date(item.data.date).toLocaleDateString() : "Gym"}</div>
                  <div className="text-lg font-bold text-orange-500">₹{item.data.price}</div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Link to={item.type === "event" ? `/events/${item.data._id}` : `/gyms/${item.data._id}`} className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm">View</Link>
                  <Link to={item.type === "event" ? "/events" : "/explore"} className="px-3 py-1 rounded-full border border-gray-200 text-sm">More</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// -----------------------------
// LOCAL DISCOVERY
// -----------------------------
function LocalDiscoverySection() {
  const chips = ["Yoga", "Bootcamp", "Hiking", "Beach Workout", "Pilates", "MMA", "Dance"];
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-6 py-12 bg-white/50 rounded-2xl">
      <h3 className="text-2xl font-semibold mb-4">Discover locally</h3>
      <div className="flex flex-wrap gap-3">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => navigate(`/explore?query=${encodeURIComponent(c)}`)}
            className="px-4 py-2 rounded-full bg-white/90 border text-sm font-semibold hover:scale-[1.02] transition"
          >
            {c}
          </button>
        ))}
      </div>
    </section>
  );
}

// -----------------------------
// HOW IT WORKS
// -----------------------------
function HowItWorksSection() {
  const steps = [
    { emoji: "🔎", title: "Discover", desc: "Find events and gyms near you." },
    { emoji: "🧾", title: "Select", desc: "Choose the pass or event." },
    { emoji: "💳", title: "Book", desc: "Secure checkout in seconds." },
    { emoji: "🏃", title: "Attend", desc: "Show pass & enjoy the experience." },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-extrabold mb-8">How it works</h2>
      <div className="grid md:grid-cols-4 gap-6">
        {steps.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow border border-gray-100 text-center">
            <div className="text-4xl mb-3">{s.emoji}</div>
            <div className="font-semibold mb-2">{s.title}</div>
            <div className="text-sm text-gray-500">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// -----------------------------
// CTA
// -----------------------------
function CTASection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${COLORS.inkBlack}, ${COLORS.warmCoral})`, opacity: 0.95 }} />
      <div className="relative max-w-4xl mx-auto px-6 py-20 text-center text-white">
        <h2 className="text-4xl font-black mb-4">Ready to Move Different?</h2>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">Join thousands of travelers discovering unforgettable fitness experiences worldwide</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/events" className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl">Explore Events</Link>
          <Link to="/explore" className="px-8 py-4 bg-orange-500 text-white font-bold rounded-xl">Find Gyms Near You</Link>
        </div>
      </div>
    </section>
  );
}

// -----------------------------
// Page assembly (default export)
// -----------------------------
export default function Home() {
  // central onSearch can be forwarded to sections if desired
  const onSearch = (q, t) => {
    // placeholder - sections individually navigate by default
    console.log("search requested:", q, t);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F5F2] via-white to-[#C8C8C8]/20 text-gray-900">
      <HeroSection onSearch={onSearch} />
      <main className="space-y-8">
        <CategoriesSection />
        <AdventureEventsSection />
        <TopGymsSection />
        <TrendingExperiencesSection />
        <LocalDiscoverySection />
        <HowItWorksSection />
        <CTASection />
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-2xl font-bold">Passiify</h4>
            <p className="text-sm text-gray-600 mt-2">One-day fitness passes and curated events for travelers & locals.</p>
          </div>

          <div>
            <h5 className="font-semibold mb-2">Quick Links</h5>
            <ul className="text-sm text-gray-600 space-y-2">
              <li><Link to="/explore" className="hover:text-orange-500">Explore</Link></li>
              <li><Link to="/partner" className="hover:text-orange-500">Partner with us</Link></li>
              <li><Link to="/about" className="hover:text-orange-500">About</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold mb-2">Contact</h5>
            <p className="text-sm text-gray-600">support@passiify.com</p>
            <p className="text-sm text-gray-600 mt-2">© {new Date().getFullYear()} Passiify</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
