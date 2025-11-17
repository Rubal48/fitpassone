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
   THEME TOKENS — Passiify "Sunset Nomad" brand
   ========================================================= */
const THEME = {
  bg: "#050308",
  accent1: "#FF4B5C",
  accent2: "#FF9F68",
  borderSoft: "rgba(245, 213, 189, 0.22)",
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
      dayLabel: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short" }),
      dateLabel: d.getDate(),
      monthLabel: d.toLocaleDateString("en-IN", { month: "short" }),
    });
  }
  return arr;
};

export default function GymDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // -------------------------------------------------------
  // STATE
  // -------------------------------------------------------
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

  // -------------------------------------------------------
  // FETCH GYM + REVIEWS
  // -------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gymRes, reviewRes] = await Promise.all([
          API.get(`/gyms/${id}`),
          API.get(`/reviews/${id}`),
        ]);

        const gymData = gymRes.data;

        // Normalize dynamic custom pricing to passes array
        if (gymData.customPrice && !gymData.passes) {
          gymData.passes = Object.entries(gymData.customPrice).map(
            ([duration, price]) => ({
              duration: Number(duration),
              price: Number(price),
            })
          );
        }

        setGym(gymData);
        setReviews(reviewRes.data);
        if (gymData.passes?.length) setSelectedPass(gymData.passes[0]);
      } catch (err) {
        console.error("❌ Error fetching gym:", err);
        setError("Could not load gym details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // -------------------------------------------------------
  // BOOKING HANDLER
  // -------------------------------------------------------
  const handleBooking = async () => {
    try {
      setBookingLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first!");
        navigate("/login");
        return;
      }

      if (!selectedPass) {
        alert("Please select a pass first!");
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
        1500
      );
    } catch (error) {
      console.error("❌ Booking failed:", error);
      alert("Booking failed. Try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  // -------------------------------------------------------
  // REVIEW HANDLER
  // -------------------------------------------------------
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
      setReviews(res.data);
    } catch (err) {
      console.error("Error posting review:", err);
      alert("Could not post review. Try again later.");
    }
  };

  // -------------------------------------------------------
  // LOADING / ERROR
  // -------------------------------------------------------
  if (loading) {
    return (
      <div
        className="min-h-screen flex justify-center items-center text-gray-200"
        style={{ backgroundColor: THEME.bg }}
      >
        <Loader2 className="w-6 h-6 animate-spin text-orange-300 mr-2" />
        Loading gym details...
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div
        className="min-h-screen flex flex-col justify-center items-center text-gray-200"
        style={{ backgroundColor: THEME.bg }}
      >
        <p className="text-sm md:text-base">⚠️ {error || "Gym not found."}</p>
        <Link
          to="/explore"
          className="mt-4 rounded-full text-xs md:text-sm font-semibold px-5 py-2 bg-white text-gray-900"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------
  // DERIVED DATA
  // -------------------------------------------------------
  const galleryImages =
    gym.images && gym.images.length > 0
      ? gym.images.map((img) =>
          img.startsWith("http") ? img : `http://localhost:5000${img}`
        )
      : [
          "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg",
          "https://images.pexels.com/photos/7031707/pexels-photo-7031707.jpeg",
        ];

  let bestValue = null;
  if (gym.passes?.length > 1) {
    const withPerDay = gym.passes.map((p) => ({
      ...p,
      perDay: p.price / p.duration,
    }));
    bestValue = withPerDay.reduce((a, b) => (a.perDay < b.perDay ? a : b));
  }

  const minPassPrice =
    gym.passes && gym.passes.length
      ? Math.min(...gym.passes.map((p) => Number(p.price) || 0))
      : null;

  const isApproved =
    gym.status && gym.status.toLowerCase().trim() === "approved";

  // =======================================================
  // RENDER
  // =======================================================
  return (
    <div
      className="min-h-screen text-gray-100"
      style={{
        backgroundColor: THEME.bg,
        backgroundImage:
          "radial-gradient(circle at top, rgba(248, 216, 181, 0.16), transparent 55%)",
      }}
    >
      {/* ===================================================
         HERO — Cinematic with overlay + title
         =================================================== */}
      <section className="relative w-full h-[56vh] md:h-[62vh] overflow-hidden">
        <img
          src={galleryImages[0]}
          alt={gym.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -bottom-40 -right-40 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
            style={{ background: THEME.accent1 }}
          />
          <div
            className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full blur-3xl opacity-32"
            style={{ background: THEME.accent2 }}
          />
        </div>

        <div className="absolute inset-x-6 md:inset-x-12 bottom-10 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 border border-white/20 mb-3">
            {gym.verified && (
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            )}
            <span className="text-[10px] uppercase tracking-[0.22em] text-gray-100">
              Passiify partner · Day-pass ready
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl lg:text-[2.7rem] font-black tracking-tight text-white">
            {gym.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-200">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-4 h-4 text-orange-200" />
              {gym.city || "Location TBA"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-300" />
              {gym.rating
                ? `${gym.rating.toFixed(1)} · traveler rated`
                : "New on Passiify"}
            </span>
            {minPassPrice && (
              <span className="inline-flex items-center gap-1">
                <CreditCard className="w-4 h-4 text-emerald-300" />
                From ₹{minPassPrice} / day pass
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ===================================================
         QUICK FACTS STRIP
         =================================================== */}
      <section className="max-w-6xl mx-auto px-6 -mt-6 md:-mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-black/75 border border-white/15 px-4 py-3 text-xs md:text-sm">
            <div className="flex items-center gap-2 mb-1 text-gray-300">
              <Clock className="w-3.5 h-3.5 text-orange-200" />
              <span className="uppercase text-[10px] tracking-[0.18em] text-gray-500">
                Hours
              </span>
            </div>
            <div className="text-gray-100">
              {gym.openingHours || "6:00 AM – 10:00 PM"}
            </div>
          </div>
          <div className="rounded-2xl bg-black/75 border border-white/15 px-4 py-3 text-xs md:text-sm">
            <div className="flex items-center gap-2 mb-1 text-gray-300">
              <Dumbbell className="w-3.5 h-3.5 text-orange-200" />
              <span className="uppercase text-[10px] tracking-[0.18em] text-gray-500">
                Style
              </span>
            </div>
            <div className="text-gray-100">
              {gym.type || "Strength · Conditioning"}
            </div>
          </div>
          <div className="rounded-2xl bg-black/75 border border-white/15 px-4 py-3 text-xs md:text-sm">
            <div className="flex items-center gap-2 mb-1 text-gray-300">
              <Users className="w-3.5 h-3.5 text-orange-200" />
              <span className="uppercase text-[10px] tracking-[0.18em] text-gray-500">
                Crowd
              </span>
            </div>
            <div className="text-gray-100">
              {gym.vibe || "Mixed crowd · Traveller friendly"}
            </div>
          </div>
          <div className="rounded-2xl bg-black/75 border border-white/15 px-4 py-3 text-xs md:text-sm">
            <div className="flex items-center gap-2 mb-1 text-gray-300">
              <Shield className="w-3.5 h-3.5 text-orange-200" />
              <span className="uppercase text-[10px] tracking-[0.18em] text-gray-500">
                Access
              </span>
            </div>
            <div className="text-gray-100">
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
            <h2 className="text-xl md:text-2xl font-semibold text-gray-50 mb-3">
              Why this gym works for{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${THEME.accent2}, ${THEME.accent1})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                one-day passes
              </span>
              .
            </h2>
            <p className="text-sm md:text-[15px] text-gray-300 leading-relaxed">
              {gym.description ||
                "This space is built for focused sessions: solid equipment, a motivating atmosphere and coaches who actually care. Drop in for a day and you’ll still feel like a regular."}
            </p>
          </div>

          {/* AMENITIES — NEW PREMIUM STYLE */}
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-50 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-200" />
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
                  desc: "Perfect if you’re working or travelling while training.",
                },
                {
                  label: "Easy arrival",
                  tag: "Parking",
                  icon: <MapPin className="w-4 h-4" />,
                  desc: "No stress about where to leave your ride.",
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
                  className="rounded-2xl border border-white/15 bg-black/65 px-4 py-4 flex flex-col justify-between hover:border-white/35 hover:-translate-y-[1px] hover:shadow-[0_18px_60px_rgba(0,0,0,1)] transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs text-gray-100">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    <span className="text-[10px] px-2 py-[2px] rounded-full border border-emerald-300/40 text-emerald-200 bg-emerald-500/10">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* GALLERY */}
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-50 mb-3">
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
                  className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black/40"
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

          {/* ADDRESS / MAP */}
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-50 mb-3">
              Location & access
            </h3>
            <div className="rounded-2xl border border-white/15 bg-black/65 px-4 py-4 md:px-5 md:py-5 text-xs md:text-sm">
              <p className="font-semibold text-gray-50">{gym.address}</p>
              <p className="text-gray-300">{gym.city}</p>
              <p className="mt-2 text-gray-400">
                📞 {gym.phone || "Contact details not provided"}
              </p>
              <p className="mt-1 text-gray-400">
                🕒 {gym.openingHours || "6:00 AM – 10:00 PM"}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${gym.address || ""} ${gym.city || ""}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-[11px] px-3 py-1.5 rounded-full bg-white/5 border border-white/20 text-gray-100 hover:bg-white/10 transition"
              >
                <ExternalLink className="w-4 h-4" /> Open in Google Maps
              </a>
            </div>
          </div>

          {/* REVIEWS */}
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-50 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-300" /> Member reviews
            </h3>

            {reviews.length === 0 ? (
              <p className="text-xs md:text-sm text-gray-400 mb-4">
                No reviews yet. Be the first one to tell other travellers what
                this spot really feels like.
              </p>
            ) : (
              <div className="space-y-3 mb-5">
                {reviews.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs md:text-sm"
                  >
                    <p className="font-semibold text-gray-50">
                      {r.user?.name || "Anonymous"}
                    </p>
                    <p className="text-yellow-300 text-[11px] mt-0.5">
                      ⭐ {r.rating}/5
                    </p>
                    <p className="text-gray-300 mt-1">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ADD REVIEW FORM */}
            <form
              onSubmit={handleReviewSubmit}
              className="rounded-2xl border border-white/15 bg-black/65 px-4 py-4 md:px-5 md:py-5 text-xs md:text-sm"
            >
              <h4 className="font-semibold text-gray-50 mb-3">
                Share your experience
              </h4>
              <div className="flex items-center gap-1.5 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-6 h-6 cursor-pointer transition-transform ${
                      s <= rating
                        ? "text-yellow-300 scale-110"
                        : "text-gray-500 hover:text-yellow-300"
                    }`}
                    onClick={() => setRating(s)}
                  />
                ))}
              </div>
              <textarea
                placeholder="How was the vibe, equipment, crowd, coaches...?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs md:text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/40 mb-3"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 rounded-full text-[11px] md:text-xs font-semibold bg-white text-gray-900 hover:scale-[1.02] shadow-[0_12px_40px_rgba(0,0,0,0.9)] transition"
              >
                Submit review
              </button>
            </form>
          </div>
        </section>

        {/* ================================================
           RIGHT COLUMN — BOOKING (with PREMIUM CALENDAR)
           ================================================ */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div
            className="rounded-3xl bg-black/75 backdrop-blur-2xl border shadow-[0_22px_70px_rgba(0,0,0,1)] px-5 py-5 md:px-6 md:py-6"
            style={{ borderColor: THEME.borderSoft }}
          >
            <h3 className="text-base md:text-lg font-semibold text-gray-50 mb-3">
              Choose your pass
            </h3>

            {/* PASS OPTIONS */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {gym.passes && gym.passes.length > 0 ? (
                gym.passes.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedPass(p)}
                    className={`relative border rounded-xl px-3 py-2 text-[11px] md:text-xs font-semibold text-left transition ${
                      selectedPass?.duration === p.duration
                        ? "border-white bg-white/10 text-gray-50"
                        : "border-white/20 bg-black/40 text-gray-200 hover:border-white/40"
                    }`}
                  >
                    <div>{p.duration}-day</div>
                    <div className="text-[11px] text-gray-300">
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
                <p className="text-[11px] text-gray-400 col-span-2">
                  No passes available right now.
                </p>
              )}
            </div>

            {/* PRICE DISPLAY */}
            {selectedPass && (
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl font-bold text-gray-50">
                  ₹{selectedPass.price}
                </div>
                <span className="text-[10px] md:text-[11px] text-emerald-300 bg-emerald-500/15 border border-emerald-400/40 px-2 py-1 rounded-full font-semibold">
                  {selectedPass.duration}-day pass
                </span>
              </div>
            )}

            <p className="text-[11px] text-gray-400 mb-4">
              Instant digital pass · Show at the front desk · No long-term
              lock-ins.
            </p>

            {/* PREMIUM DATE PICKER (QUICK CALENDAR + NATIVE) */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-[11px] md:text-xs font-medium text-gray-200 mb-2">
                <CalendarDays className="w-4 h-4 text-orange-200" />
                Choose when you want to train
              </label>

              {/* Quick calendar chips */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {quickDates.map((d) => {
                  const isActive = selectedDate === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setSelectedDate(d.key)}
                      className={`rounded-xl border px-2 py-1.5 text-[10px] md:text-[11px] flex flex-col items-center gap-0.5 transition ${
                        isActive
                          ? "border-white bg-white text-gray-900"
                          : "border-white/20 bg-black/40 text-gray-200 hover:border-white/50"
                      }`}
                    >
                      <span className="font-semibold">{d.dayLabel}</span>
                      <span className="text-[10px] text-gray-500 md:text-[11px]">
                        {d.dateLabel} {d.monthLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Native date input (always works even if calendar UI fails) */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-gray-500">
                  Need a different date?
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-black/40 border border-white/25 rounded-full px-3 py-1.5 text-[11px] text-gray-100 focus:outline-none focus:border-white/60"
                />
              </div>
            </div>

            {/* TRUST POINTS */}
            <ul className="space-y-1.5 text-[11px] md:text-xs text-gray-300 mb-5">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300" /> Verified
                gym partner
              </li>
              <li className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-orange-200" /> Loved by
                travellers & locals
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-200" /> Check-in according
                to venue hours
              </li>
            </ul>

            {/* BOOK BUTTON */}
            <button
              onClick={handleBooking}
              disabled={bookingLoading || !isApproved}
              className={`w-full py-2.5 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center transition ${
                !isApproved
                  ? "bg-white/10 text-gray-400 cursor-not-allowed"
                  : "text-gray-900 shadow-[0_18px_60px_rgba(0,0,0,0.95)] hover:scale-[1.01]"
              }`}
              style={
                isApproved
                  ? {
                      backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
                    }
                  : {}
              }
            >
              {bookingLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Booking...
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
         TRUST BAND / FOOTER STRIP
         =================================================== */}
      <section className="border-t border-white/10 bg-black/80">
        <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-6 text-center text-[11px] md:text-xs text-gray-200">
          <div>
            <Shield className="mx-auto w-7 h-7 text-orange-200 mb-2" />
            <h4 className="font-semibold text-gray-50 mb-1">Verified gyms</h4>
            <p className="text-gray-400">
              Screened partners so you don&apos;t waste sessions.
            </p>
          </div>
          <div>
            <CreditCard className="mx-auto w-7 h-7 text-orange-200 mb-2" />
            <h4 className="font-semibold text-gray-50 mb-1">
              Secure payments
            </h4>
            <p className="text-gray-400">
              UPI, cards & wallets, encrypted and safe.
            </p>
          </div>
          <div>
            <Award className="mx-auto w-7 h-7 text-orange-200 mb-2" />
            <h4 className="font-semibold text-gray-50 mb-1">Top rated</h4>
            <p className="text-gray-400">
              High-performing spaces stay, others fade out.
            </p>
          </div>
          <div>
            <Users className="mx-auto w-7 h-7 text-orange-200 mb-2" />
            <h4 className="font-semibold text-gray-50 mb-1">
              Built for travellers
            </h4>
            <p className="text-gray-400">
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
          <div className="bg-black/80 border border-emerald-400/40 px-6 py-5 rounded-2xl shadow-[0_22px_70px_rgba(0,0,0,1)] text-center">
            <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
            <h3 className="text-sm md:text-base font-semibold text-gray-50 mb-1">
              Booking confirmed!
            </h3>
            <p className="text-[11px] md:text-xs text-gray-300">
              We&apos;re taking you to your booking details now.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
