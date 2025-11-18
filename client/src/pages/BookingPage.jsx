import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import {
  CreditCard,
  MapPin,
  ShieldCheck,
  X,
  Mail,
  CalendarDays,
  Dumbbell,
} from "lucide-react";

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPass, setSelectedPass] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);

  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // 🧠 Fetch gym details
  useEffect(() => {
    const fetchGym = async () => {
      try {
        const res = await API.get(`/gyms/${id}`);
        const data = res.data;

        // Normalize passes if customPrice exists
        let passes = data.passes || [];
        if ((!passes || passes.length === 0) && data.customPrice) {
          passes = Object.entries(data.customPrice).map(([duration, price]) => ({
            duration: Number(duration),
            price: Number(price),
          }));
        }

        data.passes = passes;

        setGym(data);

        // Default pass selection
        if (passes && passes.length > 0) {
          setSelectedPass(passes[0]);
        } else if (data.price) {
          setSelectedPass({
            duration: 1,
            price: data.price,
          });
        }

        // Default date → today
        setSelectedDate(new Date().toISOString().split("T")[0]);
      } catch (err) {
        console.error("Error fetching gym:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGym();
  }, [id]);

  // 💳 Handle booking (sends duration & price)
  const handleBooking = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedDate) {
      setErrorMessage("Please select a date first.");
      return;
    }

    if (!selectedPass) {
      setErrorMessage("Please select a pass option.");
      return;
    }

    try {
      setErrorMessage("");
      setBookingLoading(true);

      const payload = {
        gymId: gym._id,
        date: selectedDate,
        duration: selectedPass.duration,
        price: selectedPass.price,
      };

      const res = await API.post("/bookings", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data?.success && res.data.booking) {
        navigate(`/booking-success/${res.data.booking._id}`, {
          state: { type: "gym", name: res.data.booking.gym?.name },
        });
      } else if (res.data?._id) {
        // in case backend returns booking object directly
        navigate(`/booking-success/${res.data._id}`, {
          state: { type: "gym", name: res.data.gym?.name },
        });
      } else {
        console.warn("⚠️ Unexpected response:", res.data);
        setErrorMessage("Booking failed. Please try again.");
      }
    } catch (err) {
      console.error("❌ Booking failed:", err.response?.data || err);
      setErrorMessage("Something went wrong during booking.");
    } finally {
      setBookingLoading(false);
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

      // For login: usually res.data = { token, user }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      setShowAuthModal(false);
      setIsForgotMode(false);
      setIsLoginMode(true);
      setAuthData({ name: "", email: "", password: "" });

      // Optional toast
      alert(`✅ ${isLoginMode ? "Login" : "Signup"} successful! Now complete your booking.`);
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
      console.error("Forgot password error:", err);
      setErrorMessage("Error sending reset link. Try again.");
    }
  };

  // 🧮 Derived values
  const formattedDateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Select a date";

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
        Loading booking page...
      </div>
    );
  }

  if (!gym) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-sm sm:text-base text-gray-200"
        style={{
          backgroundColor: "#050308",
          backgroundImage:
            "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
        }}
      >
        Gym not found 🏋️‍♂️
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10 sm:py-16 px-4 flex items-center justify-center"
      style={{
        backgroundColor: "#050308",
        backgroundImage:
          "radial-gradient(circle at top, rgba(248,216,181,0.16), transparent 55%)",
      }}
    >
      {/* 🔐 AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 px-4">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#050308] via-[#090813] to-[#050308] border border-white/10 rounded-2xl shadow-[0_22px_80px_rgba(0,0,0,1)] p-6 sm:p-7 text-gray-100">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setIsForgotMode(false);
                setIsLoginMode(true);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-center mb-5">
              {isForgotMode
                ? "Reset your password"
                : isLoginMode
                ? "Login to continue"
                : "Create your Passiify account"}
            </h2>

            {(errorMessage || successMessage) && (
              <div className="mb-3 text-center text-xs sm:text-sm">
                {errorMessage && (
                  <div className="bg-red-500/15 border border-red-500/50 text-red-200 rounded-lg px-3 py-2 mb-2">
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div className="bg-emerald-500/15 border border-emerald-500/50 text-emerald-200 rounded-lg px-3 py-2">
                    {successMessage}
                  </div>
                )}
              </div>
            )}

            {isForgotMode ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="flex items-center border border-white/15 rounded-lg px-3 py-2 bg-white/5">
                  <Mail className="text-sky-400 w-5 h-5 mr-2" />
                  <input
                    type="email"
                    placeholder="Registered email"
                    value={authData.email}
                    onChange={(e) =>
                      setAuthData({ ...authData, email: e.target.value })
                    }
                    className="w-full bg-transparent outline-none text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-sky-500 to-orange-400 text-gray-950 py-2.5 rounded-lg font-semibold text-sm hover:opacity-95 transition"
                >
                  Send reset link
                </button>

                <p
                  onClick={() => {
                    setIsForgotMode(false);
                    setIsLoginMode(true);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="text-xs sm:text-sm text-sky-300 text-center mt-1 cursor-pointer"
                >
                  ← Back to Login
                </p>
              </form>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLoginMode && (
                  <input
                    type="text"
                    placeholder="Full name"
                    value={authData.name}
                    onChange={(e) =>
                      setAuthData({ ...authData, name: e.target.value })
                    }
                    required
                    className="w-full border border-white/15 bg-white/5 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/80"
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
                  className="w-full border border-white/15 bg-white/5 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/80"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={authData.password}
                  onChange={(e) =>
                    setAuthData({ ...authData, password: e.target.value })
                  }
                  required
                  minLength={6}
                  className="w-full border border-white/15 bg-white/5 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/80"
                />

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-sky-500 to-orange-400 text-gray-950 py-2.5 rounded-lg font-semibold text-sm hover:opacity-95 transition"
                >
                  {isLoginMode ? "Login & Continue" : "Create account"}
                </button>
              </form>
            )}

            {!isForgotMode && (
              <div className="text-center text-xs sm:text-sm text-gray-300 mt-4">
                {isLoginMode ? (
                  <>
                    Don’t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginMode(false);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-orange-300 font-semibold underline-offset-2 hover:underline"
                    >
                      Sign up
                    </button>
                    <br />
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(true);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-sky-300 mt-2 underline-offset-2 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginMode(true);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-orange-300 font-semibold underline-offset-2 hover:underline"
                    >
                      Login
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🏋️ Booking Card */}
      <div className="max-w-3xl w-full relative">
        {/* glow */}
        <div className="absolute inset-0 -z-10 blur-3xl opacity-60 bg-[radial-gradient(circle_at_top,_rgba(255,159,104,0.45),_transparent_55%)]" />

        <div className="bg-black/70 border border-white/12 rounded-[26px] shadow-[0_24px_90px_rgba(0,0,0,1)] overflow-hidden">
          {/* Hero */}
          <div className="relative h-60 sm:h-72 overflow-hidden">
            <img
              src={
                gym.images?.[0] ||
                gym.image ||
                "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1200"
              }
              alt={gym.name}
              className="w-full h-full object-cover brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow">
                  {gym.name}
                </h1>
                <p className="flex items-center text-xs sm:text-sm text-gray-200 mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-orange-300" />
                  {gym.city}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/25 text-[11px] sm:text-xs text-gray-100 backdrop-blur">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Verified · No membership, just a pass</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 sm:px-7 py-7 text-gray-100 space-y-7">
            {/* Pass selector + date */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pass selector */}
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                  Choose your pass
                </p>
                {gym.passes && gym.passes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {gym.passes.map((p, idx) => {
                      const isSelected =
                        selectedPass?.duration === p.duration &&
                        selectedPass?.price === p.price;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPass(p)}
                          className={`relative text-left rounded-2xl border px-3 py-3 text-xs sm:text-sm transition-all ${
                            isSelected
                              ? "border-orange-400 bg-orange-400/10 shadow-[0_18px_50px_rgba(0,0,0,0.8)]"
                              : "border-white/15 bg-white/5 hover:border-orange-300/80"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 grid place-items-center text-[10px] text-gray-950">
                              <Dumbbell className="w-3 h-3" />
                            </div>
                            <div>
                              <p className="font-semibold">
                                {p.duration}-Day Pass
                              </p>
                              <p className="text-[11px] text-gray-400">
                                Ideal for short stays & drop-ins
                              </p>
                            </div>
                          </div>
                          <p className="mt-1 font-semibold text-orange-200">
                            ₹{p.price}
                          </p>

                          {idx === 0 && (
                            <span className="absolute -top-2 right-2 text-[9px] px-2 py-[2px] rounded-full bg-emerald-400 text-gray-950 font-semibold">
                              Popular
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xs sm:text-sm">
                    <p className="font-semibold mb-1">
                      1-Day Pass · ₹{gym.price || "—"}
                    </p>
                    <p className="text-gray-400">
                      Simple day access · zero commitments
                    </p>
                  </div>
                )}
              </div>

              {/* Date picker + summary */}
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                  Select your date
                </p>
                <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                  <label className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                    <CalendarDays className="w-4 h-4 text-sky-300" />
                    Choose the day you want to train
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-100 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/60 cursor-pointer"
                  />

                  <div className="mt-3 text-[11px] sm:text-xs text-gray-400">
                    <p>
                      Selected:{" "}
                      <span className="text-gray-100">{formattedDateLabel}</span>
                    </p>
                    {selectedPass && (
                      <p className="mt-1">
                        Pass:{" "}
                        <span className="text-gray-100">
                          {selectedPass.duration}-Day · ₹{selectedPass.price}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error message */}
            {errorMessage && !showAuthModal && (
              <p className="text-xs sm:text-sm text-red-300 bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-2 text-center">
                {errorMessage}
              </p>
            )}

            {/* Price + button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-300">
                <p>Pay now & get instant QR access.</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  No membership. No paperwork. Just turn up and train.
                </p>
              </div>

              <button
                onClick={handleBooking}
                disabled={bookingLoading}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 sm:px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-sky-500 to-orange-400 text-gray-950 shadow-[0_18px_60px_rgba(0,0,0,1)] hover:scale-[1.02] hover:shadow-[0_22px_70px_rgba(0,0,0,1)] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-4 h-4" />
                {bookingLoading ? "Processing..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
