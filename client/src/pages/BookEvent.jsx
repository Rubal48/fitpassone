// src/pages/BookEvent.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  CalendarDays,
  Users,
  Loader2,
  Ticket,
  ShieldCheck,
  ArrowLeft,
  Clock,
  Info,
  Minus,
  Plus,
  Sparkles,
  CreditCard,
  Lock,
} from "lucide-react";
import API from "../utils/api";

/* =========================================================
   Shared helpers — align with EventsPage
========================================================= */

const getEventStartDate = (event) => {
  const raw =
    event?.startTime ||
    event?.startDate ||
    event?.date ||
    event?.start_at ||
    null;

  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const getLocationLabel = (event) => {
  const city =
    event?.city ||
    event?.gym?.city ||
    event?.gym?.location ||
    event?.gym?.area ||
    null;

  const baseLoc = event?.location || event?.address || null;

  if (city && baseLoc) return `${city}, ${baseLoc}`;
  if (city) return city;
  if (baseLoc) return baseLoc;
  return "Location shared after booking";
};

const getSpotsLeft = (event) => {
  if (typeof event?.remainingSeats === "number") {
    return Math.max(event.remainingSeats, 0);
  }

  const capacity = Number(event?.capacity || event?.totalSlots || 0);
  const booked = Number(event?.bookedCount || event?.bookingsCount || 0);

  if (!capacity) return null;
  return Math.max(capacity - booked, 0);
};

/* 🔌 Load Razorpay SDK on demand */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) return resolve(true);

    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      existing.onload = () => resolve(true);
      existing.onerror = () => resolve(false);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const BookEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tickets, setTickets] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [pageError, setPageError] = useState("");
  const [bookingError, setBookingError] = useState("");

  // ─────────────────────────────────────────
  // Fetch event details
  // ─────────────────────────────────────────
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setPageError("");
        const res = await API.get(`/events/${id}`);
        const ev = res.data?.event || res.data;
        setEvent(ev);
      } catch (err) {
        console.error("Error fetching event:", err);
        setPageError("We couldn’t load this experience. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  // ─────────────────────────────────────────
  // Derived values
  // ─────────────────────────────────────────
  const eventDate = useMemo(() => {
    if (!event) return null;
    return getEventStartDate(event);
  }, [event]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const diffDays =
    eventDate && !Number.isNaN(eventDate.getTime())
      ? Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))
      : null;

  const isPast = eventDate ? eventDate < today : false;

  const dateLabel = eventDate
    ? eventDate.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date TBA";

  const timeLabel = eventDate
    ? eventDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const remainingSeats = useMemo(() => getSpotsLeft(event), [event]);

  const isSoldOut =
    event?.isSoldOut ||
    (typeof remainingSeats === "number" && remainingSeats === 0);

  const capacityLabel = useMemo(() => {
    if (typeof event?.capacity === "number" && event.capacity > 0)
      return `${event.capacity} spots`;
    if (typeof event?.totalSlots === "number" && event.totalSlots > 0)
      return `${event.totalSlots} spots`;
    return "Limited spots";
  }, [event]);

  // 🔢 Match backend price usage (event.price)
  const pricePerTicket = useMemo(() => {
    if (!event) return null;
    const raw =
      event.price ??
      event.passPrice ??
      event.amount ??
      (event.pricing && event.pricing.price);

    const n = Number(raw);
    if (!raw || Number.isNaN(n) || n <= 0) return null;
    return n;
  }, [event]);

  const totalPrice = useMemo(
    () => (pricePerTicket ? pricePerTicket * tickets : 0),
    [tickets, pricePerTicket]
  );

  const bookingDisabled = !event || isPast || isSoldOut || !pricePerTicket;

  // ─────────────────────────────────────────
  // Booking handler – Razorpay flow
  // ─────────────────────────────────────────
  const handleBookEvent = async () => {
    if (!event || bookingDisabled) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to book this experience.");
      navigate("/login");
      return;
    }

    if (!pricePerTicket) {
      setBookingError(
        "This experience doesn’t have a valid price yet. Please try another event or contact support."
      );
      return;
    }

    if (isPast) {
      alert("This experience has already happened. Please pick another one.");
      return;
    }

    if (
      typeof remainingSeats === "number" &&
      tickets > remainingSeats &&
      remainingSeats >= 0
    ) {
      alert(
        `Only ${remainingSeats} seat${
          remainingSeats === 1 ? "" : "s"
        } left for this experience.`
      );
      setTickets(Math.max(1, remainingSeats || 1));
      return;
    }

    try {
      setBookingError("");
      setBookingLoading(true);

      // 1️⃣ Ensure Razorpay SDK is loaded
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        setBookingLoading(false);
        setBookingError(
          "Payment SDK failed to load. Check your internet and try again."
        );
        return;
      }

      // 2️⃣ Create order on backend
      const orderRes = await API.post("/payments/event/create-order", {
        eventId: event._id,
        tickets,
      });

      const data = orderRes.data || {};
      if (!data.success || !data.order) {
        setBookingLoading(false);
        setBookingError(
          data.message || "Failed to start payment. Please try again."
        );
        return;
      }

      const { order, key } = data;

      // 3️⃣ Prefill user details from localStorage (if any)
      let userName = "";
      let userEmail = "";
      let userPhone = "";
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          userName = parsed.user?.name || parsed.name || "";
          userEmail = parsed.user?.email || parsed.email || "";
          userPhone =
            parsed.user?.phone ||
            parsed.user?.phoneNumber ||
            parsed.phone ||
            "";
        } catch {
          // ignore JSON errors
        }
      }

      // 4️⃣ Open Razorpay checkout
      const options = {
        key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Passiify",
        description: event.name || "Passiify experience booking",
        image: "/passiify-mark.png", // optional – replace/remove if needed
        order_id: order.id,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        notes: {
          eventId: event._id,
          tickets: String(tickets),
        },
        theme: {
          color: "#2563EB", // Passiify blue
        },
        handler: async function (response) {
          try {
            const verifyRes = await API.post(
              "/payments/event/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                eventId: event._id,
                tickets,
              }
            );

            const vData = verifyRes.data || {};
            if (vData.success && vData.booking) {
              navigate(`/booking-success/${vData.booking._id}`, {
                state: { type: "event", name: event.name },
              });
            } else {
              setBookingError(
                vData.message ||
                  "Payment captured but booking couldn’t be created. Please contact support."
              );
            }
          } catch (err) {
            console.error("❌ Error verifying event payment:", err);
            setBookingError(
              err?.response?.data?.message ||
                "Payment succeeded but booking failed. Please contact support."
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

      const razorpayObject = new window.Razorpay(options);
      razorpayObject.open();
    } catch (err) {
      console.error(
        "❌ Error during event payment init:",
        err?.response?.data || err
      );
      setBookingError(
        err?.response?.data?.message ||
          "Failed to initiate payment. Please try again."
      );
      setBookingLoading(false);
    }
  };

  const handleTicketChange = (delta) => {
    setTickets((prev) => {
      const next = Math.max(1, prev + delta);
      if (typeof remainingSeats === "number" && remainingSeats > 0) {
        return Math.min(next, remainingSeats);
      }
      return next;
    });
  };

  // ─────────────────────────────────────────
  // Loading / error states
  // ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-sky-400 animate-spin mb-3" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Setting up your Passiify booking…
        </p>
      </div>
    );
  }

  if (pageError || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 text-center">
        <p className="text-lg text-slate-700 dark:text-slate-100 mb-3">
          {pageError || "We couldn’t find this experience."}
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-[0_18px_55px_rgba(15,23,42,0.65)] hover:shadow-[0_22px_70px_rgba(15,23,42,0.85)] hover:scale-[1.03] transition-transform"
        >
          Browse other experiences
        </Link>
      </div>
    );
  }

  const locationLabel = getLocationLabel(event);

  const coverImage =
    event.bannerImage ||
    event.image ||
    (Array.isArray(event.images) && event.images[0]) ||
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&auto=format&fit=crop&q=80";

  // ─────────────────────────────────────────
  // Main UI
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50 pb-16">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-orange-300 transition"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back
        </button>

        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          <span className="hidden sm:inline">Passiify · Booking</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-500">
            ·
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full border border-blue-500/60 flex items-center justify-center text-[10px] text-blue-600 dark:text-sky-300">
              1
            </span>
            <span>Review</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full border border-slate-400/40 flex items-center justify-center text-[10px] text-slate-400">
              2
            </span>
            <span>Confirm</span>
          </span>
        </div>
      </div>

      {/* HERO STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
        <div className="relative rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-900 overflow-hidden shadow-[0_26px_90px_rgba(15,23,42,0.45)]">
          <div className="absolute inset-0 opacity-70">
            <div className="absolute -top-20 -left-10 w-64 h-64 rounded-full bg-blue-500/40 blur-3xl" />
            <div className="absolute -bottom-24 right-0 w-72 h-72 rounded-full bg-orange-500/40 blur-3xl" />
          </div>

          <div className="relative px-5 sm:px-8 py-5 sm:py-6 flex flex-col md:flex-row justify-between gap-4 md:gap-6 items-start md:items-center">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700/80 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                <span className="uppercase tracking-[0.18em] text-slate-100">
                  You’re almost booked in
                </span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-white">
                {event.name}
              </h1>
              <p className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-200">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-orange-300" />
                  {locationLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-slate-100">
                  <CalendarDays size={14} className="text-sky-300" />
                  {dateLabel}
                  {timeLabel ? ` · ${timeLabel}` : ""}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-slate-100">
                  <Users size={14} className="text-emerald-300" />
                  {capacityLabel}
                </span>
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 text-right">
              <div className="inline-flex items-baseline gap-1 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-700 text-slate-50">
                <span className="text-[11px] text-slate-300">from</span>
                <span className="text-xl sm:text-2xl font-extrabold text-orange-300">
                  {pricePerTicket ? `₹${pricePerTicket}` : "Price TBA"}
                </span>
                {pricePerTicket && (
                  <span className="text-[11px] text-slate-300 ml-1">
                    / person
                  </span>
                )}
              </div>
              {typeof remainingSeats === "number" && (
                <div
                  className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full border text-slate-100 ${
                    remainingSeats > 0
                      ? "bg-emerald-600/70 border-emerald-300/60"
                      : "bg-rose-600/70 border-rose-300/60"
                  }`}
                >
                  <Info size={13} className="text-white" />
                  <span>
                    {remainingSeats > 0
                      ? `${remainingSeats} seats left`
                      : "Sold out"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 grid md:grid-cols-3 gap-8 lg:gap-10">
        {/* LEFT: Summary / reassurance */}
        <section className="md:col-span-2 space-y-6">
          {/* Experience snapshot */}
          <div className="bg-white/90 dark:bg-slate-900/85 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_18px_55px_rgba(15,23,42,0.15)] flex gap-4">
            <div className="hidden sm:block w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
              <img
                src={coverImage}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Your chosen experience
              </p>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
                {event.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                {event.description ||
                  "A curated fitness experience designed for travellers and locals to move, connect and explore the city together — without any long-term membership."}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <Clock
                    size={13}
                    className="text-blue-500 dark:text-sky-400"
                  />
                  Arrive 10–15 min early
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <ShieldCheck
                    size={13}
                    className="text-emerald-500 dark:text-emerald-400"
                  />
                  Verified host · Secure pass
                </span>
              </div>
            </div>
          </div>

          {/* Tiny FAQ */}
          <div className="bg-white/90 dark:bg-slate-900/85 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_18px_55px_rgba(15,23,42,0.12)]">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 dark:text-sky-400" />
              Before you confirm
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div>
                <p className="font-semibold mb-1">Do I need a membership?</p>
                <p>No. This is a one-time experience. Just book and show up.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Payment & pass</p>
                <p>
                  You’ll receive a Passiify ticket with a QR code instantly
                  after successful payment.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Can I cancel?</p>
                <p className="text-xs sm:text-sm">
                  Cancellations follow this event’s policy. You’ll see it again
                  on your ticket.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Booking card */}
        <aside className="md:sticky md:top-24 h-fit">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-[0_26px_90px_rgba(15,23,42,0.22)] p-5 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 mb-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-sky-400" />
              Confirm your booking
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">
              Choose how many passes you want and review your total before you
              confirm.
            </p>

            {/* Ticket selector */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-50">
                  Number of passes
                </span>
                {typeof remainingSeats === "number" && remainingSeats > 0 && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Max {remainingSeats} for this date
                  </span>
                )}
              </div>
              <div className="inline-flex items-center gap-3 px-3 py-2 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleTicketChange(-1)}
                  disabled={tickets <= 1}
                  className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {tickets}
                </span>
                <button
                  type="button"
                  onClick={() => handleTicketChange(1)}
                  disabled={
                    typeof remainingSeats === "number" &&
                    remainingSeats > 0 &&
                    tickets >= remainingSeats
                  }
                  className="w-7 h-7 rounded-full flex items-center justify-center border border-blue-500/70 dark:border-sky-500/70 text-blue-600 dark:text-sky-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 mb-4 space-y-2">
              <div className="flex justify-between">
                <span>Base price</span>
                <span>
                  ₹{pricePerTicket || 0}{" "}
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    x {tickets}
                  </span>
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                <span>Platform fee</span>
                <span>Included</span>
              </div>
              <div className="pt-2 mt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between font-semibold text-slate-900 dark:text-slate-50">
                <span>Total due today</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>

            {!pricePerTicket && (
              <p className="mb-3 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-3 py-2">
                This event’s price is being updated by the host. You can browse
                other experiences or check back in a bit.
              </p>
            )}

            {/* Status / date banner */}
            {!isPast ? (
              diffDays !== null && diffDays > 0 ? (
                <p className="flex items-center gap-2 bg-sky-50 dark:bg-sky-900/35 border border-sky-100 dark:border-sky-800 px-4 py-2 rounded-2xl text-xs sm:text-sm text-sky-800 dark:text-sky-200 mb-3">
                  <Clock size={16} className="text-sky-500 dark:text-sky-300" />
                  Starts in{" "}
                  <span className="font-semibold">{diffDays}</span> day
                  {diffDays > 1 ? "s" : ""} — your pass will be sent instantly
                  after payment.
                </p>
              ) : (
                <p className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/35 border border-emerald-100 dark:border-emerald-800 px-4 py-2 rounded-2xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 mb-3">
                  <Clock
                    size={16}
                    className="text-emerald-500 dark:text-emerald-300"
                  />
                  Happening <span className="font-semibold">today</span> — book
                  now to secure your spot.
                </p>
              )
            ) : (
              <p className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/35 border border-rose-100 dark:border-rose-800 px-4 py-2 rounded-2xl text-xs sm:text-sm text-rose-800 dark:text-rose-200 mb-3">
                <Clock
                  size={16}
                  className="text-rose-500 dark:text-rose-300"
                />
                This experience has already ended.
              </p>
            )}

            {/* Booking error (payment) */}
            {bookingError && (
              <p className="mb-3 text-xs sm:text-sm text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 rounded-2xl px-3 py-2">
                {bookingError}
              </p>
            )}

            {/* Main CTA */}
            <button
              onClick={handleBookEvent}
              disabled={bookingDisabled || bookingLoading}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm mt-1 transition-transform shadow-md ${
                bookingDisabled
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-white hover:shadow-[0_18px_55px_rgba(15,23,42,0.55)] hover:scale-[1.03]"
              }`}
            >
              {bookingLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Ticket size={18} />
                  {isPast || isSoldOut || !pricePerTicket
                    ? "Not available"
                    : "Confirm & pay securely"}
                </>
              )}
            </button>

            {/* Trust block */}
            <div className="mt-5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-[11px] sm:text-[13px] text-slate-700 dark:text-slate-300 space-y-2">
              <p className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-emerald-500 dark:text-emerald-400"
                />
                100% secure payment processed via Passiify & Razorpay.
              </p>
              <p className="flex items-center gap-2">
                <Lock
                  size={16}
                  className="text-slate-600 dark:text-slate-300"
                />
                Your card & UPI details are encrypted end-to-end by Razorpay.
              </p>
              <p className="flex items-center gap-2">
                <Info
                  size={16}
                  className="text-orange-500 dark:text-orange-400"
                />
                Your QR ticket and exact meeting point will be shared
                immediately on confirmation.
              </p>
            </div>

            <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
              By confirming, you agree to this event’s cancellation policy and
              Passiify’s terms. Just book this one experience, show your QR pass
              at check-in, and you’re in — no complicated memberships.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default BookEvent;
