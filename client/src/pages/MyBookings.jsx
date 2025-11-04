import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Dumbbell, Calendar, Loader2 } from "lucide-react";
import API from "../utils/api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        console.log("📡 Fetching user bookings...");

        const res = await API.get("/bookings/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Bookings received:", res.data);

        setBookings(res.data);
      } catch (err) {
        console.error("❌ Error fetching bookings:", err.response?.data || err);
        setError(err.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-blue-600" />
        Loading your bookings...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login Again
        </Link>
      </div>
    );

  if (!bookings || bookings.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-white to-orange-50 text-center px-6">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1047/1047711.png"
          alt="No bookings"
          className="w-28 h-28 mb-6 opacity-80"
        />
        <h2 className="text-2xl font-bold text-blue-700 mb-2">
          You haven’t booked any passes yet 🏋️‍♂️
        </h2>
        <p className="text-gray-600 mb-6">
          Start exploring gyms and get your first 1-day pass now!
        </p>
        <Link
          to="/explore"
          className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Explore Gyms
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 py-16 px-6">
      <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-10">
        My Bookings
      </h1>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
          >
            <img
              src={
                booking.gym?.image ||
                "https://source.unsplash.com/400x300/?gym,fitness"
              }
              alt={booking.gym?.name}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />

            <h2 className="text-xl font-semibold text-blue-700 mb-1">
              {booking.gym?.name || "Gym Name"}
            </h2>
            <p className="flex items-center text-gray-600 text-sm mb-1">
              <MapPin className="w-4 h-4 mr-2 text-orange-500" />{" "}
              {booking.gym?.city || "City"}
            </p>
            <p className="flex items-center text-gray-600 text-sm mb-1">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />{" "}
              {new Date(booking.date).toLocaleDateString()}
            </p>
            <p className="flex items-center text-gray-600 text-sm mb-3">
              <Dumbbell className="w-4 h-4 mr-2 text-blue-500" />{" "}
              {booking.status || "confirmed"}
            </p>

            <p className="font-bold text-lg text-gray-800 mb-4">
              ₹{booking.price || 499}
            </p>

            <Link
              to={`/booking-success/${booking._id}`}
              className="block w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-2 rounded-lg font-semibold text-center hover:opacity-90 transition"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
