// src/pages/admin/AdminSettlements.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  AlertTriangle,
  WalletCards,
  Banknote,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";

/* ==========================================
   THEME — reuse Passiify blue / orange vibe
========================================== */
const THEME = {
  accentFrom: "#2563EB",
  accentMid: "#0EA5E9",
  accentTo: "#F97316",
  bg: "#020617",
  card: "rgba(15,23,42,0.98)",
  cardSoft: "rgba(15,23,42,0.94)",
  borderSoft: "rgba(148,163,184,0.4)",
};

const ROWS_PER_PAGE = 15;

const formatINR = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "₹0";
  return num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

const numberWithCommas = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-IN");
};

// 🔐 Helper: get config with admin token
const getAdminConfig = (navigate) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    navigate("/admin/login");
    return null;
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const AdminSettlements = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    summary: {
      totalGross: 0,
      totalPlatformFee: 0,
      totalRazorpayFee: 0,
      totalNetPayable: 0,
    },
    gyms: [],
    events: [],
  });

  const [activeTab, setActiveTab] = useState("gyms"); // "gyms" | "events"

  // Filters / search / pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [minNetFilter, setMinNetFilter] = useState("");
  const [pageGyms, setPageGyms] = useState(1);
  const [pageEvents, setPageEvents] = useState(1);

  // Which partner is currently being marked as paid
  const [marking, setMarking] = useState(null); // { type: "gym"|"event", id: string } | null

  const fetchSettlements = async () => {
    setLoading(true);
    setError("");
    try {
      const config = getAdminConfig(navigate);
      if (!config) {
        setLoading(false);
        return;
      }

      const res = await API.get("/admin/settlements/overview", config);
      const payload = res.data || {};
      setData({
        summary: payload.summary || {
          totalGross: 0,
          totalPlatformFee: 0,
          totalRazorpayFee: 0,
          totalNetPayable: 0,
        },
        gyms: payload.gyms || [],
        events: payload.events || [],
      });
    } catch (err) {
      console.error("Error loading settlements overview:", err);
      if (err?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
      const msg =
        err?.response?.data?.message ||
        "Unable to load settlements. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { summary, gyms, events } = data;

  const totalPartners = useMemo(
    () => (gyms?.length || 0) + (events?.length || 0),
    [gyms, events]
  );

  const effectiveTakeRate = useMemo(() => {
    const gross = Number(summary.totalGross || 0);
    if (!gross) return 0;
    const fees =
      Number(summary.totalPlatformFee || 0) +
      Number(summary.totalRazorpayFee || 0);
    return Math.round((fees / gross) * 100);
  }, [summary]);

  // Filtered + sorted data
  const filteredGyms = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const min = Number(minNetFilter || 0);

    return (gyms || [])
      .filter((g) => {
        if (!q) return true;
        return (
          (g.gymName || "").toLowerCase().includes(q) ||
          (g.city || "").toLowerCase().includes(q)
        );
      })
      .filter((g) => {
        if (!min) return true;
        return Number(g.netPayable || 0) >= min;
      })
      .sort(
        (a, b) => Number(b.netPayable || 0) - Number(a.netPayable || 0)
      );
  }, [gyms, searchTerm, minNetFilter]);

  const filteredEvents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const min = Number(minNetFilter || 0);

    return (events || [])
      .filter((e) => {
        if (!q) return true;
        return (
          (e.eventName || "").toLowerCase().includes(q) ||
          (e.organizer || "").toLowerCase().includes(q) ||
          (e.location || "").toLowerCase().includes(q)
        );
      })
      .filter((e) => {
        if (!min) return true;
        return Number(e.netPayable || 0) >= min;
      })
      .sort(
        (a, b) => Number(b.netPayable || 0) - Number(a.netPayable || 0)
      );
  }, [events, searchTerm, minNetFilter]);

  const currentFilteredRows =
    activeTab === "gyms" ? filteredGyms : filteredEvents;
  const totalCurrent = currentFilteredRows.length;
  const currentPage = activeTab === "gyms" ? pageGyms : pageEvents;
  const totalPages = Math.max(
    1,
    Math.ceil(totalCurrent / ROWS_PER_PAGE || 1)
  );

  const startIndex =
    totalCurrent === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;
  const endIndex =
    totalCurrent === 0
      ? 0
      : Math.min(totalCurrent, currentPage * ROWS_PER_PAGE);

  const paginatedRows = currentFilteredRows.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const markingKey = marking ? `${marking.type}-${marking.id}` : "";

  // Reset page on filters change
  useEffect(() => {
    if (activeTab === "gyms") {
      setPageGyms(1);
    } else {
      setPageEvents(1);
    }
  }, [searchTerm, minNetFilter, activeTab]);

  const handlePageChange = (direction) => {
    if (direction === "prev") {
      if (currentPage <= 1) return;
      if (activeTab === "gyms") {
        setPageGyms((p) => p - 1);
      } else {
        setPageEvents((p) => p - 1);
      }
    } else if (direction === "next") {
      if (currentPage >= totalPages) return;
      if (activeTab === "gyms") {
        setPageGyms((p) => p + 1);
      } else {
        setPageEvents((p) => p + 1);
      }
    }
  };

  const handleMarkPaid = async (type, id, name, netAmount) => {
    const net = Number(netAmount || 0);
    if (!net || net <= 0) {
      window.alert("Net payable is 0, nothing to mark as paid.");
      return;
    }

    const label = type === "gym" ? "gym" : "event";
    const confirmMsg = `Mark ${formatINR(
      net
    )} as PAID for ${name || label}?\n\nThis will update all pending bookings for this ${label} to payoutStatus = "paid".`;
    if (!window.confirm(confirmMsg)) return;

    const note = window.prompt(
      "Optional note (e.g. UPI ref no., date). You can also leave this blank:",
      ""
    );

    try {
      const config = getAdminConfig(navigate);
      if (!config) return;

      setMarking({ type, id });

      const url =
        type === "gym"
          ? `/admin/settlements/mark-paid/gym/${id}`
          : `/admin/settlements/mark-paid/event/${id}`;

      await API.post(
        url,
        {
          note: note || "",
        },
        config
      );

      await fetchSettlements();
    } catch (err) {
      console.error("Error marking payout as paid:", err);
      if (err?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        window.alert(
          err?.response?.data?.message ||
            "Failed to mark payout as paid. Please try again."
        );
      }
    } finally {
      setMarking(null);
    }
  };

  return (
    <div
      className="min-h-screen w-full px-4 py-6 text-slate-100 md:px-8"
      style={{
        background:
          "radial-gradient(circle at top, rgba(37,99,235,0.18), transparent 55%)," +
          "radial-gradient(circle at bottom, rgba(249,115,22,0.1), transparent 60%)," +
          THEME.bg,
      }}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.25em] text-slate-400">
            payouts &amp; settlements
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Partner settlements overview
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-slate-400">
            See how much each gym and event organiser has sold, your platform
            share, Razorpay charges, and the exact net amount you owe them.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Sparkles className="h-4 w-4 text-orange-400" />
          <span>
            Live snapshot · After you transfer money, mark payouts as{" "}
            <span className="font-semibold text-emerald-300">paid</span> here.
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {/* Total Gross */}
        <div
          className="relative overflow-hidden rounded-2xl border p-4 shadow-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.22), transparent)," +
              THEME.card,
            borderColor: THEME.borderSoft,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                total gross
              </p>
              <p className="mt-1 text-base font-semibold">
                {formatINR(summary.totalGross)}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                What all users paid (gyms + events).
              </p>
            </div>
            <Banknote className="h-8 w-8 text-slate-200/70" />
          </div>
        </div>

        {/* Platform Fee */}
        <div
          className="rounded-2xl border p-4 shadow-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(14,165,233,0.16), transparent)," +
              THEME.card,
            borderColor: THEME.borderSoft,
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            your platform fee
          </p>
          <p className="mt-1 text-base font-semibold">
            {formatINR(summary.totalPlatformFee)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Commission you kept from all bookings.
          </p>
        </div>

        {/* Razorpay Fee */}
        <div
          className="rounded-2xl border p-4 shadow-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.5), transparent)," +
              THEME.cardSoft,
            borderColor: THEME.borderSoft,
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            razorpay charges
          </p>
          <p className="mt-1 text-base font-semibold">
            {formatINR(summary.totalRazorpayFee)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Total gateway fees logged against bookings.
          </p>
        </div>

        {/* Net payable */}
        <div
          className="rounded-2xl border p-4 shadow-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(249,115,22,0.2), transparent)," +
              THEME.card,
            borderColor: THEME.borderSoft,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                net payable to partners
              </p>
              <p className="mt-1 text-base font-semibold">
                {formatINR(summary.totalNetPayable)}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                What you should payout across all gyms &amp; events.
              </p>
            </div>
            <div className="flex flex-col items-end text-right">
              <WalletCards className="mb-1 h-7 w-7 text-orange-400/90" />
              <span className="text-[10px] text-emerald-300">
                Take rate ~ {effectiveTakeRate}%
              </span>
              <span className="text-[10px] text-slate-500">
                {totalPartners} partners
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div
          className="mb-4 flex items-center gap-3 rounded-xl border px-3 py-2 text-xs text-red-200"
          style={{ borderColor: "rgba(248,113,113,0.5)", backgroundColor: "#450a0a" }}
        >
          <AlertTriangle className="h-4 w-4" />
          <div className="flex-1">
            <p className="font-medium">Failed to load settlements</p>
            <p className="text-[11px] text-red-100/80">{error}</p>
          </div>
          <button
            onClick={fetchSettlements}
            className="rounded-full border border-red-300/60 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-100 hover:bg-red-500/20"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs + table card */}
      <div
        className="overflow-hidden rounded-2xl border shadow-xl shadow-black/30"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(37,99,235,0.16), transparent 58%)," +
            THEME.card,
          borderColor: THEME.borderSoft,
        }}
      >
        {/* Header + tabs + filters */}
        <div className="border-b border-slate-700/60 px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold">Partner-wise breakdown</h2>
              <p className="text-[11px] text-slate-400">
                {activeTab === "gyms"
                  ? `${filteredGyms.length} of ${gyms.length} gyms match current filters`
                  : `${filteredEvents.length} of ${events.length} events match current filters`}
              </p>
            </div>

            <div className="inline-flex items-center rounded-full border border-slate-600/70 bg-black/40 p-1 text-[11px]">
              <button
                onClick={() => setActiveTab("gyms")}
                className={`rounded-full px-3 py-1 transition ${
                  activeTab === "gyms"
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                Gyms
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`rounded-full px-3 py-1 transition ${
                  activeTab === "events"
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                Events
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-[11px] text-slate-400">
              {totalCurrent === 0 ? (
                <span>No results for current filters.</span>
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-slate-100">
                    {startIndex}
                  </span>
                  –
                  <span className="font-semibold text-slate-100">
                    {endIndex}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-100">
                    {totalCurrent}
                  </span>{" "}
                  {activeTab === "gyms"
                    ? "gym partners"
                    : "event organisers"}
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="flex items-center rounded-full border border-slate-600/70 bg-black/40 px-2 py-1">
                <Search className="mr-1 h-3 w-3 text-slate-500" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    activeTab === "gyms"
                      ? "Search gym or city..."
                      : "Search event, organiser, city..."
                  }
                  className="w-36 bg-transparent text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none md:w-56"
                />
              </div>

              {/* Min net filter */}
              <div className="flex items-center gap-1 rounded-full border border-slate-600/70 bg-black/40 px-2 py-1 text-[11px]">
                <span className="text-slate-500">Min net</span>
                <input
                  type="number"
                  min={0}
                  value={minNetFilter}
                  onChange={(e) => setMinNetFilter(e.target.value)}
                  className="w-20 bg-transparent text-right text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table area */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-200">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading settlements…
          </div>
        ) : totalCurrent === 0 ? (
          <div className="px-4 py-10 text-center text-xs text-slate-400">
            <p>No pending {activeTab === "gyms" ? "gym" : "event"} settlements.</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Once new bookings start coming in, you&apos;ll see payouts appear
              here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              {activeTab === "gyms" ? (
                <GymSettlementsTable
                  rows={paginatedRows}
                  onMarkPaid={handleMarkPaid}
                  markingKey={markingKey}
                />
              ) : (
                <EventSettlementsTable
                  rows={paginatedRows}
                  onMarkPaid={handleMarkPaid}
                  markingKey={markingKey}
                />
              )}
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-[11px] text-slate-400">
              <span>
                Page{" "}
                <span className="font-semibold text-slate-100">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-100">
                  {totalPages}
                </span>
              </span>
              <div className="inline-flex items-center gap-2">
                <button
                  onClick={() => handlePageChange("prev")}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${
                    currentPage === 1
                      ? "cursor-not-allowed opacity-40"
                      : "hover:bg-white/5"
                  }`}
                  style={{ borderColor: THEME.borderSoft }}
                >
                  <ChevronLeft className="h-3 w-3" />
                  Prev
                </button>
                <button
                  onClick={() => handlePageChange("next")}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${
                    currentPage === totalPages
                      ? "cursor-not-allowed opacity-40"
                      : "hover:bg-white/5"
                  }`}
                  style={{ borderColor: THEME.borderSoft }}
                >
                  Next
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ==========================================
   TABLE: GYM SETTLEMENTS
========================================== */

const GymSettlementsTable = ({ rows, onMarkPaid, markingKey }) => {
  return (
    <table className="w-full text-xs">
      <thead className="bg-black/40 text-slate-300">
        <tr>
          <th className="px-4 py-2 text-left font-medium">Gym</th>
          <th className="px-4 py-2 text-left font-medium">Location</th>
          <th className="px-4 py-2 text-right font-medium">Bookings</th>
          <th className="px-4 py-2 text-right font-medium">Gross sales</th>
          <th className="px-4 py-2 text-right font-medium">Platform fee</th>
          <th className="px-4 py-2 text-right font-medium">Razorpay fee</th>
          <th className="px-4 py-2 text-right font-medium">Net payable</th>
          <th className="px-4 py-2 text-right font-medium">Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((g) => {
          const key = `gym-${g.gymId}`;
          return (
            <tr
              key={g.gymId}
              className="border-t border-white/5 bg-black/15 hover:bg-white/5"
            >
              <td className="px-4 py-2">
                <div className="text-slate-100">{g.gymName}</div>
                {g.ownerId && (
                  <div className="text-[11px] text-slate-500">
                    Owner ID: {String(g.ownerId).slice(-6)}
                  </div>
                )}
              </td>
              <td className="px-4 py-2 text-slate-200">{g.city || "—"}</td>
              <td className="px-4 py-2 text-right text-slate-100">
                {numberWithCommas(g.totalBookings)}
              </td>
              <td className="px-4 py-2 text-right text-slate-100">
                {formatINR(g.grossAmount)}
              </td>
              <td className="px-4 py-2 text-right text-slate-300">
                {formatINR(g.platformFee)}
              </td>
              <td className="px-4 py-2 text-right text-slate-300">
                {formatINR(g.razorpayFee)}
              </td>
              <td className="px-4 py-2 text-right font-semibold text-emerald-300">
                {formatINR(g.netPayable)}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() =>
                    onMarkPaid("gym", g.gymId, g.gymName, g.netPayable)
                  }
                  disabled={markingKey === key}
                  className={`inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
                    markingKey === key
                      ? "bg-emerald-500/20 text-emerald-200 cursor-wait"
                      : "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                  }`}
                >
                  {markingKey === key ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Marking…
                    </>
                  ) : (
                    "Mark as paid"
                  )}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

/* ==========================================
   TABLE: EVENT SETTLEMENTS
========================================== */

const EventSettlementsTable = ({ rows, onMarkPaid, markingKey }) => {
  return (
    <table className="w-full text-xs">
      <thead className="bg-black/40 text-slate-300">
        <tr>
          <th className="px-4 py-2 text-left font-medium">Event</th>
          <th className="px-4 py-2 text-left font-medium">Organiser</th>
          <th className="px-4 py-2 text-left font-medium">Location</th>
          <th className="px-4 py-2 text-right font-medium">Bookings</th>
          <th className="px-4 py-2 text-right font-medium">Tickets sold</th>
          <th className="px-4 py-2 text-right font-medium">Gross sales</th>
          <th className="px-4 py-2 text-right font-medium">Platform fee</th>
          <th className="px-4 py-2 text-right font-medium">Razorpay fee</th>
          <th className="px-4 py-2 text-right font-medium">Net payable</th>
          <th className="px-4 py-2 text-right font-medium">Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((e) => {
          const key = `event-${e.eventId}`;
          return (
            <tr
              key={e.eventId}
              className="border-t border-white/5 bg-black/15 hover:bg-white/5"
            >
              <td className="px-4 py-2">
                <div className="text-slate-100">{e.eventName}</div>
                {e.eventDate && (
                  <div className="text-[11px] text-slate-500">
                    {new Date(e.eventDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                )}
              </td>
              <td className="px-4 py-2 text-slate-200">
                {e.organizer || "—"}
              </td>
              <td className="px-4 py-2 text-slate-200">
                {e.location || "—"}
              </td>
              <td className="px-4 py-2 text-right text-slate-100">
                {numberWithCommas(e.totalBookings)}
              </td>
              <td className="px-4 py-2 text-right text-slate-100">
                {numberWithCommas(e.ticketsSold)}
              </td>
              <td className="px-4 py-2 text-right text-slate-100">
                {formatINR(e.grossAmount)}
              </td>
              <td className="px-4 py-2 text-right text-slate-300">
                {formatINR(e.platformFee)}
              </td>
              <td className="px-4 py-2 text-right text-slate-300">
                {formatINR(e.razorpayFee)}
              </td>
              <td className="px-4 py-2 text-right font-semibold text-emerald-300">
                {formatINR(e.netPayable)}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() =>
                    onMarkPaid("event", e.eventId, e.eventName, e.netPayable)
                  }
                  disabled={markingKey === key}
                  className={`inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
                    markingKey === key
                      ? "bg-emerald-500/20 text-emerald-200 cursor-wait"
                      : "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                  }`}
                >
                  {markingKey === key ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Marking…
                    </>
                  ) : (
                    "Mark as paid"
                  )}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default AdminSettlements;
