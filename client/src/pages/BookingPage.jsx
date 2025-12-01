// src/pages/BookingPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import {
  CreditCard,
  MapPin,
  ShieldCheck,
  X,
  Mail,
  CalendarDays,
  Dumbbell,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

/* =========================================================
   Helper: Load Razorpay SDK once
========================================================= */
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Window is not defined"));
    }

    if (window.Razorpay) {
      return resolve(true);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(
        new Error("Razorpay SDK failed to load. Please check your network.")
      );

    document.body.appendChild(script);
  });
};

/* =========================================================
   Media helpers — match GymDetails / Explore behaviour
========================================================= */

const fallbackHeroImage =
  "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1200";

const getBackendOrigin = () => {
  if (!API?.defaults?.baseURL) return "";
  // e.g. "https://passiify.onrender.com/api" -> "https://passiify.onrender.com"
  return API.defaults.baseURL.replace(/\/api\/?$/, "").replace(/\/$/, "");
};

const buildMediaUrl = (raw) => {
  if (!raw) return null;
  if (typeof raw === "string" && raw.startsWith("http")) return raw;

  try {
    const origin = getBackendOrigin();
    const cleanPath = String(raw).replace(/^\/+/, "");
    if (!origin) return `/${cleanPath}`;
    return `${origin}/${cleanPath}`;
  } catch {
    return null;
  }
};

const getHeroImageForGym = (gym) => {
  if (!gym) return null;

  if (Array.isArray(gym.images) && gym.images.length) {
    const url = buildMediaUrl(gym.images[0]);
    if (url) return url;
  }

  if (gym.image) {
    const url = buildMediaUrl(gym.image);
    if (url) return url;
  }

  return null;
};

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPass, setSelectedPass] = useState(null);

  // Auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);

  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Booking / payment state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // User (for prefill)
  const [currentUser, setCurrentUser] = useState(null);

  /* =========================================================
     Read user from localStorage for prefill
  ========================================================= */
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const userData = parsed?.user || parsed;
      setCurrentUser(userData || null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  /* =========================================================
     Fetch gym details
  ========================================================= */
  useEffect(() => {
    const fetchGym = async () => {
      try {
        const res = await API.get(`/gyms/${id}`);
        const data = res.data;

        // Normalize passes if customPrice exists
        let passes = data.passes || [];
        if ((!passes || passes.length === 0) && data.customPrice) {
          passes = Object.entries(data.customPrice).map(
            ([duration, price]) => ({
              duration: Number(duration),
              price: Number(price),
            })
          );
        }

        data.passes = passes;

        setGym(data);

        // Default pass selection
        if (passes && passes.length > 0) {
          setSelectedPass(passes[0]);
        } else if (data.price) {
          setSelectedPass({
            duration: 1,
            price: data.price,
          });
        }

        // Default date → today
        setSelectedDate(new Date().toISOString().split("T")[0]);
      } catch (err) {
        console.error("❌ Error fetching gym:", err);
        setErrorMessage("Failed to load this gym. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGym();
  }, [id]);

  /* =========================================================
     Auth handlers (login / signup / forgot)
  ========================================================= */
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    try {
      const endpoint = isLoginMode ? "/auth/login" : "/auth/register";
      const res = await API.post(endpoint, authData);

      if (!res.data?.token) {
        throw new Error("Invalid auth response from server");
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      const userData = res.data.user || res.data;
      setCurrentUser(userData || null);

      setAuthSuccess(
        isLoginMode
          ? "Logged in. You can now complete your booking."
          : "Account created. You can now complete your booking."
      );
      setAuthError("");

      // Close modal after short success delay
      setTimeout(() => {
        setShowAuthModal(false);
        setIsForgotMode(false);
        setIsLoginMode(true);
        setAuthData({ name: "", email: "", password: "" });
        setAuthSuccess("");
      }, 900);
    } catch (err) {
      console.error("❌ Auth failed:", err);
      setAuthError(
        err?.response?.data?.message ||
          "Something went wrong. Please check your details and try again."
      );
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!authData.email) {
      setAuthError("Please enter your registered email.");
      return;
    }

    try {
      await API.post("/auth/forgot-password", { email: authData.email });
      setAuthSuccess("Password reset link sent to your email.");
    } catch (err) {
      console.error("❌ Forgot password error:", err);
      setAuthError("Error sending reset link. Try again.");
    }
  };

  /* =========================================================
     Booking + Razorpay flow
  ========================================================= */
  const handleBooking = async () => {
    setErrorMessage("");
    setInfoMessage("");
    setSuccessMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setShowAuthModal(true);
      return;
    }

    if (!gym) {
      setErrorMessage("Gym not loaded. Please refresh and try again.");
      return;
    }

    if (!selectedDate) {
      setErrorMessage("Please select a date first.");
      return;
    }

    if (!selectedPass) {
      setErrorMessage("Please select a pass option.");
      return;
    }

    try {
      setBookingLoading(true);

      // 1) Load Razorpay script
      await loadRazorpayScript();

      if (!window.Razorpay) {
        setErrorMessage(
          "Payment SDK not loaded. Please refresh the page and try again."
        );
        setBookingLoading(false);
        return;
      }

      // 2) Create order on backend
      const payload = {
        gymId: gym._id,
        date: selectedDate,
        duration: selectedPass.duration,
        price: selectedPass.price,
      };

      const initRes = await API.post("/payments/gym/create-order", payload);
      const initData = initRes.data;

      if (!initData?.success || !initData.order) {
        console.warn("⚠️ Unexpected create-order response:", initData);
        setErrorMessage(
          initData?.message ||
            "Failed to start payment. Please try again in a moment."
        );
        setBookingLoading(false);
        return;
      }

      const { order, key } = initData;

      // 3) Open Razorpay Checkout
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Passiify",
        description: `${gym.name} · ${selectedPass.duration}-Day Pass`,
        image: undefined, // add logo path here if you have one, e.g. "/logo192.png"
        order_id: order.id,
        prefill: {
          name: currentUser?.name || "",
          email: currentUser?.email || "",
        },
        notes: {
          gymId: gym._id?.toString(),
          date: selectedDate,
          duration: String(selectedPass.duration),
        },
        theme: {
          color: "#2563EB",
        },
        handler: async function (response) {
          try {
            setInfoMessage("Confirming payment and creating your pass…");

            const verifyRes = await API.post("/payments/gym/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              gymId: gym._id,
              date: selectedDate,
              duration: selectedPass.duration,
              price: selectedPass.price,
            });

            if (verifyRes.data?.success && verifyRes.data.booking) {
              const booking = verifyRes.data.booking;
              setSuccessMessage("Payment successful. Your pass is ready!");
              setInfoMessage("");

              // Redirect to booking success page
              setTimeout(() => {
                navigate(`/booking-success/${booking._id}`, {
                  state: {
                    type: "gym",
                    name: gym.name,
                  },
                });
              }, 700);
            } else {
              console.warn("⚠️ Unexpected verify response:", verifyRes.data);
              setErrorMessage(
                verifyRes.data?.message ||
                  "Payment verified but booking could not be created. Please contact support."
              );
            }
          } catch (err) {
            console.error("❌ verifyGymPayment error:", err);
            setErrorMessage(
              err?.response?.data?.message ||
                "We received your payment but something went wrong while creating your pass. Please contact support with your payment ID."
            );
          } finally {
            setBookingLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBookingLoading(false);
            setInfoMessage("");
            setErrorMessage("Payment window closed. No amount was charged.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(
        "❌ Booking / payment init failed:",
        err?.response?.data || err
      );
      setErrorMessage(
        err?.response?.data?.message ||
          "Failed to start payment. Please try again or contact support."
      );
      setBookingLoading(false);
    }
  };

  /* =========================================================
     Derived values
  ========================================================= */
  const formattedDateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Select a date";

  const heroImage = getHeroImageForGym(gym) || fallbackHeroImage;

  /* =========================================================
     Loading / not-found states
  ========================================================= */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100">
        <Loader2 className="w-7 h-7 animate-spin mb-3 text-blue-600 dark:text-sky-400" />
        <p className="text-sm sm:text-base">
          Loading your Passiify booking flow…
        </p>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 px-4">
        <AlertCircle className="w-8 h-8 mb-3 text-rose-500 dark:text-rose-400" />
        <p className="text-sm sm:text-base mb-4 text-center">
          We couldn’t find this gym. It may have been removed or is no longer
          available.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-sky-400/70 dark:hover:border-sky-400/70 transition"
        >
          Go back
        </button>
      </div>
    );
  }

  /* =========================================================
     MAIN PREMIUM LAYOUT
  ========================================================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20 pb-16 relative">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-36 w-[320px] h-[320px] bg-sky-500/22 dark:bg-sky-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -right-40 w-[360px] h-[360px] bg-orange-500/22 dark:bg-orange-500/32 rounded-full blur-3xl" />
      </div>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header meta */}
        <header className="mb-6 sm:mb-8">
          <p className="text-[11px] uppercase tracking-[0.26em] text-slate-400 dark:text-slate-500 mb-2">
            Passiify · Secure pass checkout
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Book your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 bg-clip-text text-transparent">
              day pass
            </span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
            Choose your pass, pick your date and pay securely via Razorpay. Your
            QR pass lands instantly in your Passiify dashboard.
          </p>
        </header>

        {/* Main card */}
        <section className="bg-white/92 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-[0_24px_90px_rgba(15,23,42,0.65)] overflow-hidden backdrop-blur-xl">
          {/* Hero image */}
          <div className="relative h-56 sm:h-64 md:h-64 overflow-hidden">
            <img
              src={heroImage}
              alt={gym.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md line-clamp-2">
                  {gym.name}
                </h2>
                <p className="flex items-center text-xs sm:text-sm text-slate-100 mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-orange-300" />
                  {gym.city || "Across the city"}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/25 backdrop-blur-md text-[11px] sm:text-xs text-slate-50 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Verified partner · No membership, just passes</span>
              </div>
            </div>
          </div>

          {/* Content grid */}
          <div className="grid md:grid-cols-[1.6fr,1.1fr] gap-0">
            {/* Left: pass + date */}
            <div className="px-5 sm:px-7 py-6 sm:py-7 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800/80 space-y-6">
              {/* Step row */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50/90 dark:bg-sky-900/40 text-sky-700 dark:text-sky-200 border border-sky-200/70 dark:border-sky-700/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  Step 1 · Choose pass
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50/90 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70">
                  Step 2 · Pick date
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50/90 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70">
                  Step 3 · Pay via Razorpay
                </span>
              </div>

              {/* Pass selector */}
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-2">
                  Pass options
                </p>
                {gym.passes && gym.passes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {gym.passes.map((p, idx) => {
                      const isSelected =
                        selectedPass?.duration === p.duration &&
                        selectedPass?.price === p.price;
                      return (
                        <button
                          key={`${p.duration}-${p.price}-${idx}`}
                          type="button"
                          onClick={() => setSelectedPass(p)}
                          className={`relative text-left rounded-2xl border px-3 py-3 text-xs sm:text-sm transition-all ${
                            isSelected
                              ? "border-blue-500/80 bg-gradient-to-br from-blue-600/10 via-sky-500/5 to-orange-500/10 shadow-[0_18px_60px_rgba(15,23,42,0.35)]"
                              : "border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-950/80 hover:border-sky-400/80 dark:hover:border-sky-400/80"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-blue-600 via-sky-500 to-orange-500 grid place-items-center text-[11px] text-slate-950 shadow-sm">
                              <Dumbbell className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-50">
                                {p.duration}-Day Pass
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Perfect for short stays & drop-ins
                              </p>
                            </div>
                          </div>
                          <p className="mt-1 font-semibold text-slate-900 dark:text-slate-50">
                            ₹{p.price}
                          </p>
                          {idx === 0 && (
                            <span className="absolute -top-2 right-2 text-[9px] px-2 py-[2px] rounded-full bg-emerald-500 text-emerald-50 font-semibold shadow-sm">
                              Most booked
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-950/80 px-4 py-3 text-xs sm:text-sm">
                    <p className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                      1-Day Pass · ₹{gym.price || "—"}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Simple full-day access. No contracts, no lock-in.
                    </p>
                  </div>
                )}
              </div>

              {/* Date picker */}
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-2">
                  Training date
                </p>
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-950/80 px-4 py-3">
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mb-2">
                    <CalendarDays className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                    Choose the day you want to train
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/60 cursor-pointer"
                  />

                  <div className="mt-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    <p>
                      Selected:{" "}
                      <span className="text-slate-900 dark:text-slate-50">
                        {formattedDateLabel}
                      </span>
                    </p>
                    {selectedPass && (
                      <p className="mt-1">
                        Pass:{" "}
                        <span className="text-slate-900 dark:text-slate-50">
                          {selectedPass.duration}-Day · ₹{selectedPass.price}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Info / errors */}
              <div className="space-y-2 text-xs sm:text-sm">
                {errorMessage && (
                  <div className="flex items-start gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 rounded-2xl px-3 py-2">
                    <AlertCircle className="w-4 h-4 mt-[2px]" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                {infoMessage && (
                  <div className="flex items-start gap-2 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/70 rounded-2xl px-3 py-2">
                    <Loader2 className="w-4 h-4 mt-[2px] animate-spin" />
                    <span>{infoMessage}</span>
                  </div>
                )}
                {successMessage && (
                  <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 rounded-2xl px-3 py-2">
                    <CheckCircle2 className="w-4 h-4 mt-[2px]" />
                    <span>{successMessage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: summary & CTA */}
            <div className="px-5 sm:px-7 py-6 sm:py-7 bg-slate-50/95 dark:bg-slate-950/95 flex flex-col justify-between gap-6 border-t md:border-t-0 border-slate-200/80 dark:border-slate-800/80">
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                  Booking summary
                </h3>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-4 py-3 text-xs sm:text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Gym
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-50 line-clamp-1">
                      {gym.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      City
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {gym.city || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Date
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {formattedDateLabel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Pass
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {selectedPass
                        ? `${selectedPass.duration}-Day`
                        : "Select a pass"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-dashed border-slate-200/80 dark:border-slate-700/80 flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">
                      Total (incl. platform fee)
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">
                      ₹{selectedPass?.price || gym.price || 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    Payments are processed securely via Razorpay.
                  </p>
                  <p>Instant QR pass after successful payment.</p>
                  <p>No long-term contract. Just turn up and train.</p>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={bookingLoading}
                className="inline-flex items-center justify-center gap-2 w-full px-5 sm:px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-slate-950 shadow-[0_20px_70px_rgba(15,23,42,0.9)] hover:scale-[1.02] hover:shadow-[0_24px_80px_rgba(15,23,42,1)] transition-transform disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-[0_20px_60px_rgba(15,23,42,0.7)]"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing payment…
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Confirm & Pay with Razorpay
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 🔐 AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-[0_26px_100px_rgba(15,23,42,0.95)] p-6 sm:p-7">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setIsForgotMode(false);
                setIsLoginMode(true);
                setAuthError("");
                setAuthSuccess("");
              }}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-900 dark:text-slate-50 mb-4">
              {isForgotMode
                ? "Reset your password"
                : isLoginMode
                ? "Login to continue"
                : "Create your Passiify account"}
            </h2>

            {(authError || authSuccess) && (
              <div className="mb-3 text-center text-xs sm:text-sm">
                {authError && (
                  <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 text-rose-600 dark:text-rose-300 rounded-xl px-3 py-2 mb-2">
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-300 rounded-xl px-3 py-2">
                    {authSuccess}
                  </div>
                )}
              </div>
            )}

            {isForgotMode ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/80 dark:bg-slate-950/80">
                  <Mail className="text-sky-500 dark:text-sky-400 w-5 h-5 mr-2" />
                  <input
                    type="email"
                    placeholder="Registered email"
                    value={authData.email}
                    onChange={(e) =>
                      setAuthData({ ...authData, email: e.target.value })
                    }
                    className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-slate-950 py-2.5 rounded-full font-semibold text-sm shadow-[0_18px_60px_rgba(15,23,42,0.8)] hover:scale-[1.02] transition-transform"
                >
                  Send reset link
                </button>

                <p
                  onClick={() => {
                    setIsForgotMode(false);
                    setIsLoginMode(true);
                    setAuthError("");
                    setAuthSuccess("");
                  }}
                  className="text-xs sm:text-sm text-sky-600 dark:text-sky-300 text-center mt-2 cursor-pointer hover:underline underline-offset-2"
                >
                  ← Back to Login
                </p>
              </form>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLoginMode && (
                  <input
                    type="text"
                    placeholder="Full name"
                    value={authData.name}
                    onChange={(e) =>
                      setAuthData({ ...authData, name: e.target.value })
                    }
                    required
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/80 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/60"
                  />
                )}

                <input
                  type="email"
                  placeholder="Email"
                  value={authData.email}
                  onChange={(e) =>
                    setAuthData({ ...authData, email: e.target.value })
                  }
                  required
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/80 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/60"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={authData.password}
                  onChange={(e) =>
                    setAuthData({ ...authData, password: e.target.value })
                  }
                  required
                  minLength={6}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/80 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/60"
                />

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-slate-950 py-2.5 rounded-full font-semibold text-sm shadow-[0_18px_60px_rgba(15,23,42,0.8)] hover:scale-[1.02] transition-transform"
                >
                  {isLoginMode ? "Login & Continue" : "Create account"}
                </button>
              </form>
            )}

            {!isForgotMode && (
              <div className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-4">
                {isLoginMode ? (
                  <>
                    Don’t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginMode(false);
                        setAuthError("");
                        setAuthSuccess("");
                      }}
                      className="text-orange-600 dark:text-orange-400 font-semibold underline-offset-2 hover:underline"
                    >
                      Sign up
                    </button>
                    <br />
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(true);
                        setAuthError("");
                        setAuthSuccess("");
                      }}
                      className="text-sky-600 dark:text-sky-300 mt-2 underline-offset-2 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginMode(true);
                        setAuthError("");
                        setAuthSuccess("");
                      }}
                      className="text-orange-600 dark:text-orange-400 font-semibold underline-offset-2 hover:underline"
                    >
                      Login
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
