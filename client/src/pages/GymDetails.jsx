import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  ShieldCheck,
  Clock,
  Dumbbell,
  ThumbsUp,
  Shield,
  Award,
  Users,
  CreditCard,
  Loader2,
  CheckCircle,
  CalendarDays,
  Star,
  Wifi,
  Droplet,
  ExternalLink,
} from "lucide-react";
import API from "../utils/api";

export default function GymDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedPass, setSelectedPass] = useState(null);

  // ✅ Fetch gym and reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gymRes, reviewRes] = await Promise.all([
          API.get(`/gyms/${id}`),
          API.get(`/reviews/${id}`),
        ]);

        const gymData = gymRes.data;

        // Normalize dynamic custom pricing
        if (gymData.customPrice && !gymData.passes) {
          gymData.passes = Object.entries(gymData.customPrice).map(([duration, price]) => ({
            duration: Number(duration),
            price: Number(price),
          }));
        }

        setGym(gymData);
        setReviews(reviewRes.data);
        if (gymData.passes?.length) setSelectedPass(gymData.passes[0]);
      } catch (err) {
        console.error("❌ Error fetching gym:", err);
        setError("Could not load gym details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ✅ Booking handler (fixed: backend expects duration & price fields)
  const handleBooking = async () => {
    try {
      setBookingLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first!");
        navigate("/login");
        return;
      }

      if (!selectedPass) {
        alert("Please select a pass first!");
        return;
      }

      const gymId = gym?._id || id;
      const bookingData = {
        gymId,
        date: selectedDate,
        duration: selectedPass.duration, // ✅ backend expects 'duration'
        price: selectedPass.price, // ✅ backend expects 'price'
      };

      const { data } = await API.post("/bookings", bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowSuccess(true);
      setTimeout(() => navigate(`/booking-success/${data.booking?._id || data._id}`), 1500);


    } catch (error) {
      console.error("❌ Booking failed:", error);
      alert("Booking failed. Try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  // ✅ Review handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      await API.post(
        `/reviews/${id}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRating(0);
      setComment("");
      const res = await API.get(`/reviews/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error posting review:", err);
      alert("Could not post review. Try again later.");
    }
  };

  // ✅ Loader & Error States
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        Loading gym details...
      </div>
    );

  if (error || !gym)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-gray-600">
        <p className="text-lg">⚠️ {error || "Gym not found."}</p>
        <Link
          to="/explore"
          className="mt-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Back to Explore
        </Link>
      </div>
    );

  // ✅ Best Value Calculation
  let bestValue = null;
  if (gym.passes?.length > 1) {
    const withPerDay = gym.passes.map((p) => ({
      ...p,
      perDay: p.price / p.duration,
    }));
    bestValue = withPerDay.reduce((a, b) => (a.perDay < b.perDay ? a : b));
  }

  const galleryImages =
    gym.images && gym.images.length > 0
      ? gym.images.map((img) =>
          img.startsWith("http") ? img : `http://localhost:5000${img}`
        )
      : [
          "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg",
          "https://images.pexels.com/photos/7031707/pexels-photo-7031707.jpeg",
        ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 pb-20">
      {/* 🏋️ Hero Section */}
      <div className="relative w-full h-[60vh] overflow-hidden">
        <img
          src={galleryImages[0]}
          alt={gym.name}
          className="w-full h-full object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-10 left-6 md:left-16 text-white drop-shadow-lg">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-2 flex items-center gap-2">
            {gym.name}
            {gym.verified && (
              <ShieldCheck className="text-green-400 w-7 h-7" title="Verified" />
            )}
          </h1>
          <p className="flex items-center gap-2 text-blue-100">
            <MapPin className="w-5 h-5 text-orange-300" /> {gym.city}
          </p>
          <p className="flex items-center gap-2 text-yellow-300 mt-1">
            <Star className="w-5 h-5 text-yellow-400" />{" "}
            {gym.rating ? `${gym.rating.toFixed(1)} / 5` : "No ratings yet"}
          </p>
        </div>
      </div>

      {/* 💪 About + Booking */}
      <div className="max-w-6xl mx-auto mt-12 px-6 grid md:grid-cols-3 gap-10">
        {/* Left Column */}
        <div className="md:col-span-2">
          <h2 className="text-3xl font-extrabold mb-4 text-blue-700">
            Why Choose <span className="text-orange-500">{gym.name}</span>?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6 text-lg">
            {gym.description ||
              "Train smarter with premium equipment, certified trainers, and a motivating environment to help you reach your goals."}
          </p>

          {/* ✅ Amenities */}
          <div className="mt-10">
            <h3 className="text-2xl font-bold text-blue-700 mb-4">
              Amenities & Facilities
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {["AC", "Lockers", "Showers", "WiFi", "Parking", "Trainers"].map(
                (a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-blue-100 shadow-md hover:scale-[1.02] transition"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-blue-600 to-orange-400 grid place-items-center text-white">
                      {i % 3 === 0 && <Dumbbell className="w-5 h-5" />}
                      {i % 3 === 1 && <Wifi className="w-5 h-5" />}
                      {i % 3 === 2 && <Droplet className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{a}</div>
                      <div className="text-xs text-slate-500">Available</div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* ✅ Gallery Section */}
          <div className="mt-10">
            <h3 className="text-2xl font-bold text-blue-700 mb-4">Gallery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {galleryImages.slice(0, 6).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${gym.name}-${i}`}
                  onClick={() => {
                    setActiveImage(i);
                    setGalleryOpen(true);
                  }}
                  className="w-full h-40 object-cover rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform"
                />
              ))}
            </div>
          </div>

          {/* ✅ Address */}
          <div className="mt-10">
            <h3 className="text-2xl font-bold text-blue-700 mb-4">Address</h3>
            <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-6 rounded-2xl shadow-lg">
              <p className="font-semibold text-lg">{gym.address}</p>
              <p className="text-blue-100">{gym.city}</p>
              <p className="mt-2 text-sm">📞 {gym.phone || "Not available"}</p>
              <p className="mt-2 text-sm">
                🕒 {gym.openingHours || "6:00 AM - 10:00 PM"}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${gym.address || ""} ${gym.city || ""}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm bg-white/20 px-4 py-2 rounded-lg"
              >
                <ExternalLink className="w-4 h-4" /> View on Google Maps
              </a>
            </div>
          </div>

          {/* ✅ Reviews */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <Star className="text-yellow-400 w-6 h-6" /> Member Reviews
            </h3>

            {reviews.length === 0 ? (
              <p className="text-gray-600 mb-4">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4 mb-6">
                {reviews.map((r, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-sm"
                  >
                    <p className="font-semibold text-gray-800">
                      {r.user?.name || "Anonymous"}
                    </p>
                    <p className="text-yellow-500 mb-1">⭐ {r.rating}/5</p>
                    <p className="text-gray-700">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ⭐ Add Review */}
            <form
              onSubmit={handleReviewSubmit}
              className="bg-white/80 backdrop-blur-md border border-blue-100 rounded-2xl p-6 shadow-md"
            >
              <h4 className="font-semibold mb-3 text-blue-700">Add Your Review</h4>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-7 h-7 cursor-pointer transition-transform ${
                      s <= rating
                        ? "text-yellow-400 scale-110"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                    onClick={() => setRating(s)}
                  />
                ))}
              </div>
              <textarea
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 text-gray-700 focus:ring-2 focus:ring-orange-400 outline-none"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>

        {/* ✅ Booking Card */}
        <div className="bg-white p-8 rounded-2xl shadow-lg h-fit border border-gray-100 sticky top-20">
          <h3 className="text-xl font-bold text-blue-700 mb-3">Choose Your Pass</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {gym.passes && gym.passes.length > 0 ? (
              gym.passes.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPass(p)}
                  className={`relative border rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    selectedPass?.duration === p.duration
                      ? "border-orange-500 bg-orange-100 text-orange-700"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {p.duration}-Day <br /> ₹{p.price}
                  {bestValue && bestValue.duration === p.duration && (
                    <span className="absolute top-0 right-0 text-[10px] bg-green-500 text-white px-2 py-[1px] rounded-bl-md">
                      Best Value
                    </span>
                  )}
                </button>
              ))
            ) : (
              <p className="text-gray-500 text-sm col-span-2">No passes available</p>
            )}
          </div>

          {selectedPass && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-3xl font-bold text-gray-900">₹{selectedPass.price}</p>
              <span className="text-green-600 text-sm font-semibold bg-green-100 px-2 py-1 rounded">
                {selectedPass.duration}-Day Pass
              </span>
            </div>
          )}

          <p className="text-gray-600 mb-4">Instant Booking Available</p>

          {/* 📅 Date Picker */}
          <div className="mb-5">
            <label className="text-gray-700 text-sm font-semibold flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <ul className="space-y-2 text-sm text-gray-700 mb-5">
            <li className="flex items-center gap-2">
              <ShieldCheck className="text-blue-600 w-4 h-4" /> Verified Gym
            </li>
            <li className="flex items-center gap-2">
              <ThumbsUp className="text-blue-600 w-4 h-4" /> Trusted by 2M+ users
            </li>
            <li className="flex items-center gap-2">
              <Clock className="text-blue-600 w-4 h-4" /> Instant Pass Activation
            </li>
          </ul>

          <button
            onClick={handleBooking}
            disabled={bookingLoading || gym.status?.toLowerCase().trim() !== "approved"}
            className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center ${
              gym.status?.toLowerCase().trim() !== "approved"
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:opacity-90"
            }`}
          >
            {bookingLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Booking...
              </>
            ) : gym.status?.toLowerCase().trim() !== "approved" ? (
              "Awaiting Verification"
            ) : selectedPass ? (
              `Book ${selectedPass.duration}-Day Pass`
            ) : (
              "Select a Pass"
            )}
          </button>
        </div>
      </div>

      {/* Gallery Modal */}
      {galleryOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <button
            onClick={() => setGalleryOpen(false)}
            className="absolute top-5 right-5 text-white text-2xl font-bold"
          >
            ✕
          </button>
          <img
            src={galleryImages[activeImage]}
            alt="active"
            className="max-w-4xl w-full max-h-[80vh] object-contain rounded-xl shadow-lg"
          />
        </div>
      )}

      {/* 🛡️ Footer */}
      <div className="mt-20 bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 py-12 text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center px-4">
          <div>
            <Shield className="mx-auto w-8 h-8 text-orange-300 mb-2" />
            <h4 className="font-semibold">Verified Gyms</h4>
            <p className="text-blue-100 text-sm">Certified & trusted centers.</p>
          </div>
          <div>
            <CreditCard className="mx-auto w-8 h-8 text-orange-300 mb-2" />
            <h4 className="font-semibold">Secure Payments</h4>
            <p className="text-blue-100 text-sm">UPI, Cards & Wallets supported.</p>
          </div>
          <div>
            <Award className="mx-auto w-8 h-8 text-orange-300 mb-2" />
            <h4 className="font-semibold">Top Rated</h4>
            <p className="text-blue-100 text-sm">Rated 4.5★ and above.</p>
          </div>
          <div>
            <Users className="mx-auto w-8 h-8 text-orange-300 mb-2" />
            <h4 className="font-semibold">2M+ Users</h4>
            <p className="text-blue-100 text-sm">
              India’s biggest fitness network.
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Success Toast */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl text-center animate-fade-in-up">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Booking Confirmed!
            </h3>
            <p className="text-gray-600 text-sm">
              Redirecting to your booking details...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
