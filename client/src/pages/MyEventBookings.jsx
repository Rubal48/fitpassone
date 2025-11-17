import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { CalendarDays, MapPin, Loader2, Ticket, IndianRupee } from "lucide-react";

export default function MyEventBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const user = JSON.parse(storedUser);
        const userId = user._id || user.user?._id;

        const res = await API.get(`/event-bookings/user/${userId}`);

        if (res.data?.bookings) {
          setBookings(res.data.bookings);
        }
      } catch (err) {
        console.error("Error loading event bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  if (!bookings.length)
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Event Bookings Yet</h2>
        <p className="text-gray-500">Your booked events will appear here.</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
          My Event Bookings
        </h1>
        <p className="text-gray-500 mt-2">All your adventure bookings in one place.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {bookings.map((b) => (
          <div
            key={b._id}
            className="relative bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden hover:shadow-[0_10px_40px_rgba(0,0,0,0.12)] transition-all duration-300 group"
          >
            {/* Top Gradient Banner */}
            <div className="h-2 bg-gradient-to-r from-blue-600 to-orange-500"></div>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition">
                {b.event?.name}
              </h2>

              <div className="mt-4 space-y-2 text-gray-700">
                <p className="flex items-center gap-2">
                  <MapPin size={18} className="text-orange-500" />
                  {b.event?.location}
                </p>

                <p className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-blue-600" />
                  {new Date(b.event?.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <p className="flex items-center gap-2 font-medium text-gray-800">
                  <Ticket size={18} className="text-green-600" />
                  {b.tickets} Ticket(s)
                </p>

                <p className="flex items-center gap-2 font-semibold text-green-600 text-lg">
                  <IndianRupee size={18} />
                  {b.totalPrice}
                </p>
              </div>
            </div>

            {/* Bottom Badge */}
            <div className="absolute bottom-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-md">
              Booking ID: {b._id?.slice(-6).toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
