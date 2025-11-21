// src/pages/partner/PartnerBookings.jsx
import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import API from "../../utils/api";

const THEME = {
  card: "rgba(15, 10, 24, 0.96)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
};

const PartnerBookings = () => {
  const { gym, isGym, isEventHost } = useOutletContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!isGym) return; // 🔒 only fetch for gym partners for now

    setLoading(true);
    try {
      // Adjust to your backend:
      // e.g. GET /gyms/me/bookings  or  GET /bookings?gymId=...
      const res = await API.get("/gyms/me/bookings");
      setBookings(res.data?.bookings || res.data || []);
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGym) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [isGym]);

  // 🎟 Event-host view: explain Ticket Sales instead of hitting broken APIs
  if (isEventHost && !isGym) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-500 mb-1">
              ticket sales
            </p>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              Ticket sales & check-ins
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              This section will show tickets sold for your events, attendee
              details and check-in status. Once your event APIs are live, we’ll
              wire it to real-time data.
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl border p-4 text-xs text-gray-300"
          style={{ backgroundColor: THEME.card, borderColor: THEME.borderSubtle }}
        >
          <p className="mb-1 font-medium text-sm">How Ticket Sales will work</p>
          <ul className="list-disc list-inside text-[11px] text-gray-400 space-y-1">
            <li>See every ticket sold per event with buyer details.</li>
            <li>Track check-ins at the venue using QR code scanning.</li>
            <li>Filter by event, date, ticket type and status.</li>
            <li>Sync with your revenue page for payouts and analytics.</li>
          </ul>
          <p className="text-[11px] text-gray-500 mt-2">
            Once your `/events` and `/bookings` endpoints for hosts are ready,
            we’ll plug them in here without changing the UI.
          </p>
        </div>
      </div>
    );
  }

  // 🏋️ Gym partner view: live bookings & check-ins table
  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 mb-1">
            bookings
          </p>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Live bookings & check-ins
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            View users who have booked your passes and classes. Later we can
            add QR-based check-in directly from this table.
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl border"
        style={{ backgroundColor: THEME.card, borderColor: THEME.borderSubtle }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-medium">Recent bookings</h2>
          <p className="text-[11px] text-gray-400">
            {bookings.length} total
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-300 gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading bookings…
          </div>
        ) : bookings.length === 0 ? (
          <div className="px-4 py-6 text-xs text-gray-400">
            No bookings yet. Once users start booking, you will see them here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-black/30 text-gray-400">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">User</th>
                  <th className="text-left px-4 py-2 font-medium">Pass</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-right px-4 py-2 font-medium">
                    Check-ins used
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b._id || b.id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-100">
                        {b.user?.name || "User"}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {b.user?.email}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-100">
                        {b.pass?.name || b.passName}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        #{(b.pass?._id || b.passId)?.slice?.(-6) || ""}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(b.createdAt || b.date).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      {b.status === "cancelled" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-300">
                          <XCircle className="w-3 h-3" />
                          Cancelled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {b.checkInsUsed ?? 0} /{" "}
                      {b.maxCheckIns === 0 || b.maxCheckIns == null
                        ? "∞"
                        : b.maxCheckIns}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerBookings;
