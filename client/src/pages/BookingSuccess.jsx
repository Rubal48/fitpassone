import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { CheckCircle, MapPin, Calendar, Dumbbell } from "lucide-react";
import API from "../utils/api";

export default function BookingSuccess() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🎉 Fire confetti ONCE when component mounts
  useEffect(() => {
    const duration = 1500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        startVelocity: 30,
        spread: 70,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();

    // ✅ Cleanup on unmount
    return () => confetti.reset();
  }, []);

  // 🧠 Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not logged in");
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

  // Loading state
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading your booking details...
      </div>
    );

  // Error or missing booking
  if (error || !booking)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p className="mb-4 text-lg">⚠️ {error || "Booking not found."}</p>
        <Link
          to="/explore"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Go Back to Explore
        </Link>
      </div>
    );

  const gym = booking.gym || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 flex items-center justify-center px-6 py-16">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 text-center border border-gray-100">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
        <h1 className="text-3xl font-extrabold text-blue-700 mb-3">
          Booking Confirmed 🎉
        </h1>
        <p className="text-gray-600 mb-8">
          Your 1-day pass has been successfully booked!
        </p>

        {/* Booking summary */}
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-5 shadow-inner mb-8 text-left">
          <h3 className="font-semibold text-blue-700 text-lg mb-2">
            {gym.name || "Gym Name"}
          </h3>
          <p className="flex items-center text-gray-700 text-sm mb-1">
            <MapPin className="w-4 h-4 mr-1 text-orange-500" />{" "}
            {gym.city || "City"}
          </p>
          <p className="flex items-center text-gray-700 text-sm mb-1">
            <Calendar className="w-4 h-4 mr-1 text-blue-600" />{" "}
            {new Date(booking.date).toLocaleDateString()}
          </p>
          <p className="flex items-center text-gray-700 text-sm mb-1">
            <Dumbbell className="w-4 h-4 mr-1 text-orange-500" /> 1-Day Pass
          </p>
          <p className="mt-2 font-bold text-gray-900">
            ₹{booking.price || 499}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/my-bookings"
            className="bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:opacity-90 transition"
          >
            View My Bookings
          </Link>
          <Link
            to="/explore"
            className="bg-white border border-gray-300 text-blue-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition"
          >
            Explore More Gyms
          </Link>
        </div>
      </div>
    </div>
  );
}
