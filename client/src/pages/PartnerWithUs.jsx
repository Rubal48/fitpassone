// src/pages/PartnerWithUs.jsx
import React, { useState, useMemo } from "react";
import {
  Loader2,
  CheckCircle2,
  DollarSign,
  Phone,
  Plus,
  Trash2,
  Shield,
  Users,
  Sparkles,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ImageIcon,
  Info,
  Clock,
} from "lucide-react";
import API from "../utils/api";

/* =========================================================
   PASSIIFY THEME TOKENS (accent only – colors via Tailwind)
========================================================= */
const THEME = {
  accentFrom: "#2563EB", // main blue
  accentMid: "#0EA5E9", // sky
  accentTo: "#F97316", // orange
};

/* =========================================================
   AMENITIES — serious chain gym vibe
========================================================= */
const AMENITIES = [
  "WiFi",
  "Parking",
  "AC",
  "Showers",
  "Lockers",
  "Changing Rooms",
  "Steam Room",
  "Sauna",
  "Swimming Pool",
  "Cardio Zone",
  "Free Weights",
  "Machine Weights",
  "CrossFit / Functional Area",
  "Turf / Sled Track",
  "Personal Training",
  "Group Classes",
  "Yoga Room",
  "MMA / Boxing Ring",
  "Cafeteria / Shake Bar",
  "Women-Only Section",
];

const BUSINESS_TYPES = [
  { value: "gym", label: "Gym / Fitness Centre" },
  { value: "mma", label: "MMA / Combat Academy" },
  { value: "yoga", label: "Yoga / Meditation Studio" },
  { value: "event", label: "Event / Workshop Organizer" },
];

const STEPS = [
  { id: 0, label: "Business", sub: "Basics & contact" },
  { id: 1, label: "Passes", sub: "Pricing you control" },
  { id: 2, label: "Facilities", sub: "Trust, timings & docs" },
  { id: 3, label: "Media", sub: "Visuals & submit" },
];

/* =========================================================
   DAYS CONFIG – for Google Pay style timings
========================================================= */
const DAY_CONFIG = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

/* =========================================================
   HELPERS
========================================================= */
const createEmptyPass = () => ({
  name: "",
  duration: 1,
  price: "",
  discountPercent: "",
  offerLabel: "",
});

const createDefaultHours = () => {
  const base = {};
  DAY_CONFIG.forEach((d) => {
    base[d.key] = { open: "", close: "", closed: false };
  });
  return base;
};

/* ---------- Media URL helper (handles /api + relative paths) ---------- */
const getBackendOrigin = () => {
  if (!API?.defaults?.baseURL) return "";
  // e.g. "https://passiify.onrender.com/api" -> "https://passiify.onrender.com"
  return API.defaults.baseURL.replace(/\/api\/?$/, "").replace(/\/$/, "");
};

const buildMediaUrl = (raw) => {
  if (!raw) return null;

  if (typeof raw === "string" && raw.startsWith("http")) {
    return raw;
  }

  const origin = getBackendOrigin();
  const cleanPath = String(raw).replace(/^\/+/, ""); // remove starting "/"

  if (!origin) {
    // fallback to same-origin (dev with proxy)
    return `/${cleanPath}`;
  }

  return `${origin}/${cleanPath}`;
};

export default function PartnerWithUs() {
  /* -------------------------------------------------------
     STATE
  -------------------------------------------------------- */
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    businessType: "gym",
    city: "",
    address: "",
    phone: "",
    description: "",
    tags: "",
    website: "",
    instagram: "",
    googleMapLink: "",
  });

  const [passes, setPasses] = useState([createEmptyPass()]);

  // 🖼️ Media
  const [heroImage, setHeroImage] = useState(null); // main banner / cover image
  const [galleryImages, setGalleryImages] = useState([]); // inside / preview photos

  const [businessProof, setBusinessProof] = useState(null);
  const [ownerIdProof, setOwnerIdProof] = useState(null);
  const [video, setVideo] = useState(null);
  const [facilities, setFacilities] = useState([]);

  // 🕒 Opening hours (Mon–Sun)
  const [hours, setHours] = useState(() => createDefaultHours());

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [success, setSuccess] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  /* -------------------------------------------------------
     DERIVED – ESTIMATED EARNINGS PREVIEW
  -------------------------------------------------------- */
  const pricingPreview = useMemo(() => {
    if (!passes.length) return { min: 0, max: 0, avg: 0 };
    const numeric = passes
      .map((p) => Number(p.price) || 0)
      .filter((v) => v > 0);
    if (!numeric.length) return { min: 0, max: 0, avg: 0 };
    const min = Math.min(...numeric);
    const max = Math.max(...numeric);
    const avg = Math.round(numeric.reduce((a, b) => a + b, 0) / numeric.length);
    return { min, max, avg };
  }, [passes]);

  const hasAnyHours = useMemo(
    () =>
      DAY_CONFIG.some((d) => {
        const h = hours[d.key];
        return h && !h.closed && h.open && h.close;
      }),
    [hours]
  );

  /* -------------------------------------------------------
     HANDLERS
  -------------------------------------------------------- */
  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    setGlobalError("");
  };

  const handlePassChange = (index, field, value) => {
    const updated = [...passes];
    updated[index][field] = value;
    setPasses(updated);
    setFieldErrors((prev) => ({ ...prev, passes: "" }));
    setGlobalError("");
  };

  const addPass = () => {
    setPasses((prev) => [...prev, createEmptyPass()]);
  };

  const removePass = (index) => {
    setPasses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFacilityChange = (e) => {
    const { value, checked } = e.target;
    setFacilities((prev) =>
      checked ? [...prev, value] : prev.filter((f) => f !== value)
    );
  };

  const updateHours = (dayKey, field, value) => {
    setHours((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }));
  };

  // 🖼️ HERO / COVER IMAGE (single)
  const handleHeroChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("images", file);

    try {
      setUploadingImages(true);
      setGlobalError("");
      setFieldErrors((prev) => ({ ...prev, heroImage: "" }));

      const res = await API.post("/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploaded = (res.data.images && res.data.images[0]) || null;
      if (!uploaded) throw new Error("No file returned");

      setHeroImage(uploaded);
    } catch (err) {
      console.error("Hero image upload failed:", err);
      setGlobalError("Hero image upload failed. Please try again.");
    } finally {
      setUploadingImages(false);
    }
  };

  // 🖼️ GALLERY IMAGES (multiple)
  const handleGalleryChange = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    const formDataUpload = new FormData();
    files.forEach((file) => formDataUpload.append("images", file));

    try {
      setUploadingImages(true);
      setGlobalError("");
      setFieldErrors((prev) => ({ ...prev, images: "" }));

      const res = await API.post("/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploaded = res.data.images || [];
      if (!uploaded.length) throw new Error("No files returned");

      setGalleryImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error("Gallery upload failed:", err);
      setGlobalError("Image upload failed. Please try again.");
    } finally {
      setUploadingImages(false);
    }
  };

  // 📄 Proofs / video – also via /upload with "images" (single file)
  const handleProofUpload = async (e, type) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("images", file);

    try {
      setUploadingDocs(true);
      setGlobalError("");

      const res = await API.post("/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploaded = (res.data.images && res.data.images[0]) || null;
      if (!uploaded) throw new Error("No file returned");

      if (type === "business") {
        setBusinessProof(uploaded);
        setFieldErrors((prev) => ({ ...prev, businessProof: "" }));
      }
      if (type === "owner") {
        setOwnerIdProof(uploaded);
        setFieldErrors((prev) => ({ ...prev, ownerIdProof: "" }));
      }
      if (type === "video") setVideo(uploaded);
    } catch (err) {
      console.error("Document upload failed:", err);
      setGlobalError("Document upload failed. Please try again.");
    } finally {
      setUploadingDocs(false);
    }
  };

  /* -------------------------------------------------------
     VALIDATION
  -------------------------------------------------------- */
  const validateStep = (targetStep = step) => {
    const errors = {};

    if (targetStep === 0) {
      if (!formData.businessType)
        errors.businessType = "Select a business type";
      if (!formData.name.trim()) errors.name = "Centre name is required";
      if (!formData.city.trim()) errors.city = "City is required";
      if (!formData.phone.trim()) errors.phone = "Business phone is required";
    }

    if (targetStep === 1) {
      if (!passes.length) {
        errors.passes = "Add at least one pass";
      } else if (
        passes.some(
          (p) =>
            !p.name?.trim() ||
            !p.duration ||
            Number(p.duration) <= 0 ||
            !p.price ||
            Number(p.price) <= 0
        )
      ) {
        errors.passes =
          "Each pass needs a name, valid duration (days) and price";
      }
    }

    if (targetStep === 3) {
      if (!heroImage) errors.heroImage = "Upload a hero / banner image";
      if (!galleryImages.length)
        errors.images = "Upload at least one inside / gallery image";
      if (!businessProof) errors.businessProof = "Business proof is required";
      if (!ownerIdProof) errors.ownerIdProof = "Owner ID proof is required";
    }

    setFieldErrors((prev) => ({ ...prev, ...errors }));
    if (Object.keys(errors).length) {
      setGlobalError("Please complete the highlighted fields.");
      return false;
    }
    setGlobalError("");
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  /* -------------------------------------------------------
     SUBMIT
  -------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const valid0 = validateStep(0);
    const valid1 = validateStep(1);
    const valid3 = validateStep(3);
    if (!valid0 || !valid1 || !valid3) {
      if (
        fieldErrors.businessType ||
        fieldErrors.name ||
        fieldErrors.city ||
        fieldErrors.phone
      ) {
        setStep(0);
      } else if (fieldErrors.passes) {
        setStep(1);
      } else if (
        fieldErrors.heroImage ||
        fieldErrors.images ||
        fieldErrors.businessProof ||
        fieldErrors.ownerIdProof
      ) {
        setStep(3);
      }
      return;
    }

    try {
      setLoading(true);
      setGlobalError("");
      setSuccess(false);

      const payload = {
        ...formData,
        passes: passes.map((p) => ({
          // core fields (for backend)
          duration: Number(p.duration),
          price: Number(p.price),
          // extra metadata to power new UI
          name: p.name?.trim() || undefined,
          discountPercent: p.discountPercent
            ? Number(p.discountPercent)
            : undefined,
          offerLabel: p.offerLabel?.trim() || undefined,
        })),
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : [],
        facilities,
        // timings for detail / explore pages (Mon–Sun object)
        openingHours: hours,
        // media contract: cover + gallery
        coverImage: heroImage,
        images: galleryImages,
        businessProof,
        ownerIdProof,
        video,
        status: "pending",
      };

      const res = await API.post("/gyms", payload);
      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setFormData({
          name: "",
          businessType: "gym",
          city: "",
          address: "",
          phone: "",
          description: "",
          tags: "",
          website: "",
          instagram: "",
          googleMapLink: "",
        });
        setFacilities([]);
        setHeroImage(null);
        setGalleryImages([]);
        setBusinessProof(null);
        setOwnerIdProof(null);
        setVideo(null);
        setPasses([createEmptyPass()]);
        setHours(createDefaultHours());
        setStep(0);
        setFieldErrors({});
      } else {
        setGlobalError("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Partner submit error:", err);
      setGlobalError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     UI – LAYOUT & THEME (light/dark via Tailwind)
  -------------------------------------------------------- */
  return (
    <div
      className="min-h-screen pb-16 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300"
      style={{
        backgroundImage:
          "radial-gradient(circle at top, rgba(37,99,235,0.10), transparent 55%), radial-gradient(circle at 120% 0, rgba(249,115,22,0.12), transparent 55%)",
      }}
    >
      {/* HERO / PITCH */}
      <section className="relative overflow-hidden border-b border-slate-200/70 dark:border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50 to-slate-100 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617]" />
        <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.22] bg-[url('https://images.pexels.com/photos/1552104/pexels-photo-1552104.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center mix-blend-soft-light" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-10 md:pt-28 md:pb-16 grid md:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
          {/* LEFT TEXT */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/5 border border-slate-200/70 dark:border-white/25 text-[11px] uppercase tracking-[0.25em] text-slate-700 dark:text-slate-100 mb-5 shadow-[0_15px_50px_rgba(15,23,42,0.35)] dark:shadow-[0_15px_50px_rgba(15,23,42,0.9)]">
              <Sparkles className="w-3.5 h-3.5 text-orange-400 dark:text-orange-300" />
              <span>For gyms · studios · event hosts</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-black tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
              Turn your{" "}
              <span className="text-sky-600 dark:text-sky-300">
                fitness space
              </span>{" "}
              into a{" "}
              <span
                className="font-extrabold"
                style={{
                  backgroundImage: `linear-gradient(120deg,${THEME.accentMid},${THEME.accentTo})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                traveler magnet
              </span>
              .
            </h1>

            <p className="mt-4 text-sm md:text-base text-slate-600 dark:text-slate-200 max-w-xl leading-relaxed">
              List your gym, yoga studio, MMA academy or fitness event on{" "}
              <span className="font-semibold text-orange-500 dark:text-orange-300">
                Passiify
              </span>{" "}
              and start getting high-intent one-day visitors — travelers, GenZ,
              remote workers and movers who want to train without long-term
              contracts.
            </p>

            <div className="mt-6 grid sm:grid-cols-3 gap-4 text-xs md:text-sm">
              <div className="rounded-2xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_60px_rgba(15,23,42,0.95)]">
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-200 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    New Footfall
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Attract travelers & nearby users who normally never discover
                  your space.
                </p>
              </div>
              <div className="rounded-2xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_60px_rgba(15,23,42,0.95)]">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-200 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    Extra Revenue
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Monetise empty slots & off-peak hours with one-day and short
                  passes.
                </p>
              </div>
              <div className="rounded-2xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_60px_rgba(15,23,42,0.95)]">
                <div className="flex items-center gap-2 text-orange-500 dark:text-orange-200 mb-1">
                  <Shield className="w-4 h-4" />
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    Verified Network
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Join a curated, quality-first fitness ecosystem across cities.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT HIGHLIGHT CARD */}
          <div className="hidden md:block">
            <div className="rounded-3xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-sky-200/15 shadow-[0_20px_70px_rgba(15,23,42,0.18)] dark:shadow-[0_26px_90px_rgba(15,23,42,1)] px-6 py-7 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                Why hosts love Passiify
              </h2>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>
                    <span className="font-semibold">Flexible pricing:</span>{" "}
                    you fully control your one-day & multi-day pass durations
                    and rates.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>
                    <span className="font-semibold">
                      Transparent payouts:
                    </span>{" "}
                    we show your estimated earnings per pass (after platform
                    fee).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>
                    <span className="font-semibold">Smart discovery:</span>{" "}
                    appear in city, category & experience searches in the app.
                  </span>
                </li>
              </ul>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-white/10">
                Fill out the partner flow below — our team reviews new listings
                to keep the network high quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN SECTION – MULTI STEP WIZARD */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-[0.9fr,1.4fr] gap-10 items-start">
          {/* LEFT GUIDELINES – DESKTOP */}
          <div className="hidden lg:flex flex-col gap-4">
            <div className="rounded-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-100/15 px-5 py-5 text-xs md:text-sm text-slate-700 dark:text-slate-200 space-y-3 shadow-[0_18px_60px_rgba(15,23,42,0.18)] dark:shadow-[0_24px_80px_rgba(15,23,42,1)]">
              <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50 mb-1">
                What makes a great Passiify listing
              </h3>
              <p>
                We highlight hosts who care about community, safety and
                experience. If you maintain a respectful environment, clean
                equipment and clear communication — you&apos;re exactly who we
                want.
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <li>• Clear signage & a simple check-in process for day passes.</li>
                <li>• Transparent rules around footwear, clothing & filming.</li>
                <li>• Staff present during peak hours for support.</li>
                <li>• Open to travelers & new movers, not just regular members.</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-100/15 px-5 py-4 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
              <p>
                Once submitted, our team reviews your details, may ask for extra
                info, and then your space goes live on{" "}
                <span className="font-semibold text-sky-600 dark:text-sky-300">
                  Passiify
                </span>
                .
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-500">
                You&apos;ll always have control over pricing, availability and
                how you want to present your brand in the app.
              </p>
            </div>
          </div>

          {/* MOBILE MINI GUIDELINES */}
          <div className="lg:hidden mb-4">
            <div className="rounded-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-100/15 px-4 py-4 text-xs text-slate-700 dark:text-slate-200 space-y-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1">
                What we look for in partners
              </h3>
              <p>
                Clean, safe, professionally-run gyms, studios, boxes or
                academies that welcome day-pass users and travelers.
              </p>
              <p className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-sky-500 dark:text-sky-300" />
                Priority to centrally located or easily accessible spaces.
              </p>
            </div>
          </div>

          {/* RIGHT – WIZARD CARD */}
          <div className="rounded-3xl bg-white/95 dark:bg-slate-950/80 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-100/15 shadow-[0_22px_80px_rgba(15,23,42,0.18)] dark:shadow-[0_26px_90px_rgba(15,23,42,1)] px-5 py-6 md:px-7 md:py-8">
            {success ? (
              <div className="text-center flex flex-col items-center py-6">
                <CheckCircle2 className="w-14 h-14 mb-3 text-emerald-500 dark:text-emerald-400" />
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">
                  Centre submitted for review
                </h2>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mb-5 max-w-md">
                  Thank you for partnering with{" "}
                  <span className="text-sky-600 dark:text-sky-300 font-semibold">
                    Passiify
                  </span>
                  . Our team will review and verify your details before your
                  listing goes live in the app.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold bg-slate-900 text-slate-50 dark:bg-white dark:text-slate-900 hover:scale-[1.02] transition shadow-[0_18px_60px_rgba(15,23,42,0.22)]"
                >
                  Add another centre
                </button>
              </div>
            ) : (
              <>
                {/* STEP HEADER + PROGRESS */}
                <div className="mb-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400 mb-1">
                        Partner onboarding
                      </p>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50">
                        List your gym / studio / academy
                      </h2>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                        A guided flow to get your space live on Passiify. You
                        can always update details later.
                      </p>
                    </div>
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Step {step + 1} of {STEPS.length}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {STEPS[step].label} · {STEPS[step].sub}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-orange-400 transition-all"
                      style={{
                        width: `${((step + 1) / STEPS.length) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    {STEPS.map((s, idx) => {
                      const active = idx === step;
                      const done = idx < step;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            if (idx <= step) setStep(idx);
                          }}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              done
                                ? "bg-sky-500"
                                : active
                                ? "bg-orange-400"
                                : "bg-slate-400 dark:bg-slate-600"
                            }`}
                          />
                          <span
                            className={
                              active
                                ? "text-slate-900 dark:text-slate-100 font-medium"
                                : "text-slate-500 dark:text-slate-500"
                            }
                          >
                            {s.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {globalError && (
                  <p className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/40 rounded-xl px-3 py-2 text-xs mb-4 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" /> {globalError}
                  </p>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 text-xs md:text-sm"
                >
                  {/* STEP 0 – BUSINESS DETAILS */}
                  {step === 0 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                          Business type *
                        </label>
                        <select
                          name="businessType"
                          value={formData.businessType}
                          onChange={(e) =>
                            updateField("businessType", e.target.value)
                          }
                          className={`w-full bg-slate-50/70 dark:bg-slate-950/70 border ${
                            fieldErrors.businessType
                              ? "border-red-400/70"
                              : "border-slate-300/70 dark:border-slate-500/40"
                          } rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500/80`}
                        >
                          {BUSINESS_TYPES.map((bt) => (
                            <option key={bt.value} value={bt.value}>
                              {bt.label}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.businessType && (
                          <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                            {fieldErrors.businessType}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                            Centre name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            placeholder="Example: Iron Pulse Fitness"
                            className={`w-full bg-slate-50/70 dark:bg-slate-950/70 border ${
                              fieldErrors.name
                                ? "border-red-400/70"
                                : "border-slate-300/70 dark:border-slate-500/40"
                            } rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80`}
                          />
                          {fieldErrors.name && (
                            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                              {fieldErrors.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                            Business phone *
                          </label>
                          <div className="flex items-center gap-2">
                            <Phone className="text-sky-500 dark:text-sky-300 w-4 h-4" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={(e) =>
                                updateField("phone", e.target.value)
                              }
                              placeholder="Owner / front desk number"
                              className={`w-full bg-slate-50/70 dark:bg-slate-950/70 border ${
                                fieldErrors.phone
                                  ? "border-red-400/70"
                                  : "border-slate-300/70 dark:border-slate-500/40"
                              } rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80`}
                            />
                          </div>
                          {fieldErrors.phone && (
                            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                              {fieldErrors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={(e) => updateField("city", e.target.value)}
                            placeholder="e.g. Delhi, Mumbai, Goa"
                            className={`w-full bg-slate-50/70 dark:bg-slate-950/70 border ${
                              fieldErrors.city
                                ? "border-red-400/70"
                                : "border-slate-300/70 dark:border-slate-500/40"
                            } rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80`}
                          />
                          {fieldErrors.city && (
                            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                              {fieldErrors.city}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={(e) =>
                              updateField("address", e.target.value)
                            }
                            placeholder="Street, building, nearby landmark"
                            className="w-full bg-slate-50/70 dark:bg-slate-950/70 border border-slate-300/70 dark:border-slate-500/40 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                            Website
                          </label>
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={(e) =>
                              updateField("website", e.target.value)
                            }
                            placeholder="https://"
                            className="w-full bg-slate-50/70 dark:bg-slate-950/70 border border-slate-300/70 dark:border-slate-500/40 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                            Instagram
                          </label>
                          <input
                            type="url"
                            name="instagram"
                            value={formData.instagram}
                            onChange={(e) =>
                              updateField("instagram", e.target.value)
                            }
                            placeholder="https://instagram.com/yourhandle"
                            className="w-full bg-slate-50/70 dark:bg-slate-950/70 border border-slate-300/70 dark:border-slate-500/40 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                            Google Maps link
                          </label>
                          <input
                            type="url"
                            name="googleMapLink"
                            value={formData.googleMapLink}
                            onChange={(e) =>
                              updateField("googleMapLink", e.target.value)
                            }
                            placeholder="Share location link"
                            className="w-full bg-slate-50/70 dark:bg-slate-950/70 border border-slate-300/70 dark:border-slate-500/40 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 1 – PASSES */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                          Custom passes (name, duration & price) *
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-2">
                          Add passes like{" "}
                          <span className="font-semibold">
                            Day Pass, Weekly Pass, Trial
                          </span>{" "}
                          and optionally add a discount. You stay in control.
                        </p>

                        {passes.map((pass, index) => (
                          <div
                            key={index}
                            className="mb-2 bg-slate-50/80 dark:bg-slate-950/70 border border-slate-300/80 dark:border-slate-600/50 rounded-2xl px-3 py-2.5 space-y-2"
                          >
                            {/* Row 1: pass name + offer label */}
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                placeholder="Pass name (e.g. Day Pass)"
                                value={pass.name}
                                onChange={(e) =>
                                  handlePassChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full sm:flex-1 bg-transparent border border-slate-300/80 dark:border-slate-600/60 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80"
                              />
                              <input
                                type="text"
                                placeholder="Offer label (optional, e.g. Best for travellers)"
                                value={pass.offerLabel || ""}
                                onChange={(e) =>
                                  handlePassChange(
                                    index,
                                    "offerLabel",
                                    e.target.value
                                  )
                                }
                                className="w-full sm:flex-1 bg-transparent border border-slate-300/80 dark:border-slate-600/60 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80"
                              />
                            </div>

                            {/* Row 2: duration, price, discount */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                placeholder="Duration (days)"
                                value={pass.duration}
                                onChange={(e) =>
                                  handlePassChange(
                                    index,
                                    "duration",
                                    e.target.value
                                  )
                                }
                                className="w-full sm:w-1/4 bg-transparent border border-slate-300/80 dark:border-slate-600/60 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80"
                              />
                              <div className="relative w-full sm:w-1/3">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 dark:text-slate-400">
                                  ₹
                                </span>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Price"
                                  value={pass.price}
                                  onChange={(e) =>
                                    handlePassChange(
                                      index,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent border border-slate-300/80 dark:border-slate-600/60 rounded-xl pl-6 pr-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80"
                                />
                              </div>
                              <div className="w-full sm:w-1/4">
                                <input
                                  type="number"
                                  min="0"
                                  max="90"
                                  placeholder="Discount % (optional)"
                                  value={pass.discountPercent || ""}
                                  onChange={(e) =>
                                    handlePassChange(
                                      index,
                                      "discountPercent",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent border border-slate-300/80 dark:border-slate-600/60 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80"
                                />
                              </div>
                              {passes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePass(index)}
                                  className="text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 self-start sm:self-center"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {fieldErrors.passes && (
                          <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                            {fieldErrors.passes}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={addPass}
                          className="mt-1 inline-flex items-center text-[11px] text-sky-600 dark:text-sky-300 hover:text-sky-500 dark:hover:text-sky-200 font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add another pass
                        </button>
                      </div>

                      <div className="rounded-2xl bg-slate-50/90 dark:bg-slate-950/80 border border-slate-300/70 dark:border-slate-600/60 px-4 py-3 text-[11px] text-slate-700 dark:text-slate-300 flex flex-col gap-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            Earnings preview (example)
                          </span>
                          <DollarSign className="w-3.5 h-3.5 text-sky-600 dark:text-sky-300" />
                        </div>
                        {pricingPreview.avg > 0 ? (
                          <>
                            <p>
                              If you sell{" "}
                              <span className="font-semibold">
                                30 passes / month
                              </span>{" "}
                              at an average of{" "}
                              <span className="font-semibold">
                                ₹{pricingPreview.avg}
                              </span>
                              , you earn ~
                              <span className="font-semibold">
                                {" "}
                                ₹
                                {Math.round(
                                  pricingPreview.avg * 30 * 0.9
                                ).toLocaleString("en-IN")}
                              </span>{" "}
                              after a 10% platform fee.
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-500">
                              This is a rough example — you always set final
                              prices and we show clear payouts.
                            </p>
                          </>
                        ) : (
                          <p className="text-slate-500 dark:text-slate-500">
                            Add at least one pass with a price to see a quick
                            earnings example.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={(e) =>
                            updateField("description", e.target.value)
                          }
                          placeholder="Tell us about your vibe, coaching, community, peak hours, etc."
                          rows={3}
                          className="w-full bg-slate-50/70 dark:bg-slate-950/70 border border-slate-300/70 dark:border-slate-500/40 rounded-2xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={(e) => updateField("tags", e.target.value)}
                          placeholder="Example: CrossFit, Open Gym, Powerlifting"
                          className="w-full bg-slate-50/70 dark:bg-slate-950/70 border border-slate-300/70 dark:border-slate-500/40 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500/80"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2 – FACILITIES, TIMINGS & TRUST */}
                  {step === 2 && (
                    <div className="space-y-5">
                      {/* Facilities */}
                      <div>
                        <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                          Available facilities
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-2">
                          Select whatever is consistently available for
                          day-pass users.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {AMENITIES.map((item) => (
                            <label
                              key={item}
                              className="flex items-center space-x-2 text-[11px] md:text-xs text-slate-800 dark:text-slate-200 bg-slate-50/80 dark:bg-slate-950/70 border border-slate-300/80 dark:border-slate-600/60 rounded-xl px-2.5 py-2 cursor-pointer hover:border-sky-500/80"
                            >
                              <input
                                type="checkbox"
                                value={item}
                                onChange={handleFacilityChange}
                                checked={facilities.includes(item)}
                                className="accent-sky-500"
                              />
                              <span>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* OPERATING HOURS – GOOGLE PAY STYLE */}
                      <div>
                        <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                          Operating hours (public)
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-2">
                          Set timings day by day — this is what users will see,
                          similar to Google Pay / Maps business hours. You can
                          update this later from your partner dashboard.
                        </p>

                        <div className="space-y-2">
                          {DAY_CONFIG.map((day) => {
                            const dayHours = hours[day.key] || {
                              open: "",
                              close: "",
                              closed: false,
                            };
                            return (
                              <div
                                key={day.key}
                                className="rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-300/80 dark:border-slate-600/60 px-3 py-3 text-[11px] text-slate-800 dark:text-slate-200 flex flex-col gap-2"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-sky-500 dark:text-sky-300" />
                                    <span className="font-semibold text-slate-900 dark:text-slate-50">
                                      {day.label}
                                    </span>
                                  </div>
                                  <label className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                                    <input
                                      type="checkbox"
                                      checked={dayHours.closed}
                                      onChange={(e) =>
                                        updateHours(
                                          day.key,
                                          "closed",
                                          e.target.checked
                                        )
                                      }
                                      className="accent-sky-500"
                                    />
                                    Closed
                                  </label>
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="time"
                                    value={dayHours.open}
                                    onChange={(e) =>
                                      updateHours(
                                        day.key,
                                        "open",
                                        e.target.value
                                      )
                                    }
                                    disabled={dayHours.closed}
                                    className="w-full bg-transparent border border-slate-300/80 dark:border-slate-600/60 rounded-xl px-2 py-1.5 text-slate-900 dark:text-slate-100 text-[11px] focus:outline-none focus:border-sky-500/80 disabled:opacity-40"
                                  />
                                  <span className="text-[10px] text-slate-500 dark:text-slate-500">
                                    to
                                  </span>
                                  <input
                                    type="time"
                                    value={dayHours.close}
                                    onChange={(e) =>
                                      updateHours(
                                        day.key,
                                        "close",
                                        e.target.value
                                      )
                                    }
                                    disabled={dayHours.closed}
                                    className="w-full bg-transparent border border-slate-300/80 dark:border-slate-600/60 rounded-xl px-2 py-1.5 text-slate-900 dark:text-slate-100 text-[11px] focus:outline-none focus:border-sky-500/80 disabled:opacity-40"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Preview – how user will see timings (like Google Pay list) */}
                        <div className="mt-3 rounded-2xl bg-slate-50/90 dark:bg-slate-950/80 border border-slate-300/80 dark:border-slate-600/70 px-3 py-3 text-[11px] text-slate-700 dark:text-slate-300">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            Preview for customers
                          </p>
                          <div className="space-y-0.5">
                            {DAY_CONFIG.map((day) => {
                              const h = hours[day.key] || {};
                              const label =
                                h.closed || !h.open || !h.close
                                  ? "Closed"
                                  : `${h.open} – ${h.close}`;
                              return (
                                <div
                                  key={day.key}
                                  className="flex items-center justify-between"
                                >
                                  <span className="text-slate-500 dark:text-slate-400">
                                    {day.short}
                                  </span>
                                  <span className="text-slate-800 dark:text-slate-200">
                                    {label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {!hasAnyHours && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2">
                              Tip: Add at least a few open timings so users know
                              when they can walk in for a day pass.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50/90 dark:bg-slate-950/80 border border-slate-300/80 dark:border-slate-600/70 px-4 py-3 text-[11px] text-slate-700 dark:text-slate-300 flex gap-2">
                        <Shield className="w-4 h-4 text-sky-500 dark:text-sky-300 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
                            Trust & safety first
                          </p>
                          <p>
                            Verification documents are kept private and used only
                            for checks. Users see your rating, photos and passes
                            — not your internal paperwork.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                            Business proof (GST / registration) *
                          </p>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleProofUpload(e, "business")}
                            className="w-full text-[11px] bg-slate-50/80 dark:bg-slate-950/70 border border-slate-300/80 dark:border-slate-600/60 rounded-xl px-2 py-2 text-slate-700 dark:text-slate-200 file:text-slate-600 dark:file:text-slate-300"
                          />
                          {fieldErrors.businessProof && (
                            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                              {fieldErrors.businessProof}
                            </p>
                          )}
                          {businessProof && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-300 mt-1">
                              Business proof uploaded.
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                            Owner ID (Aadhaar / PAN) *
                          </p>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleProofUpload(e, "owner")}
                            className="w-full text-[11px] bg-slate-50/80 dark:bg-slate-950/70 border border-slate-300/80 dark:border-slate-600/60 rounded-xl px-2 py-2 text-slate-700 dark:text-slate-200 file:text-slate-600 dark:file:text-slate-300"
                          />
                          {fieldErrors.ownerIdProof && (
                            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                              {fieldErrors.ownerIdProof}
                            </p>
                          )}
                          {ownerIdProof && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-300 mt-1">
                              Owner ID uploaded.
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                            Intro video (optional)
                          </p>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleProofUpload(e, "video")}
                            className="w-full text-[11px] bg-slate-50/80 dark:bg-slate-950/70 border border-slate-300/80 dark:border-slate-600/60 rounded-xl px-2 py-2 text-slate-700 dark:text-slate-200 file:text-slate-600 dark:file:text-slate-300"
                          />
                          {video && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-300 mt-1">
                              Intro video uploaded.
                            </p>
                          )}
                        </div>
                      </div>

                      {uploadingDocs && (
                        <p className="text-sky-700 dark:text-sky-200 text-[11px] mt-1 flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                          Uploading document(s)...
                        </p>
                      )}
                    </div>
                  )}

                  {/* STEP 3 – HERO + GALLERY IMAGES & SUBMIT */}
                  {step === 3 && (
                    <div className="space-y-6">
                      {/* HERO / BANNER IMAGE */}
                      <div className="space-y-2">
                        <label className="block font-semibold text-slate-900 dark:text-slate-100">
                          Hero / banner image *
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-1.5">
                          This is the{" "}
                          <span className="font-semibold text-slate-800 dark:text-slate-300">
                            main cover photo
                          </span>{" "}
                          that appears on your Passiify detail page and on
                          Explore cards — just like the big image on
                          Booking.com. Choose a bright, wide shot that captures
                          the overall vibe of your space.
                        </p>

                        <div className="grid md:grid-cols-[1.3fr,0.9fr] gap-3 items-center">
                          <div className="w-full">
                            <div className="aspect-video rounded-2xl border bg-slate-100 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700/70 overflow-hidden flex items-center justify-center relative">
                              {heroImage ? (
                                <img
                                  src={buildMediaUrl(heroImage)}
                                  alt="Hero banner"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800";
                                  }}
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-[11px] text-slate-500 dark:text-slate-400 gap-1 px-4 text-center">
                                  <ImageIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 mb-1" />
                                  <span>
                                    No hero image yet. Upload a wide shot of your
                                    main floor or best angle.
                                  </span>
                                </div>
                              )}
                              <div className="absolute bottom-2 left-2 rounded-full bg-slate-900/80 border border-slate-700/80 px-3 py-1 text-[10px] text-slate-200 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-orange-300" />
                                Main banner on Passiify
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleHeroChange}
                              className="w-full text-[11px] bg-slate-50/80 dark:bg-slate-950/70 border border-slate-300/80 dark:border-slate-600/60 rounded-xl px-2 py-2 text-slate-700 dark:text-slate-200 file:text-slate-600 dark:file:text-slate-300"
                            />
                            {fieldErrors.heroImage && (
                              <p className="text-[11px] text-red-500 dark:text-red-400">
                                {fieldErrors.heroImage}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-500 dark:text-slate-500">
                              Tip: Use a{" "}
                              <span className="font-semibold">
                                horizontal 16:9 image
                              </span>{" "}
                              (landscape) with good lighting and minimal clutter.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* GALLERY / INSIDE IMAGES */}
                      <div className="space-y-2">
                        <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
                          Inside / gallery images *
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-1.5">
                          Show members what it{" "}
                          <span className="font-semibold text-slate-800 dark:text-slate-300">
                            actually feels like inside
                          </span>
                          : equipment rows, lifting platforms, cardio area,
                          mirrors, changing rooms, group class zone, etc. These
                          appear in the photo carousel on your listing.
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleGalleryChange}
                          className="w-full text-[11px] bg-slate-50/80 dark:bg-slate-950/70 border border-slate-300/80 dark:border-slate-600/60 rounded-xl px-2 py-2 text-slate-700 dark:text-slate-200 file:text-slate-600 dark:file:text-slate-300"
                        />
                        {fieldErrors.images && (
                          <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                            {fieldErrors.images}
                          </p>
                        )}
                        {uploadingImages && (
                          <p className="text-sky-700 dark:text-sky-200 text-[11px] mt-1 flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                            Uploading image(s)...
                          </p>
                        )}
                        {galleryImages.length > 0 && (
                          <p className="text-emerald-700 dark:text-emerald-300 text-[11px] mt-1">
                            {galleryImages.length} image(s) uploaded
                            successfully.
                          </p>
                        )}

                        {galleryImages.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            {galleryImages.slice(0, 3).map((img, idx) => (
                              <div
                                key={idx}
                                className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/70"
                              >
                                <img
                                  src={buildMediaUrl(img)}
                                  alt={`centre-${idx}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800";
                                  }}
                                />
                              </div>
                            ))}
                            {galleryImages.length > 3 && (
                              <div className="flex items-center justify-center text-[11px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/70 rounded-xl">
                                +{galleryImages.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl bg-slate-50/90 dark:bg-slate-950/80 border border-slate-300/80 dark:border-slate-600/70 px-4 py-3 text-[11px] text-slate-700 dark:text-slate-300 flex gap-2">
                        <ImageIcon className="w-4 h-4 text-orange-500 dark:text-orange-300 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
                            Make your first impression count
                          </p>
                          <p>
                            Bright, clear photos perform best — especially wide
                            shots that show the full layout, equipment and vibe.
                            Think like a travel platform: would you book{" "}
                            <span className="font-semibold">
                              your own space
                            </span>{" "}
                            based only on these photos?
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FOOTER NAV BUTTONS */}
                  <div className="pt-4 flex items-center justify-between gap-3">
                    <div>
                      {step > 0 && (
                        <button
                          type="button"
                          onClick={goBack}
                          className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-600/70 px-4 py-2 rounded-full text-xs font-semibold hover:border-sky-500/80 hover:text-slate-900 dark:hover:text-slate-50 transition"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          Back
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {step < STEPS.length - 1 && (
                        <button
                          type="button"
                          onClick={goNext}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-orange-400 text-slate-950 px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold shadow-[0_18px_60px_rgba(15,23,42,0.35)] hover:opacity-95 hover:scale-[1.02] transition"
                        >
                          Next step
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {step === STEPS.length - 1 && (
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-orange-400 text-slate-950 px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold shadow-[0_22px_80px_rgba(15,23,42,0.4)] hover:opacity-95 hover:scale-[1.02] transition disabled:opacity-60 disabled:hover:scale-100"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit partner details
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-500 text-center mt-2">
                    By submitting, you confirm that all details are accurate and
                    that you have the authority to represent this business.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
