// src/pages/AdminEventDetails.jsx
// ----------------------------------------------
// PASSIIFY ADMIN EVENT DETAILS
// ----------------------------------------------

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../utils/api";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  CalendarDays,
  IndianRupee,
  Users,
  Ticket,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  Trash2,
  Globe,
} from "lucide-react";

/* =========================
   URL + AUTH HELPERS
========================= */

// Use same base URL as axios, then strip `/api` for media files
const RAW_BASE =
  (API.defaults && API.defaults.baseURL) || "http://localhost:5000/api";
const MEDIA_BASE = RAW_BASE.replace(/\/api\/?$/, "");

const toMediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${MEDIA_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

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

const statusChipClass = (status) => {
  const s = status || "pending";
  if (s === "approved")
    return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
  if (s === "rejected")
    return "bg-red-500/15 text-red-300 border-red-400/30";
  return "bg-amber-500/15 text-amber-300 border-amber-400/30";
};

const prettyStatus = (status) =>
  (status || "pending").charAt(0).toUpperCase() +
  (status || "pending").slice(1);

const AdminEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;

      const { data } = await API.get(`/admin/events/${id}`, config);
      // your backend might send { event } or raw event
      setEventData(data?.event || data);
    } catch (e) {
      console.error("fetch event error", e);
      if (e?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        navigate("/admin/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVerify = async (status) => {
    if (!eventData?._id) return;
    const ok = window.confirm(`Mark this event as ${status}?`);
    if (!ok) return;

    setActing(true);
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;

      const res = await API.put(
        `/admin/events/${eventData._id}/verify`,
        { status },
        config
      );
      const updated = res.data?.event || res.data;
      setEventData(updated);
    } catch (e) {
      console.error("verify event error", e);
      if (e?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        alert("Failed to update event status");
      }
    } finally {
      setActing(false);
    }
  };

  const handleRejectWithReason = async () => {
    // backend doesn’t store reason yet; UX only for now
    setShowReject(false);
    await handleVerify("rejected");
    setRejectReason("");
  };

  const handleDelete = async () => {
    if (!eventData?._id) return;
    const ok = window.confirm(
      "Delete this event permanently? This cannot be undone."
    );
    if (!ok) return;

    setActing(true);
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;

      await API.delete(`/admin/events/${eventData._id}`, config);
      navigate("/admin/dashboard");
    } catch (e) {
      console.error("delete event error", e);
      if (e?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        alert("Failed to delete event");
      }
    } finally {
      setActing(false);
    }
  };

  const ticketsSold = eventData?.ticketsSold || 0;
  const remainingSeats = eventData?.remainingSeats ?? eventData?.totalSeats ?? 0;
  const totalRevenue = Number(eventData?.totalRevenue || 0);

  const dateLabel = useMemo(() => {
    if (!eventData?.date) return "Date not set";
    try {
      return new Date(eventData.date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return eventData.date;
    }
  }, [eventData?.date]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050308] text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#9b5cff]" />
      </div>
    );
  }

  if (!eventData) return null;

  return (
    <div className="min-h-screen bg-[#050308] text-white px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-slate-200 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div
            className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusChipClass(
              eventData.status
            )}`}
          >
            {prettyStatus(eventData.status)}
          </div>
        </div>

        {/* Header layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Left: main info */}
          <div className="lg:col-span-2 rounded-2xl bg-[#0A0812] border border-white/10 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold flex items-center gap-2">
                  {eventData.name}
                  {eventData.status === "approved" && (
                    <ShieldCheck className="text-emerald-400" size={20} />
                  )}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} className="text-[#9b5cff]" />
                    {eventData.location || "Location not set"}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={14} className="text-sky-400" />
                    {dateLabel}
                  </span>

                  {eventData.category && (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs">
                      {eventData.category}
                    </span>
                  )}
                </div>

                {/* Organizer + website */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  {eventData.organizer && (
                    <span className="inline-flex items-center gap-1">
                      <Users size={14} className="text-emerald-300" />
                      Organizer: {eventData.organizer}
                    </span>
                  )}
                  {eventData.website && (
                    <a
                      href={eventData.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:text-white"
                    >
                      <Globe size={14} className="text-sky-300" />
                      Website
                    </a>
                  )}
                </div>

                {/* Key stats row */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                    <div className="text-xs text-slate-400">Ticket Price</div>
                    <div className="mt-1 flex items-center gap-1 font-semibold text-white">
                      <IndianRupee size={14} />
                      {eventData.price ?? "NA"}
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                    <div className="text-xs text-slate-400">Tickets Sold</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-emerald-300 font-semibold">
                      <Ticket size={14} />
                      {ticketsSold}
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                    <div className="text-xs text-slate-400">Remaining Seats</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-slate-100 font-semibold">
                      <Users size={14} />
                      {remainingSeats}
                    </div>
                  </div>
                </div>

                {/* Revenue */}
                <div className="mt-4 rounded-xl bg-black/30 border border-white/10 p-3">
                  <div className="text-xs text-slate-400">
                    Estimated Revenue
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-lg font-bold text-emerald-300">
                    <IndianRupee size={16} />
                    {totalRevenue.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 min-w-[140px]">
                {eventData.status !== "approved" && (
                  <button
                    disabled={acting}
                    onClick={() => handleVerify("approved")}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                )}

                {eventData.status !== "rejected" && (
                  <button
                    disabled={acting}
                    onClick={() => setShowReject(true)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                )}

                <button
                  disabled={acting}
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-600/90 text-white text-sm font-semibold hover:bg-red-500 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">
                About Event
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {eventData.description || "No description provided."}
              </p>
            </div>

            {/* Timing block (if you store explicit time fields later) */}
            {eventData.duration && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                <Clock size={16} className="text-sky-400" />
                <span>Duration: {eventData.duration}</span>
              </div>
            )}
          </div>

          {/* Right: main image */}
          <div className="rounded-2xl bg-[#0A0812] border border-white/10 p-5 h-fit">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              Event Cover
            </h3>

            {eventData.image ? (
              <a
                href={toMediaUrl(eventData.image)}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl overflow-hidden border border-white/10 bg-black/40"
              >
                <img
                  src={toMediaUrl(eventData.image)}
                  alt={eventData.name || "Event cover"}
                  className="w-full h-56 object-cover"
                />
              </a>
            ) : (
              <div className="w-full h-56 flex items-center justify-center rounded-xl bg-black/40 border border-dashed border-white/15 text-xs text-slate-400">
                No cover image uploaded.
              </div>
            )}

            {/* Simple rating display if exists */}
            {typeof eventData.rating !== "undefined" && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <div className="inline-flex items-center gap-1 text-amber-300">
                  <Star size={16} fill="currentColor" />
                  <span className="font-semibold">
                    {Number(eventData.rating || 0).toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {eventData.reviewsCount
                    ? `(${eventData.reviewsCount} reviews)`
                    : null}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {showReject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-[#0A0812] border border-white/10 p-5">
            <h3 className="text-lg font-bold">Reject Event</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add a reason for internal record. (We’ll store it in backend
              later.)
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason..."
              className="w-full mt-3 rounded-xl bg-black/40 border border-white/10 p-3 text-sm outline-none"
              rows={4}
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowReject(false)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectWithReason}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black text-sm font-semibold"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventDetails;
