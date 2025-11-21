// src/pages/partner/PartnerBookings.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
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
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all"); // all | active | cancelled
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = async () => {
    if (!isGym) return; // 🔒 only fetch for gym partners for now

    setLoading(true);
    setError("");
    try {
      // Adjust to your backend:
      // e.g. GET /gyms/me/bookings  or  GET /bookings?gymId=...
      const res = await API.get("/gyms/me/bookings");
      setBookings(res.data?.bookings || res.data || []);
    } catch (err) {
      console.error("Error loading bookings:", err);
      const msg =
        err?.response?.data?.message ||
        "Unable to load bookings. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGym) {
      fetchBookings();
    } else {
      setLoading(false);
      setBookings([]);
    }
  }, [isGym]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const status = b.status || "active";

      if (statusFilter === "active" && status === "cancelled") return false;
      if (statusFilter === "cancelled" && status !== "cancelled") return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const userName = b.user?.name?.toLowerCase() || "";
      const userEmail = b.user?.email?.toLowerCase() || "";
      const passName =
        (b.pass?.name || b.passName || "").toLowerCase();
      const bookingId = (b._id || b.id || "").toLowerCase();

      return (
        userName.includes(q) ||
        userEmail.includes(q) ||
        passName.includes(q) ||
        bookingId.includes(q)
      );
    });
  }, [bookings, statusFilter, searchQuery]);

  // 🎟 Event-host view: explain Ticket Sales instead of hitting broken APIs
  if (isEventHost && !isGym) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.22em] text-gray-500">
              ticket sales
            </p>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              Ticket sales & check-ins
            </h1>
            <p className="mt-1 max-w-xl text-xs text-gray-400">
              This section will show tickets sold for your events, attendee
              details and check-in status. Once your event APIs are live, we’ll
              wire it to real-time data.
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl border p-4 text-xs text-gray-300 shadow-lg shadow-black/40"
          style={{
            backgroundColor: THEME.card,
            borderColor: THEME.borderSubtle,
          }}
        >
          <p className="mb-1 text-sm font-medium">
            How Ticket Sales will work
          </p>
          <ul className="list-inside list-disc space-y-1 text-[11px] text-gray-400">
            <li>See every ticket sold per event with buyer details.</li>
            <li>Track check-ins at the venue using QR code scanning.</li>
            <li>Filter by event, date, ticket type and status.</li>
            <li>Sync with your revenue page for payouts and analytics.</li>
          </ul>
          <p className="mt-2 text-[11px] text-gray-500">
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
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.22em] text-gray-500">
            bookings
          </p>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            Live bookings & check-ins
          </h1>
          <p className="mt-1 max-w-xl text-xs text-gray-400">
            View users who have booked your passes and classes. Later we can
            add QR-based check-in directly from this table.
          </p>
        </div>
      </div>

      {/* Card */}
      <div
        className="overflow-hidden rounded-2xl border shadow-lg shadow-black/40"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(249,115,22,0.14), transparent 55%), " +
            THEME.card,
          borderColor: THEME.borderSubtle,
        }}
      >
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-medium">Recent bookings</h2>
            <p className="text-[11px] text-gray-400">
              {filteredBookings.length} shown · {bookings.length} total
            </p>
          </div>

          <div className="flex flex-col gap-2 text-[11px] md:flex-row md:items-center">
            {/* Status filter pills */}
            <div className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 border border-white/10">
              <Filter className="h-3 w-3 text-gray-400" />
              {["all", "active", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-2 py-0.5 capitalize transition ${
                    statusFilter === s
                      ? "bg-orange-500/80 text-black font-medium"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Search box */}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2 py-1">
              <Search className="h-3.5 w-3.5 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, email, pass, ID…"
                className="w-40 bg-transparent text-[11px] text-gray-100 placeholder:text-gray-500 focus:outline-none md:w-56"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-xs text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading bookings…
          </div>
        ) : error ? (
          <div className="px-4 py-6 text-center text-xs text-red-300">
            <p className="mb-2">{error}</p>
            <button
              onClick={fetchBookings}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-100 hover:bg-white/10"
            >
              Retry
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-gray-400">
            {bookings.length === 0 && !searchQuery && statusFilter === "all" ? (
              <>
                <p>No bookings yet.</p>
                <p className="mt-1 text-[11px] text-gray-500">
                  Once users start booking your passes, you’ll see them here in
                  real-time.
                </p>
              </>
            ) : (
              <>
                <p>No bookings match your filters.</p>
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="mt-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-100 hover:bg-white/10"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-black/40 text-gray-400">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">User</th>
                  <th className="px-4 py-2 text-left font-medium">Pass</th>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">
                    Check-ins used
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const status = b.status || "active";
                  const created = b.createdAt || b.date;
                  let dateDisplay = "—";
                  try {
                    if (created) {
                      dateDisplay = new Date(created).toLocaleString();
                    }
                  } catch {
                    dateDisplay = created || "—";
                  }

                  return (
                    <tr
                      key={b._id || b.id}
                      className="border-t border-white/5 bg-black/20 hover:bg-white/5"
                    >
                      <td className="px-4 py-2">
                        <div className="text-gray-100">
                          {b.user?.name || "User"}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {b.user?.email}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-gray-100">
                          {b.pass?.name || b.passName || "Pass"}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          #{(b.pass?._id || b.passId || "")
                            ?.toString()
                            ?.slice(-6)}
                        </div>
                      </td>
                      <td className="px-4 py-2">{dateDisplay}</td>
                      <td className="px-4 py-2">
                        {status === "cancelled" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-red-300">
                            <XCircle className="h-3 w-3" />
                            Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerBookings;
