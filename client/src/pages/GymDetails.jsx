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
import { Helmet } from "react-helmet";
import API from "../utils/api";

/* =========================================================
   GLOBAL PASSIIFY THEME — same as Home / Explore / Booking
   ========================================================= */

const THEME = {
  accentFrom: "#2563EB", // blue-600
  accentMid: "#0EA5E9", // sky-500
  accentTo: "#F97316", // orange-500,

  light: {
    mode: "light",
    bg: "#F4F5FB",
    card: "rgba(255,255,255,0.96)",
    cardSoft: "rgba(248,250,252,0.98)",
    textMain: "#020617",
    textMuted: "#6B7280",
    borderSoft: "rgba(148,163,184,0.38)",
    shadowStrong: "0 34px 110px rgba(15,23,42,0.22)",
    shadowSoft: "0 20px 70px rgba(15,23,42,0.12)",
  },
  dark: {
    mode: "dark",
    bg: "#020617",
    card: "rgba(15,23,42,0.96)",
    cardSoft: "rgba(15,23,42,0.92)",
    textMain: "#E5E7EB",
    textMuted: "#9CA3AF",
    borderSoft: "rgba(148,163,184,0.55)",
    shadowStrong: "0 40px 140px rgba(0,0,0,0.9)",
    shadowSoft: "0 24px 90px rgba(15,23,42,0.9)",
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
  };
};

/* ---------- 🔗 Media URL builder (backend + CDN + Cloudinary) ---------- */

const fallbackGalleryImages = [
  "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/7031707/pexels-photo-7031707.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/4754142/pexels-photo-4754142.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

const getBackendOrigin = () => {
  if (!API?.defaults?.baseURL) return "";
  // e.g. "https://passiify.onrender.com/api" -> "https://passiify.onrender.com"
  return API.defaults.baseURL.replace(/\/api\/?$/, "").replace(/\/$/, "");
};

// Try to read a URL out of any shape (string | obj | array)
const extractImageValue = (value) => {
  if (!value) return null;

  // direct string
  if (typeof value === "string") return value;

  // array: pick first usable
  if (Array.isArray(value)) {
    for (const item of value) {
      const fromItem = extractImageValue(item);
      if (fromItem) return fromItem;
    }
    return null;
  }

  // object from Cloudinary / multer / S3, etc.
  if (typeof value === "object") {
    return (
      value.url || // { url: "https://..." } or "/uploads/..."
      value.secure_url ||
      value.path || // multer: { path: "uploads/gyms/..." }
      value.location ||
      value.key ||
      value.filename ||
      null
    );
  }

  return null;
};

const normalizeRelativePath = (rawPath) => {
  if (!rawPath) return null;
  let p = String(rawPath).trim();

  // already absolute URL
  if (p.startsWith("http://") || p.startsWith("https://")) return p;

  // fix Windows slashes and strip "public/"
  p = p.replace(/\\/g, "/");
  p = p.replace(/^public\//, "");
  p = p.replace(/^\/+/, ""); // remove starting "/"
  return p || null;
};

const buildMediaUrl = (raw) => {
  const extracted = extractImageValue(raw);
  if (!extracted) return null;

  // full URL (Cloudinary, S3, etc.)
  if (typeof extracted === "string" && extracted.startsWith("http")) {
    return extracted;
  }

  const origin = getBackendOrigin();
  const clean = normalizeRelativePath(extracted);
  if (!clean) return null;

  // If backend origin unknown, fall back to same origin
  return origin ? `${origin}/${clean}` : `/${clean}`;
};

const getGalleryImages = (gym) => {
  if (!gym) return fallbackGalleryImages;

  const candidates = [];

  // Prefer hero/cover/banner fields first
  if (gym.heroImage) candidates.push(gym.heroImage);
  if (gym.coverImage) candidates.push(gym.coverImage);
  if (gym.bannerImage) candidates.push(gym.bannerImage);
  if (gym.mainImage) candidates.push(gym.mainImage);

  // Then common arrays
  if (Array.isArray(gym.images) && gym.images.length) {
    candidates.push(...gym.images);
  }
  if (Array.isArray(gym.media) && gym.media.length) {
    candidates.push(...gym.media);
  }
  if (Array.isArray(gym.gallery) && gym.gallery.length) {
    candidates.push(...gym.gallery);
  }

  // Fallback: single image field
  if (!candidates.length && gym.image) {
    candidates.push(gym.image);
  }

  const mapped = candidates.map((item) => buildMediaUrl(item)).filter(Boolean);

  if (mapped.length) return mapped;

  return fallbackGalleryImages;
};

/* ---------- 🧮 Helpers for numbers & passes ---------- */

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

const normalizePasses = (rawPasses, gym) => {
  const passes = Array.isArray(rawPasses) ? rawPasses : [];
  if (!passes.length && gym?.customPrice) {
    // Old customPrice → passes shape
    return Object.entries(gym.customPrice).map(([duration, price]) => {
      const d = Number(duration) || 1;
      const basePrice = pickNumber(price, gym.basePrice, gym.price);
      return {
        duration: d,
        durationDays: d,
        basePrice,
        salePrice: basePrice,
        price: basePrice,
        discountPercent: 0,
        isActive: true,
        label: `${d}-day pass`,
      };
    });
  }

  return passes
    .filter((p) => p && p.isActive !== false) // treat undefined as active
    .map((p) => {
      const duration = pickNumber(p.durationDays, p.duration) || 1;

      const basePrice = pickNumber(
        p.basePrice,
        p.price,
        gym?.basePrice,
        gym?.price
      );

      let salePrice = pickNumber(p.salePrice, p.price, basePrice);
      if (!salePrice && basePrice) salePrice = basePrice;

      let discountPercent =
        typeof p.discountPercent === "number" ? p.discountPercent : 0;

      if (basePrice && salePrice && salePrice < basePrice && !discountPercent) {
        discountPercent = Math.round(
          ((basePrice - salePrice) / basePrice) * 100
        );
      }

      const label =
        p.name || p.offerLabel || gym?.offerLabel || `${duration}-day pass`;

      return {
        ...p,
        duration,
        durationDays: duration,
        basePrice,
        salePrice,
        price: salePrice || basePrice,
        discountPercent,
        label,
      };
    });
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

/* Opening hours helpers — supports string OR Mon–Sun object from PartnerWithUs */

const DAY_CONFIG = [
  { key: "monday", label: "Monday", short: "Mon", jsDay: 1 },
  { key: "tuesday", label: "Tuesday", short: "Tue", jsDay: 2 },
  { key: "wednesday", label: "Wednesday", short: "Wed", jsDay: 3 },
  { key: "thursday", label: "Thursday", short: "Thu", jsDay: 4 },
  { key: "friday", label: "Friday", short: "Fri", jsDay: 5 },
  { key: "saturday", label: "Saturday", short: "Sat", jsDay: 6 },
  { key: "sunday", label: "Sunday", short: "Sun", jsDay: 0 },
];

const normalizeOpeningHours = (openingHoursInput) => {
  if (!openingHoursInput) return null;

  // Unwrap potential nested containers from PartnerWithUs
  let openingHours = openingHoursInput;
  if (
    typeof openingHours === "object" &&
    openingHours !== null &&
    !Array.isArray(openingHours)
  ) {
    if (openingHours.days) openingHours = openingHours.days;
    else if (openingHours.week) openingHours = openingHours.week;
    else if (openingHours.schedule) openingHours = openingHours.schedule;
    else if (openingHours.slots) openingHours = openingHours.slots;
  }

  // Old data: simple string like "6:00 AM – 10:00 PM"
  if (typeof openingHours === "string") {
    return {
      isStructured: false,
      label: openingHours,
    };
  }

  // New data: object from PartnerWithUs (monday/tuesday/... with open/close/closed)
  if (
    typeof openingHours === "object" &&
    openingHours !== null &&
    !Array.isArray(openingHours)
  ) {
    let hasAnyOpen = false;

    const list = DAY_CONFIG.map((day) => {
      // Support case-variants and a few alternative shapes
      const raw =
        openingHours[day.key] ||
        openingHours[day.key.toUpperCase()] ||
        openingHours[day.key[0].toUpperCase() + day.key.slice(1)] ||
        null;

      let data = raw;
      let closed = false;
      let open = "";
      let close = "";

      if (typeof data === "string") {
        // Some backends may store "6:00 AM – 10:00 PM" directly per day
        open = data;
        close = "";
      } else if (typeof data === "object" && data !== null) {
        open = data.open || data.openTime || data.from || "";
        close = data.close || data.closeTime || data.to || "";
        closed = !!data.closed;
      }

      const hasTimes = open && close;
      const isClosed = closed || !hasTimes;

      if (!isClosed) hasAnyOpen = true;

      return {
        ...day,
        closed: isClosed,
        open,
        close,
        raw,
      };
    });

    const hasAnyDayConfigured =
      Object.keys(openingHours).length > 0 || hasAnyOpen;

    return {
      isStructured: true,
      list,
      hasAnyOpen: hasAnyOpen || hasAnyDayConfigured,
    };
  }

  // Fallback: treat anything else as a simple string
  return {
    isStructured: false,
    label: String(openingHoursInput),
  };
};

// Helper: find opening hours field regardless of exact key
const extractOpeningHoursSource = (gym) => {
  if (!gym) return null;
  return (
    gym.openingHours ||
    gym.operatingHours ||
    gym.operating_hours ||
    gym.hours ||
    gym.timings ||
    null
  );
};

/* Helper: load Razorpay SDK safely for SPA navigation */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/* Helper: follow system dark / light */
const getSystemMode = () => {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/* ---------- Amenity icon map (wired with PartnerWithUs facilities) ---------- */

const AMENITY_ICON_MAP = {
  WiFi: Wifi,
  Wifi: Wifi,
  wifi: Wifi,
  wifi_zone: Wifi,
  Parking: MapPin,
  "Car Parking": MapPin,
  "Bike Parking": MapPin,
  AC: Droplet,
  "Air Conditioning": Droplet,
  Showers: Droplet,
  "Changing Rooms": Droplet,
  Lockers: Shield,
  "Cardio Zone": Dumbbell,
  "Free Weights": Dumbbell,
  "Machine Weights": Dumbbell,
  "CrossFit / Functional Area": Dumbbell,
  "Turf / Sled Track": Dumbbell,
  "Personal Training": Users,
  "Group Classes": Users,
  "Yoga Room": Users,
  "MMA / Boxing Ring": Users,
  "Cafeteria / Shake Bar": Users,
  "Women-Only Section": Users,
};

const FALLBACK_AMENITIES = [
  "WiFi",
  "Parking",
  "AC",
  "Showers",
  "Lockers",
  "Personal Training",
];

export default function GymDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* -------------------------------------------------------
     THEME (light/dark) — auto-follow system
     ------------------------------------------------------- */
  const [mode, setMode] = useState(getSystemMode);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e) => setMode(e.matches ? "dark" : "light");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

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
  const [bookingError, setBookingError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedPass, setSelectedPass] = useState(null);

  const quickDates = useMemo(() => buildQuickDates(7), []);

  // 🔁 Normalised opening hours (supports both string + structured object)
  const normalizedHours = useMemo(
    () => normalizeOpeningHours(extractOpeningHoursSource(gym)),
    [gym]
  );

  // "Monday · 6:00 AM – 10:00 PM" label for hero + quick facts + location
  const todayHoursLabel = useMemo(() => {
    if (!normalizedHours) return null;

    if (!normalizedHours.isStructured) {
      // old string form
      return normalizedHours.label;
    }

    if (!normalizedHours.hasAnyOpen) {
      // nothing filled yet in partner form → don't show "Closed"
      return null;
    }

    const jsDay = new Date().getDay(); // 0 = Sun ... 6 = Sat
    const today = normalizedHours.list.find((d) => d.jsDay === jsDay);

    if (!today) return null;

    if (today.closed) {
      return `${today.label} · Closed`;
    }

    if (today.open && today.close) {
      return `${today.label} · ${today.open} – ${today.close}`;
    }

    if (typeof today.raw === "string" && today.raw.trim()) {
      return `${today.label} · ${today.raw}`;
    }

    if (today.open) {
      return `${today.label} · ${today.open}`;
    }

    return null;
  }, [normalizedHours]);

  const hasStructuredHours =
    !!normalizedHours?.isStructured && !!normalizedHours?.hasAnyOpen;

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

        const gymData = gymRes.data || {};

        // Normalise passes to new model (with fallback for old customPrice)
        const normalisedPasses = normalizePasses(gymData.passes, gymData);
        gymData.passes = normalisedPasses;

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
     BOOKING HANDLER — via Razorpay
     ------------------------------------------------------- */
  const handleBooking = async () => {
    setBookingError("");

    try {
      if (!gym) {
        setBookingError("Gym details are still loading. Please wait a moment.");
        return;
      }

      if (!selectedPass) {
        setBookingError("Please select a pass first.");
        return;
      }

      if (!selectedDate) {
        setBookingError("Please choose the date you want to train.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first to book a pass.");
        navigate("/login");
        return;
      }

      setBookingLoading(true);

      // Ensure Razorpay SDK is available (SPA-safe)
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        setBookingLoading(false);
        setBookingError(
          "Payment SDK couldn’t load. Check your connection and try again."
        );
        return;
      }

      const gymId = gym?._id || id;
      const passDuration =
        selectedPass.duration || selectedPass.durationDays || 1;
      const effectivePrice = pickNumber(
        selectedPass.salePrice,
        selectedPass.price,
        selectedPass.basePrice
      );

      // Step 1: Create Razorpay order via your backend
      const createPayload = {
        gymId,
        date: selectedDate,
        duration: passDuration,
        price: effectivePrice,
      };

      const { data } = await API.post(
        "/payments/gym/create-order",
        createPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!data?.success || !data?.order) {
        console.error("create-order failed:", data);
        setBookingError(
          data?.message || "Unable to start payment. Please try again."
        );
        setBookingLoading(false);
        return;
      }

      const { order, key } = data;

      // Try to prefill from stored user
      let prefill = {};
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          const u = parsed?.user || parsed;
          prefill = {
            name: u?.name || "",
            email: u?.email || "",
          };
        }
      } catch {
        // ignore
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Passiify",
        description: `${passDuration}-day pass at ${gym.name}`,
        order_id: order.id,
        prefill,
        notes: {
          gymId,
          date: selectedDate,
          duration: String(passDuration),
        },
        theme: {
          color: theme.accentFrom,
        },
        handler: async function (response) {
          try {
            // Step 3: Verify payment & create booking
            const verifyRes = await API.post(
              "/payments/gym/verify-payment",
              {
                ...response,
                gymId,
                date: selectedDate,
                duration: passDuration,
                price: effectivePrice,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (verifyRes.data?.success && verifyRes.data?.booking) {
              setShowSuccess(true);
              setTimeout(() => {
                navigate(`/booking-success/${verifyRes.data.booking._id}`, {
                  state: { type: "gym", name: gym.name },
                });
              }, 1000);
            } else {
              console.error("verify-payment failed:", verifyRes.data);
              setBookingError(
                verifyRes.data?.message ||
                  "Payment was captured but booking could not be created. Please contact support."
              );
            }
          } catch (err) {
            console.error("verify-payment error:", err);
            setBookingError(
              "Payment was captured but booking could not be completed. Please contact support with your payment ID."
            );
          } finally {
            setBookingLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBookingLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(
        "❌ Booking / payment init failed:",
        err?.response?.data || err
      );
      setBookingError(
        err?.response?.data?.message ||
          "Something went wrong while starting payment. Please try again."
      );
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
            style={{ color: theme.accentTo }}
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
            backgroundImage: `linear-gradient(120deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`,
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
     DERIVED DATA (after we have gym)
     ------------------------------------------------------- */

  const galleryImages = getGalleryImages(gym);

  // Map URL – prefer saved googleMapLink from PartnerWithUs
  const mapHref = gym.googleMapLink
    ? gym.googleMapLink
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${gym.address || ""} ${gym.city || ""}`
      )}`;

  // Cheapest pass (for hero "From ₹")
  let minPass = null;
  if (Array.isArray(gym.passes) && gym.passes.length) {
    minPass = gym.passes.reduce((best, current) => {
      const currentPrice = pickNumber(
        current.salePrice,
        current.price,
        current.basePrice
      );
      if (!best) return current;
      const bestPrice = pickNumber(
        best.salePrice,
        best.price,
        best.basePrice
      );
      if (!bestPrice && currentPrice) return current;
      return currentPrice && currentPrice < bestPrice ? current : best;
    }, null);
  }

  const minPassPrice = minPass
    ? pickNumber(minPass.salePrice, minPass.price, minPass.basePrice)
    : null;

  const minPassDuration =
    minPass?.duration || minPass?.durationDays || (minPass ? 1 : null);

  // Best value (lowest per-day)
  let bestValue = null;
  if (Array.isArray(gym.passes) && gym.passes.length > 1) {
    bestValue = gym.passes.reduce((best, current) => {
      const duration = current.duration || current.durationDays || 1;
      const price = pickNumber(
        current.salePrice,
        current.price,
        current.basePrice
      );
      const perDay = duration ? price / duration : price;
      const curWithPerDay = { ...current, perDay };

      if (!best) return curWithPerDay;
      return perDay < best.perDay ? curWithPerDay : best;
    }, null);
  }

  const isApproved =
    gym.status && gym.status.toLowerCase().trim() === "approved";

  const avgRating =
    typeof gym.rating === "number"
      ? gym.rating
      : reviews.length
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : null;

  const ratingCount = gym.ratingCount || reviews.length || 0;

  const selectedPrice = selectedPass
    ? pickNumber(
        selectedPass.salePrice,
        selectedPass.price,
        selectedPass.basePrice
      )
    : 0;

  const backgroundImage =
    mode === "dark"
      ? `radial-gradient(circle at top, rgba(37,99,235,0.34), transparent 55%),
         radial-gradient(circle at bottom right, rgba(249,115,22,0.22), transparent 60%)`
      : `radial-gradient(circle at top, rgba(37,99,235,0.12), transparent 55%),
         radial-gradient(circle at bottom right, rgba(249,115,22,0.12), transparent 60%)`;

  const surfaceGradient =
    mode === "dark"
      ? "linear-gradient(to bottom, #020617, #020617)"
      : "linear-gradient(to bottom, #E0F2FE, #FFFFFF, #F1F5F9)";

  const primaryGradient = `linear-gradient(120deg, ${theme.accentFrom}, ${theme.accentMid}, ${theme.accentTo})`;

  // Facilities wired from PartnerWithUs
  const facilityList = Array.isArray(gym.facilities) ? gym.facilities : [];

  const resolvedAmenities = (facilityList.length
    ? facilityList
    : FALLBACK_AMENITIES
  ).map((name) => {
    const Icon = AMENITY_ICON_MAP[name] || Sparkles;
    return { name, Icon };
  });

  // ---------- SEO: Helmet + JSON-LD ----------
  const pageTitle = `${gym.name} | Day Pass Gym in ${
    gym.city || "your city"
  } | Passiify`;
  const seoDescription =
    gym.description ||
    `Train at ${gym.name} with flexible day passes via Passiify. ${
      gym.city ? `Located in ${gym.city}. ` : ""
    }No long-term contracts – just turn up, scan your QR and lift.`;

  const canonicalUrl =
    typeof window !== "undefined" ? window.location.href : "";

  // openingHoursSpecification for structured data (best-effort)
  let openingHoursSpec;
  if (normalizedHours?.isStructured && Array.isArray(normalizedHours.list)) {
    openingHoursSpec = normalizedHours.list
      .filter((day) => !day.closed && day.open && day.close)
      .map((day) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: day.label, // "Monday", "Tuesday", etc.
        opens: day.open,
        closes: day.close,
      }));
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HealthClub",
    name: gym.name,
    description: seoDescription,
    address: {
      "@type": "PostalAddress",
      streetAddress: gym.address || "",
      addressLocality: gym.city || "",
      addressCountry: "IN",
    },
    url: canonicalUrl || undefined,
    telephone: gym.phone || undefined,
    aggregateRating: avgRating
      ? {
          "@type": "AggregateRating",
          ratingValue: avgRating.toFixed(1),
          reviewCount: ratingCount || 1,
        }
      : undefined,
    openingHoursSpecification: openingHoursSpec,
  };

  const jsonLd = JSON.stringify(structuredData);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      {/* SEO HEAD */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={seoDescription} />
        {gym.city && (
          <meta
            name="keywords"
            content={`gym day pass, ${gym.city} gym, ${gym.city} day pass, ${gym.name}, Passiify`}
          />
        )}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={seoDescription} />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        {galleryImages[0] && (
          <meta
            property="og:image"
            content={buildMediaUrl(galleryImages[0])}
          />
        )}
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{jsonLd}</script>
      </Helmet>

      <div
        className="min-h-screen"
        style={{
          backgroundColor: theme.bg,
          backgroundImage: `${surfaceGradient}, ${backgroundImage}`,
        }}
      >
        {/* ===================================================
           HERO — Cinematic hero with overlay + trust
           =================================================== */}
        <section className="relative w-full h-[54vh] md:h-[60vh] overflow-hidden rounded-b-[32px] md:rounded-b-[40px] shadow-2xl">
          <img
            src={buildMediaUrl(galleryImages[0])}
            alt={gym.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = fallbackGalleryImages[0];
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />
          {/* Ambient blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -bottom-40 -right-40 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
              style={{ background: theme.accentTo }}
            />
            <div
              className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full blur-3xl opacity-36"
              style={{ background: theme.accentFrom }}
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
                    {gym.type ||
                      gym.businessType ||
                      "Strength · Conditioning"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-200" />
                    {todayHoursLabel || "Timings shared on arrival"}
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
                      / {minPassDuration || 1}-day pass
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <a
                    href={mapHref}
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
            {/* Hours */}
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
                  style={{ color: theme.accentTo }}
                />
                <span
                  className="uppercase text-[10px] tracking-[0.18em]"
                  style={{ color: theme.textMuted }}
                >
                  Hours
                </span>
              </div>
              <div style={{ color: theme.textMain }}>
                {todayHoursLabel || "6:00 AM – 10:00 PM"}
              </div>
            </div>

            {/* Style */}
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
                  style={{ color: theme.accentFrom }}
                />
                <span
                  className="uppercase text-[10px] tracking-[0.18em]"
                  style={{ color: theme.textMuted }}
                >
                  Style
                </span>
              </div>
              <div style={{ color: theme.textMain }}>
                {gym.type || gym.businessType || "Strength · Conditioning"}
              </div>
            </div>

            {/* Vibe */}
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
                  style={{ color: theme.accentTo }}
                />
              </div>
              <div style={{ color: theme.textMain }}>
                {gym.vibe || "Mixed crowd · Traveller-friendly"}
              </div>
            </div>

            {/* Access */}
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
                  style={{ color: theme.accentFrom }}
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
                    backgroundImage: primaryGradient,
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
                    Staff know you’re coming via Passiify — no awkward front
                    desk sales pitch.
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

            {/* AMENITIES – compact, mobile-first chips wired with facilities */}
            <div>
              <h3
                className="text-lg md:text-xl font-semibold mb-3 flex items-center gap-2"
                style={{ color: theme.textMain }}
              >
                <Sparkles
                  className="w-4 h-4"
                  style={{ color: theme.accentTo }}
                />
                Amenities & facilities
              </h3>

              {/* Mobile-friendly chip layout */}
              <div className="flex flex-wrap gap-2">
                {resolvedAmenities.map(({ name, Icon }, idx) => (
                  <div
                    key={`${name}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] border backdrop-blur-sm"
                    style={{
                      borderColor: theme.borderSoft,
                      background:
                        mode === "dark"
                          ? "rgba(15,23,42,0.96)"
                          : "rgba(248,250,252,0.98)",
                      boxShadow:
                        idx < 3 ? theme.shadowSoft : "none", // top 3 pop slightly
                    }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: theme.accentFrom }}
                    />
                    <span style={{ color: theme.textMain }}>{name}</span>
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
                      src={buildMediaUrl(img)}
                      alt={`${gym.name}-${i}`}
                      className="w-full h-32 sm:h-40 object-cover group-hover:scale-[1.05] transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src =
                          fallbackGalleryImages[
                            i % fallbackGalleryImages.length
                          ];
                      }}
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

                <p
                  className="mt-1 text-[11px] md:text-xs"
                  style={{ color: theme.textMuted }}
                >
                  🕒 {todayHoursLabel || "Timings shared on arrival"}
                </p>

                {/* Weekly opening hours, in correct Mon–Sun order */}
                {hasStructuredHours && normalizedHours.list && (
                  <div
                    className="mt-3 pt-3 border-t border-dashed"
                    style={{ borderColor: theme.borderSoft }}
                  >
                    <p
                      className="text-[11px] md:text-xs font-semibold mb-1.5"
                      style={{ color: theme.textMain }}
                    >
                      Opening hours (weekly)
                    </p>
                    <div className="space-y-0.5">
                      {normalizedHours.list.map((day) => {
                        const isToday =
                          typeof day.jsDay === "number" &&
                          day.jsDay === new Date().getDay();

                        let label;
                        if (day.closed) {
                          label = "Closed";
                        } else if (day.open && day.close) {
                          label = `${day.open} – ${day.close}`;
                        } else if (
                          typeof day.raw === "string" &&
                          day.raw?.trim()
                        ) {
                          label = day.raw;
                        } else if (day.open) {
                          label = day.open;
                        } else {
                          label = "Closed";
                        }

                        return (
                          <div
                            key={day.key}
                            className="flex items-center justify-between text-[11px] md:text-xs"
                            style={{
                              color: isToday
                                ? theme.textMain
                                : theme.textMuted,
                            }}
                          >
                            <span
                              className={`w-16 text-left ${
                                isToday ? "font-semibold" : "font-medium"
                              }`}
                              style={{
                                color: isToday
                                  ? theme.textMain
                                  : theme.textMuted,
                              }}
                            >
                              {day.short}
                              {isToday && (
                                <span
                                  className="ml-1 text-[10px] uppercase tracking-wide"
                                  style={{
                                    color: theme.accentTo,
                                  }}
                                >
                                  · Today
                                </span>
                              )}
                            </span>
                            <span>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <a
                  href={mapHref}
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
                        s <= rating ? "scale-110" : "hover:scale-110"
                      }`}
                      style={{
                        color: s <= rating ? "#FACC15" : theme.textMuted,
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
                    backgroundImage: primaryGradient,
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
             RIGHT COLUMN — BOOKING (premium + Razorpay)
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
                  gym.passes.map((p, i) => {
                    const passDuration = p.duration || p.durationDays || 1;
                    const salePrice = pickNumber(
                      p.salePrice,
                      p.price,
                      p.basePrice
                    );
                    const basePrice =
                      p.basePrice && salePrice && p.basePrice > salePrice
                        ? p.basePrice
                        : null;

                    const selectedPriceForCompare = selectedPass
                      ? pickNumber(
                          selectedPass.salePrice,
                          selectedPass.price,
                          selectedPass.basePrice
                        )
                      : null;

                    const isActive =
                      selectedPass &&
                      (selectedPass._id
                        ? selectedPass._id === p._id
                        : selectedPass.duration === passDuration &&
                          selectedPriceForCompare === salePrice);

                    const bestValuePrice = bestValue
                      ? pickNumber(
                          bestValue.salePrice,
                          bestValue.price,
                          bestValue.basePrice
                        )
                      : null;

                    const isBestValue =
                      bestValue &&
                      (bestValue._id
                        ? bestValue._id === p._id
                        : bestValue.duration === passDuration &&
                          bestValuePrice === salePrice);

                    const maxCheckInsText =
                      p.maxCheckIns && Number(p.maxCheckIns) > 0
                        ? `${p.maxCheckIns} check-ins included`
                        : null;

                    let offerValidTillLabel = null;
                    if (p.offerValidTill) {
                      const ov = new Date(p.offerValidTill);
                      if (!Number.isNaN(ov.getTime())) {
                        offerValidTillLabel = `Offer valid till ${ov.toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                          }
                        )}`;
                      }
                    }

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedPass(p)}
                        className="relative border rounded-xl px-3 py-2 text-[11px] md:text-xs font-semibold text-left transition"
                        style={{
                          borderColor: isActive
                            ? "transparent"
                            : theme.borderSoft,
                          background: isActive
                            ? primaryGradient
                            : mode === "dark"
                            ? "rgba(15,23,42,0.96)"
                            : "rgba(248,250,252,0.98)",
                          color: isActive ? "#020617" : theme.textMain,
                        }}
                      >
                        <div>{passDuration}-day</div>

                        <div
                          className="text-[11px] mt-0.5"
                          style={{
                            color: isActive ? "#111827" : theme.textMain,
                          }}
                        >
                          ₹{salePrice}
                        </div>

                        {basePrice && (
                          <div
                            className="text-[9px] flex items-center gap-1 mt-0.5"
                            style={{
                              color: isActive
                                ? "#111827"
                                : theme.textMuted,
                            }}
                          >
                            <span className="line-through opacity-80">
                              ₹{basePrice}
                            </span>
                            {p.discountPercent ? (
                              <span>· {p.discountPercent}% OFF</span>
                            ) : null}
                          </div>
                        )}

                        {p.offerLabel && (
                          <div
                            className="mt-1 text-[9px] font-medium"
                            style={{
                              color: isActive ? "#111827" : theme.textMuted,
                            }}
                          >
                            {p.offerLabel}
                          </div>
                        )}

                        {(maxCheckInsText || offerValidTillLabel) && (
                          <div
                            className="mt-1 text-[9px] leading-snug"
                            style={{
                              color: isActive ? "#111827" : theme.textMuted,
                            }}
                          >
                            {maxCheckInsText}
                            {maxCheckInsText && offerValidTillLabel && " · "}
                            {offerValidTillLabel}
                          </div>
                        )}

                        {isBestValue && (
                          <span className="absolute -top-2 right-2 text-[9px] bg-emerald-400 text-gray-900 px-2 py-[2px] rounded-full font-semibold">
                            Best value
                          </span>
                        )}
                      </button>
                    );
                  })
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
                    ₹{selectedPrice}
                  </div>
                  <span
                    className="text-[10px] md:text-[11px] px-2 py-1 rounded-full border font-semibold"
                    style={{
                      borderColor: "rgba(16,185,129,0.5)",
                      background: "rgba(16,185,129,0.08)",
                      color: "#6EE7B7",
                    }}
                  >
                    {(selectedPass.duration ||
                      selectedPass.durationDays ||
                      1
                    ).toString()}
                    -day pass
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
                <label
                  className="flex items-center gap-2 text-[11px] md:text-xs font-medium mb-2"
                  style={{ color: theme.textMain }}
                >
                  <CalendarDays
                    className="w-4 h-4"
                    style={{ color: theme.accentTo }}
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
                            ? primaryGradient
                            : mode === "dark"
                            ? "rgba(15,23,42,0.96)"
                            : "rgba(248,250,252,0.98)",
                          color: isActive ? "#020617" : theme.textMain,
                        }}
                      >
                        <span className="font-semibold">{d.dayLabel}</span>
                        <span
                          className="text-[10px]"
                          style={{
                            color: isActive ? "#111827" : theme.textMuted,
                          }}
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
                    style={{ color: theme.accentTo }}
                  />{" "}
                  <span style={{ color: theme.textMuted }}>
                    Loved by travellers & locals
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard
                    className="w-4 h-4"
                    style={{ color: theme.accentFrom }}
                  />{" "}
                  <span style={{ color: theme.textMuted }}>
                    UPI, cards & wallets via Razorpay — encrypted payments
                  </span>
                </li>
              </ul>

              {/* BOOKING ERROR (if any) */}
              {bookingError && (
                <p
                  className="text-[11px] mb-3 rounded-lg px-3 py-2"
                  style={{
                    backgroundColor:
                      mode === "dark"
                        ? "rgba(248,113,113,0.12)"
                        : "rgba(254,226,226,0.95)",
                    color: mode === "dark" ? "#fecaca" : "#b91c1c",
                    border: "1px solid rgba(248,113,113,0.7)",
                  }}
                >
                  {bookingError}
                </p>
              )}

              {/* BOOK BUTTON (Razorpay) */}
              <button
                onClick={handleBooking}
                disabled={bookingLoading || !isApproved}
                className="w-full py-2.5 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center transition"
                style={{
                  backgroundImage: isApproved ? primaryGradient : "none",
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
                  `Confirm & pay for ${
                    selectedPass.duration ||
                    selectedPass.durationDays ||
                    1
                  }-day pass`
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
                style={{ color: theme.accentFrom }}
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
                style={{ color: theme.accentTo }}
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
                style={{ color: theme.accentFrom }}
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
                style={{ color: theme.accentTo }}
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
              src={buildMediaUrl(galleryImages[activeImage])}
              alt="active"
              className="max-w-4xl w-full max-h-[80vh] object-contain rounded-2xl border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,1)]"
              onError={(e) => {
                e.currentTarget.src =
                  fallbackGalleryImages[
                    activeImage % fallbackGalleryImages.length
                  ];
              }}
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
    </>
  );
}
