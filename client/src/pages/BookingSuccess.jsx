import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  CheckCircle,
  MapPin,
  CalendarDays,
  Dumbbell,
  IndianRupee,
  Download,
  Users,
} from "lucide-react";
import jsPDF from "jspdf";
import API from "../utils/api";

export default function BookingSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const type = location.state?.type || "gym"; // 'event' or 'gym'
  const name = location.state?.name || "";
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🎉 Confetti animation
  useEffect(() => {
    const duration = 1500;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 6,
        startVelocity: 30,
        spread: 70,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ["#2563eb", "#f97316", "#22c55e"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    return () => confetti.reset();
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

        // ✅ Correct: backend returns { success, booking }
       // ✅ Handle both response formats
if (res.data?.booking) {
  setBooking(res.data.booking);
} else if (res.data?._id) {
  // Direct booking object returned
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

    doc.setFillColor("#2563eb");
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor("#ffffff");
    doc.setFontSize(22);
    doc.text("Passiify", 15, 25);
    doc.setFontSize(10);
    doc.text(
      type === "event"
        ? "Your Adventure, Your Story — Passiify Events"
        : "Your Fitness, Your Way — Passiify Gym",
      15,
      32
    );

    doc.setFillColor("#ffffff");
    doc.roundedRect(10, 50, 190, 120, 5, 5, "F");
    doc.setFontSize(18);
    doc.setTextColor("#2563eb");
    doc.text(
      type === "event" ? "Event Booking Confirmation" : "Gym Booking Confirmation",
      15,
      65
    );

    doc.setDrawColor("#e5e7eb");
    doc.line(15, 70, 195, 70);

    doc.setFontSize(13);
    doc.setTextColor("#374151");

    if (type === "event") {
      doc.text(`🎉 Event: ${item?.name || "Passiify Event"}`, 15, 85);
      doc.text(`📍 Location: ${item?.location || "Venue"}`, 15, 95);
      doc.text(
        `📅 Date: ${item?.date ? new Date(item.date).toLocaleDateString("en-IN") : "TBA"}`,
        15,
        105
      );
      doc.text(`🎟️ Tickets: ${booking?.tickets || 1}`, 15, 115);
      doc.text(`💰 Price: ₹${booking?.totalPrice || item?.price || "N/A"}`, 15, 125);
    } else {
      doc.text(`🏋️ Gym: ${item?.name || "Fitness Centre"}`, 15, 85);
      doc.text(`📍 City: ${item?.city || "City"}`, 15, 95);
      doc.text(
        `📅 Date: ${
          booking?.date
            ? new Date(booking.date).toLocaleDateString("en-IN")
            : "TBA"
        }`,
        15,
        105
      );
      doc.text(`💰 Price: ₹${booking?.price || "N/A"}`, 15, 115);
      doc.text(`🔖 Booking ID: ${booking?.bookingCode || "N/A"}`, 15, 125);
    }

    doc.setFontSize(10);
    doc.setTextColor("#6b7280");
    doc.text(
      "Please show this ticket at the venue. Verified via Passiify Dashboard.",
      15,
      145,
      { maxWidth: 180 }
    );

    doc.setFontSize(10);
    doc.setTextColor("#9ca3af");
    doc.text(
      "© Passiify - India's #1 Fitness & Adventure Booking Platform",
      15,
      190
    );

    doc.save(`Passiify_${type}_Ticket_${booking?._id || "Booking"}.pdf`);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg font-medium">
        Fetching your booking details...
      </div>
    );

  if (error || !booking)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600 text-center px-4">
        <p className="mb-4 text-lg">⚠️ {error || "Booking not found."}</p>
        <Link
          to={type === "event" ? "/events" : "/explore"}
          className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
        >
          Go Back
        </Link>
      </div>
    );

  const item = type === "event" ? booking.event : booking.gym;
  const formattedDate = new Date(
    type === "event" ? item?.date : booking?.date
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-gradient-to-b from-white via-orange-50 to-white text-gray-800">
      <div className="relative bg-white rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] max-w-lg w-full border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white py-10 px-8 text-center relative flex flex-col items-center">
          <CheckCircle className="w-16 h-16 text-yellow-300 drop-shadow-lg animate-bounce mb-4" />
          <h1 className="text-3xl font-extrabold tracking-wide mb-2">
            {type === "event" ? "Event Booked 🎉" : "Booking Confirmed 🎉"}
          </h1>
          <p className="text-blue-100 text-md font-medium mb-4">
            {type === "event"
              ? "Your spot has been reserved for this amazing experience!"
              : "Your 1-Day Fitness Pass is successfully booked!"}
          </p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white text-blue-700 font-semibold text-sm px-6 py-2 rounded-full shadow-md border border-blue-100">
            {type === "event" ? "Event Booking" : "Booking ID"}:{" "}
            {booking?._id?.slice(-6).toUpperCase() || "N/A"}
          </div>
        </div>

        {/* Booking Summary */}
        <div className="p-8 mt-8">
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 border border-gray-200 shadow-inner space-y-3">
            <h3 className="text-2xl font-bold text-blue-700 mb-2 tracking-tight">
              {item?.name || (type === "event" ? "Event" : "Fitness Centre")}
            </h3>

            <div className="space-y-2 text-gray-700 text-md">
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-orange-500" />{" "}
                {item?.location || item?.city || "Location"}
              </p>
              <p className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-2 text-blue-600" />{" "}
                {formattedDate}
              </p>
              {type === "event" ? (
                <p className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-orange-500" />{" "}
                  {booking?.tickets || 1} Ticket(s)
                </p>
              ) : (
                <p className="flex items-center">
                  <Dumbbell className="w-4 h-4 mr-2 text-orange-500" /> 1-Day
                  Pass
                </p>
              )}
              <p className="flex items-center font-semibold text-gray-900">
                <IndianRupee className="w-4 h-4 mr-1 text-green-600" />{" "}
                {booking?.totalPrice || booking?.price || item?.price || "—"}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownload}
              className="bg-gradient-to-r from-green-500 to-lime-500 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:scale-105 hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" /> Download Ticket
            </button>
            <Link
              to={type === "event" ? "/my-event-bookings" : "/my-bookings"}
              className="bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all text-center"
            >
              View My {type === "event" ? "Event" : "Gym"} Bookings
            </Link>
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">
            {type === "event" ? (
              <>
                ✨ Thank you for trusting{" "}
                <span className="text-blue-700 font-semibold">Passiify</span> — 
                your home for fitness & adventures.
              </>
            ) : (
              <>
                💪 Thank you for choosing{" "}
                <span className="text-blue-700 font-semibold">Passiify</span> — 
                your one-day fitness freedom.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
