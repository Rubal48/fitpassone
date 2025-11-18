import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  CheckCircle,
  MapPin,
  CalendarDays,
  Dumbbell,
  IndianRupee,
  Download,
  Users,
  Ticket,
} from "lucide-react";
import jsPDF from "jspdf";
import API from "../utils/api";

export default function BookingSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 'event' or 'gym' – default to gym if not passed
  const type = location.state?.type || "gym";

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🎉 Confetti animation on mount
  useEffect(() => {
    const duration = 1500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 10,
        startVelocity: 28,
        spread: 70,
        origin: { x: Math.random(), y: Math.random() - 0.15 },
        colors: ["#FF4B5C", "#FF9F68", "#22c55e"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  }, []);

  // 🧾 Fetch booking data
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
          type === "event" ? `/event-bookings/${id}` : `/bookings/${id}`;

        const res = await API.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Handle both shapes: { booking } or direct booking
        if (res.data?.booking) {
          setBooking(res.data.booking);
        } else if (res.data?._id) {
          setBooking(res.data);
        } else {
          console.warn("⚠️ Unexpected booking response:", res.data);
          setError("Booking data not found.");
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("Could not load your booking details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBooking();
  }, [id, type]);

  // 📄 Generate PDF Ticket
  const handleDownload = () => {
    if (!booking) return;

    const item = type === "event" ? booking.event : booking.gym;
    const doc = new jsPDF();

    // Header bar
    doc.setFillColor("#111827");
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor("#FFFFFF");
    doc.setFontSize(22);
    doc.text("Passiify", 15, 25);
    doc.setFontSize(10);
    doc.text(
      type === "event"
        ? "Your Adventure, Your Story — Passiify Events"
        : "Your Fitness, Your Way — Passiify One-Day Pass",
      15,
      32
    );

    // Card
    doc.setFillColor("#FFFFFF");
    doc.roundedRect(10, 50, 190, 120, 5, 5, "F");
    doc.setFontSize(17);
    doc.setTextColor("#111827");
    doc.text(
      type === "event" ? "Event Booking Confirmation" : "Gym Booking Confirmation",
      15,
      65
    );

    doc.setDrawColor("#E5E7EB");
    doc.line(15, 70, 195, 70);

    doc.setFontSize(12);
    doc.setTextColor("#374151");

    if (type === "event") {
      doc.text(`Event: ${item?.name || "Passiify Event"}`, 15, 85);
      doc.text(`Location: ${item?.location || "Venue"}`, 15, 95);
      doc.text(
        `Date: ${
          item?.date
            ? new Date(item.date).toLocaleDateString("en-IN")
            : "TBA"
        }`,
        15,
        105
      );
      doc.text(`Tickets: ${booking?.tickets || 1}`, 15, 115);
      doc.text(
        `Total: ₹${booking?.totalPrice || item?.price || "N/A"}`,
        15,
        125
      );
      if (booking?._id) {
        doc.text(`Booking ID: ${booking._id}`, 15, 135);
      }
    } else {
      doc.text(`Gym: ${item?.name || "Fitness Centre"}`, 15, 85);
      doc.text(`City: ${item?.city || "City"}`, 15, 95);
      doc.text(
        `Date: ${
          booking?.date
            ? new Date(booking.date).toLocaleDateString("en-IN")
            : "TBA"
        }`,
        15,
        105
      );
      doc.text(
        `Pass: ${booking?.duration || 1}-Day Access`,
        15,
        115
      );
      doc.text(
        `Price: ₹${booking?.price || item?.price || "N/A"}`,
        15,
        125
      );
      if (booking?.bookingCode || booking?._id) {
        doc.text(
          `Booking ID: ${booking?.bookingCode || booking._id}`,
          15,
          135
        );
      }
    }

    doc.setFontSize(9);
    doc.setTextColor("#6B7280");
    doc.text(
      "Please show this ticket at the venue. Verified via Passiify Dashboard.",
      15,
      152,
      { maxWidth: 180 }
    );

    doc.setFontSize(9);
    doc.setTextColor("#9CA3AF");
    doc.text(
      "© Passiify — India’s flexible fitness & event pass platform.",
      15,
      190
    );

    doc.save(
      `Passiify_${type}_Ticket_${booking?._id || "Booking"}.pdf`
    );
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-sm sm:text-base text-gray-200"
        style={{
          backgroundColor: "#050308",
          backgroundImage:
            "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
        }}
      >
        Fetching your booking details...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-center px-4 text-gray-100"
        style={{
          backgroundColor: "#050308",
          backgroundImage:
            "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
        }}
      >
        <p className="mb-3 text-base sm:text-lg">⚠️ {error || "Booking not found."}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white/5 border border-white/25 hover:border-white/60 transition"
          >
            Go Back
          </button>
          <Link
            to={type === "event" ? "/events" : "/explore"}
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#FF4B5C] to-[#FF9F68] text-gray-950 shadow-[0_18px_60px_rgba(0,0,0,0.9)] hover:opacity-95"
          >
            Browse {type === "event" ? "Events" : "Gyms"}
          </Link>
        </div>
      </div>
    );
  }

  const item = type === "event" ? booking.event : booking.gym;

  const formattedDate = (() => {
    const rawDate = type === "event" ? item?.date : booking?.date;
    if (!rawDate) return "Date not available";
    return new Date(rawDate).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  })();

  const displayAmount =
    booking?.totalPrice || booking?.price || item?.price || "—";

  const shortId = (booking?._id || "").slice(-6).toUpperCase() || "N/A";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-16"
      style={{
        backgroundColor: "#050308",
        backgroundImage:
          "radial-gradient(circle at top, rgba(248,216,181,0.16), transparent 55%)",
      }}
    >
      {/* Ticket wrapper */}
      <div className="relative max-w-xl w-full">
        {/* Glow behind */}
        <div className="absolute inset-0 -z-10 blur-3xl opacity-60 bg-[radial-gradient(circle_at_top,_rgba(255,159,104,0.45),_transparent_55%)]" />

        <div className="relative bg-black/70 border border-white/15 rounded-[28px] shadow-[0_24px_90px_rgba(0,0,0,0.95)] overflow-hidden">
          {/* HEADER band */}
          <div className="relative px-6 sm:px-8 pt-8 pb-10 bg-[radial-gradient(circle_at_top,_#111827,_#030712)] border-b border-white/10">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-14 h-14 text-emerald-400 drop-shadow-[0_0_22px_rgba(16,185,129,0.7)] mb-3" />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide">
                {type === "event" ? "Event Booked" : "Pass Confirmed"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-sm">
                {type === "event"
                  ? "Your spot is locked in. See you at the event."
                  : "Your one-day pass is live. Show up, scan in and train."}
              </p>

              {/* Mini ticket label */}
              <div className="mt-5 inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-white/5 border border-white/20 text-[11px] font-medium text-gray-100">
                <Ticket className="w-3.5 h-3.5 text-orange-300" />
                <span>
                  {type === "event" ? "Event Booking" : "Gym Booking"} ·{" "}
                  <span className="text-orange-300">#{shortId}</span>
                </span>
              </div>
            </div>

            {/* Decorative perforation circle */}
            <div className="absolute -bottom-3 left-10 w-6 h-6 rounded-full bg-[#050308] border border-white/10" />
            <div className="absolute -bottom-3 right-10 w-6 h-6 rounded-full bg-[#050308] border border-white/10" />
          </div>

          {/* BODY / TICKET CONTENT */}
          <div className="px-6 sm:px-8 py-7 bg-gradient-to-b from-black/70 via-black/80 to-black/90 text-gray-100">
            {/* Main card */}
            <div className="bg-white/5 border border-white/12 rounded-2xl px-5 py-4 sm:px-6 sm:py-5 shadow-[0_16px_60px_rgba(0,0,0,0.9)]">
              <h2 className="text-lg sm:text-xl font-semibold mb-1 truncate">
                {item?.name ||
                  (type === "event" ? "Passiify Event" : "Fitness Centre")}
              </h2>

              <p className="text-[11px] sm:text-xs text-gray-400 mb-4">
                {type === "event"
                  ? "Hosted via Passiify Events"
                  : "Verified one-day access via Passiify"}
              </p>

              <div className="grid grid-cols-2 gap-4 text-[11px] sm:text-xs">
                {/* Location */}
                <div className="space-y-1.5">
                  <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                    Location
                  </p>
                  <p className="flex items-center text-gray-100">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-orange-300" />
                    {item?.location || item?.city || "TBA"}
                  </p>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                    Date
                  </p>
                  <p className="flex items-center text-gray-100">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-sky-300" />
                    {formattedDate}
                  </p>
                </div>

                {/* Pass / Tickets */}
                <div className="space-y-1.5">
                  <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                    {type === "event" ? "Tickets" : "Pass Type"}
                  </p>
                  {type === "event" ? (
                    <p className="flex items-center text-gray-100">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                      {booking?.tickets || 1} ticket
                      {booking?.tickets > 1 ? "s" : ""}
                    </p>
                  ) : (
                    <p className="flex items-center text-gray-100">
                      <Dumbbell className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                      {booking?.duration || 1}-Day pass
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                    Amount
                  </p>
                  <p className="flex items-center text-gray-100 font-semibold">
                    <IndianRupee className="w-3.5 h-3.5 mr-1.5 text-lime-300" />
                    {displayAmount}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-gray-950 text-xs sm:text-sm font-semibold py-3 shadow-[0_18px_60px_rgba(0,0,0,0.95)] hover:scale-[1.01] hover:shadow-[0_22px_70px_rgba(0,0,0,1)] transition-transform"
              >
                <Download className="w-4 h-4" />
                Download Ticket
              </button>

              <Link
                to={type === "event" ? "/my-event-bookings" : "/my-bookings"}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/20 text-xs sm:text-sm font-semibold py-3 text-gray-100 hover:border-white/60 transition"
              >
                View my {type === "event" ? "event" : "gym"} bookings
              </Link>
            </div>

            {/* Subtext */}
            <p className="mt-6 text-[11px] sm:text-xs text-gray-500 text-center leading-relaxed">
              Show this ticket at the venue along with a valid ID. Your booking is
              securely stored in your{" "}
              <span className="text-gray-200 font-medium">Passiify dashboard</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
