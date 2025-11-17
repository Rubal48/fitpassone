// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";

const COLORS = ["#2563eb", "#f97316", "#06b6d4", "#10b981", "#8b5cf6"];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("gyms"); // 'gyms' | 'events' | 'analytics'

  // Gyms
  const [gyms, setGyms] = useState([]);
  const [loadingGyms, setLoadingGyms] = useState(true);
  const [gymFilter, setGymFilter] = useState("all");

  // Events
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Analytics (cards only)
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // ---------------------------
  // Fetch gyms (once)
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
  // Fetch events (once)
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
      // refresh analytics if analytics tab is open
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
  // Derived values
  // ---------------------------
  const filteredGyms = gyms.filter((g) => (gymFilter === "all" ? true : g.status === gymFilter));
  const topCategories = analytics?.categoryStats?.slice(0, 6) || [];

  // ---------------------------
  // Loading state (if any of main loads)
  // ---------------------------
  const globalLoading = loadingGyms || loadingEvents || (activeTab === "analytics" ? loadingAnalytics : false);

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">Admin Dashboard</h1>

          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab("gyms")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeTab === "gyms"
                  ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg"
                  : "bg-white border border-gray-200 text-gray-700 hover:shadow-sm"
              }`}
            >
              <Dumbbell className="inline mr-2" size={16} />
              Gyms
            </button>

            <button
              onClick={() => setActiveTab("events")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeTab === "events"
                  ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg"
                  : "bg-white border border-gray-200 text-gray-700 hover:shadow-sm"
              }`}
            >
              <CalendarDays className="inline mr-2" size={16} />
              Events
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeTab === "analytics"
                  ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg"
                  : "bg-white border border-gray-200 text-gray-700 hover:shadow-sm"
              }`}
            >
              <PieIcon className="inline mr-2" size={16} />
              Event Analytics
            </button>
          </div>
        </div>

        {/* Global loading */}
        {globalLoading && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                    <Dumbbell size={22} /> Gym Management
                  </h2>

                  <div className="flex gap-2">
                    {["all", "pending", "approved", "rejected"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setGymFilter(s)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                          gymFilter === s
                            ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredGyms.length === 0 ? (
                  <p className="text-gray-500">No gyms found for this filter.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGyms.map((gym) => (
                      <div
                        key={gym._id}
                        className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition"
                      >
                        {gym.images && gym.images.length > 0 ? (
                          <Link to={`/admin/gym/${gym._1d}`}>
                            <img
                              src={gym.images[0]}
                              alt={gym.name}
                              className="w-full h-44 object-cover"
                            />
                          </Link>
                        ) : (
                          <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}

                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                {gym.name}
                                {gym.verified && (
                                  <ShieldCheck size={16} className="text-green-500" />
                                )}
                              </h3>
                              <p className="text-sm text-gray-500">{gym.city}</p>
                            </div>

                            <Link
                              to={`/admin/gym/${gym._id}`}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                            >
                              <Eye size={16} /> View
                            </Link>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              <span className="inline-flex items-center gap-1">
                                <IndianRupee size={14} />{" "}
                                <span className="font-semibold">
                                  {gym.price ? `₹${gym.price}` : "—"}
                                </span>
                              </span>
                            </div>

                            <div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  gym.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : gym.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {gym.status || "pending"}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {gym.description || "No description available."}
                          </p>

                          <div className="mt-4 flex gap-2 flex-wrap">
                            {gym.status !== "approved" && (
                              <button
                                onClick={() => handleGymVerification(gym._id, "approved")}
                                className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                              >
                                <CheckCircle size={14} /> Approve
                              </button>
                            )}
                            {gym.status !== "rejected" && (
                              <button
                                onClick={() => handleGymVerification(gym._id, "rejected")}
                                className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteGym(gym._id)}
                              className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ===========================
                Events Tab
               =========================== */}
            {activeTab === "events" && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                    <CalendarDays size={22} /> Event Management
                  </h2>

                  <div className="flex gap-2">
                    <Link
                      to="/create-event"
                      className="px-4 py-2 rounded-full font-semibold bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow"
                    >
                      Create New Event
                    </Link>
                  </div>
                </div>

                {events.length === 0 ? (
                  <p className="text-gray-500">No events created yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((ev) => (
                      <div
                        key={ev._id}
                        className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition"
                      >
                        {ev.image ? (
                          <Link to={`/events/${ev._id}`}>
                            <img src={ev.image} alt={ev.name} className="w-full h-44 object-cover" />
                          </Link>
                        ) : (
                          <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}

                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{ev.name}</h3>
                              <p className="text-sm text-gray-500">{ev.location}</p>
                            </div>

                            <div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  ev.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : ev.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {ev.status || "pending"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 text-sm text-gray-600 flex items-center gap-3">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays size={14} /> {new Date(ev.date).toLocaleDateString()}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={14} /> {ev.category}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-sm text-gray-600">Organizer: {ev.organizer}</div>
                            <div className="text-lg font-bold text-orange-500">₹{ev.price}</div>
                          </div>

                          {ev.personalNote && (
                            <p className="text-sm text-gray-600 mt-3 line-clamp-3 italic">“{ev.personalNote}”</p>
                          )}

                          <div className="mt-4 flex gap-2 flex-wrap">
                            {ev.status !== "approved" && (
                              <button
                                onClick={() => handleEventVerify(ev._id, "approved")}
                                className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                              >
                                <CheckCircle size={14} /> Approve
                              </button>
                            )}

                            {ev.status !== "rejected" && (
                              <button
                                onClick={() => handleEventVerify(ev._id, "rejected")}
                                className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            )}

                            <Link
                              to={`/events/${ev._id}`}
                              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                            >
                              <Eye size={14} /> View
                            </Link>

                            <button
                              onClick={() => handleDeleteEvent(ev._id)}
                              className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ===========================
                Analytics Tab
               =========================== */}
            {activeTab === "analytics" && (
              <section className="mb-12">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-3">
                    <BarIcon size={22} /> Event Analytics
                  </h2>

                  <div className="flex gap-3">
                    <button
                      onClick={refreshAnalytics}
                      className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:shadow-sm"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-white to-blue-50 shadow-md border border-gray-100">
                    <div className="text-sm text-gray-500">Total Events</div>
                    <div className="text-2xl font-bold text-gray-800 mt-2">{analytics?.totalEvents ?? 0}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg">
                    <div className="text-sm opacity-90">Approved</div>
                    <div className="text-2xl font-bold mt-2">{analytics?.approvedEvents ?? 0}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-white to-yellow-50 shadow-md border border-gray-100">
                    <div className="text-sm text-gray-500">Pending</div>
                    <div className="text-2xl font-bold text-gray-800 mt-2">{analytics?.pendingEvents ?? 0}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-white to-red-50 shadow-md border border-gray-100">
                    <div className="text-sm text-gray-500">Rejected</div>
                    <div className="text-2xl font-bold text-gray-800 mt-2">{analytics?.rejectedEvents ?? 0}</div>
                  </div>
                </div>

                {/* Top categories + revenue */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Top Categories</h3>

                    {topCategories.length === 0 ? (
                      <p className="text-gray-500">No category data</p>
                    ) : (
                      <div className="space-y-3">
                        {topCategories.map((c, i) => (
                          <div key={c._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ background: COLORS[i % COLORS.length] }}
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-700">{c._id}</div>
                                <div className="text-xs text-gray-400">{c.count} events</div>
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-gray-800">{((c.count / (analytics?.totalEvents || 1)) * 100).toFixed(0)}%</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Estimated Revenue</h3>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-white to-blue-50 border border-gray-100">
                      <div className="text-sm text-gray-500">Total (sum of event prices)</div>
                      <div className="text-2xl font-bold text-gray-900 mt-2">₹{analytics?.estimatedRevenue ?? 0}</div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Insights</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        <li>{analytics?.approvedEvents ?? 0} approved events — good moderation.</li>
                        <li>{analytics?.pendingEvents ?? 0} pending — review these.</li>
                        <li>{analytics?.rejectedEvents ?? 0} rejected — flagged or low quality.</li>
                      </ul>
                    </div>
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
