// src/pages/partner/PartnerBookings.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Ticket,
  Users,
  Mail,
  CalendarDays,
  MapPin,
  X,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import API from "../../utils/api";

const THEME = {
  card: "rgba(15, 10, 24, 0.96)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
  accentBlue: "#2563EB",
  accentSky: "#0EA5E9",
  accentOrange: "#F97316",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const PartnerBookings = () => {
  const { gym, isGym, isEventHost } = useOutletContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all"); // all | active | cancelled
  const [searchQuery, setSearchQuery] = useState("");

  // 🧾 detail drawer state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const brandName =
    gym?.name ||
    (isEventHost && !isGym
      ? "your event brand"
      : isGym
      ? "your gym"
      : "your brand");

  const roleLabel =
    isEventHost && !isGym ? "Event host" : isGym ? "Gym partner" : "Partner";

  const fetchBookings = async () => {
    // Only fetch for partners (gym or event host)
    if (!isGym && !isEventHost) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      let res;

      if (isGym) {
        // 🏋️ Gym partner bookings
        res = await API.get("/gyms/me/bookings");
      } else if (isEventHost) {
        // 🎟 Event host ticket bookings
        // Make sure backend has this route wired to EventBooking list for host
        res = await API.get("/event-bookings/host/me");
      }

      setBookings(res?.data?.bookings || res?.data || []);
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
    if (isGym || isEventHost) {
      fetchBookings();
    } else {
      setLoading(false);
      setBookings([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGym, isEventHost]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const status = b.status || "active";

      if (statusFilter === "active" && status === "cancelled") return false;
      if (statusFilter === "cancelled" && status !== "cancelled") return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const userName = b.user?.name?.toLowerCase() || "";
      const userEmail = b.user?.email?.toLowerCase() || "";
      const passName = (b.pass?.name || b.passName || "").toLowerCase();
      const eventName = (b.event?.name || "").toLowerCase();
      const bookingId = (b._id || b.id || "").toLowerCase();

      return (
        userName.includes(q) ||
        userEmail.includes(q) ||
        passName.includes(q) ||
        eventName.includes(q) ||
        bookingId.includes(q)
      );
    });
  }, [bookings, statusFilter, searchQuery]);

  // lightweight stats for header chips
  const stats = useMemo(() => {
    let total = bookings.length;
    let active = 0;
    let cancelled = 0;
    let checkedIn = 0;
    let ticketsTotal = 0;

    bookings.forEach((b) => {
      const status = b.status || "active";
      if (status === "cancelled") cancelled += 1;
      else active += 1;
      if (status === "checked-in") checkedIn += 1;
      ticketsTotal += b.tickets ?? 1;
    });

    return { total, active, cancelled, checkedIn, ticketsTotal };
  }, [bookings]);

  const isHostView = isEventHost && !isGym;

  const title =
    isHostView ? "Ticket bookings & check-ins" : "Live bookings & check-ins";

  const subtitle = isHostView
    ? "View users who have booked tickets for your events. Later we can add QR-based check-in directly from this table."
    : "View users who have booked your passes and classes. Later we can add QR-based check-in directly from this table.";

  const secondColumnLabel = isHostView ? "Event" : "Pass";
  const lastColumnLabel = isHostView ? "Tickets" : "Check-ins used";

  const openDetail = (booking) => {
    setSelectedBooking(booking);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    // keep selectedBooking so closing/opening animations feel smooth
  };

  // derived fields for detail drawer
  const detail = (() => {
    if (!selectedBooking) return null;

    const b = selectedBooking;
    const status = b.status || "active";
    const createdAt = b.createdAt || b.date || b.eventDate;
    const bookingId = b._id || b.id || "—";

    const tickets = b.tickets ?? 1;
    const totalPrice = b.totalPrice ?? b.price ?? null;
    const paymentStatus = b.paymentStatus || (totalPrice ? "paid" : "—");

    const checkInsUsed = b.checkInsUsed ?? 0;
    const maxCI =
      b.maxCheckIns === 0 || b.maxCheckIns == null ? "∞" : b.maxCheckIns;

    const isEvent = isHostView;
    const title = isEvent
      ? b.event?.name || "Event"
      : b.pass?.name || b.passName || "Pass";
    const subTitle = isEvent
      ? b.event?.location || ""
      : gym?.name || "Gym";

    const eventDate = b.eventDate || b.event?.date || null;
    const bookingCode = b.bookingCode || null;

    return {
      status,
      createdAt,
      bookingId,
      tickets,
      totalPrice,
      paymentStatus,
      checkInsUsed,
      maxCI,
      isEvent,
      title,
      subTitle,
      eventDate,
      bookingCode,
      userName: b.user?.name || "User",
      userEmail: b.user?.email || "",
    };
  })();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.22em] text-gray-500">
            bookings
          </p>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {title}
          </h1>
          <p className="mt-1 max-w-xl text-xs text-gray-400">{subtitle}</p>

          {/* Role + Brand chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-gray-200">
              <Users className="h-3 w-3 text-gray-300" />
              <span className="uppercase tracking-[0.16em] text-[10px] text-gray-300">
                {roleLabel}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-1 text-gray-300">
              <Ticket className="h-3 w-3 text-orange-300" />
              <span className="truncate max-w-[180px]">{brandName}</span>
            </span>
          </div>
        </div>

        {/* Small stat chips */}
        <div className="flex flex-wrap gap-2 text-[11px] md:justify-end">
          <div className="rounded-2xl border border-white/10 bg-black/50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400">
              Total
            </p>
            <p className="text-sm font-semibold text-gray-50">
              {stats.total}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-200/80">
              Active / Checked-in
            </p>
            <p className="text-sm font-semibold text-emerald-100">
              {stats.active}
              <span className="text-[11px] text-emerald-200/80">
                {" "}
                · {stats.checkedIn} checked-in
              </span>
            </p>
          </div>
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-red-200/80">
              Cancelled
            </p>
            <p className="text-sm font-semibold text-red-100">
              {stats.cancelled}
            </p>
          </div>
          {isHostView && (
            <div className="rounded-2xl border border-white/10 bg-black/60 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400">
                Tickets sold
              </p>
              <p className="text-sm font-semibold text-gray-50">
                {stats.ticketsTotal}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main card */}
      <div
        className="overflow-hidden rounded-2xl border shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
        style={{
          background: `
            radial-gradient(circle at top left, rgba(14,165,233,0.22), transparent 55%),
            radial-gradient(circle at top right, rgba(249,115,22,0.16), transparent 55%),
            ${THEME.card}
          `,
          borderColor: THEME.borderSubtle,
        }}
      >
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-50">Recent bookings</h2>
            <p className="text-[11px] text-gray-400">
              {filteredBookings.length} shown · {bookings.length} total
            </p>
          </div>

          <div className="flex flex-col gap-2 text-[11px] md:flex-row md:items-center">
            {/* Status filter pills */}
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1 backdrop-blur-sm">
              <Filter className="h-3 w-3 text-gray-400" />
              {["all", "active", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-2 py-0.5 capitalize transition ${
                    statusFilter === s
                      ? "bg-gradient-to-r from-blue-500 via-sky-400 to-orange-400 text-black font-medium shadow shadow-blue-500/40"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Search box */}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2 py-1 backdrop-blur-sm">
              <Search className="h-3.5 w-3.5 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, email, pass/event, ID…"
                className="w-40 bg-transparent text-[11px] text-gray-100 placeholder:text-gray-500 focus:outline-none md:w-56"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-xs text-gray-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-[11px] text-gray-400">
              Pulling your latest {isHostView ? "ticket bookings" : "gym bookings"}…
            </p>
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
                  Once users start booking your{" "}
                  {isHostView ? "events" : "passes"}, you’ll see them here in
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
                  <th className="px-4 py-2 text-left font-medium">
                    {secondColumnLabel}
                  </th>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">
                    {lastColumnLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const status = b.status || "active";
                  const created = b.createdAt || b.date || b.eventDate;
                  const dateDisplay = formatDateTime(created);

                  const secondColLabel = isHostView
                    ? b.event?.name || "Event"
                    : b.pass?.name || b.passName || "Pass";

                  const secondColId = isHostView
                    ? (b.event?._id || "")?.toString()?.slice(-6)
                    : (b.pass?._id || b.passId || "")?.toString()?.slice(-6);

                  const tickets = b.tickets ?? 1;
                  const ciUsed = b.checkInsUsed ?? 0;
                  const maxCI =
                    b.maxCheckIns === 0 || b.maxCheckIns == null
                      ? "∞"
                      : b.maxCheckIns;

                  return (
                    <tr
                      key={b._id || b.id}
                      className="border-t border-white/5 bg-black/20 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => openDetail(b)}
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
                          {secondColLabel}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          #{secondColId}
                        </div>
                      </td>
                      <td className="px-4 py-2">{dateDisplay}</td>
                      <td className="px-4 py-2">
                        {status === "cancelled" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] text-red-200">
                            <XCircle className="h-3 w-3" />
                            Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            {status === "checked-in" ? "Checked-in" : "Active"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {isHostView ? (
                          <span className="font-medium text-gray-50">
                            {tickets}
                          </span>
                        ) : (
                          <span className="font-medium text-gray-50">
                            {ciUsed} / {maxCI}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🧾 Detail drawer */}
      {detailOpen && selectedBooking && detail && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={closeDetail}
          />
          {/* drawer */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-white/10 bg-[#050712]/95 shadow-[0_0_60px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                    booking details
                  </p>
                  <h2 className="text-sm font-semibold text-gray-50">
                    {detail.isEvent ? "Event booking" : "Gym pass booking"}
                  </h2>
                </div>
                <button
                  onClick={closeDetail}
                  className="rounded-full border border-white/10 bg-black/40 p-1.5 text-gray-300 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 text-xs text-gray-200">
                {/* Status + ID */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-1 text-[11px]">
                      <Ticket className="h-3 w-3 text-orange-300" />
                      #{detail.bookingId?.toString().slice(-8)}
                    </span>
                    {detail.status === "cancelled" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-1 text-[11px] text-red-200">
                        <XCircle className="h-3 w-3" />
                        Cancelled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] text-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        {detail.status === "checked-in"
                          ? "Checked-in"
                          : "Active"}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Created · {formatDateTime(detail.createdAt)}
                  </p>
                </div>

                {/* Main block: pass/event + user */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                  <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-gray-500">
                    {detail.isEvent ? "Event" : "Pass"}
                  </p>
                  <h3 className="text-sm font-semibold text-gray-50">
                    {detail.title}
                  </h3>
                  {detail.subTitle && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
                      {detail.isEvent && <MapPin className="h-3 w-3" />}
                      <span>{detail.subTitle}</span>
                    </p>
                  )}

                  <div className="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-white/5 bg-black/30 p-2 text-[11px] md:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">
                        User
                      </p>
                      <p className="text-xs font-medium text-gray-50">
                        {detail.userName}
                      </p>
                      {detail.userEmail && (
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{detail.userEmail}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">
                        {detail.isEvent ? "Event date" : "Booking date"}
                      </p>
                      <p className="text-xs text-gray-50">
                        {detail.isEvent
                          ? formatDateTime(detail.eventDate || detail.createdAt)
                          : formatDateTime(detail.createdAt)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
                        <CalendarDays className="h-3 w-3" />
                        <span>
                          {detail.isEvent ? "Event" : "Booked"} via Passiify
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Numbers: tickets / check-ins / totals */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {detail.isEvent ? (
                    <>
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">
                          Tickets
                        </p>
                        <p className="mt-1 text-base font-semibold text-gray-50">
                          {detail.tickets}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">
                          Total amount
                        </p>
                        <p className="mt-1 text-base font-semibold text-gray-50">
                          {detail.totalPrice != null
                            ? `₹${Number(detail.totalPrice).toLocaleString()}`
                            : "—"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          Status: {detail.paymentStatus}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">
                          Booking code
                        </p>
                        <p className="mt-1 text-xs font-medium text-gray-50">
                          {detail.bookingCode || "—"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          Use this for QR / manual check-in
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">
                          Check-ins used
                        </p>
                        <p className="mt-1 text-base font-semibold text-gray-50">
                          {detail.checkInsUsed} / {detail.maxCI}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">
                          Total amount
                        </p>
                        <p className="mt-1 text-base font-semibold text-gray-50">
                          {detail.totalPrice != null
                            ? `₹${Number(detail.totalPrice).toLocaleString()}`
                            : "—"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">
                          Payment status
                        </p>
                        <p className="mt-1 text-base font-semibold text-gray-50">
                          {detail.paymentStatus}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer note */}
                <p className="mt-2 text-[10px] text-gray-500">
                  This is a preview of how a full{" "}
                  <span className="text-gray-300">
                    Stripe-style booking detail
                  </span>{" "}
                  looks inside Passiify. Later we can plug in actions like{" "}
                  <span className="text-gray-300">
                    resend ticket, manual check-in, cancel & refund
                  </span>{" "}
                  right here.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PartnerBookings;
