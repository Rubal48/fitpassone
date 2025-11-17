// src/components/sections/HeroSection.jsx
import React, { useEffect, useState } from "react";
import { Search, CalendarDays, Shield, Award, Heart } from "lucide-react";
import HeroRive from "../HeroRive"; // adjust path if your component is elsewhere (../HeroRive or ../animation/HeroRive)

const palette = {
  inkBlack: "#0C0C0C",
  sakuraOffwhite: "#F7F5F2",
  calmGrey: "#C8C8C8",
  warmCoral: "#FF6D5E",
  mossGreen: "#6DA674",
};

// Props: rivePath (string), onSearch (fn), initialQuery
export default function HeroSection({
  rivePath = "/riv/hero.riv",
  onSearch, // (query, type) => {}
  initialQuery = "",
}) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState("all");
  const [riveAvailable, setRiveAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkRive = async () => {
      try {
        const r = await fetch(rivePath, { method: "HEAD" });
        if (!mounted) return;
        setRiveAvailable(r.ok);
      } catch (err) {
        if (!mounted) return;
        setRiveAvailable(false);
      }
    };
    checkRive();
    return () => {
      mounted = false;
    };
  }, [rivePath]);

  const handleSearch = (e) => {
    e?.preventDefault?.();
    if (typeof onSearch === "function") onSearch(query.trim(), type);
  };

  // fallback image — premium, calm
  const fallbackImage =
    "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1600&auto=format&fit=crop";

  return (
    <header
      className="relative overflow-hidden"
      aria-label="Passiify hero"
      style={{ background: palette.inkBlack }}
    >
      {/* Soft textured background using palette C (Sakura + Ink contrast) */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${palette.inkBlack} 0%, rgba(12,12,12,0.75) 45%, ${palette.sakuraOffwhite} 100%)`,
          mixBlendMode: "normal",
        }}
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* LEFT: Headline + Search */}
          <div className="z-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/6 backdrop-blur border border-white/10 mb-6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke="#FF6D5E" strokeWidth="2" />
              </svg>
              <span className="text-sm font-semibold text-white/90">Curated for travellers</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white" style={{ lineHeight: 1.03 }}>
              Move. Explore. Belong.
              <span className="block text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${palette.warmCoral}, ${palette.mossGreen})`,
                }}
              >
                {" "}Find experiences that stay with you.
              </span>
            </h1>

            <p className="mt-4 text-lg text-white/80 max-w-xl">
              Handpicked retreats, fight camps, yoga & cultural experiences — trusted local hosts, instant booking,
              and flexible passes for travellers who want more than a visit.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mt-8 flex gap-3 items-center max-w-xl">
              <div className="flex items-center rounded-xl bg-[rgba(247,245,242,0.95)] p-1 w-full shadow-lg border border-white/10">
                <select
                  aria-label="Type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="rounded-lg px-3 py-3 bg-transparent text-inkBlack outline-none border-r border-white/10 text-sm font-medium"
                >
                  <option value="all">All</option>
                  <option value="events">Events</option>
                  <option value="gyms">Gyms & Studios</option>
                </select>

                <input
                  aria-label="Search query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search MMA, Yoga, studio, or city — e.g. Rishikesh"
                  className="flex-1 px-4 py-3 bg-transparent text-sm text-inkBlack placeholder:text-gray-400 focus:outline-none"
                />

                <button
                  type="submit"
                  onClick={handleSearch}
                  className="ml-2 mr-1 px-5 py-3 rounded-lg font-semibold text-white"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${palette.warmCoral}, ${palette.mossGreen})`,
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

            {/* chips */}
            <div className="mt-5 flex flex-wrap gap-3">
              {["Yoga", "MMA", "Dance", "Pilates", "Hiking"].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setQuery(c);
                    setType("all");
                    if (typeof onSearch === "function") onSearch(c, "all");
                  }}
                  className="px-4 py-1.5 rounded-full bg-white/6 text-white text-sm hover:bg-white/10 transition"
                >
                  #{c}
                </button>
              ))}
            </div>

            {/* trust + moto row */}
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

          {/* RIGHT: Rive or fallback image */}
          <div className="relative z-10">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              {riveAvailable ? (
                // HeroRive should accept src prop; your HeroRive.jsx uses src param name 'src'
                <div className="w-full h-96 md:h-[520px]">
                  <HeroRive src={rivePath} autoplay={true} />
                </div>
              ) : (
                <div className="w-full h-96 md:h-[520px] relative bg-gray-100">
                  <img
                    src={fallbackImage}
                    alt="Featured experience"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
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

            {/* small badges row */}
            <div className="mt-4 flex gap-3 justify-start">
              <div className="px-3 py-2 bg-white/90 rounded-full text-sm font-semibold text-inkBlack">Local hosts</div>
              <div className="px-3 py-2 bg-white/90 rounded-full text-sm font-semibold text-inkBlack">Instant booking</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
