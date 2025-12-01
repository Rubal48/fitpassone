// src/pages/AdminDashboard.jsx
// ----------------------------------------------
// PASSIIFY ADMIN DASHBOARD
// ----------------------------------------------

import React, { useEffect, useMemo, useState } from "react";
import API from "../utils/api";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  ShieldCheck,
  IndianRupee,
  Dumbbell,
  CalendarDays,
  MapPin,
  BarChart as BarIcon,
  PieChart as PieIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Ticket,
  Star,
  WalletCards,
  AlertTriangle,
  Banknote,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

/* =========================================================
   PASSIIFY PREMIUM THEME (aligned with blue / orange brand)
========================================================= */
const THEME = {
  // Dark admin surface but on-brand
  bg: "#020617", // slate-950
  bgSoft: "rgba(15,23,42,0.98)", // slate-900
  card: "rgba(15,23,42,0.98)",
  border: "rgba(148,163,184,0.45)",

  // Brand accents (same system as main app)
  accent: "#2563EB", // main blue
  accentMid: "#0EA5E9", // sky
  accent2: "#F97316", // orange

  textSoft: "rgba(226,232,240,0.9)",
  textDim: "rgba(148,163,184,0.9)",
};

const COLORS = [
  "#2563EB",
  "#0EA5E9",
  "#F97316",
  "#22c55e",
  "#eab308",
];

const GYMS_PER_PAGE = 6;
const EVENTS_PER_PAGE = 6;
const GYM_SETTLEMENTS_PER_PAGE = 12;
const EVENT_SETTLEMENTS_PER_PAGE = 12;

/* =========================================================
   Helpers
========================================================= */

// Use the same base URL as your axios instance, then strip "/api"
const RAW_BASE =
  (API.defaults && API.defaults.baseURL) || "http://localhost:5000/api";
const MEDIA_BASE = RAW_BASE.replace(/\/api\/?$/, "");

const toMediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${MEDIA_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

const prettyStatus = (status) =>
  (status || "pending").charAt(0).toUpperCase() +
  (status || "pending").slice(1);

const statusChipClass = (status) => {
  const s = status || "pending";
  if (s === "approved")
    return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
  if (s === "rejected") return "bg-red-500/15 text-red-300 border-red-400/30";
  return "bg-amber-500/15 text-amber-300 border-amber-400/30";
};

const getLowestPassPrice = (passes = []) => {
  if (!passes.length) return null;
  return passes.reduce(
    (acc, p) => (p.price < acc ? p.price : acc),
    passes[0].price
  );
};

// 💰 Formatting helpers
const formatINR = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "₹0";
  return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

const numberWithCommas = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-IN");
};

// 🗓️ Event date helper (supports multiple backend fields)
const getEventStartDate = (event) => {
  const raw =
    event?.startTime ||
    event?.startDate ||
    event?.date ||
    event?.start_at ||
    event?.eventDate ||
    null;

  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
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

/* =========================================================
   Pagination
========================================================= */
const Pagination = ({
  page,
  totalPages,
  onPageChange,
  label,
  totalItems,
  perPage,
}) => {
  if (totalPages <= 1) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(totalItems, page * perPage);

  return (
    <div
      className="flex items-center justify-between mt-5 text-[11px]"
      style={{ color: THEME.textDim }}
    >
      <span>
        Showing <span className="font-semibold text-white">{start}</span>–
        <span className="font-semibold text-white">{end}</span> of{" "}
        <span className="font-semibold text-white">{totalItems}</span> {label}
      </span>

      <div className="inline-flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`px-2 py-1 rounded-full border flex items-center gap-1 text-[11px] ${
            page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10"
          }`}
          style={{ borderColor: THEME.border }}
        >
          <ChevronLeft size={12} /> Prev
        </button>

        <span className="px-3 text-[11px]" style={{ color: THEME.textSoft }}>
          Page <span className="font-semibold text-white">{page}</span> /{" "}
          {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`px-2 py-1 rounded-full border flex items-center gap-1 text-[11px] ${
            page === totalPages
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-white/10"
          }`}
          style={{ borderColor: THEME.border }}
        >
          Next <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   Stat Card
========================================================= */
const StatCard = ({ label, value, sub, icon: Icon, tint = "white" }) => (
  <div
    className="rounded-2xl p-4 border shadow-[0_18px_60px_rgba(0,0,0,0.9)]"
    style={{ background: THEME.bgSoft, borderColor: THEME.border }}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: THEME.textDim }}>
        {label}
      </span>
      <Icon className="w-4 h-4" style={{ color: tint }} />
    </div>
    <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    {sub && (
      <p className="mt-1 text-[11px]" style={{ color: THEME.textDim }}>
        {sub}
      </p>
    )}
  </div>
);

/* =========================================================
   Insight Card
========================================================= */
const InsightCard = ({ icon: Icon, title, text }) => (
  <div
    className="rounded-2xl p-4 border"
    style={{ background: THEME.bgSoft, borderColor: THEME.border }}
  >
    <div className="flex items-center gap-2 text-sm font-semibold text-white">
      <Icon size={16} style={{ color: THEME.accent }} />
      {title}
    </div>
    <p className="text-xs mt-2" style={{ color: THEME.textDim }}>
      {text}
    </p>
  </div>
);

/* =========================================================
   Mini Components
========================================================= */
const TabBtn = ({ active, onClick, icon: Icon, label, activeBg }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border"
    style={{
      background: active ? activeBg : "rgba(0,0,0,0.35)",
      color: active ? "#050308" : "white",
      borderColor: THEME.border,
      boxShadow: active ? "0 14px 40px rgba(0,0,0,1)" : "none",
    }}
  >
    <Icon size={16} />
    {label}
  </button>
);

const MiniKpi = ({ icon: Icon, label, value }) => (
  <div
    className="rounded-lg border px-2 py-1"
    style={{ background: "rgba(0,0,0,0.35)", borderColor: THEME.border }}
  >
    <div
      className="text-[10px] flex items-center gap-1"
      style={{ color: THEME.textDim }}
    >
      <Icon size={10} /> {label}
    </div>
    <div className="text-[11px] font-semibold text-white">{value}</div>
  </div>
);

/* =========================================================
   Settlements Tables
========================================================= */

const GymSettlementsTable = ({ gyms }) => {
  if (!gyms?.length) {
    return (
      <p className="text-xs" style={{ color: THEME.textSoft }}>
        No pending payouts for gyms.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto text-xs">
      <table className="w-full min-w-[720px]">
        <thead className="bg-black/40 text-[11px]">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Gym</th>
            <th className="px-3 py-2 text-left font-medium">City</th>
            <th className="px-3 py-2 text-right font-medium">Bookings</th>
            <th className="px-3 py-2 text-right font-medium">Gross sales</th>
            <th className="px-3 py-2 text-right font-medium">
              Your commission
            </th>
            <th className="px-3 py-2 text-right font-medium">
              Razorpay fee (est.)
            </th>
            <th className="px-3 py-2 text-right font-medium">
              Net payable (gym)
            </th>
          </tr>
        </thead>
        <tbody>
          {gyms.map((g) => {
            // 👇 support new API fields, fallback to old ones if any
            const gross = g.grossAmount || g.grossSales || 0;
            const platformFee = g.platformFee || 0;
            const razorpayFee = g.razorpayFee || 0;
            const net = g.netPayable || 0;
            const bookingCount = g.totalBookings || g.bookingCount || 0;

            return (
              <tr
                key={g.gymId}
                className="border-t border-white/5 hover:bg-white/5"
              >
                <td className="px-3 py-2 text-[11px]">
                  <div className="font-semibold text-white">{g.gymName}</div>
                  <div className="text-[10px]" style={{ color: THEME.textDim }}>
                    Gym ID:{" "}
                    <span className="font-mono">
                      {g.gymId?.toString().slice(-6)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-[11px]">{g.city || "—"}</td>
                <td className="px-3 py-2 text-right text-[11px]">
                  {numberWithCommas(bookingCount)}
                </td>
                <td className="px-3 py-2 text-right text-[11px]">
                  {formatINR(gross)}
                </td>
                <td className="px-3 py-2 text-right text-[11px] text-amber-300">
                  {formatINR(platformFee)}
                </td>
                <td className="px-3 py-2 text-right text-[11px] text-sky-300">
                  {formatINR(razorpayFee)}
                </td>
                <td className="px-3 py-2 text-right text-[11px] text-emerald-300 font-semibold">
                  {formatINR(net)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const EventSettlementsTable = ({ events }) => {
  if (!events?.length) {
    return (
      <p className="text-xs" style={{ color: THEME.textSoft }}>
        No pending payouts for events.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto text-xs">
      <table className="w-full min-w-[720px]">
        <thead className="bg-black/40 text-[11px]">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Event</th>
            <th className="px-3 py-2 text-left font-medium">Organizer</th>
            <th className="px-3 py-2 text-left font-medium">Location</th>
            <th className="px-3 py-2 text-right font-medium">Bookings</th>
            <th className="px-3 py-2 text-right font-medium">Tickets</th>
            <th className="px-3 py-2 text-right font-medium">Gross sales</th>
            <th className="px-3 py-2 text-right font-medium">
              Your commission
            </th>
            <th className="px-3 py-2 text-right font-medium">
              Razorpay fee (est.)
            </th>
            <th className="px-3 py-2 text-right font-medium">
              Net payable (host)
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => {
            const gross = e.grossAmount || e.grossSales || 0;
            const platformFee = e.platformFee || 0;
            const razorpayFee = e.razorpayFee || 0;
            const net = e.netPayable || 0;
            const bookingCount = e.totalBookings || e.bookingCount || 0;
            const tickets = e.ticketsSold || 0;
            const eventDateObj = getEventStartDate(e);

            return (
              <tr
                key={e.eventId}
                className="border-t border-white/5 hover:bg-white/5"
              >
                <td className="px-3 py-2 text-[11px]">
                  <div className="font-semibold text-white">
                    {e.eventName}
                  </div>
                  <div className="text-[10px]" style={{ color: THEME.textDim }}>
                    {eventDateObj
                      ? eventDateObj.toLocaleDateString()
                      : "Date TBA"}
                  </div>
                </td>
                <td className="px-3 py-2 text-[11px]">
                  {e.organizer || "—"}
                </td>
                <td className="px-3 py-2 text-[11px]">
                  {e.location || "—"}
                </td>
                <td className="px-3 py-2 text-right text-[11px]">
                  {numberWithCommas(bookingCount)}
                </td>
                <td className="px-3 py-2 text-right text-[11px]">
                  {numberWithCommas(tickets)}
                </td>
                <td className="px-3 py-2 text-right text-[11px]">
                  {formatINR(gross)}
                </td>
                <td className="px-3 py-2 text-right text-[11px] text-amber-300">
                  {formatINR(platformFee)}
                </td>
                <td className="px-3 py-2 text-right text-[11px] text-sky-300">
                  {formatINR(razorpayFee)}
                </td>
                <td className="px-3 py-2 text-right text-[11px] text-emerald-300 font-semibold">
                  {formatINR(net)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* =========================================================
   Admin Dashboard
========================================================= */
const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("gyms");

  // Gyms
  const [gyms, setGyms] = useState([]);
  const [loadingGyms, setLoadingGyms] = useState(true);
  const [gymSearch, setGymSearch] = useState("");
  const [gymFilter, setGymFilter] = useState("all");
  const [gymPage, setGymPage] = useState(1);

  // Events
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState("all");
  const [eventPage, setEventPage] = useState(1);

  // Analytics (events)
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Settlements
  const [settlements, setSettlements] = useState({
    gyms: [],
    events: [],
  });
  const [loadingSettlements, setLoadingSettlements] = useState(false);
  const [settlementsError, setSettlementsError] = useState("");
  const [settlementView, setSettlementView] = useState("gyms"); // "gyms" | "events"

  // Settlements filters / pagination
  const [settlementSearch, setSettlementSearch] = useState("");
  const [settlementMinAmount, setSettlementMinAmount] = useState("");
  const [settlementSort, setSettlementSort] = useState("netDesc"); // netDesc | netAsc | nameAsc | nameDesc
  const [gymSettlementPage, setGymSettlementPage] = useState(1);
  const [eventSettlementPage, setEventSettlementPage] = useState(1);

  /* =====================================
        FETCH DATA
  ===================================== */
  const fetchGyms = async () => {
    setLoadingGyms(true);
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;
      const { data } = await API.get("/admin/gyms", config);
      setGyms(data || []);
    } catch (e) {
      console.error("Error fetching gyms:", e);
      if (e?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    }
    setLoadingGyms(false);
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;
      const { data } = await API.get("/admin/events", config);
      setEvents(data || []);
    } catch (e) {
      console.error("Error fetching events:", e);
      if (e?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    }
    setLoadingEvents(false);
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;
      const { data } = await API.get(
        "/admin/events/analytics/summary",
        config
      );
      setAnalytics(data || {});
    } catch (e) {
      console.error("Error fetching analytics:", e);
      if (e?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    }
    setLoadingAnalytics(false);
  };

  const fetchSettlements = async () => {
    setLoadingSettlements(true);
    setSettlementsError("");
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;
      const { data } = await API.get("/admin/settlements/overview", config);
      // New API: { summary, gyms, events }
      setSettlements({
        gyms: data?.gyms || [],
        events: data?.events || [],
      });
    } catch (e) {
      console.error("Error fetching settlements:", e);
      if (e?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        setSettlementsError(
          e?.response?.data?.message || "Failed to load settlements overview"
        );
      }
    }
    setLoadingSettlements(false);
  };

  /* =====================================
        INITIAL LOAD
  ===================================== */
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchGyms();
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "analytics") fetchAnalytics();
    if (activeTab === "settlements") fetchSettlements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  /* =====================================
        ACTIONS
  ===================================== */
  const handleGymVerification = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this gym?`)) return;

    try {
      const config = getAdminConfig(navigate);
      if (!config) return;
      await API.put(
        `/admin/gyms/${id}/verify`,
        {
          status,
          verified: status === "approved",
        },
        config
      );

      setGyms((prev) =>
        prev.map((g) =>
          g._id === id ? { ...g, status, verified: status === "approved" } : g
        )
      );
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        alert("Failed to update gym status");
      }
    }
  };

  const handleDeleteGym = async (id) => {
    if (!window.confirm("Delete this gym permanently?")) return;
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;
      await API.delete(`/admin/gyms/${id}`, config);
      setGyms((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        alert("Failed to delete gym");
      }
    }
  };

  const handleEventVerify = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this event?`))
      return;
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;
      const res = await API.put(
        `/admin/events/${id}/verify`,
        { status },
        config
      );
      const updated = res.data?.event || res.data;
      setEvents((prev) => prev.map((ev) => (ev._id === id ? updated : ev)));
      if (activeTab === "analytics") fetchAnalytics();
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        alert("Failed to update event status");
      }
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Delete this event permanently?")) return;
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;
      await API.delete(`/admin/events/${id}`, config);
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
      if (activeTab === "analytics") fetchAnalytics();
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        alert("Failed to delete event");
      }
    }
  };

  /* =====================================
        FILTERS + PAGINATION (GYMS/EVENTS)
  ===================================== */
  const filteredGyms = useMemo(() => {
    return gyms
      .filter((g) =>
        gymFilter === "all" ? true : (g.status || "pending") === gymFilter
      )
      .filter((g) => {
        if (!gymSearch.trim()) return true;
        const q = gymSearch.toLowerCase();
        return (
          g.name?.toLowerCase().includes(q) ||
          g.city?.toLowerCase().includes(q) ||
          g.businessType?.toLowerCase().includes(q)
        );
      });
  }, [gyms, gymFilter, gymSearch]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) =>
        eventStatusFilter === "all"
          ? true
          : (ev.status || "pending") === eventStatusFilter
      )
      .filter((ev) => {
        if (!eventSearch.trim()) return true;
        const q = eventSearch.toLowerCase();
        return (
          ev.name?.toLowerCase().includes(q) ||
          ev.location?.toLowerCase().includes(q) ||
          ev.category?.toLowerCase().includes(q)
        );
      });
  }, [events, eventStatusFilter, eventSearch]);

  const totalGymPages = Math.max(
    1,
    Math.ceil(filteredGyms.length / GYMS_PER_PAGE)
  );
  const totalEventPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / EVENTS_PER_PAGE)
  );

  const paginatedGyms = filteredGyms.slice(
    (gymPage - 1) * GYMS_PER_PAGE,
    gymPage * GYMS_PER_PAGE
  );

  const paginatedEvents = filteredEvents.slice(
    (eventPage - 1) * EVENTS_PER_PAGE,
    eventPage * EVENTS_PER_PAGE
  );

  useEffect(() => setGymPage(1), [gymSearch, gymFilter]);
  useEffect(() => setEventPage(1), [eventSearch, eventStatusFilter]);

  const globalLoading =
    loadingGyms ||
    loadingEvents ||
    (activeTab === "analytics" && loadingAnalytics) ||
    (activeTab === "settlements" && loadingSettlements);

  /* =====================================
        SETTLEMENTS DERIVED STATS
  ===================================== */
  const gymSettlements = settlements.gyms || [];
  const eventSettlements = settlements.events || [];

  const settlementSummary = useMemo(() => {
    let totalGross = 0;
    let totalPlatformFee = 0;
    let totalRazorpayFee = 0;
    let totalNetPayable = 0;
    let gymNet = 0;
    let eventNet = 0;

    gymSettlements.forEach((g) => {
      const gross = g.grossAmount || g.grossSales || 0;
      const pf = g.platformFee || 0;
      const rf = g.razorpayFee || 0;
      const net = g.netPayable || 0;

      totalGross += gross;
      totalPlatformFee += pf;
      totalRazorpayFee += rf;
      totalNetPayable += net;
      gymNet += net;
    });

    eventSettlements.forEach((e) => {
      const gross = e.grossAmount || e.grossSales || 0;
      const pf = e.platformFee || 0;
      const rf = e.razorpayFee || 0;
      const net = e.netPayable || 0;

      totalGross += gross;
      totalPlatformFee += pf;
      totalRazorpayFee += rf;
      totalNetPayable += net;
      eventNet += net;
    });

    return {
      totalGross,
      totalPlatformFee,
      totalRazorpayFee,
      totalNetPayable,
      gymNet,
      eventNet,
      combinedNet: totalNetPayable,
    };
  }, [gymSettlements, eventSettlements]);

  const totalPartners =
    (gymSettlements?.length || 0) + (eventSettlements?.length || 0);

  const effectiveTakeRate = useMemo(() => {
    if (!settlementSummary.totalGross) return 0;
    const fees =
      settlementSummary.totalPlatformFee +
      settlementSummary.totalRazorpayFee;
    return Math.round((fees / settlementSummary.totalGross) * 100);
  }, [settlementSummary]);

  // 🧠 Big list helper (filter + sort) for settlements
  const filterAndSortSettlements = (items, mode) => {
    let list = [...(items || [])];

    const q = settlementSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((row) => {
        const name =
          mode === "gym"
            ? row.gymName?.toLowerCase() || ""
            : row.eventName?.toLowerCase() || "";
        const place =
          (row.city || row.location || "").toString().toLowerCase();
        const organiser =
          mode === "event" ? row.organizer?.toLowerCase() || "" : "";
        return (
          name.includes(q) || place.includes(q) || organiser.includes(q)
        );
      });
    }

    const minAmt = parseInt(settlementMinAmount, 10);
    if (!Number.isNaN(minAmt)) {
      list = list.filter((row) => (row.netPayable || 0) >= minAmt);
    }

    list.sort((a, b) => {
      const netA = a.netPayable || 0;
      const netB = b.netPayable || 0;
      if (settlementSort === "netDesc") return netB - netA;
      if (settlementSort === "netAsc") return netA - netB;

      const nameA =
        mode === "gym"
          ? (a.gymName || "").toLowerCase()
          : (a.eventName || "").toLowerCase();
      const nameB =
        mode === "gym"
          ? (b.gymName || "").toLowerCase()
          : (b.eventName || "").toLowerCase();

      if (settlementSort === "nameAsc") return nameA.localeCompare(nameB);
      if (settlementSort === "nameDesc") return nameB.localeCompare(nameA);
      return 0;
    });

    return list;
  };

  const gymSettlementFiltered = useMemo(
    () => filterAndSortSettlements(gymSettlements, "gym"),
    [
      gymSettlements,
      settlementSearch,
      settlementMinAmount,
      settlementSort,
    ]
  );

  const eventSettlementFiltered = useMemo(
    () => filterAndSortSettlements(eventSettlements, "event"),
    [
      eventSettlements,
      settlementSearch,
      settlementMinAmount,
      settlementSort,
    ]
  );

  const gymSettlementTotalPages = Math.max(
    1,
    Math.ceil(gymSettlementFiltered.length / GYM_SETTLEMENTS_PER_PAGE)
  );
  const eventSettlementTotalPages = Math.max(
    1,
    Math.ceil(eventSettlementFiltered.length / EVENT_SETTLEMENTS_PER_PAGE)
  );

  const gymSettlementPaginated = gymSettlementFiltered.slice(
    (gymSettlementPage - 1) * GYM_SETTLEMENTS_PER_PAGE,
    gymSettlementPage * GYM_SETTLEMENTS_PER_PAGE
  );

  const eventSettlementPaginated = eventSettlementFiltered.slice(
    (eventSettlementPage - 1) * EVENT_SETTLEMENTS_PER_PAGE,
    eventSettlementPage * EVENT_SETTLEMENTS_PER_PAGE
  );

  useEffect(() => {
    setGymSettlementPage(1);
    setEventSettlementPage(1);
  }, [settlementSearch, settlementMinAmount, settlementSort, settlementView]);

  /* =====================================
        UI
  ===================================== */
  return (
    <div
      className="min-h-screen text-white py-8 px-4"
      style={{
        background: `radial-gradient(circle at top, rgba(37,99,235,0.22), transparent 55%), radial-gradient(circle at bottom, rgba(249,115,22,0.18), transparent 60%), ${THEME.bg}`,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Passiify Admin Control Center
            </h1>
            <p className="text-sm mt-1" style={{ color: THEME.textSoft }}>
              Moderate gyms &amp; events and track platform health in real-time.
            </p>
          </div>

          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 border"
            style={{ background: THEME.bgSoft, borderColor: THEME.border }}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs" style={{ color: THEME.textSoft }}>
              Logged in as <span className="font-semibold text-white">Admin</span>
            </span>
          </div>
        </header>

        {/* TOP STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <StatCard
            label="Total Gyms"
            value={gyms.length}
            sub={`${gyms.filter((g) => g.status === "approved").length} approved · ${
              gyms.filter((g) => (g.status || "pending") === "pending").length
            } pending`}
            icon={Dumbbell}
            tint="#38bdf8"
          />

          <StatCard
            label="Total Events"
            value={events.length}
            sub={`${events.filter((e) => e.status === "approved").length} approved · ${
              events.filter((e) => (e.status || "pending") === "pending").length
            } pending`}
            icon={CalendarDays}
            tint="#f97316"
          />

          <StatCard
            label="Rejected Items"
            value={
              gyms.filter((g) => g.status === "rejected").length +
              events.filter((e) => e.status === "rejected").length
            }
            sub="Gyms + Events"
            icon={XCircle}
            tint="#ef4444"
          />

          <div
            className="rounded-2xl p-4 border"
            style={{
              background: `linear-gradient(90deg, ${THEME.accent}, ${THEME.accent2})`,
              color: "#050308",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase">
                Quick Focus
              </span>
              <PieIcon className="w-4 h-4" />
            </div>
            <p className="mt-2 text-sm font-semibold">
              {gyms.filter((g) => (g.status || "pending") === "pending").length +
                events.filter((e) => (e.status || "pending") === "pending").length}{" "}
              items need review.
            </p>
          </div>
        </section>

        {/* TABS */}
        <nav className="flex flex-wrap gap-2 mb-6">
          <TabBtn
            label="Gyms"
            active={activeTab === "gyms"}
            onClick={() => setActiveTab("gyms")}
            icon={Dumbbell}
            activeBg={THEME.accent}
          />
          <TabBtn
            label="Events"
            active={activeTab === "events"}
            onClick={() => setActiveTab("events")}
            icon={CalendarDays}
            activeBg={THEME.accent2}
          />
          <TabBtn
            label="Event Analytics"
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
            icon={BarIcon}
            activeBg={THEME.accentMid}
          />
          <TabBtn
            label="Settlements"
            active={activeTab === "settlements"}
            onClick={() => setActiveTab("settlements")}
            icon={WalletCards}
            activeBg="#22c55e"
          />
        </nav>

        {/* LOADING */}
        {globalLoading && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2
              className="w-10 h-10 animate-spin"
              style={{ color: THEME.accent }}
            />
          </div>
        )}

        {/* CONTENT */}
        {!globalLoading && (
          <>
            {/* GYMS TAB */}
            {activeTab === "gyms" && (
              <section className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 gap-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Dumbbell size={20} style={{ color: THEME.accent }} />
                    Gym Verification Queue
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {["all", "pending", "approved", "rejected"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setGymFilter(s)}
                        className="px-3 py-1 rounded-full text-xs font-semibold border"
                        style={{
                          background:
                            gymFilter === s ? THEME.accent : "rgba(0,0,0,0.35)",
                          color: gymFilter === s ? "#050308" : "white",
                          borderColor: THEME.border,
                        }}
                      >
                        {prettyStatus(s)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div
                  className="flex items-center px-3 py-2 rounded-2xl border max-w-md mb-4"
                  style={{
                    background: "rgba(0,0,0,0.45)",
                    borderColor: THEME.border,
                  }}
                >
                  <Search
                    className="w-4 h-4"
                    style={{ color: THEME.textDim }}
                  />
                  <input
                    value={gymSearch}
                    onChange={(e) => setGymSearch(e.target.value)}
                    placeholder="Search gyms..."
                    className="bg-transparent text-sm outline-none ml-2 text-white w-full"
                  />
                </div>

                {paginatedGyms.length === 0 ? (
                  <p style={{ color: THEME.textSoft }}>No gyms found.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {paginatedGyms.map((gym) => {
                        const price = getLowestPassPrice(gym.passes);
                        return (
                          <div
                            key={gym._id}
                            className="rounded-2xl overflow-hidden border shadow-[0_16px_60px_rgba(0,0,0,0.9)]"
                            style={{
                              background: THEME.card,
                              borderColor: THEME.border,
                            }}
                          >
                            <Link to={`/admin/gym/${gym._id}`}>
                              {gym.images?.[0] ? (
                                <img
                                  src={toMediaUrl(gym.images[0])}
                                  alt={gym.name || "Gym cover"}
                                  className="w-full h-40 object-cover"
                                />
                              ) : (
                                <div className="w-full h-40 flex items-center justify-center text-xs text-white/60">
                                  No Image
                                </div>
                              )}
                            </Link>

                            <div className="p-4 flex flex-col gap-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-sm font-semibold">
                                    {gym.name}{" "}
                                    {gym.verified && (
                                      <ShieldCheck
                                        size={14}
                                        className="text-emerald-400 inline"
                                      />
                                    )}
                                  </h3>
                                  <p
                                    className="text-xs flex items-center gap-1"
                                    style={{ color: THEME.textDim }}
                                  >
                                    <MapPin size={12} /> {gym.city}
                                  </p>
                                </div>

                                <span
                                  className={`px-3 py-1 rounded-full text-[10px] font-semibold border ${statusChipClass(
                                    gym.status
                                  )}`}
                                >
                                  {prettyStatus(gym.status)}
                                </span>
                              </div>

                              <div
                                className="flex justify-between text-xs"
                                style={{ color: THEME.textSoft }}
                              >
                                <span className="inline-flex items-center gap-1">
                                  <IndianRupee size={12} />
                                  {price ? `From ₹${price}` : "Custom Passes"}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded-full border text-[10px]"
                                  style={{ borderColor: THEME.border }}
                                >
                                  {gym.businessType}
                                </span>
                              </div>

                              <p
                                className="text-xs line-clamp-2"
                                style={{ color: THEME.textDim }}
                              >
                                {gym.description || "No description."}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                <Link
                                  to={`/admin/gym/${gym._id}`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px]"
                                  style={{
                                    borderColor: THEME.border,
                                    color: THEME.textSoft,
                                  }}
                                >
                                  <Eye size={12} /> View
                                </Link>

                                {gym.status !== "approved" && (
                                  <button
                                    onClick={() =>
                                      handleGymVerification(gym._id, "approved")
                                    }
                                    className="px-2 py-1 rounded-md bg-emerald-500 text-[11px] text-black font-semibold"
                                  >
                                    Approve
                                  </button>
                                )}

                                {gym.status !== "rejected" && (
                                  <button
                                    onClick={() =>
                                      handleGymVerification(gym._id, "rejected")
                                    }
                                    className="px-2 py-1 rounded-md bg-amber-500 text-[11px] text-black font-semibold"
                                  >
                                    Reject
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteGym(gym._id)}
                                  className="px-2 py-1 rounded-md bg-red-500 text-[11px] font-semibold"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Pagination
                      page={gymPage}
                      totalPages={totalGymPages}
                      onPageChange={setGymPage}
                      label="gyms"
                      totalItems={filteredGyms.length}
                      perPage={GYMS_PER_PAGE}
                    />
                  </>
                )}
              </section>
            )}

            {/* EVENTS TAB */}
            {activeTab === "events" && (
              <section className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 gap-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <CalendarDays size={20} style={{ color: THEME.accent2 }} />
                    Event Moderation
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {["all", "pending", "approved", "rejected"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setEventStatusFilter(s)}
                      className="px-3 py-1 rounded-full text-xs font-semibold border"
                      style={{
                        background:
                          eventStatusFilter === s
                            ? THEME.accent2
                            : "rgba(0,0,0,0.35)",
                        color: eventStatusFilter === s ? "#050308" : "white",
                        borderColor: THEME.border,
                      }}
                    >
                      {prettyStatus(s)}
                    </button>
                  ))}
                </div>

                <div
                  className="flex items-center px-3 py-2 rounded-2xl border max-w-md mb-4"
                  style={{
                    background: "rgba(0,0,0,0.45)",
                    borderColor: THEME.border,
                  }}
                >
                  <Search
                    className="w-4 h-4"
                    style={{ color: THEME.textDim }}
                  />
                  <input
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Search events..."
                    className="bg-transparent text-sm outline-none ml-2 text-white w-full"
                  />
                </div>

                {paginatedEvents.length === 0 ? (
                  <p style={{ color: THEME.textSoft }}>No events found.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {paginatedEvents.map((ev) => {
                        const startDateObj = getEventStartDate(ev);
                        return (
                          <div
                            key={ev._id}
                            className="rounded-2xl overflow-hidden border shadow-[0_16px_60px_rgba(0,0,0,0.9)]"
                            style={{
                              background: THEME.card,
                              borderColor: THEME.border,
                            }}
                          >
                            <Link to={`/admin/event/${ev._id}`}>
                              <img
                                src={toMediaUrl(ev.image)}
                                alt={ev.name || "Event cover"}
                                className="w-full h-40 object-cover"
                              />
                            </Link>

                            <div className="p-4 flex flex-col gap-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-sm font-semibold text-white">
                                    {ev.name}
                                  </h3>
                                  <p
                                    className="text-xs flex items-center gap-1"
                                    style={{ color: THEME.textDim }}
                                  >
                                    <MapPin size={12} /> {ev.location}
                                  </p>
                                </div>

                                <span
                                  className={`px-3 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap ${statusChipClass(
                                    ev.status
                                  )}`}
                                >
                                  {prettyStatus(ev.status)}
                                </span>
                              </div>

                              <div
                                className="flex justify-between text-xs"
                                style={{ color: THEME.textSoft }}
                              >
                                <span className="inline-flex items-center gap-1">
                                  <CalendarDays size={12} />
                                  {startDateObj
                                    ? startDateObj.toLocaleDateString()
                                    : "Date TBA"}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded-full border text-[10px]"
                                  style={{ borderColor: THEME.border }}
                                >
                                  {ev.category}
                                </span>
                              </div>

                              <div className="flex justify-between text-xs">
                                <span style={{ color: THEME.textSoft }}>
                                  Organizer: {ev.organizer}
                                </span>
                                <span
                                  className="inline-flex items-center gap-1 font-semibold"
                                  style={{ color: THEME.accent2 }}
                                >
                                  <IndianRupee size={12} />
                                  {ev.price}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-[10px]">
                                <MiniKpi
                                  icon={Ticket}
                                  label="Sold"
                                  value={ev.ticketsSold || 0}
                                />
                                <MiniKpi
                                  icon={Users}
                                  label="Seats"
                                  value={ev.remainingSeats || 0}
                                />
                                <MiniKpi
                                  icon={IndianRupee}
                                  label="Revenue"
                                  value={`₹${Number(
                                    ev.totalRevenue || 0
                                  ).toLocaleString("en-IN")}`}
                                />
                              </div>

                              <div className="mt-2 flex flex-wrap gap-2">
                                <Link
                                  to={`/admin/event/${ev._id}`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px]"
                                  style={{
                                    borderColor: THEME.border,
                                    color: THEME.textSoft,
                                  }}
                                >
                                  <Eye size={12} /> View
                                </Link>

                                {ev.status !== "approved" && (
                                  <button
                                    onClick={() =>
                                      handleEventVerify(ev._id, "approved")
                                    }
                                    className="px-2 py-1 rounded-md bg-emerald-500 text-[11px] text-black font-semibold"
                                  >
                                    Approve
                                  </button>
                                )}

                                {ev.status !== "rejected" && (
                                  <button
                                    onClick={() =>
                                      handleEventVerify(ev._id, "rejected")
                                    }
                                    className="px-2 py-1 rounded-md bg-amber-500 text-[11px] text-black font-semibold"
                                  >
                                    Reject
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteEvent(ev._id)}
                                  className="px-2 py-1 rounded-md bg-red-500 text-[11px] font-semibold"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Pagination
                      page={eventPage}
                      totalPages={totalEventPages}
                      onPageChange={setEventPage}
                      label="events"
                      totalItems={filteredEvents.length}
                      perPage={EVENTS_PER_PAGE}
                    />
                  </>
                )}
              </section>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === "analytics" && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BarIcon size={20} className="text-indigo-400" />
                    Event Analytics Snapshot
                  </h2>

                  <button
                    onClick={fetchAnalytics}
                    className="px-4 py-2 text-xs rounded-full border"
                    style={{
                      borderColor: THEME.border,
                      background: "rgba(0,0,0,0.35)",
                    }}
                  >
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <StatCard
                    label="Total Events"
                    value={analytics?.totalEvents || 0}
                    icon={CalendarDays}
                    tint="#c084fc"
                  />
                  <StatCard
                    label="Approved"
                    value={analytics?.approvedEvents || 0}
                    icon={CheckCircle}
                    tint="#22c55e"
                  />
                  <StatCard
                    label="Pending"
                    value={analytics?.pendingEvents || 0}
                    icon={ShieldCheck}
                    tint="#f59e0b"
                  />
                  <StatCard
                    label="Rejected"
                    value={analytics?.rejectedEvents || 0}
                    icon={XCircle}
                    tint="#ef4444"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div
                    className="rounded-2xl p-4 border"
                    style={{
                      background: THEME.bgSoft,
                      borderColor: THEME.border,
                    }}
                  >
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <PieIcon size={16} style={{ color: THEME.accent }} />
                      Top Categories
                    </h3>

                    {analytics?.categoryStats?.length ? (
                      analytics.categoryStats.slice(0, 6).map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between mb-2"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                background: COLORS[i % COLORS.length],
                              }}
                            />
                            <span className="text-sm text-white">
                              {c._id}
                            </span>
                          </div>
                          <span className="text-xs text-white">
                            {c.count}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: THEME.textDim }}>No data.</p>
                    )}
                  </div>

                  <div
                    className="rounded-2xl p-4 border"
                    style={{
                      background: THEME.bgSoft,
                      borderColor: THEME.border,
                    }}
                  >
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <IndianRupee
                        size={16}
                        className="text-emerald-300"
                      />
                      Estimated Revenue
                    </h3>

                    <div
                      className="p-4 rounded-xl border mb-4"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        borderColor: THEME.border,
                      }}
                    >
                      <div
                        className="text-[11px]"
                        style={{ color: THEME.textDim }}
                      >
                        Sum of ticket revenues
                      </div>
                      <div className="text-2xl font-bold text-white mt-1">
                        ₹
                        {Number(
                          analytics?.estimatedRevenue || 0
                        ).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <InsightCard
                    icon={Star}
                    title="Quality Gate"
                    text="Maintain premium curation with strict approvals."
                  />
                  <InsightCard
                    icon={Ticket}
                    title="Ticket Flow"
                    text="Check event seats and sales in detail pages."
                  />
                  <InsightCard
                    icon={Users}
                    title="Community Growth"
                    text="Feature high-quality gyms & events."
                  />
                </div>
              </section>
            )}

            {/* SETTLEMENTS TAB */}
            {activeTab === "settlements" && (
              <section className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <WalletCards
                        size={20}
                        className="text-emerald-300"
                      />
                      Settlements & Payouts
                    </h2>
                    <p
                      className="text-xs mt-1"
                      style={{ color: THEME.textSoft }}
                    >
                      One clear view of how much you owe each gym and event
                      organiser after{" "}
                      <span className="font-semibold">Passiify fee</span> and{" "}
                      <span className="font-semibold">Razorpay charges</span>.
                    </p>
                  </div>

                  <button
                    onClick={fetchSettlements}
                    className="px-4 py-2 text-xs rounded-full border flex items-center gap-2"
                    style={{
                      borderColor: THEME.border,
                      background: "rgba(0,0,0,0.35)",
                    }}
                  >
                    <Loader2
                      className={`w-3 h-3 ${
                        loadingSettlements ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </div>

                {/* Error banner */}
                {settlementsError && (
                  <div
                    className="mb-4 rounded-xl border px-3 py-2 text-xs flex items-center gap-2"
                    style={{
                      background: "rgba(127,29,29,0.9)",
                      borderColor: "rgba(248,113,113,0.5)",
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 text-yellow-200" />
                    <span>{settlementsError}</span>
                  </div>
                )}

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    label="Total Gross Sales"
                    value={formatINR(settlementSummary.totalGross)}
                    sub="Gym passes + event tickets (pending payout)"
                    icon={IndianRupee}
                    tint="#22c55e"
                  />
                  <StatCard
                    label="Passiify Commission + Fees"
                    value={formatINR(
                      settlementSummary.totalPlatformFee +
                        settlementSummary.totalRazorpayFee
                    )}
                    sub={`Approx. ${effectiveTakeRate}% effective take rate`}
                    icon={Banknote}
                    tint="#f97316"
                  />
                  <StatCard
                    label="Net Payable to Partners"
                    value={formatINR(settlementSummary.totalNetPayable)}
                    sub={`Gyms: ${formatINR(
                      settlementSummary.gymNet || 0
                    )} · Events: ${formatINR(
                      settlementSummary.eventNet || 0
                    )}`}
                    icon={WalletCards}
                    tint="#4ade80"
                  />
                  <StatCard
                    label="Partners Awaiting Payout"
                    value={totalPartners}
                    sub={`Gyms: ${gymSettlements.length} · Events: ${eventSettlements.length}`}
                    icon={Users}
                    tint="#38bdf8"
                  />
                </div>

                {/* Internal tabs for Gyms / Events settlements */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setSettlementView("gyms")}
                    className="px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      background:
                        settlementView === "gyms"
                          ? "linear-gradient(90deg,#22c55e,#4ade80)"
                          : "rgba(0,0,0,0.35)",
                      color: settlementView === "gyms" ? "#020617" : "white",
                      borderColor: THEME.border,
                    }}
                  >
                    Gym settlements
                  </button>
                  <button
                    onClick={() => setSettlementView("events")}
                    className="px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      background:
                        settlementView === "events"
                          ? "linear-gradient(90deg,#f97316,#fb923c)"
                          : "rgba(0,0,0,0.35)",
                      color: settlementView === "events" ? "#020617" : "white",
                      borderColor: THEME.border,
                    }}
                  >
                    Event settlements
                  </button>
                </div>

                {/* Filters & search for large volumes */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                  <div
                    className="flex items-center px-3 py-2 rounded-2xl border max-w-md w-full"
                    style={{
                      background: "rgba(0,0,0,0.45)",
                      borderColor: THEME.border,
                    }}
                  >
                    <Search
                      className="w-4 h-4"
                      style={{ color: THEME.textDim }}
                    />
                    <input
                      value={settlementSearch}
                      onChange={(e) => setSettlementSearch(e.target.value)}
                      placeholder={
                        settlementView === "gyms"
                          ? "Search gym name or city..."
                          : "Search event or organiser..."
                      }
                      className="bg-transparent text-sm outline-none ml-2 text-white w-full"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-2xl border"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        borderColor: THEME.border,
                      }}
                    >
                      <span style={{ color: THEME.textDim }}>Min payout</span>
                      <span className="text-xs text-white">₹</span>
                      <input
                        type="number"
                        value={settlementMinAmount}
                        onChange={(e) =>
                          setSettlementMinAmount(e.target.value)
                        }
                        placeholder="0"
                        className="w-20 bg-transparent text-xs outline-none text-white"
                      />
                    </div>

                    <select
                      value={settlementSort}
                      onChange={(e) => setSettlementSort(e.target.value)}
                      className="px-3 py-2 rounded-2xl border bg-transparent text-xs outline-none"
                      style={{
                        borderColor: THEME.border,
                        color: THEME.textSoft,
                      }}
                    >
                      <option value="netDesc">Highest payout first</option>
                      <option value="netAsc">Lowest payout first</option>
                      <option value="nameAsc">Name A → Z</option>
                      <option value="nameDesc">Name Z → A</option>
                    </select>
                  </div>
                </div>

                {/* Tables */}
                <div
                  className="rounded-2xl border p-4 shadow-[0_18px_60px_rgba(0,0,0,0.9)]"
                  style={{
                    background:
                      "radial-gradient(circle at top left, rgba(34,197,94,0.15), transparent 55%), " +
                      THEME.card,
                    borderColor: THEME.border,
                  }}
                >
                  {settlementView === "gyms" ? (
                    <>
                      <GymSettlementsTable gyms={gymSettlementPaginated} />
                      <Pagination
                        page={gymSettlementPage}
                        totalPages={gymSettlementTotalPages}
                        onPageChange={setGymSettlementPage}
                        label="gym partners"
                        totalItems={gymSettlementFiltered.length}
                        perPage={GYM_SETTLEMENTS_PER_PAGE}
                      />
                    </>
                  ) : (
                    <>
                      <EventSettlementsTable
                        events={eventSettlementPaginated}
                      />
                      <Pagination
                        page={eventSettlementPage}
                        totalPages={eventSettlementTotalPages}
                        onPageChange={setEventSettlementPage}
                        label="event partners"
                        totalItems={eventSettlementFiltered.length}
                        perPage={EVENT_SETTLEMENTS_PER_PAGE}
                      />
                    </>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
