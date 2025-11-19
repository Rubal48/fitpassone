// src/pages/BookingSuccess.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  MapPin,
  CalendarDays,
  Dumbbell,
  IndianRupee,
  Download,
  Users,
  Ticket,
  ShieldCheck,
  Clock,
  Info,
  Loader2,
  QrCode,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import jsPDF from "jspdf";
import API from "../utils/api";

export default function BookingSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 'event' or 'gym' – default to gym if not passed
  const initialType = location.state?.type || "gym";

  const [booking, setBooking] = useState(null);
  const [type, setType] = useState(initialType);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* 🎉 Confetti animation on mount */
  useEffect(() => {
    const duration = 1400;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 12,
        startVelocity: 28,
        spread: 70,
        origin: { x: Math.random(), y: Math.random() - 0.1 },
        colors: ["#22c55e", "#38bdf8", "#f97316", "#e11d48"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  }, []);

  /* 🧾 Fetch booking data */
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }

        const endpoint =
          initialType === "event"
            ? `/event-bookings/${id}`
            : `/bookings/${id}`;

        const res = await API.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data?.booking || res.data;

        if (!data || !data._id) {
          console.warn("⚠️ Unexpected booking response:", res.data);
          setError("Booking data not found.");
          return;
        }

        // Infer type from data in case state was lost on refresh
        const inferredType = data.event ? "event" : data.gym ? "gym" : initialType;

        setBooking(data);
        setType(inferredType);
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("Could not load your booking details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBooking();
  }, [id, initialType]);

  /* 📄 Generate PDF Ticket */
  const handleDownload = () => {
    if (!booking) return;

    const isEvent = type === "event";
    const item = isEvent ? booking.event : booking.gym;

    const doc = new jsPDF();

    // Header band
    doc.setFillColor(10, 16, 35);
    doc.rect(0, 0, 210, 42, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Passiify", 15, 24);
    doc.setFontSize(10);
    doc.text(
      isEvent
        ? "Your Adventure, Your Story — Passiify Events"
        : "Your Fitness, Your Way — Passiify Gym Pass",
      15,
      31
    );

    // White ticket card
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(10, 50, 190, 125, 5, 5, "F");
    doc.setDrawColor(230, 230, 230);

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(
      isEvent ? "Event Booking Confirmation" : "Gym Pass Confirmation",
      15,
      66
    );

    doc.line(15, 70, 195, 70);

    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81);

    const bookingCode = booking.bookingCode || booking._id;
    const tickets = booking.tickets || 1;
    const dateRaw = isEvent ? item?.date : booking.date;
    const dateLabel = dateRaw
      ? new Date(dateRaw).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "TBA";

    if (isEvent) {
      doc.text(`Event: ${item?.name || "Passiify Event"}`, 15, 86);
      doc.text(`Location: ${item?.location || "Venue"}`, 15, 96);
      doc.text(`Date: ${dateLabel}`, 15, 106);
      doc.text(`Tickets: ${tickets}`, 15, 116);
      doc.text(
        `Total: ₹${booking.totalPrice || item?.price || "N/A"}`,
        15,
        126
      );
      if (bookingCode) doc.text(`Ticket Code: ${bookingCode}`, 15, 136);
    } else {
      doc.text(`Gym: ${item?.name || "Fitness Centre"}`, 15, 86);
      doc.text(`City: ${item?.city || "City"}`, 15, 96);
      doc.text(`Date: ${dateLabel}`, 15, 106);
      doc.text(
        `Pass: ${booking.duration || 1}-Day Access`,
        15,
        116
      );
      doc.text(
        `Price: ₹${booking.price || item?.price || "N/A"}`,
        15,
        126
      );
      if (bookingCode) doc.text(`Booking Code: ${bookingCode}`, 15, 136);
    }

    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(
      "Please show this ticket at the venue. Verified via Passiify Dashboard.",
      15,
      154,
      { maxWidth: 180 }
    );

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "© Passiify — India’s flexible fitness & experience pass platform.",
      15,
      192
    );

    doc.save(
      `Passiify_${isEvent ? "Event" : "Gym"}_Ticket_${
        bookingCode || "Booking"
      }.pdf`
    );
  };

  /* 🔄 Shared computed values */
  const isEvent = type === "event";
  const item = isEvent ? booking?.event : booking?.gym;

  const formattedDate = (() => {
    if (!booking || !item) return "Date not available";
    const rawDate = isEvent ? item.date : booking.date;
    if (!rawDate) return "Date not available";
    return new Date(rawDate).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  })();

  const formattedTime = (() => {
    if (!booking || !item) return null;
    const raw =
      (isEvent && (item.startTime || item.time)) ||
      booking.startTime ||
      null;
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  })();

  const displayAmount =
    booking?.totalPrice || booking?.price || item?.price || "—";

  const shortId =
    (booking?.bookingCode || booking?._id || "").slice(-6).toUpperCase() ||
    "TICKET";

  const bookingStatusLabel = (() => {
    const status = booking?.status;
    if (!status) return "Active";
    return status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  })();

  const statusColorClasses =
    booking?.status === "cancelled"
      ? "bg-rose-500/10 text-rose-400 border-rose-500/40"
      : booking?.status === "checked-in"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
      : "bg-sky-500/10 text-sky-300 border-sky-500/40";

  const hostNote = isEvent ? item?.personalNote : null;
  const meetingPoint = isEvent ? item?.meetingPoint : null;
  const meetingInstructions = isEvent ? item?.meetingInstructions : null;

  const cancellationPolicy = isEvent ? item?.cancellationPolicy : null;
  const policySummary = (() => {
    if (!cancellationPolicy || cancellationPolicy.type === "none") {
      return "This experience may not support refunds close to start time. Please review your ticket or contact support if needed.";
    }
    const free = cancellationPolicy.freeCancellationHours ?? 24;
    const before = cancellationPolicy.refundPercentBefore ?? 100;
    const after = cancellationPolicy.refundPercentAfter ?? 0;

    return `Free cancellation (${before}% refund) until ${free} hours before start. After that, up to ${after}% refund depending on timing.`;
  })();

  const ticketsCount = booking?.tickets || 1;

  const qrImage =
    booking?.qrCodeImage ||
    booking?.qrImage ||
    booking?.qrCodeDataUrl ||
    booking?.qrCode ||
    null;

  /* ⏳ Loading / Error states */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-sky-400 animate-spin mb-3" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Fetching your Passiify ticket…
        </p>
      </div>
    );
  }

  if (error || !booking) {
    const isEventFromState = initialType === "event";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-center px-4">
        <p className="mb-3 text-base sm:text-lg text-slate-800 dark:text-slate-100">
          ⚠️ {error || "Booking not found."}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-slate-800 dark:text-slate-100 transition"
          >
            Go back
          </button>
          <Link
            to={isEventFromState ? "/events" : "/explore"}
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.03] transition"
          >
            Browse {isEventFromState ? "events" : "gyms"}
          </Link>
        </div>
      </div>
    );
  }

  const locationLabel =
    item?.location || item?.city || item?.area || "Location TBA";

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50 pb-12 relative overflow-hidden">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 w-[360px] h-[360px] bg-sky-500/25 dark:bg-sky-500/35 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-32 w-[380px] h-[380px] bg-orange-500/25 dark:bg-orange-500/35 rounded-full blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="relative border-b border-slate-200/70 dark:border-slate-800/80 bg-white/75 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(isEvent ? "/events" : "/explore")}
            className="inline-flex items-center text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-orange-300 transition"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to {isEvent ? "experiences" : "gyms"}
          </button>
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Passiify · {isEvent ? "Experience ticket" : "Gym pass"}
          </span>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-6 lg:pt-8">
        <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.85fr)] gap-6 lg:gap-8 items-stretch">
          {/* Ticket card */}
          <div className="relative bg-white/90 dark:bg-slate-950/85 border border-slate-200/70 dark:border-slate-800 rounded-3xl shadow-[0_28px_90px_rgba(15,23,42,0.35)] overflow-hidden backdrop-blur-xl">
            {/* Header strip */}
            <div className="relative px-6 sm:px-8 pt-7 pb-8 bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 dark:from-sky-500 dark:via-blue-600 dark:to-orange-500 text-slate-950 border-b border-white/50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold opacity-80">
                    Passiify ticket
                  </p>
                  <h1 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight">
                    {isEvent ? "Event booked" : "Gym pass confirmed"}
                  </h1>
                  <p className="text-[11px] sm:text-xs mt-1.5 opacity-85 max-w-xs">
                    {isEvent
                      ? "Your spot is locked in. We just sent all details to your email."
                      : "Your day pass is active. Show this at the front desk when you arrive."}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-semibold ${statusColorClasses}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{bookingStatusLabel}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 text-[10px] font-mono font-semibold">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{shortId}</span>
                  </div>
                </div>
              </div>

              {/* perforation circles */}
              <div className="absolute -bottom-4 left-14 w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-950 border border-white/70 dark:border-slate-800" />
              <div className="absolute -bottom-4 right-14 w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-950 border border-white/70 dark:border-slate-800" />
            </div>

            {/* Main ticket body */}
            <div className="px-6 sm:px-8 pt-6 pb-7 bg-gradient-to-b from-white/95 via-white/90 to-slate-50/90 dark:from-slate-950/90 dark:via-slate-950/95 dark:to-slate-950 text-slate-900 dark:text-slate-100">
              {/* Title & host */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold leading-snug">
                    {item?.name ||
                      (isEvent ? "Passiify Experience" : "Passiify Partner Gym")}
                  </h2>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    {isEvent
                      ? `Hosted by ${item?.organizer || "Passiify Community"}`
                      : "Verified by the Passiify team"}
                  </p>
                </div>
                {booking.bookingCode && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      Booking code
                    </p>
                    <p className="mt-0.5 font-mono text-xs sm:text-sm font-semibold">
                      {booking.bookingCode}
                    </p>
                  </div>
                )}
              </div>

              {/* Grid of key info */}
              <div className="grid grid-cols-2 gap-4 text-[11px] sm:text-xs">
                <div className="space-y-1.5">
                  <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wide text-[10px]">
                    Location
                  </p>
                  <p className="flex items-center text-slate-900 dark:text-slate-100">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-orange-500 dark:text-orange-400" />
                    {locationLabel}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wide text-[10px]">
                    Date & time
                  </p>
                  <p className="flex items-center">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-sky-500 dark:text-sky-400" />
                    {formattedDate}
                    {formattedTime ? ` · ${formattedTime}` : ""}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wide text-[10px]">
                    {isEvent ? "Tickets" : "Pass type"}
                  </p>
                  {isEvent ? (
                    <p className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-500 dark:text-emerald-400" />
                      {ticketsCount} ticket{ticketsCount > 1 ? "s" : ""}
                    </p>
                  ) : (
                    <p className="flex items-center">
                      <Dumbbell className="w-3.5 h-3.5 mr-1.5 text-emerald-500 dark:text-emerald-400" />
                      {booking.duration || 1}-day pass
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wide text-[10px]">
                    Amount paid
                  </p>
                  <p className="flex items-center font-semibold">
                    <IndianRupee className="w-3.5 h-3.5 mr-1.5 text-lime-500 dark:text-lime-400" />
                    {displayAmount}
                  </p>
                </div>
              </div>

              {/* QR + info row */}
              <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                {/* QR / usage */}
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 px-3.5 py-3 flex gap-3">
                    <div className="w-24 h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                      {qrImage ? (
                        <img
                          src={qrImage}
                          alt="Passiify QR code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center px-2 text-center">
                          <QrCode className="w-7 h-7 text-slate-400 mb-1.5" />
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            QR will be available on this screen and your email
                            when the host enables scanning.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5 text-[11px] sm:text-xs text-slate-700 dark:text-slate-200">
                      <p className="font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                        Show this {isEvent ? "ticket" : "pass"} at check-in.
                      </p>
                      <ul className="space-y-1.5 list-disc pl-4">
                        <li>Keep a valid ID with the same name.</li>
                        <li>Do not share your QR or booking code publicly.</li>
                        <li>Arrive 10–15 minutes before start time.</li>
                      </ul>
                    </div>
                  </div>

                  {isEvent && hostNote && (
                    <div className="rounded-2xl border border-sky-200/70 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/20 px-3.5 py-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Host’s note
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-100">
                        “{hostNote}”
                      </p>
                    </div>
                  )}
                </div>

                {/* Meeting / cancellation */}
                <div className="space-y-3">
                  {isEvent && (meetingPoint || meetingInstructions) && (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70 px-3.5 py-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Meeting details
                      </p>
                      {meetingPoint && (
                        <p className="text-[11px] sm:text-xs mb-1.5">
                          <span className="font-medium">Point: </span>
                          {meetingPoint}
                        </p>
                      )}
                      {meetingInstructions && (
                        <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
                          {meetingInstructions}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="rounded-2xl border border-amber-200/70 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/20 px-3.5 py-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 mb-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Cancellation & refund
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-100">
                      {isEvent
                        ? policySummary
                        : "Gym passes may follow the gym’s own cancellation rules. For issues, contact Passiify support with your booking code."}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA row */}
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400 text-white text-xs sm:text-sm font-semibold py-3 shadow-[0_18px_55px_rgba(15,23,42,0.65)] hover:scale-[1.02] hover:shadow-[0_22px_70px_rgba(15,23,42,0.8)] transition-transform"
                >
                  <Download className="w-4 h-4" />
                  Download ticket
                </button>

                <Link
                  to={isEvent ? "/my-event-bookings" : "/my-bookings"}
                  className="flex-1 inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold py-3 text-slate-800 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500 transition"
                >
                  View my {isEvent ? "event" : "gym"} bookings
                </Link>
              </div>

              <p className="mt-5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                This ticket is securely stored in your{" "}
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  Passiify account
                </span>
                . For any changes or questions, contact support with your booking
                code.
              </p>
            </div>
          </div>

          {/* Side brand column */}
          <aside className="hidden md:flex flex-col justify-between rounded-3xl overflow-hidden border border-slate-200/70 dark:border-slate-800 bg-gradient-to-b from-blue-600 via-sky-500 to-orange-500 dark:from-sky-500 dark:via-blue-700 dark:to-orange-500 shadow-[0_26px_90px_rgba(15,23,42,0.45)] text-slate-950">
            <div className="p-6 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 text-[11px] font-semibold uppercase tracking-[0.18em]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified by Passiify
              </div>
              <p className="text-lg font-semibold leading-snug">
                One ticket, no membership.
                <br />
                <span className="opacity-85">
                  Move, explore and meet people wherever you land.
                </span>
              </p>
              <p className="text-xs opacity-85">
                Built for travellers, expats and locals who hate lock-ins but
                love good sessions, good hosts and good stories.
              </p>
            </div>

            <div className="p-6 text-xs border-t border-white/60 bg-white/10">
              <p className="font-semibold mb-1">Why hosts trust Passiify</p>
              <ul className="space-y-1.5 opacity-90">
                <li>• Instant ticket verification with QR / booking code</li>
                <li>• Simple payouts and transparent fees</li>
                <li>• Community of global travellers & Gen-Z movers</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
