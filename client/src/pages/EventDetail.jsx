import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  CalendarDays,
  Users,
  Star,
  Loader2,
  ArrowLeft,
  Ticket,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  Clock,
} from "lucide-react";
import API from "../utils/api";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Event Details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await API.get(`/events/${id}`);
        setEvent(res.data.event);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // ✅ Handle Booking
  const handleBookEvent = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("Please login to book this event.");
        navigate("/login");
        return;
      }

      const user = JSON.parse(storedUser);
      const userId = user._id || user.user?._id;

      if (!userId) {
        alert("User not found. Please log in again.");
        navigate("/login");
        return;
      }

      // ✅ Correct API endpoint (removed extra /api)
      const res = await API.post("/event-bookings", {
        userId,
        eventId: event._id,
        tickets: 1,
      });

      if (res.data.success) {
        alert("🎉 Event booked successfully!");
        navigate(`/booking-success/${res.data.booking._id}`, {
          state: { type: "event", name: event.name },
        });
      } else {
        alert(res.data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error booking event:", error);
      alert("Failed to book this event. Please try again later.");
    }
  };

  // ✅ Loading State
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={42} />
      </div>
    );

  if (!event)
    return (
      <div className="text-center py-20 text-gray-600">
        <p>❌ Event not found.</p>
        <Link
          to="/events"
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-orange-500 transition"
        >
          Back to Events
        </Link>
      </div>
    );

  // 🕒 Countdown
  const eventDate = new Date(event.date);
  const today = new Date();
  const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white text-gray-800">
      {/* 🔙 Back Button */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 font-medium hover:text-orange-500 transition"
        >
          <ArrowLeft size={18} className="mr-1" /> Back
        </button>
      </div>

      {/* 🌟 Hero Section */}
      <div className="relative max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-lg mb-10">
        <img
          src={event.image || "/images/default-event.jpg"}
          alt={event.name}
          className="w-full h-[420px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-4xl font-extrabold mb-2">{event.name}</h1>
          <p className="flex items-center gap-2 text-sm text-gray-200">
            <MapPin size={16} /> {event.location}
          </p>
        </div>

        <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-1 rounded-full font-semibold text-sm shadow-md">
          ₹{event.price}
        </div>
      </div>

      {/* 🧭 Event Info */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
        {/* Left Details */}
        <div className="md:col-span-2 bg-white rounded-3xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">
            About this Event
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            {event.description}
          </p>

          <div className="flex flex-wrap gap-6 text-gray-700 text-sm mb-6">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} />{" "}
              {eventDate.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2">
              <Users size={18} /> Capacity: {event.capacity} People
            </div>
            <div className="flex items-center gap-2">
              <Star size={18} className="text-yellow-500" /> Rating:{" "}
              {event.rating || 4.5}/5
            </div>
          </div>

          {/* Organizer */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-700 flex items-center gap-2">
                Hosted by{" "}
                <span className="text-blue-600">{event.organizer}</span>
                <ShieldCheck className="text-green-500" size={18} />
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Verified Organizer • 12 successful events
              </p>
            </div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="host"
              className="w-14 h-14 rounded-full border-2 border-orange-400"
            />
          </div>

          {/* What to Expect */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-3 text-blue-700">
              What You'll Experience
            </h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Meet passionate fitness and travel communities</li>
              <li>Learn from professional instructors</li>
              <li>Get exclusive photos & community rewards</li>
            </ul>
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden shadow-md">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                event.location
              )}&output=embed`}
              width="100%"
              height="250"
              allowFullScreen=""
              loading="lazy"
              className="rounded-xl"
              title="Event Location"
            ></iframe>
          </div>
        </div>

        {/* ✅ Sticky Booking Card */}
        <div className="relative md:sticky md:top-24 h-fit">
          <div className="bg-gradient-to-b from-blue-600 to-orange-500 text-white rounded-3xl shadow-lg p-8 flex flex-col justify-between transition-all duration-300 ease-in-out">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                ₹{event.price} per ticket
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                Secure your spot instantly — limited seats available!
              </p>

              {diffDays > 0 ? (
                <p className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-sm mb-4">
                  <Clock size={16} /> Starts in {diffDays} days
                </p>
              ) : (
                <p className="text-yellow-200 text-sm mb-4">
                  Event is live today!
                </p>
              )}

              {event.capacity < 10 && (
                <p className="text-red-300 font-semibold mb-4">
                  Only {event.capacity} seats left! 🔥
                </p>
              )}
            </div>

            <button
              onClick={handleBookEvent}
              className="w-full flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-full shadow-md hover:bg-orange-100 transition-all hover:scale-105"
            >
              <Ticket size={18} /> Book Now
            </button>

            <div className="mt-8 bg-white/20 p-4 rounded-xl text-sm space-y-2">
              <p className="flex items-center gap-2">
                <ShieldCheck size={16} /> 100% Secure Payment
              </p>
              <p className="flex items-center gap-2">
                <RotateCcw size={16} /> Easy Refunds if event canceled
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle size={16} /> Verified Community Reviews
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center py-16 mt-16 bg-gradient-to-r from-blue-700 to-orange-500 text-white">
        <h2 className="text-3xl font-semibold mb-3">
          Experience. Connect. Grow.
        </h2>
        <p className="text-blue-100 mb-6">
          Discover more events hosted by communities around India.
        </p>
        <Link
          to="/events"
          className="bg-white text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-orange-100 transition-all"
        >
          Browse More Events
        </Link>
      </div>
    </div>
  );
};

export default EventDetail;
