// src/pages/GymDetails.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  ShieldCheck,
  Clock,
  Dumbbell,
  ThumbsUp,
  Shield,
  Award,
  Users,
  CreditCard,
  Loader2,
  CheckCircle,
  CalendarDays,
  Star,
  Wifi,
  Droplet,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import API from "../utils/api";

/* =========================================================
   BRAND / THEME TOKENS — balanced blue x orange, glass
   ========================================================= */

const BRAND = {
  accentBlue: "#2563EB",
  accentOrange: "#FB923C",
};

const LIGHT_THEME = {
  mode: "light",
  bg: "#F4F6FB",
  card: "rgba(255,255,255,0.96)",
  cardSoft: "rgba(248,250,252,0.98)",
  textMain: "#0F172A",
  textMuted: "#6B7280",
  borderSoft: "rgba(148,163,184,0.38)",
  shadowStrong: "0 34px 110px rgba(15,23,42,0.22)",
  shadowSoft: "0 20px 70px rgba(15,23,42,0.12)",
};

const DARK_THEME = {
  mode: "dark",
  bg: "#020617",
  card: "rgba(15,23,42,0.96)",
  cardSoft: "rgba(15,23,42,0.92)",
  textMain: "#E5E7EB",
  textMuted: "#9CA3AF",
  borderSoft: "rgba(148,163,184,0.55)",
  shadowStrong: "0 40px 140px rgba(0,0,0,0.9)",
  shadowSoft: "0 24px 90px rgba(15,23,42,0.9)",
};

/* Helper: build next N dates for quick calendar chips */
const buildQuickDates = (days = 7) => {
  const arr = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    arr.push({
      key: d.toISOString().split("T")[0],
      dayLabel:
        i === 0
          ? "Today"
          : i === 1
          ? "Tomorrow"
          : d.toLocaleDateString("en-IN", { weekday: "short" }),
      dateLabel: d.getDate(),
      monthLabel: d.toLocaleDateString("en-IN", { month: "short" }),
    });
  }
  return arr;
};

export default function GymDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* -------------------------------------------------------
     THEME (light/dark) — respects system + localStorage
     ------------------------------------------------------- */
  const [mode, setMode] = useState("dark");
  const theme = mode === "light" ? LIGHT_THEME : DARK_THEME;

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

  useEffect(() => {
    try {
      localStorage.setItem("passiify-theme", mode);
    } catch {
      // ignore
    }
  }, [mode]);

  /* -------------------------------------------------------
     STATE
     ------------------------------------------------------- */
  const [gym, setGym] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedPass, setSelectedPass] = useState(null);

  const quickDates = useMemo(() => buildQuickDates(7), []);

  /* -------------------------------------------------------
     FETCH GYM + REVIEWS
     ------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [gymRes, reviewRes] = await Promise.all([
          API.get(`/gyms/${id}`),
          API.get(`/reviews/${id}`),
        ]);

        if (!mounted) return;

        const gymData = gymRes.data;

        // Normalise customPrice → passes
        if (gymData.customPrice && !gymData.passes) {
          gymData.passes = Object.entries(gymData.customPrice).map(
            ([duration, price]) => ({
              duration: Number(duration),
              price: Number(price),
            })
          );
        }

        setGym(gymData);
        setReviews(reviewRes.data || []);
        if (gymData.passes?.length) setSelectedPass(gymData.passes[0]);
        setError("");
      } catch (err) {
        console.error("❌ Error fetching gym:", err);
        if (!mounted) return;
        setError("Could not load gym details.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [id]);

  /* -------------------------------------------------------
     BOOKING HANDLER
     ------------------------------------------------------- */
  const handleBooking = async () => {
    try {
      setBookingLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first to book a pass.");
        navigate("/login");
        return;
      }

      if (!selectedPass) {
        alert("Please select a pass first.");
        return;
      }

      const gymId = gym?._id || id;
      const bookingData = {
        gymId,
        date: selectedDate,
        duration: selectedPass.duration,
        price: selectedPass.price,
      };

      const { data } = await API.post("/bookings", bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowSuccess(true);
      setTimeout(
        () => navigate(`/booking-success/${data.booking?._id || data._id}`),
        1400
      );
    } catch (err) {
      console.error("❌ Booking failed:", err);
      alert("Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  /* -------------------------------------------------------
     REVIEW HANDLER
     ------------------------------------------------------- */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      await API.post(
        `/reviews/${id}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRating(0);
      setComment("");
      const res = await API.get(`/reviews/${id}`);
      setReviews(res.data || []);
    } catch (err) {
      console.error("Error posting review:", err);
      alert("Could not post review. Try again later.");
    }
  };

  /* -------------------------------------------------------
     LOADING / ERROR
     ------------------------------------------------------- */
  if (loading) {
    return (
      <div
        className="min-h-screen flex justify-center items-center"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="flex items-center gap-2 text-sm">
          <Loader2
            className="w-5 h-5 animate-spin"
            style={{ color: BRAND.accentOrange }}
          />
          <span style={{ color: theme.textMuted }}>
            Loading gym details…
          </span>
        </div>
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div
        className="min-h-screen flex flex-col justify-center items-center px-4 text-center"
        style={{ backgroundColor: theme.bg }}
      >
        <p
          className="text-sm md:text-base mb-3"
          style={{ color: theme.textMain }}
        >
          ⚠️ {error || "Gym not found."}
        </p>
        <Link
          to="/explore"
          className="mt-1 rounded-full text-xs md:text-sm font-semibold px-5 py-2"
          style={{
            backgroundImage: `linear-gradient(120deg, ${BRAND.accentBlue}, ${BRAND.accentOrange})`,
            color: "#020617",
            boxShadow: theme.shadowSoft,
          }}
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  /* -------------------------------------------------------
     DERIVED DATA
     ------------------------------------------------------- */

  const galleryImages =
    gym.images && gym.images.length > 0
      ? gym.images.map((img) =>
          img.startsWith("http")
            ? img
            : `http://localhost:5000${img}`
        )
      : [
          "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1200",
          "https://images.pexels.com/photos/7031707/pexels-photo-7031707.jpeg?auto=compress&cs=tinysrgb&w=1200",
        ];

  const minPassPrice =
    gym.passes && gym.passes.length
      ? Math.min(...gym.passes.map((p) => Number(p.price) || 0))
      : null;

  let bestValue = null;
  if (gym.passes?.length > 1) {
    const withPerDay = gym.passes.map((p) => ({
      ...p,
      perDay: p.price / p.duration,
    }));
    bestValue = withPerDay.reduce((a, b) => (a.perDay < b.perDay ? a : b));
  }

  const isApproved =
    gym.status && gym.status.toLowerCase().trim() === "approved";

  const avgRating =
    typeof gym.rating === "number"
      ? gym.rating
      : reviews.length
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        reviews.length
      : null;

  const ratingCount = gym.ratingCount || reviews.length || 0;

  const backgroundImage =
    mode === "dark"
      ? `radial-gradient(circle at top, rgba(37,99,235,0.34), transparent 55%),
         radial-gradient(circle at bottom right, rgba(249,115,22,0.22), transparent 60%)`
      : `radial-gradient(circle at top, rgba(37,99,235,0.12), transparent 55%),
         radial-gradient(circle at bottom right, rgba(249,115,22,0.12), transparent 60%)`;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.bg,
        backgroundImage,
      }}
    >
      {/* ===================================================
         HERO — Cinematic hero with overlay + trust
         =================================================== */}
      <section className="relative w-full h-[54vh] md:h-[60vh] overflow-hidden rounded-b-[32px] md:rounded-b-[40px] shadow-2xl">
        <img
          src={galleryImages[0]}
          alt={gym.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -bottom-40 -right-40 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
            style={{ background: BRAND.accentOrange }}
          />
          <div
            className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full blur-3xl opacity-36"
            style={{ background: BRAND.accentBlue }}
          />
        </div>

        <div className="absolute inset-x-6 md:inset-x-12 bottom-8 md:bottom-10 max-w-6xl mx-auto">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/20 mb-3 backdrop-blur">
            {gym.verified && (
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            )}
            <span className="text-[10px] uppercase tracking-[0.22em] text-gray-100">
              Passiify partner · Day-pass ready
            </span>
          </div>

          {/* Name + meta + price */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl lg:text-[2.7rem] font-black tracking-tight text-white">
                {gym.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-200">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-200" />
                  {gym.city || "Location TBA"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-orange-200" />
                  {gym.type || "Strength · Conditioning"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-200" />
                  {gym.openingHours || "6:00 AM – 10:00 PM"}
                </span>
                {avgRating ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    {avgRating.toFixed(1)}{" "}
                    {ratingCount ? `· ${ratingCount}+ reviews` : ""}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    New on Passiify
                  </span>
                )}
              </div>
            </div>

            {/* Price & CTA mini strip */}
            <div className="inline-flex flex-col items-end gap-2">
              {minPassPrice && (
                <div className="inline-flex items-baseline gap-1 text-right">
                  <span className="text-xs text-gray-200">From</span>
                  <span className="text-2xl md:text-3xl font-extrabold text-white">
                    ₹{minPassPrice}
                  </span>
                  <span className="text-[10px] text-gray-300 uppercase tracking-[0.18em]">
                    / 1-day pass
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${gym.address || ""} ${gym.city || ""}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full border border-white/30 text-[11px] text-gray-100 bg-black/40 hover:bg-black/60 transition inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
         QUICK FACTS STRIP
         =================================================== */}
      <section className="max-w-6xl mx-auto px-6 -mt-6 md:-mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            className="rounded-2xl px-4 py-3 text-xs md:text-sm backdrop-blur"
            style={{
              background: theme.cardSoft,
              border: `1px solid ${theme.borderSoft}`,
              boxShadow: theme.shadowSoft,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock
                className="w-3.5 h-3.5"
                style={{ color: BRAND.accentOrange }}
              />
              <span
                className="uppercase text-[10px] tracking-[0.18em]"
                style={{ color: theme.textMuted }}
              >
                Hours
              </span>
            </div>
            <div style={{ color: theme.textMain }}>
              {gym.openingHours || "6:00 AM – 10:00 PM"}
            </div>
          </div>
          <div
            className="rounded-2xl px-4 py-3 text-xs md:text-sm backdrop-blur"
            style={{
              background: theme.cardSoft,
              border: `1px solid ${theme.borderSoft}`,
              boxShadow: theme.shadowSoft,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell
                className="w-3.5 h-3.5"
                style={{ color: BRAND.accentBlue }}
              />
              <span
                className="uppercase text-[10px] tracking-[0.18em]"
                style={{ color: theme.textMuted }}
              >
                Style
              </span>
            </div>
            <div style={{ color: theme.textMain }}>
              {gym.type || "Strength · Conditioning"}
            </div>
          </div>
          <div
            className="rounded-2xl px-4 py-3 text-xs md:text-sm backdrop-blur"
            style={{
              background: theme.cardSoft,
              border: `1px solid ${theme.borderSoft}`,
              boxShadow: theme.shadowSoft,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Users
                className="w-3.5 h-3.5"
                style={{ color: BRAND.accentOrange }}
              />
              <span
                className="uppercase text-[10px] tracking-[0.18em]"
                style={{ color: theme.textMuted }}
              >
                Crowd
              </span>
            </div>
            <div style={{ color: theme.textMain }}>
              {gym.vibe || "Mixed crowd · Traveller-friendly"}
            </div>
          </div>
          <div
            className="rounded-2xl px-4 py-3 text-xs md:text-sm backdrop-blur"
            style={{
              background: theme.cardSoft,
              border: `1px solid ${theme.borderSoft}`,
              boxShadow: theme.shadowSoft,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Shield
                className="w-3.5 h-3.5"
                style={{ color: BRAND.accentBlue }}
              />
              <span
                className="uppercase text-[10px] tracking-[0.18em]"
                style={{ color: theme.textMuted }}
              >
                Access
              </span>
            </div>
            <div style={{ color: theme.textMain }}>
              {isApproved ? "Instant QR activation" : "Awaiting verification"}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
         MAIN LAYOUT
         =================================================== */}
      <main className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid lg:grid-cols-[minmax(0,2fr)_minmax(260px,320px)] gap-10">
        {/* ================================================
           LEFT COLUMN
           ================================================ */}
        <section className="space-y-10">
          {/* STORY / DESCRIPTION */}
          <div>
            <h2
              className="text-xl md:text-2xl font-semibold mb-3"
              style={{ color: theme.textMain }}
            >
              Why this gym is perfect for{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${BRAND.accentBlue}, ${BRAND.accentOrange})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                one-day passes
              </span>
              .
            </h2>
            <p
              className="text-sm md:text-[15px] leading-relaxed"
              style={{ color: theme.textMuted }}
            >
              {gym.description ||
                "This space is built for focused sessions: solid equipment, a motivating atmosphere and coaches who actually care. Drop in for a day and you’ll still feel like a regular."}
            </p>

            {/* “What your pass includes” strip */}
            <div className="mt-4 grid sm:grid-cols-3 gap-3 text-[11px] md:text-xs">
              <div
                className="rounded-2xl px-3 py-3"
                style={{
                  background: theme.cardSoft,
                  border: `1px solid ${theme.borderSoft}`,
                }}
              >
                <div
                  className="font-semibold mb-1"
                  style={{ color: theme.textMain }}
                >
                  Full floor access
                </div>
                <p style={{ color: theme.textMuted }}>
                  Use weights, machines and functional area like a member.
                </p>
              </div>
              <div
                className="rounded-2xl px-3 py-3"
                style={{
                  background: theme.cardSoft,
                  border: `1px solid ${theme.borderSoft}`,
                }}
              >
                <div
                  className="font-semibold mb-1"
                  style={{ color: theme.textMain }}
                >
                  Guest support
                </div>
                <p style={{ color: theme.textMuted }}>
                  Staff know you’re coming via Passiify — no awkward front desk
                  sales pitch.
                </p>
              </div>
              <div
                className="rounded-2xl px-3 py-3"
                style={{
                  background: theme.cardSoft,
                  border: `1px solid ${theme.borderSoft}`,
                }}
              >
                <div
                  className="font-semibold mb-1"
                  style={{ color: theme.textMain }}
                >
                  Flexible timing
                </div>
                <p style={{ color: theme.textMuted }}>
                  Train anytime within venue hours for your selected day(s).
                </p>
              </div>
            </div>
          </div>

          {/* AMENITIES */}
          <div>
            <h3
              className="text-lg md:text-xl font-semibold mb-3 flex items-center gap-2"
              style={{ color: theme.textMain }}
            >
              <Sparkles
                className="w-4 h-4"
                style={{ color: BRAND.accentOrange }}
              />
              Amenities & facilities
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  label: "Climate controlled",
                  tag: "AC",
                  icon: <Droplet className="w-4 h-4" />,
                  desc: "Train without worrying about extreme heat.",
                },
                {
                  label: "Secure storage",
                  tag: "Lockers",
                  icon: <Shield className="w-4 h-4" />,
                  desc: "Lockers to keep your gear safe between sets.",
                },
                {
                  label: "Post-session reset",
                  tag: "Showers",
                  icon: <Droplet className="w-4 h-4" />,
                  desc: "Freshen up before your next stop in the city.",
                },
                {
                  label: "Stay connected",
                  tag: "WiFi",
                  icon: <Wifi className="w-4 h-4" />,
                  desc: "Perfect for remote workers and travellers.",
                },
                {
                  label: "Easy arrival",
                  tag: "Parking",
                  icon: <MapPin className="w-4 h-4" />,
                  desc: "Convenient parking or easy access from public transit.",
                },
                {
                  label: "Guided sessions",
                  tag: "Trainers",
                  icon: <Users className="w-4 h-4" />,
                  desc: "Get help with form, programming or first-time workouts.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl px-4 py-4 flex flex-col justify-between hover:-translate-y-[1px] transition-all"
                  style={{
                    background: theme.card,
                    border: `1px solid ${theme.borderSoft}`,
                    boxShadow: theme.shadowSoft,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            mode === "dark"
                              ? "rgba(15,23,42,0.9)"
                              : "rgba(248,250,252,1)",
                        }}
                      >
                        {item.icon}
                      </div>
                      <span
                        className="font-semibold"
                        style={{ color: theme.textMain }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span
                      className="text-[10px] px-2 py-[2px] rounded-full border font-semibold"
                      style={{
                        borderColor: "rgba(16,185,129,0.5)",
                        background: "rgba(16,185,129,0.08)",
                        color: "#6EE7B7",
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p
                    className="text-[11px]"
                    style={{ color: theme.textMuted }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* GALLERY */}
          <div>
            <h3
              className="text-lg md:text-xl font-semibold mb-3"
              style={{ color: theme.textMain }}
            >
              Space preview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleryImages.slice(0, 6).map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setActiveImage(i);
                    setGalleryOpen(true);
                  }}
                  className="relative group rounded-2xl overflow-hidden"
                  style={{
                    border: `1px solid ${theme.borderSoft}`,
                    background: theme.cardSoft,
                  }}
                >
                  <img
                    src={img}
                    alt={`${gym.name}-${i}`}
                    className="w-full h-32 sm:h-40 object-cover group-hover:scale-[1.05] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[11px] text-gray-100">
                    Tap to enlarge
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* LOCATION / ACCESS */}
          <div>
            <h3
              className="text-lg md:text-xl font-semibold mb-3"
              style={{ color: theme.textMain }}
            >
              Location & access
            </h3>
            <div
              className="rounded-2xl px-4 py-4 md:px-5 md:py-5 text-xs md:text-sm"
              style={{
                background: theme.card,
                border: `1px solid ${theme.borderSoft}`,
                boxShadow: theme.shadowSoft,
              }}
            >
              <p
                className="font-semibold"
                style={{ color: theme.textMain }}
              >
                {gym.address || "Address not provided"}
              </p>
              <p style={{ color: theme.textMuted }}>{gym.city}</p>
              <p className="mt-2" style={{ color: theme.textMuted }}>
                📞 {gym.phone || "Contact not provided"}
              </p>
              <p className="mt-1" style={{ color: theme.textMuted }}>
                🕒 {gym.openingHours || "6:00 AM – 10:00 PM"}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${gym.address || ""} ${gym.city || ""}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-[11px] px-3 py-1.5 rounded-full border transition"
                style={{
                  background:
                    mode === "dark"
                      ? "rgba(15,23,42,0.96)"
                      : "rgba(248,250,252,0.98)",
                  border: `1px solid ${theme.borderSoft}`,
                  color: theme.textMain,
                }}
              >
                <ExternalLink className="w-4 h-4" /> Open in Google Maps
              </a>
            </div>
          </div>

          {/* REVIEWS */}
          <div>
            <h3
              className="text-lg md:text-xl font-semibold mb-3 flex items-center gap-2"
              style={{ color: theme.textMain }}
            >
              <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />{" "}
              Member reviews
            </h3>

            {reviews.length === 0 ? (
              <p
                className="text-xs md:text-sm mb-4"
                style={{ color: theme.textMuted }}
              >
                No reviews yet. Be the first traveler to tell others what this
                spot really feels like.
              </p>
            ) : (
              <div className="space-y-3 mb-5">
                {reviews.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-2xl px-4 py-3 text-xs md:text-sm"
                    style={{
                      background: theme.card,
                      border: `1px solid ${theme.borderSoft}`,
                    }}
                  >
                    <p
                      className="font-semibold"
                      style={{ color: theme.textMain }}
                    >
                      {r.user?.name || "Member"}
                    </p>
                    <p className="text-yellow-300 text-[11px] mt-0.5">
                      ⭐ {r.rating}/5
                    </p>
                    <p
                      className="mt-1"
                      style={{ color: theme.textMuted }}
                    >
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* ADD REVIEW FORM */}
            <form
              onSubmit={handleReviewSubmit}
              className="rounded-2xl px-4 py-4 md:px-5 md:py-5 text-xs md:text-sm"
              style={{
                background: theme.card,
                border: `1px solid ${theme.borderSoft}`,
                boxShadow: theme.shadowSoft,
              }}
            >
              <h4
                className="font-semibold mb-3"
                style={{ color: theme.textMain }}
              >
                Share your experience
              </h4>
              <div className="flex items-center gap-1.5 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-6 h-6 cursor-pointer transition-transform ${
                      s <= rating
                        ? "scale-110"
                        : "hover:scale-110"
                    }`}
                    style={{
                      color:
                        s <= rating ? "#FACC15" : theme.textMuted,
                      fill: s <= rating ? "#FACC15" : "transparent",
                    }}
                    onClick={() => setRating(s)}
                  />
                ))}
              </div>
              <textarea
                placeholder="How was the vibe, equipment, crowd, coaches...?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="w-full rounded-xl px-3 py-2 text-xs md:text-sm resize-none focus:outline-none mb-3"
                style={{
                  background:
                    mode === "dark"
                      ? "rgba(15,23,42,0.96)"
                      : "rgba(248,250,252,0.98)",
                  border: `1px solid ${theme.borderSoft}`,
                  color: theme.textMain,
                }}
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 rounded-full text-[11px] md:text-xs font-semibold"
                style={{
                  backgroundImage: `linear-gradient(120deg, ${BRAND.accentBlue}, ${BRAND.accentOrange})`,
                  color: "#020617",
                  boxShadow: theme.shadowStrong,
                }}
              >
                Submit review
              </button>
            </form>
          </div>
        </section>

        {/* ================================================
           RIGHT COLUMN — BOOKING (premium)
           ================================================ */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div
            className="rounded-3xl px-5 py-5 md:px-6 md:py-6 backdrop-blur-2xl"
            style={{
              background: theme.card,
              border: `1px solid ${theme.borderSoft}`,
              boxShadow: theme.shadowStrong,
            }}
          >
            <h3
              className="text-base md:text-lg font-semibold mb-3"
              style={{ color: theme.textMain }}
            >
              Book your day-pass
            </h3>

            {/* PASS OPTIONS */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {gym.passes && gym.passes.length > 0 ? (
                gym.passes.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedPass(p)}
                    className="relative border rounded-xl px-3 py-2 text-[11px] md:text-xs font-semibold text-left transition"
                    style={{
                      borderColor:
                        selectedPass?.duration === p.duration
                          ? "transparent"
                          : theme.borderSoft,
                      background:
                        selectedPass?.duration === p.duration
                          ? `linear-gradient(120deg, ${BRAND.accentBlue}, ${BRAND.accentOrange})`
                          : mode === "dark"
                          ? "rgba(15,23,42,0.96)"
                          : "rgba(248,250,252,0.98)",
                      color:
                        selectedPass?.duration === p.duration
                          ? "#020617"
                          : theme.textMain,
                    }}
                  >
                    <div>{p.duration}-day</div>
                    <div
                      className="text-[11px] mt-0.5"
                      style={{
                        color:
                          selectedPass?.duration === p.duration
                            ? "#111827"
                            : theme.textMuted,
                      }}
                    >
                      ₹{p.price}
                    </div>
                    {bestValue && bestValue.duration === p.duration && (
                      <span className="absolute -top-2 right-2 text-[9px] bg-emerald-400 text-gray-900 px-2 py-[2px] rounded-full font-semibold">
                        Best value
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <p
                  className="text-[11px] col-span-2"
                  style={{ color: theme.textMuted }}
                >
                  No passes available right now.
                </p>
              )}
            </div>

            {/* PRICE DISPLAY */}
            {selectedPass && (
              <div className="flex items-center justify-between mb-3">
                <div
                  className="text-2xl font-bold"
                  style={{ color: theme.textMain }}
                >
                  ₹{selectedPass.price}
                </div>
                <span className="text-[10px] md:text-[11px] px-2 py-1 rounded-full border font-semibold"
                  style={{
                    borderColor: "rgba(16,185,129,0.5)",
                    background: "rgba(16,185,129,0.08)",
                    color: "#6EE7B7",
                  }}
                >
                  {selectedPass.duration}-day pass
                </span>
              </div>
            )}

            <p
              className="text-[11px] mb-4"
              style={{ color: theme.textMuted }}
            >
              Instant digital QR · Show at the front desk · No long-term
              lock-ins.
            </p>

            {/* DATE PICKER */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-[11px] md:text-xs font-medium mb-2"
                style={{ color: theme.textMain }}
              >
                <CalendarDays
                  className="w-4 h-4"
                  style={{ color: BRAND.accentOrange }}
                />
                Choose when you want to train
              </label>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {quickDates.map((d) => {
                  const isActive = selectedDate === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setSelectedDate(d.key)}
                      className="rounded-xl border px-2 py-1.5 text-[10px] md:text-[11px] flex flex-col items-center gap-0.5 transition"
                      style={{
                        borderColor: isActive
                          ? "transparent"
                          : theme.borderSoft,
                        background: isActive
                          ? `linear-gradient(120deg, ${BRAND.accentBlue}, ${BRAND.accentOrange})`
                          : mode === "dark"
                          ? "rgba(15,23,42,0.96)"
                          : "rgba(248,250,252,0.98)",
                        color: isActive ? "#020617" : theme.textMain,
                      }}
                    >
                      <span className="font-semibold">{d.dayLabel}</span>
                      <span
                        className="text-[10px]"
                        style={{ color: isActive ? "#111827" : theme.textMuted }}
                      >
                        {d.dateLabel} {d.monthLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[10px]"
                  style={{ color: theme.textMuted }}
                >
                  Need another date?
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-full px-3 py-1.5 text-[11px] focus:outline-none"
                  style={{
                    background:
                      mode === "dark"
                        ? "rgba(15,23,42,0.96)"
                        : "rgba(248,250,252,0.98)",
                    border: `1px solid ${theme.borderSoft}`,
                    color: theme.textMain,
                  }}
                />
              </div>
            </div>

            {/* TRUST POINTS */}
            <ul className="space-y-1.5 text-[11px] md:text-xs mb-5">
              <li className="flex items-center gap-2">
                <ShieldCheck
                  className="w-4 h-4"
                  style={{ color: "#22C55E" }}
                />{" "}
                <span style={{ color: theme.textMuted }}>
                  Verified Passiify partner
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ThumbsUp
                  className="w-4 h-4"
                  style={{ color: BRAND.accentOrange }}
                />{" "}
                <span style={{ color: theme.textMuted }}>
                  Loved by travellers & locals
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CreditCard
                  className="w-4 h-4"
                  style={{ color: BRAND.accentBlue }}
                />{" "}
                <span style={{ color: theme.textMuted }}>
                  UPI, cards & wallets — encrypted payments
                </span>
              </li>
            </ul>

            {/* BOOK BUTTON */}
            <button
              onClick={handleBooking}
              disabled={bookingLoading || !isApproved}
              className="w-full py-2.5 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center transition"
              style={{
                backgroundImage: isApproved
                  ? `linear-gradient(120deg, ${BRAND.accentBlue}, ${BRAND.accentOrange})`
                  : "none",
                backgroundColor: !isApproved
                  ? "rgba(148,163,184,0.24)"
                  : undefined,
                color: isApproved ? "#020617" : theme.textMuted,
                boxShadow: isApproved ? theme.shadowStrong : "none",
                cursor: isApproved ? "pointer" : "not-allowed",
                opacity: bookingLoading ? 0.85 : 1,
              }}
            >
              {bookingLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Booking…
                </>
              ) : !isApproved ? (
                "Awaiting verification"
              ) : selectedPass ? (
                `Book ${selectedPass.duration}-day pass`
              ) : (
                "Select a pass to book"
              )}
            </button>
          </div>
        </aside>
      </main>

      {/* ===================================================
         TRUST FOOTER STRIP
         =================================================== */}
      <section
        className="border-t mt-4"
        style={{ borderColor: theme.borderSoft }}
      >
        <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-6 text-center text-[11px] md:text-xs">
          <div>
            <Shield
              className="mx-auto w-7 h-7 mb-2"
              style={{ color: BRAND.accentBlue }}
            />
            <h4
              className="font-semibold mb-1"
              style={{ color: theme.textMain }}
            >
              Verified gyms
            </h4>
            <p style={{ color: theme.textMuted }}>
              Screened partners so you don&apos;t waste sessions.
            </p>
          </div>
          <div>
            <CreditCard
              className="mx-auto w-7 h-7 mb-2"
              style={{ color: BRAND.accentOrange }}
            />
            <h4
              className="font-semibold mb-1"
              style={{ color: theme.textMain }}
            >
              Secure payments
            </h4>
            <p style={{ color: theme.textMuted }}>
              UPI, cards & wallets, processed safely.
            </p>
          </div>
          <div>
            <Award
              className="mx-auto w-7 h-7 mb-2"
              style={{ color: BRAND.accentBlue }}
            />
            <h4
              className="font-semibold mb-1"
              style={{ color: theme.textMain }}
            >
              Top rated spots
            </h4>
            <p style={{ color: theme.textMuted }}>
              High-performing spaces stay, others fade out.
            </p>
          </div>
          <div>
            <Users
              className="mx-auto w-7 h-7 mb-2"
              style={{ color: BRAND.accentOrange }}
            />
            <h4
              className="font-semibold mb-1"
              style={{ color: theme.textMain }}
            >
              Built for travellers
            </h4>
            <p style={{ color: theme.textMuted }}>
              One-day passes so your routine travels with you.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
         GALLERY MODAL
         =================================================== */}
      {galleryOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
          <button
            onClick={() => setGalleryOpen(false)}
            className="absolute top-5 right-5 text-white text-2xl font-bold"
          >
            ✕
          </button>
          <img
            src={galleryImages[activeImage]}
            alt="active"
            className="max-w-4xl w-full max-h-[80vh] object-contain rounded-2xl border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,1)]"
          />
        </div>
      )}

      {/* ===================================================
         SUCCESS TOAST
         =================================================== */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div
            className="px-6 py-5 rounded-2xl text-center"
            style={{
              background:
                mode === "dark"
                  ? "rgba(15,23,42,0.98)"
                  : "rgba(255,255,255,0.98)",
              border: "1px solid rgba(16,185,129,0.5)",
              boxShadow: theme.shadowStrong,
            }}
          >
            <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
            <h3
              className="text-sm md:text-base font-semibold mb-1"
              style={{ color: theme.textMain }}
            >
              Booking confirmed!
            </h3>
            <p
              className="text-[11px] md:text-xs"
              style={{ color: theme.textMuted }}
            >
              We&apos;re taking you to your booking details now.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
