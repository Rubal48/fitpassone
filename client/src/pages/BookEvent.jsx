import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  CalendarDays,
  Users,
  Loader2,
  Ticket,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import API from "../utils/api";

const BookEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState(1);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await API.get(`/events/${id}`);
        if (res.data?.event) {
          setEvent(res.data.event);
        } else {
          setEvent(res.data);
        }
      } catch (error) {
        console.error("Error loading event:", error);
        setError("Unable to load this event. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleConfirmBooking = async () => {
    if (!event) return;

    // ⛔ Prevent booking for past events
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      alert("This event has already happened. Please choose another one.");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        return navigate("/login");
      }

      const parsed = JSON.parse(storedUser);
      const userData = parsed.user || parsed;
      const userId = userData._id;

      if (!userId) {
        return navigate("/login");
      }

      setBooking(true);
      setError("");

      const payload = {
        userId,
        eventId: event._id,
        tickets,
        totalPrice: event.price * tickets,
      };

      // ✅ aligned with other pages: /event-bookings
      const res = await API.post("/event-bookings", payload);

      if (res.data.success && res.data.booking) {
        navigate(`/booking-success/${res.data.booking._id}`, {
          state: { type: "event", name: event.name },
        });
      } else {
        setError(res.data.message || "Booking failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setError("Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-[60vh]"
        style={{
          backgroundColor: "#050308",
          backgroundImage:
            "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
        }}
      >
        <Loader2 className="animate-spin text-sky-400" size={42} />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center text-gray-200"
        style={{
          backgroundColor: "#050308",
          backgroundImage:
            "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
        }}
      >
        <p className="mb-4 text-lg">⚠️ {error}</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-orange-400 text-gray-900 px-6 py-2.5 rounded-full text-sm font-semibold shadow-[0_16px_60px_rgba(0,0,0,0.9)] hover:scale-[1.02] transition-transform"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center text-gray-200"
        style={{
          backgroundColor: "#050308",
          backgroundImage:
            "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
        }}
      >
        <p className="mb-4 text-lg">❌ Event not found or removed.</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-orange-400 text-gray-900 px-6 py-2.5 rounded-full text-sm font-semibold shadow-[0_16px_60px_rgba(0,0,0,0.9)] hover:scale-[1.02] transition-transform"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  const totalPrice = event.price * tickets;
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const capacity = typeof event.capacity === "number" ? event.capacity : 10;
  const isPast = eventDate < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div
      className="min-h-screen text-gray-100 py-10"
      style={{
        backgroundColor: "#050308",
        backgroundImage:
          "radial-gradient(circle at top, rgba(248,216,181,0.22), transparent 55%)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-300 hover:text-orange-300 font-medium mb-6 text-sm"
        >
          <ArrowLeft size={18} className="mr-1" /> Back
        </button>

        <div className="bg-white/5 border border-white/10 rounded-[26px] shadow-[0_26px_100px_rgba(0,0,0,1)] flex flex-col md:flex-row overflow-hidden backdrop-blur-xl">
          {/* Left image */}
          <div className="md:w-1/2 relative">
            <img
              src={event.image || "/images/default-event.jpg"}
              alt={event.name}
              className="w-full h-full object-cover md:h-full max-h-[460px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/20 text-[11px] text-gray-100 mb-2">
                <CalendarDays size={14} className="text-sky-300" />
                <span>{formattedDate}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow">
                {event.name}
              </h1>
              <p className="flex items-center gap-2 text-xs text-gray-200 mt-1">
                <MapPin size={14} className="text-orange-300" />
                {event.location}
              </p>
            </div>
          </div>

          {/* Right content */}
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between bg-black/40">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Confirm your booking
              </h2>
              <p className="text-sm text-gray-300 mb-4">
                You’re about to join a curated fitness experience hosted by{" "}
                <span className="font-semibold text-orange-300">
                  {event.organizer}
                </span>
                .
              </p>

              {/* Event stats */}
              <div className="flex flex-col gap-2 text-xs sm:text-sm text-gray-200 mb-4">
                <p className="flex items-center gap-2">
                  <MapPin size={16} className="text-orange-300" />{" "}
                  {event.location}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-sky-300" />
                  {formattedDate}
                </p>
                <p className="flex items-center gap-2">
                  <Users size={16} className="text-emerald-300" />
                  Capacity: {capacity} people
                </p>
              </div>

              {/* Tickets selector */}
              <div className="my-6">
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Select number of tickets
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTickets(Math.max(1, tickets - 1))}
                    className="bg-white/10 border border-white/20 text-gray-100 px-3 py-1.5 rounded-full text-lg leading-none hover:bg-white/20 transition"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold">{tickets}</span>
                  <button
                    onClick={() =>
                      setTickets(
                        Math.min(
                          capacity > 0 ? capacity : 10,
                          tickets + 1
                        )
                      )
                    }
                    className="bg-white/10 border border-white/20 text-gray-100 px-3 py-1.5 rounded-full text-lg leading-none hover:bg-white/20 transition"
                  >
                    +
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  Max{" "}
                  {capacity > 0
                    ? `${capacity} ticket${capacity > 1 ? "s" : ""}`
                    : "10 tickets"}{" "}
                  per booking.
                </p>
              </div>

              {/* Price summary */}
              <div className="bg-white/5 border border-white/15 rounded-2xl p-4 flex justify-between items-center mb-4">
                <div>
                  <span className="block text-xs text-gray-300">
                    Total amount
                  </span>
                  <span className="text-xl font-semibold text-white">
                    ₹{totalPrice}
                  </span>
                </div>
                <div className="text-right text-[11px] text-gray-300">
                  <p>₹{event.price} per ticket</p>
                  <p>{tickets} ticket(s)</p>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 mb-2 text-center">
                  {error}
                </p>
              )}

              {/* Confirm button */}
              <button
                onClick={handleConfirmBooking}
                disabled={booking || isPast}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold mt-2 shadow-[0_18px_60px_rgba(0,0,0,1)] transition-transform ${
                  isPast
                    ? "bg-gray-500/70 text-gray-200 cursor-not-allowed"
                    : "bg-gradient-to-r from-sky-500 to-orange-400 text-gray-900 hover:scale-[1.02]"
                }`}
              >
                {booking ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processing...
                  </>
                ) : isPast ? (
                  "Event Finished"
                ) : (
                  <>
                    <Ticket size={18} />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>

            {/* Trust footer */}
            <div className="mt-6 text-gray-300 text-[11px] flex items-center justify-center gap-2">
              <ShieldCheck size={16} className="text-emerald-300" />
              100% secure booking with Passiify · Ticket & details sent to your
              email after payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookEvent;
