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

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await API.get(`/events/${id}`);
        setEvent(res.data.event);
      } catch (error) {
        console.error("Error loading event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleConfirmBooking = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        navigate("/login");
        return;
      }

      setBooking(true);

      const res = await API.post("/api/event-bookings", {
        userId: user.user._id,
        eventId: event._id,
        tickets,
        totalPrice: event.price * tickets,
      });

      if (res.data.success) {
        navigate("/booking-success");
      } else {
        alert("Booking failed. Please try again later.");
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("Something went wrong while booking.");
    } finally {
      setBooking(false);
    }
  };

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

  const totalPrice = event.price * tickets;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white text-gray-800">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 font-medium hover:text-orange-500 transition mb-6"
        >
          <ArrowLeft size={18} className="mr-1" /> Back
        </button>

        {/* Booking Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row">
          {/* Left Image */}
          <div className="md:w-1/2">
            <img
              src={event.image || "/images/default-event.jpg"}
              alt={event.name}
              className="w-full h-full object-cover md:h-[500px]"
            />
          </div>

          {/* Right Details */}
          <div className="md:w-1/2 p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-700 mb-2">{event.name}</h1>
              <p className="text-gray-500 mb-4">{event.description}</p>

              <div className="flex flex-col gap-2 text-sm text-gray-700 mb-4">
                <p className="flex items-center gap-2">
                  <MapPin size={16} /> {event.location}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays size={16} />{" "}
                  {new Date(event.date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="flex items-center gap-2">
                  <Users size={16} /> {event.capacity} People
                </p>
              </div>

              {/* Ticket Selector */}
              <div className="my-6">
                <label className="block text-gray-800 font-semibold mb-2">
                  Select Tickets
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTickets(Math.max(1, tickets - 1))}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="text-lg font-bold text-gray-800">
                    {tickets}
                  </span>
                  <button
                    onClick={() => setTickets(Math.min(10, tickets + 1))}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="bg-blue-50 rounded-xl p-4 flex justify-between items-center mb-6">
                <span className="font-semibold text-gray-700">Total Price:</span>
                <span className="text-xl font-bold text-blue-700">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmBooking}
                disabled={booking}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-md transition-all ${
                  booking
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-orange-500 hover:scale-105"
                }`}
              >
                {booking ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Ticket size={18} /> Confirm Booking
                  </>
                )}
              </button>
            </div>

            {/* Security Note */}
            <div className="mt-6 flex items-center justify-center text-gray-500 text-sm">
              <ShieldCheck size={16} className="text-green-500 mr-2" />
              100% Secure & Verified Booking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookEvent;
