import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { Calendar, MapPin, Dumbbell, CreditCard } from "lucide-react";

export default function BookingCheckout() {
  const { id } = useParams(); // gym ID
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 🧠 Fetch Gym Data
  useEffect(() => {
    const fetchGym = async () => {
      try {
        const res = await API.get(`/gyms/${id}`);
        setGym(res.data);
      } catch (error) {
        console.error("Error fetching gym:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGym();
  }, [id]);

  // 🧾 Handle Booking Confirmation
  const handleConfirmBooking = async () => {
    if (!date) {
      alert("Please select a date before confirming.");
      return;
    }
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");

      const res = await API.post(
        "/bookings",
        { gymId: id, date },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/booking-success/${res.data._id}`);
    } catch (err) {
      console.error("Error confirming booking:", err);
      alert("Failed to confirm booking. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-orange-50">
        <p className="text-gray-600 text-lg">Loading gym details...</p>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-orange-50">
        <p className="text-gray-600 text-lg">Gym not found 🏋️‍♂️</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 py-16 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
          Confirm Your <span className="text-orange-500">Booking</span>
        </h1>

        {/* 🏋️ Gym Info */}
        <div className="flex flex-col md:flex-row gap-6 items-center border-b pb-6 mb-6">
          <img
            src={gym.image || "https://source.unsplash.com/400x300/?gym,fitness"}
            alt={gym.name}
            className="w-full md:w-1/2 h-48 object-cover rounded-xl"
          />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {gym.name}
            </h2>
            <p className="flex items-center justify-center md:justify-start text-gray-600 text-sm mb-2">
              <MapPin className="w-4 h-4 text-orange-500 mr-1" /> {gym.city}
            </p>
            <p className="flex items-center justify-center md:justify-start text-gray-600 text-sm">
              <Dumbbell className="w-4 h-4 text-blue-600 mr-1" /> 1-Day Access
            </p>
          </div>
        </div>

        {/* 📅 Booking Date */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-orange-400 outline-none"
          />
        </div>

        {/* 💰 Price Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-5 shadow-inner mb-8">
          <h3 className="font-semibold text-gray-800 mb-2">Price Summary</h3>
          <div className="flex justify-between text-gray-700 mb-1">
            <span>1-Day Gym Pass</span>
            <span>₹{gym.price}</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-1">
            <span>Platform Fee</span>
            <span>₹10</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 mt-2">
            <span>Total</span>
            <span>₹{gym.price + 10}</span>
          </div>
        </div>

        {/* 💳 Confirm & Pay */}
        <button
          onClick={handleConfirmBooking}
          disabled={processing}
          className={`w-full flex justify-center items-center gap-2 py-3 rounded-xl font-semibold transition text-white ${
            processing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-orange-500 hover:opacity-90"
          }`}
        >
          <CreditCard className="w-5 h-5" />
          {processing ? "Processing..." : "Confirm & Pay"}
        </button>
      </div>
    </div>
  );
}
