import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Dumbbell, Trash2, XCircle, CheckCircle } from "lucide-react";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [confirmCancel, setConfirmCancel] = useState(null); // Which booking user is canceling
  const [toast, setToast] = useState(null); // Toast message

  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    setBookings(storedBookings);
  }, []);

  const handleCancelBooking = (id) => {
    setConfirmCancel(id);
  };

  const confirmCancelBooking = (id) => {
    const updated = bookings.filter((b) => b.id !== id);
    setBookings(updated);
    localStorage.setItem("bookings", JSON.stringify(updated));
    setConfirmCancel(null);

    // 🧠 Show toast message
    setToast({
      message: "❌ Booking Cancelled Successfully",
      type: "error",
    });

    // Hide toast automatically after 2.5s
    setTimeout(() => setToast(null), 2500);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-fade-in ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.type === "error" ? (
            <XCircle className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          My Bookings 🏋️‍♂️
        </h1>

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 mb-6 text-lg">
              You haven’t booked any passes yet.
            </p>
            <Link
              to="/explore"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Explore Gyms
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const isExpired = booking.date < today;
              const isBeingCancelled = confirmCancel === booking.id;

              return (
                <div
                  key={booking.id}
                  className={`bg-white shadow-md rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between border border-gray-100 hover:shadow-lg transition-all duration-300 ${
                    isBeingCancelled ? "opacity-50 scale-[0.98]" : ""
                  }`}
                >
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-blue-600" />
                      {booking.name}
                    </h2>
                    <p className="text-gray-600 mb-1">{booking.city}</p>
                    <p className="text-gray-700 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-blue-500" />
                      <span>{booking.date}</span>
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      ₹{booking.price}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-0 flex flex-col items-end">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isExpired
                          ? "bg-gray-200 text-gray-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isExpired ? "Expired" : "Active"}
                    </span>

                    <div className="flex gap-3 mt-3">
                      <Link
                        to={`/booking/${booking.id}`}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        Book Again
                      </Link>

                      {!isExpired && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cancel Confirmation Modal */}
                  {isBeingCancelled && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                      <div className="bg-white rounded-xl shadow-lg p-8 w-[90%] max-w-md text-center relative">
                        <XCircle className="text-red-500 w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                          Cancel Booking?
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Are you sure you want to cancel your booking for{" "}
                          <span className="font-medium text-blue-600">
                            {booking.name}
                          </span>{" "}
                          on <span className="font-semibold">{booking.date}</span>?
                        </p>

                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => setConfirmCancel(null)}
                            className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                          >
                            No, Keep It
                          </button>
                          <button
                            onClick={() => confirmCancelBooking(booking.id)}
                            className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                          >
                            Yes, Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-out {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(20px); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MyBookings;
