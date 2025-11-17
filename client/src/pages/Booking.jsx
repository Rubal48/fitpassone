import React, { useState } from "react";
import { useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { CheckCircle, Dumbbell, MapPin, CalendarDays, Lock } from "lucide-react";

const gymsData = [
  {
    id: 1,
    name: "Gold’s Gym",
    city: "Delhi",
    price: 499,
  },
  {
    id: 2,
    name: "Anytime Fitness",
    city: "Mumbai",
    price: 399,
  },
];

const Booking = () => {
  const { id } = useParams();
  const gym = gymsData.find((g) => g.id === parseInt(id));
  const [selectedDate, setSelectedDate] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!gym) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Gym not found 🏋️‍♂️
      </div>
    );
  }

  const handleBookingClick = () => {
    if (!selectedDate) {
      alert("Please select a date before booking 📅");
      return;
    }
    setShowLogin(true); // show login only when user selects date
  };

  const handleLoginAndConfirm = () => {
    setShowLogin(false);
    setIsConfirmed(true);

    // Trigger confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 py-10 px-4">
      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8">
        {!isConfirmed ? (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-3 text-center">
              Book Your 1-Day Pass
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              Experience <span className="font-semibold text-blue-600">{gym.name}</span> in{" "}
              {gym.city}. Choose your date and confirm your booking.
            </p>

            <div className="bg-gray-100 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Dumbbell className="w-5 h-5 text-blue-600" /> {gym.name}
              </div>
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <MapPin className="w-4 h-4 text-blue-500" /> {gym.city}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                ₹{gym.price} / Day
              </div>
            </div>

            <label className="block text-gray-700 font-medium mb-2">
              <CalendarDays className="inline-block w-5 h-5 text-blue-600 mr-2" />
              Select Date
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-4 py-2 mb-6 text-gray-700 focus:outline-blue-600"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />

            <button
              onClick={handleBookingClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Confirm Booking
            </button>

            <p className="text-center text-gray-500 text-sm mt-3">
              Secure and verified gym partners only.
            </p>
          </>
        ) : (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4 mx-auto animate-bounce" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Booking Confirmed 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              You’ve successfully booked a 1-day pass at{" "}
              <span className="font-semibold text-blue-600">{gym.name}</span> for{" "}
              <span className="font-medium">{selectedDate}</span>.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
              <p className="text-gray-700">
                <span className="font-medium">Gym:</span> {gym.name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">City:</span> {gym.city}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Date:</span> {selectedDate}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Amount:</span> ₹{gym.price}
              </p>
            </div>

            <button
              onClick={() => (window.location.href = "/my-bookings")}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              View My Bookings
            </button>
          </div>
        )}
      </div>

      {/* ✅ Login Modal — appears only when Confirm is clicked */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[90%] max-w-md text-center shadow-lg">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">
              Login to Continue
            </h2>
            <p className="text-gray-600 mb-6">
              You’re about to confirm your booking for{" "}
              <span className="font-semibold text-blue-700">{gym.name}</span>.
            </p>
            <input
              type="email"
              placeholder="Email"
              className="w-full border px-4 py-2 rounded-lg mb-3"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border px-4 py-2 rounded-lg mb-5"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogin(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLoginAndConfirm}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Login & Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
