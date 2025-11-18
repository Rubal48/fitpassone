// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";

const COLORS = ["#2563eb", "#f97316", "#06b6d4", "#10b981", "#8b5cf6"];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("gyms"); // 'gyms' | 'events' | 'analytics'

  // Gyms
  const [gyms, setGyms] = useState([]);
  const [loadingGyms, setLoadingGyms] = useState(true);
  const [gymFilter, setGymFilter] = useState("all");
  const [gymSearch, setGymSearch] = useState("");
  const [gymPage, setGymPage] = useState(1);
  const GYMS_PER_PAGE = 6;

  // Events
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState("all");
  const [eventPage, setEventPage] = useState(1);
  const EVENTS_PER_PAGE = 6;

  // Analytics
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // ---------------------------
  // Fetch gyms
  // ---------------------------
  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const { data } = await API.get("/admin/gyms");
        setGyms(data || []);
      } catch (err) {
        console.error("Error fetching gyms:", err);
      } finally {
        setLoadingGyms(false);
      }
    };
    fetchGyms();
  }, []);

  // ---------------------------
  // Fetch events
  // ---------------------------
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await API.get("/admin/events");
        setEvents(data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // ---------------------------
  // Fetch analytics WHEN tab is opened
  // ---------------------------
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoadingAnalytics(true);
      try {
        const { data } = await API.get("/admin/events/analytics/summary");
        setAnalytics(data || {});
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab]);

  // ---------------------------
  // Gym verification
  // ---------------------------
  const handleGymVerification = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this gym?`)) return;
    try {
      await API.put(`/admin/gyms/${id}/verify`, {
        status,
        verified: status === "approved",
      });
      setGyms((prev) =>
        prev.map((g) =>
          g._id === id ? { ...g, status, verified: status === "approved" } : g
        )
      );
    } catch (err) {
      console.error("Error updating gym status:", err);
      alert("Failed to update gym status");
    }
  };

  const handleDeleteGym = async (id) => {
    if (!window.confirm("Delete this gym permanently?")) return;
    try {
      await API.delete(`/admin/gyms/${id}`);
      setGyms((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      console.error("Error deleting gym:", err);
      alert("Failed to delete gym");
    }
  };

  // ---------------------------
  // Event approve/reject/delete
  // ---------------------------
  const handleEventVerify = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this event?`)) return;
    try {
      const res = await API.put(`/admin/events/${id}/verify`, { status });
      const updated = res.data?.event || res.data;
      setEvents((prev) => prev.map((e) => (e._id === id ? updated : e)));
      if (activeTab === "analytics") refreshAnalytics();
    } catch (err) {
      console.error("Error updating event status:", err);
      alert("Failed to update event status");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Delete this event permanently?")) return;
    try {
      await API.delete(`/admin/events/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      if (activeTab === "analytics") refreshAnalytics();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event");
    }
  };

  // ---------------------------
  // Refresh analytics helper
  // ---------------------------
  const refreshAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const { data } = await API.get("/admin/events/analytics/summary");
      setAnalytics(data || {});
    } catch (err) {
      console.error("Error refreshing analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // ---------------------------
  // Derived stats (gyms & events)
  // ---------------------------
  const totalGyms = gyms.length;
  const approvedGyms = gyms.filter((g) => (g.status || "pending") === "approved")
    .length;
  const pendingGyms = gyms.filter((g) => (g.status || "pending") === "pending")
    .length;
  const rejectedGyms = gyms.filter((g) => g.status === "rejected").length;

  const totalEvents = events.length;
  const approvedEvents = events.filter(
    (e) => (e.status || "pending") === "approved"
  ).length;
  const pendingEvents = events.filter(
    (e) => (e.status || "pending") === "pending"
  ).length;
  const rejectedEvents = events.filter((e) => e.status === "rejected").length;

  // ---------------------------
  // Filters & search
  // ---------------------------
  const filteredGyms = useMemo(
    () =>
      gyms
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
        }),
    [gyms, gymFilter, gymSearch]
  );

  const filteredEvents = useMemo(
    () =>
      events
        .filter((e) =>
          eventStatusFilter === "all"
            ? true
            : (e.status || "pending") === eventStatusFilter
        )
        .filter((e) => {
          if (!eventSearch.trim()) return true;
          const q = eventSearch.toLowerCase();
          return (
            e.name?.toLowerCase().includes(q) ||
            e.location?.toLowerCase().includes(q) ||
            e.category?.toLowerCase().includes(q) ||
            e.organizer?.toLowerCase().includes(q)
          );
        }),
    [events, eventStatusFilter, eventSearch]
  );

  // ---------------------------
  // Pagination slices
  // ---------------------------
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

  // reset page when filters/search change
  useEffect(() => {
    setGymPage(1);
  }, [gymFilter, gymSearch]);

  useEffect(() => {
    setEventPage(1);
  }, [eventStatusFilter, eventSearch]);

  const topCategories = analytics?.categoryStats?.slice(0, 6) || [];

  // ---------------------------
  // "Needs review first" lists
  // ---------------------------
  const pendingGymsList = gyms
    .filter((g) => (g.status || "pending") === "pending")
    .slice(0, 3);
  const pendingEventsList = events
    .filter((e) => (e.status || "pending") === "pending")
    .slice(0, 3);

  // ---------------------------
  // Loading state
  // ---------------------------
  const globalLoading =
    loadingGyms ||
    loadingEvents ||
    (activeTab === "analytics" ? loadingAnalytics : false);

  // ---------------------------
  // Helpers
  // ---------------------------
  const statusChipClass = (status) => {
    const s = status || "pending";
    if (s === "approved")
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (s === "rejected") return "bg-red-50 text-red-700 border-red-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  const prettyStatus = (status) =>
    (status || "pending").charAt(0).toUpperCase() +
    (status || "pending").slice(1);

  const Pagination = ({ page, totalPages, onPageChange, label }) => {
    if (totalPages <= 1) return null;
    const start = (page - 1) * (label === "gyms" ? GYMS_PER_PAGE : EVENTS_PER_PAGE) + 1;
    const end = Math.min(
      label === "gyms" ? filteredGyms.length : filteredEvents.length,
      page * (label === "gyms" ? GYMS_PER_PAGE : EVENTS_PER_PAGE)
    );

    const totalItems =
      label === "gyms" ? filteredGyms.length : filteredEvents.length;

    return (
      <div className="flex items-center justify-between mt-5 text-[11px] text-slate-400">
        <span>
          Showing <span className="font-semibold text-slate-200">{start}</span>–
          <span className="font-semibold text-slate-200">{end}</span> of{" "}
          <span className="font-semibold text-slate-200">{totalItems}</span>{" "}
          {label}
        </span>
        <div className="inline-flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className={`px-2 py-1 rounded-full border border-slate-800 bg-slate-900/70 text-slate-200 flex items-center gap-1 text-[11px] ${
              page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-800"
            }`}
          >
            <ChevronLeft size={12} /> Prev
          </button>
          <span className="px-3 text-[11px] text-slate-300">
            Page <span className="font-semibold">{page}</span> / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className={`px-2 py-1 rounded-full border border-slate-800 bg-slate-900/70 text-slate-200 flex items-center gap-1 text-[11px] ${
              page === totalPages
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-slate-800"
            }`}
          >
            Next <ChevronRight size={12} />
          </button>
        </div>
      </div>
    );
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Admin Control Center
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Review gyms, moderate events, and track how Passiify is performing.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-4 py-2 border border-slate-800 shadow-[0_18px_60px_rgba(0,0,0,0.8)]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-200">
              Logged in as <span className="font-semibold">Super Admin</span>
            </span>
          </div>
        </header>

        {/* Top Summary Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Gyms</span>
              <Dumbbell className="w-4 h-4 text-sky-400" />
            </div>
            <p className="mt-2 text-2xl font-bold">{totalGyms}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {approvedGyms} approved · {pendingGyms} pending
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Events</span>
              <CalendarDays className="w-4 h-4 text-orange-400" />
            </div>
            <p className="mt-2 text-2xl font-bold">{totalEvents}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {approvedEvents} approved · {pendingEvents} pending
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Rejected Items</span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <p className="mt-2 text-2xl font-bold">
              {rejectedGyms + rejectedEvents}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {rejectedGyms} gyms · {rejectedEvents} events
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-sky-500 to-orange-400 text-slate-950 p-4 shadow-[0_18px_60px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <span className="text-xs/4 font-semibold tracking-wide uppercase">
                Quick Focus
              </span>
              <PieIcon className="w-4 h-4" />
            </div>
            <p className="mt-2 text-sm">
              {pendingGyms + pendingEvents} items need your decision.
            </p>
            <p className="mt-1 text-[11px] opacity-80">
              Use the "Needs Review" panel below to clear them fast.
            </p>
          </div>
        </section>

        {/* 🔥 Needs Review First */}
        {(pendingGymsList.length > 0 || pendingEventsList.length > 0) && (
          <section className="mb-8 rounded-2xl bg-slate-950/80 border border-slate-800 p-4 shadow-[0_20px_80px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  Needs Review First
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Quickly approve or reject the most recent pending gyms & events.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pending Gyms */}
              <div>
                <h3 className="text-xs font-semibold text-slate-300 mb-2">
                  Pending Gyms ({pendingGyms})
                </h3>
                {pendingGymsList.length === 0 ? (
                  <p className="text-[11px] text-slate-500">
                    No pending gyms. Nice!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingGymsList.map((g) => (
                      <div
                        key={g._id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-100 truncate">
                            {g.name}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                            <MapPin size={10} /> {g.city || "Unknown"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleGymVerification(g._id, "approved")
                            }
                            className="px-2 py-1 rounded-md bg-emerald-500 text-[10px] text-slate-950 hover:bg-emerald-400"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleGymVerification(g._id, "rejected")
                            }
                            className="px-2 py-1 rounded-md bg-amber-500 text-[10px] text-slate-950 hover:bg-amber-400"
                          >
                            Reject
                          </button>
                          <Link
                            to={`/admin/gym/${g._id}`}
                            className="px-2 py-1 rounded-md bg-slate-950 text-[10px] text-slate-100 border border-slate-700 hover:bg-slate-900"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Events */}
              <div>
                <h3 className="text-xs font-semibold text-slate-300 mb-2">
                  Pending Events ({pendingEvents})
                </h3>
                {pendingEventsList.length === 0 ? (
                  <p className="text-[11px] text-slate-500">
                    No pending events. All clear.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingEventsList.map((e) => (
                      <div
                        key={e._id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-100 truncate">
                            {e.name}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                            <MapPin size={10} /> {e.location || "Unknown"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleEventVerify(e._id, "approved")
                            }
                            className="px-2 py-1 rounded-md bg-emerald-500 text-[10px] text-slate-950 hover:bg-emerald-400"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleEventVerify(e._id, "rejected")
                            }
                            className="px-2 py-1 rounded-md bg-amber-500 text-[10px] text-slate-950 hover:bg-amber-400"
                          >
                            Reject
                          </button>
                          <Link
                            to={`/events/${e._id}`}
                            className="px-2 py-1 rounded-md bg-slate-950 text-[10px] text-slate-100 border border-slate-700 hover:bg-slate-900"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Tabs */}
        <nav className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab("gyms")}
            className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === "gyms"
                ? "bg-sky-500 text-slate-950 shadow-[0_14px_40px_rgba(15,23,42,1)]"
                : "bg-slate-900/70 text-slate-200 border border-slate-800 hover:bg-slate-800"
            }`}
          >
            <Dumbbell size={16} /> Gyms
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === "events"
                ? "bg-orange-400 text-slate-950 shadow-[0_14px_40px_rgba(15,23,42,1)]"
                : "bg-slate-900/70 text-slate-200 border border-slate-800 hover:bg-slate-800"
            }`}
          >
            <CalendarDays size={16} /> Events
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === "analytics"
                ? "bg-indigo-500 text-slate-50 shadow-[0_14px_40px_rgba(15,23,42,1)]"
                : "bg-slate-900/70 text-slate-200 border border-slate-800 hover:bg-slate-800"
            }`}
          >
            <BarIcon size={16} /> Event Analytics
          </button>
        </nav>

        {/* Global loading */}
        {globalLoading && (
          <div className="flex items-center justify-center min-h-[40vh] py-16">
            <Loader2 className="w-10 h-10 animate-spin text-sky-400" />
          </div>
        )}

        {/* Tabs content */}
        {!globalLoading && (
          <>
            {/* ===========================
                Gyms Tab
               =========================== */}
            {activeTab === "gyms" && (
              <section className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Dumbbell size={20} className="text-sky-400" />
                    Gym Verification Queue
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {["all", "pending", "approved", "rejected"].map((s) => {
                      const count = gyms.filter(
                        (g) => (g.status || "pending") === s
                      ).length;
                      return (
                        <button
                          key={s}
                          onClick={() => setGymFilter(s)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                            gymFilter === s
                              ? "bg-sky-500 text-slate-950 border-sky-400"
                              : "bg-slate-900/70 text-slate-200 border-slate-800 hover:bg-slate-800"
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)} · {count}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search bar */}
                <div className="mb-4">
                  <div className="flex items-center bg-slate-900/70 border border-slate-800 rounded-2xl px-3 py-2 gap-2 max-w-md">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={gymSearch}
                      onChange={(e) => setGymSearch(e.target.value)}
                      placeholder="Search gyms by name, city, or type..."
                      className="bg-transparent text-sm text-slate-100 outline-none w-full placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {paginatedGyms.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No gyms found for this filter / search.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {paginatedGyms.map((gym) => (
                        <div
                          key={gym._id}
                          className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-[0_16px_60px_rgba(0,0,0,0.9)] flex flex-col"
                        >
                          <Link to={`/admin/gym/${gym._id}`}>
                            {gym.images && gym.images.length > 0 ? (
                              <img
                                src={gym.images[0]}
                                alt={gym.name}
                                className="w-full h-40 object-cover"
                              />
                            ) : (
                              <div className="w-full h-40 bg-slate-900 flex items-center justify-center text-slate-600 text-xs">
                                No Image
                              </div>
                            )}
                          </Link>

                          <div className="p-4 flex flex-col gap-3 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                                  {gym.name}
                                  {gym.verified && (
                                    <ShieldCheck
                                      size={14}
                                      className="text-emerald-400"
                                    />
                                  )}
                                </h3>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                  <MapPin size={12} /> {gym.city || "Unknown"}
                                </p>
                              </div>

                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap ${statusChipClass(
                                  gym.status
                                )}`}
                              >
                                {prettyStatus(gym.status)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-300">
                              <span className="inline-flex items-center gap-1">
                                <IndianRupee
                                  size={12}
                                  className="text-sky-400"
                                />
                                {gym.price ? `₹${gym.price}` : "Custom passes"}
                              </span>
                              {gym.businessType && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] border border-slate-700">
                                  {gym.businessType}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-2">
                              {gym.description || "No description provided."}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-2">
                              <Link
                                to={`/admin/gym/${gym._id}`}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800"
                              >
                                <Eye size={12} /> View details
                              </Link>

                              {gym.status !== "approved" && (
                                <button
                                  onClick={() =>
                                    handleGymVerification(gym._id, "approved")
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500 text-slate-950 text-[11px] hover:bg-emerald-400"
                                >
                                  <CheckCircle size={12} /> Approve
                                </button>
                              )}
                              {gym.status !== "rejected" && (
                                <button
                                  onClick={() =>
                                    handleGymVerification(gym._id, "rejected")
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500 text-slate-950 text-[11px] hover:bg-amber-400"
                                >
                                  <XCircle size={12} /> Reject
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteGym(gym._id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-600 text-slate-50 text-[11px] hover:bg-red-500"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Pagination
                      page={gymPage}
                      totalPages={totalGymPages}
                      onPageChange={setGymPage}
                      label="gyms"
                    />
                  </>
                )}
              </section>
            )}

            {/* ===========================
                Events Tab
               =========================== */}
            {activeTab === "events" && (
              <section className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <CalendarDays size={20} className="text-orange-400" />
                      Event Moderation
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Approve or reject events before they go live to travellers
                      & locals.
                    </p>
                  </div>

                  <Link
                    to="/create-event"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-500 to-orange-400 text-slate-950 shadow-[0_14px_40px_rgba(0,0,0,1)]"
                  >
                    + Create New Event
                  </Link>
                </div>

                {/* Filters row */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="flex flex-wrap gap-2">
                    {["all", "pending", "approved", "rejected"].map((s) => {
                      const count = events.filter(
                        (e) => (e.status || "pending") === s
                      ).length;
                      return (
                        <button
                          key={s}
                          onClick={() => setEventStatusFilter(s)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                            eventStatusFilter === s
                              ? "bg-orange-400 text-slate-950 border-orange-300"
                              : "bg-slate-900/70 text-slate-200 border-slate-800 hover:bg-slate-800"
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)} · {count}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center bg-slate-900/70 border border-slate-800 rounded-2xl px-3 py-2 gap-2 max-w-md">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      placeholder="Search events by name, city, category..."
                      className="bg-transparent text-sm text-slate-100 outline-none w-full placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {paginatedEvents.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No events found for this filter / search.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {paginatedEvents.map((ev) => (
                        <div
                          key={ev._id}
                          className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-[0_16px_60px_rgba(0,0,0,0.9)] flex flex-col"
                        >
                          <Link to={`/events/${ev._id}`}>
                            {ev.image ? (
                              <img
                                src={ev.image}
                                alt={ev.name}
                                className="w-full h-40 object-cover"
                              />
                            ) : (
                              <div className="w-full h-40 bg-slate-900 flex items-center justify-center text-slate-600 text-xs">
                                No Image
                              </div>
                            )}
                          </Link>

                          <div className="p-4 flex flex-col gap-3 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-sm font-semibold text-slate-50">
                                  {ev.name}
                                </h3>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
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

                            <div className="flex items-center justify-between text-xs text-slate-300">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays size={12} />
                                {ev.date
                                  ? new Date(ev.date).toLocaleDateString()
                                  : "No date"}
                              </span>
                              {ev.category && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px]">
                                  {ev.category}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-300">
                              <span>Organizer: {ev.organizer || "—"}</span>
                              <span className="inline-flex items-center gap-1 text-orange-300 font-semibold">
                                <IndianRupee size={12} />
                                {ev.price}
                              </span>
                            </div>

                            {ev.personalNote && (
                              <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                                “{ev.personalNote}”
                              </p>
                            )}

                            <div className="mt-1 flex flex-wrap gap-2">
                              <Link
                                to={`/events/${ev._id}`}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800"
                              >
                                <Eye size={12} /> View page
                              </Link>

                              {ev.status !== "approved" && (
                                <button
                                  onClick={() =>
                                    handleEventVerify(ev._id, "approved")
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500 text-slate-950 text-[11px] hover:bg-emerald-400"
                                >
                                  <CheckCircle size={12} /> Approve
                                </button>
                              )}

                              {ev.status !== "rejected" && (
                                <button
                                  onClick={() =>
                                    handleEventVerify(ev._id, "rejected")
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500 text-slate-950 text-[11px] hover:bg-amber-400"
                                >
                                  <XCircle size={12} /> Reject
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteEvent(ev._id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-600 text-slate-50 text-[11px] hover:bg-red-500"
                              >
                                <Trash2 size={12} /> Delete
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
                    />
                  </>
                )}
              </section>
            )}

            {/* ===========================
                Analytics Tab
               =========================== */}
            {activeTab === "analytics" && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <BarIcon size={20} className="text-indigo-400" />
                      Event Analytics Snapshot
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Quickly see how categories and approvals are distributed.
                    </p>
                  </div>

                  <button
                    onClick={refreshAnalytics}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-900/70 border border-slate-700 text-slate-100 hover:bg-slate-800"
                  >
                    Refresh
                  </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Total Events</div>
                    <div className="text-2xl font-bold mt-1">
                      {analytics?.totalEvents ?? 0}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/40">
                    <div className="text-[11px] text-emerald-200">Approved</div>
                    <div className="text-2xl font-bold text-emerald-300 mt-1">
                      {analytics?.approvedEvents ?? 0}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40">
                    <div className="text-[11px] text-amber-200">Pending</div>
                    <div className="text-2xl font-bold text-amber-300 mt-1">
                      {analytics?.pendingEvents ?? 0}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-400/40">
                    <div className="text-[11px] text-red-200">Rejected</div>
                    <div className="text-2xl font-bold text-red-300 mt-1">
                      {analytics?.rejectedEvents ?? 0}
                    </div>
                  </div>
                </div>

                {/* Top categories + revenue side-by-side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Top categories */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
                      <PieIcon size={16} className="text-sky-400" />
                      Top Event Categories
                    </h3>

                    {topCategories.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        No category data available yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {topCategories.map((c, i) => {
                          const total = analytics?.totalEvents || 1;
                          const percent = ((c.count / total) * 100).toFixed(0);
                          return (
                            <div
                              key={c._id}
                              className="flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ background: COLORS[i % COLORS.length] }}
                                />
                                <div>
                                  <div className="text-sm font-medium text-slate-100">
                                    {c._id}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {c.count} event
                                    {c.count !== 1 ? "s" : ""}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs font-semibold text-slate-200">
                                {percent}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Revenue / Insights */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
                      <IndianRupee size={16} className="text-emerald-300" />
                      Estimated Revenue Snapshot
                    </h3>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 mb-4">
                      <div className="text-[11px] text-slate-400">
                        Sum of event prices
                      </div>
                      <div className="text-2xl font-bold text-slate-50 mt-1">
                        ₹
                        {Number(
                          analytics?.estimatedRevenue ?? 0
                        ).toLocaleString("en-IN")}
                      </div>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-300 mb-2">
                      Quick moderation insights
                    </h4>
                    <ul className="list-disc pl-5 text-[11px] text-slate-400 space-y-1.5">
                      <li>
                        {analytics?.approvedEvents ?? 0} events are approved and
                        visible to users.
                      </li>
                      <li>
                        {analytics?.pendingEvents ?? 0} pending events need your
                        review.
                      </li>
                      <li>
                        {analytics?.rejectedEvents ?? 0} events were rejected for
                        quality or policy reasons.
                      </li>
                    </ul>
                  </div>
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
