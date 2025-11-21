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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

/* =========================================================
   PASSIIFY PREMIUM THEME
========================================================= */
const THEME = {
  bg: "#050308",
  bgSoft: "#0A0812",
  card: "rgba(15,10,24,0.96)",
  border: "rgba(255,255,255,0.08)",
  accent: "#9b5cff",
  accent2: "#ff8a4c",
  textSoft: "rgba(255,255,255,0.72)",
  textDim: "rgba(255,255,255,0.55)",
};

const COLORS = ["#9b5cff", "#ff8a4c", "#22c55e", "#38bdf8", "#f59e0b"];

const GYMS_PER_PAGE = 6;
const EVENTS_PER_PAGE = 6;

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
  (status || "pending").charAt(0).toUpperCase() + (status || "pending").slice(1);

const statusChipClass = (status) => {
  const s = status || "pending";
  if (s === "approved")
    return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
  if (s === "rejected") return "bg-red-500/15 text-red-300 border-red-400/30";
  return "bg-amber-500/15 text-amber-300 border-amber-400/30";
};

const getLowestPassPrice = (passes = []) => {
  if (!passes.length) return null;
  return passes.reduce((acc, p) => (p.price < acc ? p.price : acc), passes[0].price);
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
const Pagination = ({ page, totalPages, onPageChange, label, totalItems, perPage }) => {
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
          Page <span className="font-semibold text-white">{page}</span> / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`px-2 py-1 rounded-full border flex items-center gap-1 text-[11px] ${
            page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10"
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

  // Analytics
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

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
      const { data } = await API.get("/admin/events/analytics/summary", config);
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
      await API.put(`/admin/gyms/${id}/verify`, {
        status,
        verified: status === "approved",
      }, config);

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
    if (!window.confirm(`Are you sure you want to ${status} this event?`)) return;
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;
      const res = await API.put(`/admin/events/${id}/verify`, { status }, config);
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
        FILTERS + PAGINATION
  ===================================== */
  const filteredGyms = useMemo(() => {
    return gyms
      .filter((g) => (gymFilter === "all" ? true : (g.status || "pending") === gymFilter))
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

  const totalGymPages = Math.max(1, Math.ceil(filteredGyms.length / GYMS_PER_PAGE));
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
    loadingGyms || loadingEvents || (activeTab === "analytics" && loadingAnalytics);

  /* =====================================
        UI
  ===================================== */
  return (
    <div
      className="min-h-screen text-white py-8 px-4"
      style={{ background: THEME.bg }}
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
            tint="#ff8a4c"
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
              <span className="text-xs font-semibold uppercase">Quick Focus</span>
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
            activeBg="#6366f1"
          />
        </nav>

        {/* LOADING */}
        {globalLoading && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: THEME.accent }} />
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
                  style={{ background: "rgba(0,0,0,0.45)", borderColor: THEME.border }}
                >
                  <Search className="w-4 h-4" style={{ color: THEME.textDim }} />
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
                            style={{ background: THEME.card, borderColor: THEME.border }}
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
                                  style={{ borderColor: THEME.border, color: THEME.textSoft }}
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
                  style={{ background: "rgba(0,0,0,0.45)", borderColor: THEME.border }}
                >
                  <Search className="w-4 h-4" style={{ color: THEME.textDim }} />
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
                      {paginatedEvents.map((ev) => (
                        <div
                          key={ev._id}
                          className="rounded-2xl overflow-hidden border shadow-[0_16px_60px_rgba(0,0,0,0.9)]"
                          style={{ background: THEME.card, borderColor: THEME.border }}
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
                                {new Date(ev.date).toLocaleDateString()}
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
                              <MiniKpi icon={Ticket} label="Sold" value={ev.ticketsSold || 0} />
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
                                style={{ borderColor: THEME.border, color: THEME.textSoft }}
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
                      ))}
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
                    style={{ borderColor: THEME.border, background: "rgba(0,0,0,0.35)" }}
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
                    style={{ background: THEME.bgSoft, borderColor: THEME.border }}
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
                              style={{ background: COLORS[i % COLORS.length] }}
                            />
                            <span className="text-sm text-white">{c._id}</span>
                          </div>
                          <span className="text-xs text-white">{c.count}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: THEME.textDim }}>No data.</p>
                    )}
                  </div>

                  <div
                    className="rounded-2xl p-4 border"
                    style={{ background: THEME.bgSoft, borderColor: THEME.border }}
                  >
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <IndianRupee size={16} className="text-emerald-300" />
                      Estimated Revenue
                    </h3>

                    <div
                      className="p-4 rounded-xl border mb-4"
                      style={{ background: "rgba(0,0,0,0.4)", borderColor: THEME.border }}
                    >
                      <div className="text-[11px]" style={{ color: THEME.textDim }}>
                        Sum of ticket revenues
                      </div>
                      <div className="text-2xl font-bold text-white mt-1">
                        ₹{Number(analytics?.estimatedRevenue || 0).toLocaleString("en-IN")}
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
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
