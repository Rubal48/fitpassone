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
  Loader2,
  QrCode,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import jsPDF from "jspdf";
import API from "../utils/api";

/* =========================================================
   Helper — derive a generic activity label (yoga / MMA / etc.)
   so the app is not "gym only"
========================================================= */
const getActivityLabel = (isEvent, item) => {
  if (!item) return isEvent ? "Experience" : "Session";

  const rawSource =
    item.category ||
    item.type ||
    item.activityType ||
    (Array.isArray(item.tags) && item.tags.join(" ")) ||
    item.name ||
    "";
  const raw = rawSource.toString().toLowerCase();

  if (raw.includes("yoga")) return "Yoga session";
  if (raw.includes("mma")) return "MMA training";
  if (raw.includes("boxing")) return "Boxing session";
  if (raw.includes("kickboxing")) return "Kickboxing session";
  if (raw.includes("crossfit")) return "CrossFit workout";
  if (raw.includes("dance")) return "Dance session";
  if (raw.includes("pilates")) return "Pilates session";
  if (raw.includes("zumba")) return "Zumba class";
  if (raw.includes("gym") || raw.includes("fitness"))
    return isEvent ? "Fitness event" : "Gym workout";

  return isEvent ? "Experience" : "Session";
};

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
  const [downloading, setDownloading] = useState(false); // ✅ for PDF button

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

  /* 📄 Generate PREMIUM PDF Ticket (vector layout, Passiify theme, dark/light aware) */
  const handleDownload = () => {
    if (!booking) return;

    setDownloading(true);

    try {
      const isEvent = type === "event";
      const item = isEvent ? booking.event : booking.gym;
      const activityLabel = getActivityLabel(isEvent, item); // e.g. "Yoga session"

      // Detect user theme for PDF palette
      let prefersDark = false;
      if (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        prefersDark = true;
      }

      const accentBlue = { r: 37, g: 99, b: 235 }; // #2563EB
      const accentSky = { r: 14, g: 165, b: 233 }; // #0EA5E9
      const accentOrange = { r: 249, g: 115, b: 22 }; // #F97316

      const lightPalette = {
        background: { r: 244, g: 245, b: 251 }, // F4F5FB
        cardBg: { r: 255, g: 255, b: 255 },
        cardBorder: { r: 226, g: 232, b: 240 }, // slate-200
        textMain: { r: 15, g: 23, b: 42 }, // slate-900
        textMuted: { r: 100, g: 116, b: 139 }, // slate-500
        textSoft: { r: 148, g: 163, b: 184 }, // slate-400
      };

      const darkPalette = {
        background: { r: 3, g: 7, b: 18 }, // slate-950
        cardBg: { r: 15, g: 23, b: 42 }, // slate-900
        cardBorder: { r: 30, g: 64, b: 175 }, // blue-800
        textMain: { r: 248, g: 250, b: 252 }, // slate-50
        textMuted: { r: 148, g: 163, b: 184 }, // slate-400
        textSoft: { r: 100, g: 116, b: 139 }, // slate-500
      };

      const palette = prefersDark ? darkPalette : lightPalette;

      const doc = new jsPDF("p", "mm", "a4"); // portrait A4
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Background
      doc.setFillColor(
        palette.background.r,
        palette.background.g,
        palette.background.b
      );
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Ticket card dimensions (centered)
      const cardMarginX = 12;
      const cardMarginY = 28;
      const cardW = pageWidth - cardMarginX * 2;
      const cardH = 130;
      const cardX = cardMarginX;
      const cardY = cardMarginY;

      // Outer card
      doc.setFillColor(palette.cardBg.r, palette.cardBg.g, palette.cardBg.b);
      doc.setDrawColor(
        palette.cardBorder.r,
        palette.cardBorder.g,
        palette.cardBorder.b
      );
      doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, "FD");

      // Header gradient band inside card (Passiify blue → sky → orange)
      const headerH = 30;
      const h1W = cardW * 0.5;
      const h2W = cardW * 0.25;
      const h3W = cardW * 0.25;

      doc.setFillColor(accentBlue.r, accentBlue.g, accentBlue.b);
      doc.rect(cardX, cardY, h1W, headerH, "F");
      doc.setFillColor(accentSky.r, accentSky.g, accentSky.b);
      doc.rect(cardX + h1W, cardY, h2W, headerH, "F");
      doc.setFillColor(accentOrange.r, accentOrange.g, accentOrange.b);
      doc.rect(cardX + h1W + h2W, cardY, h3W, headerH, "F");

      // Brand + header text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      const headerTextX = cardX + 14;
      let headerTextY = cardY + 11;
      doc.text("Passiify", headerTextX, headerTextY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      headerTextY += 5;
      doc.text(
        "Flexible passes for gyms, yoga, MMA & more",
        headerTextX,
        headerTextY
      );

      const bookingCode = booking.bookingCode || booking._id;
      const shortId =
        (bookingCode || "").toString().slice(-6).toUpperCase() || "TICKET";

      // Right side header info
      doc.setFontSize(7.5);
      const headerRightX = cardX + cardW - 14;
      doc.text(`Booking ID: ${shortId}`, headerRightX, cardY + 10, {
        align: "right",
      });
      doc.text("Digital session pass", headerRightX, cardY + 16, {
        align: "right",
      });

      // Perforation circles & dotted line (visual ticket feel)
      const perfRadius = 3.5;
      const perfXLeft = cardX + 18;
      const perfXRight = cardX + cardW - 18;
      const perfYMid = cardY + cardH / 2;

      doc.setFillColor(
        palette.background.r,
        palette.background.g,
        palette.background.b
      );
      doc.setDrawColor(
        palette.cardBorder.r,
        palette.cardBorder.g,
        palette.cardBorder.b
      );
      doc.circle(perfXLeft, perfYMid, perfRadius, "FD");
      doc.circle(perfXRight, perfYMid, perfRadius, "FD");

      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.25);
      const dashStartX = perfXLeft + perfRadius;
      const dashEndX = perfXRight - perfRadius;
      for (let x = dashStartX; x < dashEndX; x += 3) {
        doc.line(x, perfYMid, x + 1.5, perfYMid);
      }

      // Shared values
      const locationLabel =
        item?.location || item?.city || item?.area || "Location TBA";

      const dateRaw = isEvent ? item?.date : booking.date;
      const formattedDate = dateRaw
        ? new Date(dateRaw).toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Date not set";

      const timeRaw =
        (isEvent && (item?.startTime || item?.time)) ||
        booking.startTime ||
        null;

      const formattedTime = timeRaw
        ? new Date(timeRaw).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null;

      const displayAmount =
        booking?.totalPrice || booking?.price || item?.price || "—";

      const ticketsCount = booking?.tickets || 1;
      const passLabel = isEvent
        ? `${ticketsCount} ticket${ticketsCount > 1 ? "s" : ""}`
        : `${booking.duration || 1}-day flex pass`;

      const bookingStatusLabel = (() => {
        const status = booking?.status;
        if (!status) return "Active";
        return status
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      })();

      const statusColor = (() => {
        if (booking?.status === "cancelled") {
          return { r: 248, g: 113, b: 113 }; // red-400
        }
        if (booking?.status === "checked-in" || booking?.status === "completed") {
          return { r: 34, g: 197, b: 94 }; // green-500
        }
        return accentSky; // default sky
      })();

      const qrImage =
        booking?.qrCodeImage ||
        booking?.qrImage ||
        booking?.qrCodeDataUrl ||
        booking?.qrCode ||
        null;

      // Content columns
      const contentPaddingX = cardX + 14;
      const contentTopY = cardY + headerH + 10;
      const rightColX = cardX + cardW * 0.62;

      // Left column — main info
      let y = contentTopY;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(
        palette.textMain.r,
        palette.textMain.g,
        palette.textMain.b
      );
      doc.text("Booking confirmed", contentPaddingX, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(
        palette.textMuted.r,
        palette.textMuted.g,
        palette.textMuted.b
      );
      const subtitle = isEvent
        ? `Your ${activityLabel.toLowerCase()} is locked in. Check in with this ticket.`
        : `Your ${activityLabel.toLowerCase()} is active. Show this pass when you arrive.`;
      doc.text(subtitle, contentPaddingX, y);
      y += 10;

      // Status pill + short ID
      const pillX = contentPaddingX;
      const pillY = y - 5;
      const pillPaddingX = 3;
      const pillHeight = 7;
      const pillText = bookingStatusLabel.toUpperCase();
      doc.setFontSize(7.5);
      const pillTextWidth = doc.getTextWidth(pillText) + pillPaddingX * 2;

      doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
      doc.setDrawColor(statusColor.r, statusColor.g, statusColor.b);
      doc.roundedRect(
        pillX,
        pillY,
        pillTextWidth + 4,
        pillHeight + 2,
        3,
        3,
        "FD"
      );
      doc.setTextColor(255, 255, 255);
      doc.text(pillText, pillX + pillPaddingX + 2, pillY + 5.2);

      const shortPillText = `#${shortId}`;
      const shortPillX = pillX + pillTextWidth + 10;
      const shortPillWidth =
        doc.getTextWidth(shortPillText) + pillPaddingX * 2;

      doc.setFillColor(15, 23, 42);
      doc.setDrawColor(15, 23, 42);
      doc.roundedRect(
        shortPillX,
        pillY,
        shortPillWidth + 4,
        pillHeight + 2,
        3,
        3,
        "FD"
      );
      doc.setTextColor(248, 250, 252);
      doc.text(shortPillText, shortPillX + pillPaddingX + 2, pillY + 5.2);

      y += 11;

      // Activity name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(
        palette.textMain.r,
        palette.textMain.g,
        palette.textMain.b
      );
      doc.text(
        item?.name ||
          (isEvent ? "Passiify Experience" : "Passiify Partner Location"),
        contentPaddingX,
        y
      );
      y += 6;

      // "Hosted by" / "Verified"
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(
        palette.textMuted.r,
        palette.textMuted.g,
        palette.textMuted.b
      );
      doc.text(
        isEvent
          ? `Hosted by ${item?.organizer || "Passiify Community"}`
          : "Verified by Passiify",
        contentPaddingX,
        y
      );
      y += 10;

      // Details grid (2 columns)
      doc.setFontSize(7.5);
      doc.setTextColor(
        palette.textSoft.r,
        palette.textSoft.g,
        palette.textSoft.b
      );
      const colGap = 68;
      const col2X = contentPaddingX + colGap;

      // Row 1: Location / Date & time
      doc.text("LOCATION", contentPaddingX, y);
      doc.setTextColor(
        palette.textMain.r,
        palette.textMain.g,
        palette.textMain.b
      );
      doc.setFontSize(9);
      doc.text(locationLabel, contentPaddingX, y + 5);

      doc.setFontSize(7.5);
      doc.setTextColor(
        palette.textSoft.r,
        palette.textSoft.g,
        palette.textSoft.b
      );
      doc.text("DATE & TIME", col2X, y);
      doc.setFontSize(9);
      doc.setTextColor(
        palette.textMain.r,
        palette.textMain.g,
        palette.textMain.b
      );
      const dtLine = formattedTime
        ? `${formattedDate} · ${formattedTime}`
        : formattedDate;
      doc.text(dtLine, col2X, y + 5);

      y += 15;

      // Row 2: Access / Amount
      doc.setFontSize(7.5);
      doc.setTextColor(
        palette.textSoft.r,
        palette.textSoft.g,
        palette.textSoft.b
      );
      doc.text(isEvent ? "TICKETS" : "ACCESS", contentPaddingX, y);
      doc.setFontSize(9);
      doc.setTextColor(
        palette.textMain.r,
        palette.textMain.g,
        palette.textMain.b
      );
      doc.text(passLabel, contentPaddingX, y + 5);

      doc.setFontSize(7.5);
      doc.setTextColor(
        palette.textSoft.r,
        palette.textSoft.g,
        palette.textSoft.b
      );
      doc.text("AMOUNT PAID", col2X, y);
      doc.setFontSize(9.5);
      doc.setTextColor(22, 163, 74); // green-ish for price
      doc.text(`₹${displayAmount}`, col2X, y + 5);

      // Right column — QR + summary
      const qrBoxSize = 46;
      const qrBoxX = rightColX + 6;
      const qrBoxY = contentTopY + 4;

      doc.setDrawColor(
        palette.cardBorder.r,
        palette.cardBorder.g,
        palette.cardBorder.b
      );
      doc.setFillColor(
        palette.background.r,
        palette.background.g,
        palette.background.b
      );
      doc.roundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 3, 3, "FD");

      if (
        qrImage &&
        typeof qrImage === "string" &&
        qrImage.startsWith("data:")
      ) {
        try {
          const type = qrImage.includes("image/jpeg") ? "JPEG" : "PNG";
          doc.addImage(
            qrImage,
            type,
            qrBoxX + 3,
            qrBoxY + 3,
            qrBoxSize - 6,
            qrBoxSize - 6
          );
        } catch (e) {
          console.warn("Could not embed QR in PDF:", e);
          doc.setFontSize(7);
          doc.setTextColor(
            palette.textSoft.r,
            palette.textSoft.g,
            palette.textSoft.b
          );
          doc.text("QR unavailable", qrBoxX + 8, qrBoxY + qrBoxSize / 2);
        }
      } else {
        doc.setFontSize(7);
        doc.setTextColor(
          palette.textSoft.r,
          palette.textSoft.g,
          palette.textSoft.b
        );
        doc.text("Show this ticket", qrBoxX + 7, qrBoxY + qrBoxSize / 2 - 2);
        doc.text("at check-in", qrBoxX + 10, qrBoxY + qrBoxSize / 2 + 3);
      }

      // QR caption
      doc.setFontSize(8);
      doc.setTextColor(
        palette.textMuted.r,
        palette.textMuted.g,
        palette.textMuted.b
      );
      doc.text(
        "Scan at entry or show to the host.",
        qrBoxX,
        qrBoxY + qrBoxSize + 8
      );

      // Mini summary under QR
      const summaryY = qrBoxY + qrBoxSize + 16;
      doc.setFontSize(8);
      doc.setTextColor(
        palette.textSoft.r,
        palette.textSoft.g,
        palette.textSoft.b
      );
      doc.text("Summary", qrBoxX, summaryY);
      doc.setFontSize(8.5);
      doc.setTextColor(
        palette.textMain.r,
        palette.textMain.g,
        palette.textMain.b
      );
      doc.text(
        `${activityLabel} · ${isEvent ? "Experience" : "Pass"}`,
        qrBoxX,
        summaryY + 4
      );
      doc.setFontSize(8);
      doc.setTextColor(
        palette.textMuted.r,
        palette.textMuted.g,
        palette.textMuted.b
      );
      doc.text(`Booking code: ${shortId}`, qrBoxX, summaryY + 9);

      // Fine print / footer
      const footerY = cardY + cardH - 14;
      doc.setFontSize(7.2);
      doc.setTextColor(
        palette.textSoft.r,
        palette.textSoft.g,
        palette.textSoft.b
      );
      doc.text(
        "Carry a valid ID matching the name on this booking. Do not share this ticket publicly. For any issues, contact Passiify support with your booking code.",
        cardX + 6,
        footerY,
        { maxWidth: cardW - 12 }
      );

      doc.setFontSize(7);
      doc.text(
        "© Passiify — India’s flexible fitness & experience pass platform.",
        cardX + 6,
        footerY + 6
      );

      doc.save(
        `Passiify_${isEvent ? "Experience" : "Session"}_Ticket_${
          bookingCode || "Booking"
        }.pdf`
      );
    } catch (err) {
      console.error("Error generating ticket PDF:", err);
      alert("Could not generate your ticket PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  /* 🔄 Shared computed values for on-screen UI */
  const isEvent = type === "event";
  const item = isEvent ? booking?.event : booking?.gym;
  const activityLabel = getActivityLabel(isEvent, item);

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
            Browse {isEventFromState ? "experiences" : "places"}
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
            Back to {isEvent ? "experiences" : "places"}
          </button>
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Passiify · {isEvent ? "Experience ticket" : "Session pass"}
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
                    Booking confirmed
                  </h1>
                  <p className="text-[11px] sm:text-xs mt-1.5 opacity-85 max-w-xs">
                    {isEvent
                      ? `Your ${activityLabel.toLowerCase()} is locked in. We just sent all details to your email.`
                      : `Your ${activityLabel.toLowerCase()} is active. Show this at the front desk or check-in desk when you arrive.`}
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
                      (isEvent ? "Passiify Experience" : "Passiify Partner Location")}
                  </h2>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    {isEvent
                      ? `Hosted by ${item?.organizer || "Passiify Community"}`
                      : "Verified by the Passiify team"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                    {activityLabel}
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
                    {isEvent ? "Tickets" : "Access"}
                  </p>
                  {isEvent ? (
                    <p className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-500 dark:text-emerald-400" />
                      {ticketsCount} ticket{ticketsCount > 1 ? "s" : ""}
                    </p>
                  ) : (
                    <p className="flex items-center">
                      <Dumbbell className="w-3.5 h-3.5 mr-1.5 text-emerald-500 dark:text-emerald-400" />
                      {booking.duration || 1}-day flex pass
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
                        : "Passes may follow the partner’s own cancellation rules. For issues, contact Passiify support with your booking code."}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA row */}
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400 text-white text-xs sm:text-sm font-semibold py-3 shadow-[0_18px_55px_rgba(15,23,42,0.65)] hover:scale-[1.02] hover:shadow-[0_22px_70px_rgba(15,23,42,0.8)] transition-transform disabled:opacity-70 disabled:hover:scale-100"
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {downloading ? "Preparing ticket…" : "Download ticket"}
                </button>

                <Link
                  to={isEvent ? "/my-event-bookings" : "/my-bookings"}
                  className="flex-1 inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold py-3 text-slate-800 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500 transition"
                >
                  View my {isEvent ? "event" : "session"} bookings
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
                  Drop into gyms, yoga, MMA, dance and more — on your terms.
                </span>
              </p>
              <p className="text-xs opacity-85">
                Built for travellers, expats and locals who hate lock-ins but
                love great sessions, great hosts and great stories.
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
