import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  CheckCircle,
  MapPin,
  CalendarDays,
  Dumbbell,
  IndianRupee,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import API from "../utils/api";

export default function BookingSuccess() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Fetch booking
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }
        const res = await API.get(`/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooking(res.data);
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("Could not load your booking details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  // 📄 Generate high-quality PDF Ticket
  const handleDownload = () => {
    if (!booking) return;
    const gym = booking.gym || {};
    const doc = new jsPDF();

    // Header Gradient
    const gradient = doc.context2d.createLinearGradient(0, 0, 210, 0);
    gradient.addColorStop(0, "#2563eb");
    gradient.addColorStop(1, "#f97316");
    doc.setFillColor("#2563eb");
    doc.rect(0, 0, 210, 40, "F");

    // Logo and Title
    doc.setTextColor("#ffffff");
    doc.setFontSize(22);
    doc.text("Passiify", 15, 25);
    doc.setFontSize(10);
    doc.text("Your Fitness, Your Way — Anytime, Anywhere", 15, 32);

    // White Card Body
    doc.setFillColor("#ffffff");
    doc.roundedRect(10, 50, 190, 120, 5, 5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#2563eb");
    doc.text("Booking Confirmation", 15, 65);

    // Divider line
    doc.setDrawColor("#e5e7eb");
    doc.line(15, 70, 195, 70);

    // Booking Details
    doc.setFontSize(13);
    doc.setTextColor("#374151");
    doc.setFont("helvetica", "normal");
    doc.text(`🏋️ Gym: ${gym.name || "Fitness Centre"}`, 15, 85);
    doc.text(`📍 City: ${gym.city || "City"}`, 15, 95);
    doc.text(`📅 Date: ${new Date(booking.date).toLocaleDateString("en-IN")}`, 15, 105);
    doc.text(`💰 Price: ₹${booking.price}`, 15, 115);
    doc.text(`🔖 Booking ID: ${booking.bookingCode}`, 15, 125);

    // Footer Note
    doc.setFontSize(10);
    doc.setTextColor("#6b7280");
    doc.text(
      "Please show this booking ID at the gym reception. The gym will verify it via Passiify Dashboard.",
      15,
      145,
      { maxWidth: 180 }
    );

    // Footer Branding
    doc.setFontSize(10);
    doc.setTextColor("#9ca3af");
    doc.text(
      "© Passiify - India's #1 One-Day Fitness Pass Platform",
      15,
      190
    );

    doc.save(`Passiify_Ticket_${booking.bookingCode || "Booking"}.pdf`);
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
          to="/explore"
          className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
        >
          Go Back to Explore
        </Link>
      </div>
    );

  const gym = booking.gym || {};
  const formattedDate = new Date(booking.date).toLocaleDateString("en-IN", {
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
            Booking Confirmed 🎉
          </h1>
          <p className="text-blue-100 text-md font-medium mb-4">
            Your 1-Day Fitness Pass is successfully booked!
          </p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white text-blue-700 font-semibold text-sm px-6 py-2 rounded-full shadow-md border border-blue-100">
            Booking ID: {booking.bookingCode || "N/A"}
          </div>
        </div>

        {/* Booking Summary */}
        <div className="p-8 mt-8">
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 border border-gray-200 shadow-inner space-y-3">
            <h3 className="text-2xl font-bold text-blue-700 mb-2 tracking-tight">
              {gym.name || "Fitness Centre"}
            </h3>

            <div className="space-y-2 text-gray-700 text-md">
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-orange-500" /> {gym.city || "City"}
              </p>
              <p className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-2 text-blue-600" /> {formattedDate}
              </p>
              <p className="flex items-center">
                <Dumbbell className="w-4 h-4 mr-2 text-orange-500" /> 1-Day Pass
              </p>
              <p className="flex items-center font-semibold text-gray-900">
                <IndianRupee className="w-4 h-4 mr-1 text-green-600" /> {booking.price || "—"}
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
              to="/my-bookings"
              className="bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all text-center"
            >
              View My Bookings
            </Link>
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">
            💪 Thank you for choosing{" "}
            <span className="text-blue-700 font-semibold">Passiify</span> — your one-day fitness freedom.
          </p>
        </div>
      </div>
    </div>
  );
}
