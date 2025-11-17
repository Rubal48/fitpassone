import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { CreditCard, MapPin, ShieldCheck, X, Mail } from "lucide-react";

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [authData, setAuthData] = useState({ name: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 🧠 Fetch gym details
  useEffect(() => {
    const fetchGym = async () => {
      try {
        const res = await API.get(`/gyms/${id}`);
        setGym(res.data);
      } catch (err) {
        console.error("Error fetching gym:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGym();
  }, [id]);

  // 💳 Handle booking (✅ Fixed version)
  const handleBooking = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedDate) {
      setErrorMessage("Please select a date first!");
      return;
    }

    try {
      setErrorMessage("");
      alert("⏳ Processing your booking...");

      const res = await API.post(
        "/bookings",
        { gymId: gym._id, date: selectedDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success && res.data.booking) {
        alert("🎉 Booking successful!");
        navigate(`/booking-success/${res.data.booking._id}`, {
          state: { type: "gym", name: res.data.booking.gym?.name },
        });
      } else {
        console.warn("⚠️ Unexpected response:", res.data);
        setErrorMessage("Booking failed. Please try again.");
      }
    } catch (err) {
      console.error("❌ Booking failed:", err.response?.data || err);
      setErrorMessage("Something went wrong during booking!");
    }
  };

  // 🔐 Handle Login / Signup
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const endpoint = isLoginMode ? "/auth/login" : "/auth/register";
      const res = await API.post(endpoint, authData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      setShowAuthModal(false);
      alert(`✅ ${isLoginMode ? "Login" : "Signup"} successful!`);
    } catch (err) {
      console.error("Auth failed:", err);
      setErrorMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  // 🔄 Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!authData.email) {
      setErrorMessage("Please enter your registered email.");
      return;
    }

    try {
      await API.post("/auth/forgot-password", { email: authData.email });
      setSuccessMessage("✅ Password reset link sent to your email.");
    } catch (err) {
      setErrorMessage("Error sending reset link. Try again.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading booking page...
      </div>
    );

  if (!gym)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Gym not found 🏋️‍♂️
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 py-16 px-6 relative">
      {/* 🔐 AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">
              {isForgotMode
                ? "Forgot Password"
                : isLoginMode
                ? "Login to Continue"
                : "Create Your Account"}
            </h2>

            {errorMessage && (
              <div className="bg-red-100 text-red-700 text-sm p-2 rounded-md mb-3 text-center">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-100 text-green-700 text-sm p-2 rounded-md mb-3 text-center">
                {successMessage}
              </div>
            )}

            {isForgotMode ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="flex items-center border rounded-lg px-3 py-2">
                  <Mail className="text-blue-600 w-5 h-5 mr-2" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={authData.email}
                    onChange={(e) =>
                      setAuthData({ ...authData, email: e.target.value })
                    }
                    className="w-full outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Send Reset Link
                </button>

                <p
                  onClick={() => {
                    setIsForgotMode(false);
                    setIsLoginMode(true);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="text-blue-600 text-center text-sm mt-2 cursor-pointer"
                >
                  ← Back to Login
                </p>
              </form>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLoginMode && (
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={authData.name}
                    onChange={(e) =>
                      setAuthData({ ...authData, name: e.target.value })
                    }
                    required
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                )}

                <input
                  type="email"
                  placeholder="Email"
                  value={authData.email}
                  onChange={(e) =>
                    setAuthData({ ...authData, email: e.target.value })
                  }
                  required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={authData.password}
                  onChange={(e) =>
                    setAuthData({ ...authData, password: e.target.value })
                  }
                  required
                  minLength="6"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  {isLoginMode ? "Login" : "Create Account"}
                </button>
              </form>
            )}

            {!isForgotMode && (
              <div className="text-center text-gray-600 mt-4 text-sm">
                {isLoginMode ? (
                  <>
                    Don’t have an account?{" "}
                    <span
                      onClick={() => {
                        setIsLoginMode(false);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-blue-600 font-semibold cursor-pointer"
                    >
                      Sign up
                    </span>
                    <br />
                    <span
                      onClick={() => {
                        setIsForgotMode(true);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-orange-500 cursor-pointer"
                    >
                      Forgot Password?
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span
                      onClick={() => {
                        setIsLoginMode(true);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-blue-600 font-semibold cursor-pointer"
                    >
                      Login
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🏋️ Booking Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-6">
          Book Your <span className="text-orange-500">1-Day Pass</span>
        </h1>

        <img
          src={gym.image || "https://source.unsplash.com/400x300/?gym,fitness"}
          alt={gym.name}
          className="rounded-xl mb-6 shadow-md"
        />

        <h2 className="text-2xl font-bold text-gray-800 mb-2">{gym.name}</h2>
        <p className="text-gray-600 mb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-orange-500" /> {gym.city}
        </p>
        <p className="text-gray-800 mb-4">
          <ShieldCheck className="w-4 h-4 inline text-blue-600 mr-2" />
          Verified Gym — ₹{gym.price} / 1-Day Pass
        </p>

        {/* 📅 Date Picker */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1 font-medium">
            Select Date for Your Pass
          </label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border-2 border-blue-200 focus:border-orange-400 rounded-lg px-4 py-2 outline-none bg-white text-gray-800 cursor-pointer hover:border-orange-300 transition"
          />
        </div>

        {errorMessage && !showAuthModal && (
          <p className="text-red-600 text-sm text-center mb-2">{errorMessage}</p>
        )}

        <button
          onClick={handleBooking}
          className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2"
        >
          <CreditCard className="w-5 h-5" /> Confirm Booking
        </button>
      </div>
    </div>
  );
}
