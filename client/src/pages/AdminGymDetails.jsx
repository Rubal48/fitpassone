// src/pages/AdminGymDetails.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../utils/api";
import {
  Loader2,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Dumbbell,
  Image as ImageIcon,
  FileText,
  Video,
  Trash2,
} from "lucide-react";

/* =========================
   URL + AUTH HELPERS
========================= */

// Use the same base URL as axios, then strip `/api` for media files
const RAW_BASE =
  (API.defaults && API.defaults.baseURL) || "http://localhost:5000/api";
const MEDIA_BASE = RAW_BASE.replace(/\/api\/?$/, "");

// Convert any backend media value (string | object) into a usable URL
const toMediaUrl = (input) => {
  if (!input) return "";

  let path = input;

  // If it's an object (Cloudinary / multer / S3), try common keys
  if (typeof input === "object") {
    path =
      input.url ||
      input.secure_url ||
      input.path ||
      input.location ||
      input.key ||
      input.filename ||
      "";
  }

  if (!path) return "";
  if (typeof path !== "string") {
    path = String(path);
  }

  // Already an absolute URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Normalise relative path
  let clean = path.trim().replace(/\\/g, "/");
  clean = clean.replace(/^public\//, "");
  clean = clean.replace(/^\/+/, "");

  const base = MEDIA_BASE.replace(/\/$/, "");
  return `${base}/${clean}`;
};

// Get axios config with admin token (for all protected admin routes)
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

/* =========================
   NUMBER HELPER
========================= */

const pickNumber = (...values) => {
  for (let i = 0; i < values.length; i += 1) {
    const raw = values[i];
    if (raw !== undefined && raw !== null && raw !== "") {
      const num = Number(raw);
      if (!Number.isNaN(num)) return num;
    }
  }
  return 0;
};

/* =========================
   DAY CONFIG for opening hours
========================= */

const DAY_CONFIG = [
  { key: "monday", label: "Monday", short: "Mon", jsDay: 1 },
  { key: "tuesday", label: "Tuesday", short: "Tue", jsDay: 2 },
  { key: "wednesday", label: "Wednesday", short: "Wed", jsDay: 3 },
  { key: "thursday", label: "Thursday", short: "Thu", jsDay: 4 },
  { key: "friday", label: "Friday", short: "Fri", jsDay: 5 },
  { key: "saturday", label: "Saturday", short: "Sat", jsDay: 6 },
  { key: "sunday", label: "Sunday", short: "Sun", jsDay: 0 },
];

/* =========================
   OPENING HOURS NORMALIZER
   (supports string + structured object)
========================= */

const normalizeOpeningHours = (openingHoursInput) => {
  if (!openingHoursInput) return null;

  // Unwrap potential nested containers
  let openingHours = openingHoursInput;
  if (
    typeof openingHours === "object" &&
    openingHours !== null &&
    !Array.isArray(openingHours)
  ) {
    if (openingHours.days) openingHours = openingHours.days;
    else if (openingHours.week) openingHours = openingHours.week;
    else if (openingHours.schedule) openingHours = openingHours.schedule;
    else if (openingHours.slots) openingHours = openingHours.slots;
  }

  // Old data: simple string
  if (typeof openingHours === "string") {
    return {
      isStructured: false,
      label: openingHours,
    };
  }

  // Structured Mon–Sun object
  if (
    typeof openingHours === "object" &&
    openingHours !== null &&
    !Array.isArray(openingHours)
  ) {
    let hasAnyOpen = false;

    const list = DAY_CONFIG.map((day) => {
      const raw =
        openingHours[day.key] ||
        openingHours[day.key.toUpperCase()] ||
        openingHours[day.key[0].toUpperCase() + day.key.slice(1)] ||
        null;

      let data = raw;
      let closed = false;
      let open = "";
      let close = "";

      if (typeof data === "string") {
        // e.g. "6:00 AM – 10:00 PM"
        open = data;
        close = "";
      } else if (typeof data === "object" && data !== null) {
        open = data.open || data.openTime || data.from || "";
        close = data.close || data.closeTime || data.to || "";
        closed = !!data.closed;
      }

      const hasTimes = open && close;
      const isClosed = closed || !hasTimes;

      if (!isClosed) hasAnyOpen = true;

      return {
        ...day,
        closed: isClosed,
        open,
        close,
        raw,
      };
    });

    const hasAnyDayConfigured =
      Object.keys(openingHours).length > 0 || hasAnyOpen;

    return {
      isStructured: true,
      list,
      hasAnyOpen: hasAnyOpen || hasAnyDayConfigured,
    };
  }

  // Fallback
  return {
    isStructured: false,
    label: String(openingHoursInput),
  };
};

const extractOpeningHoursSource = (gym) => {
  if (!gym) return null;
  return (
    gym.openingHours ||
    gym.operatingHours ||
    gym.operating_hours ||
    gym.hours ||
    gym.timings ||
    null
  );
};

const AdminGymDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  // Reject modal
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchGym = async () => {
    setLoading(true);
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;

      const { data } = await API.get(`/admin/gyms/${id}`, config);
      setGym(data);
    } catch (e) {
      console.error("fetch gym error", e);
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
    fetchGym();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVerify = async (status) => {
    if (!gym?._id) return;
    const ok = window.confirm(`Mark this gym as ${status}?`);
    if (!ok) return;

    setActing(true);
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;

      const res = await API.put(
        `/admin/gyms/${gym._id}/verify`,
        { status },
        config
      );
      setGym(res.data?.gym || res.data);
    } catch (e) {
      console.error("verify error", e);
      if (e?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        alert("Failed to update gym status");
      }
    } finally {
      setActing(false);
    }
  };

  const handleRejectWithReason = async () => {
    // Backend doesn't store reject reason field yet.
    // We still show UX; later you can add a field.
    setShowReject(false);
    await handleVerify("rejected");
    setRejectReason("");
  };

  const handleDelete = async () => {
    if (!gym?._id) return;
    const ok = window.confirm(
      "Delete this gym permanently? This cannot be undone."
    );
    if (!ok) return;

    setActing(true);
    try {
      const config = getAdminConfig(navigate);
      if (!config) return;

      await API.delete(`/admin/gyms/${gym._id}`, config);
      navigate("/admin/dashboard");
    } catch (e) {
      console.error("delete gym error", e);
      if (e?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        alert("Failed to delete gym");
      }
    } finally {
      setActing(false);
    }
  };

  const passes = gym?.passes || [];
  const facilities = gym?.facilities || [];
  const tags = gym?.tags || [];
  const images = [
    ...(gym?.heroImage ? [gym.heroImage] : []),
    ...(gym?.coverImage ? [gym.coverImage] : []),
    ...(gym?.bannerImage ? [gym.bannerImage] : []),
    ...(gym?.mainImage ? [gym.mainImage] : []),
    ...(Array.isArray(gym?.images) ? gym.images : []),
    ...(Array.isArray(gym?.media) ? gym.media : []),
    ...(Array.isArray(gym?.gallery) ? gym.gallery : []),
    ...(gym?.image ? [gym.image] : []),
  ];
  const reviews = gym?.reviews || [];

  const avgRating = gym?.rating ?? 0;

  const latestReviews = useMemo(
    () =>
      reviews
        .slice()
        .sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, 3),
    [reviews]
  );

  const openingHoursSource = extractOpeningHoursSource(gym);
  const normalizedHours = useMemo(
    () => normalizeOpeningHours(openingHoursSource),
    [openingHoursSource]
  );
  const hasStructuredOpeningHours =
    !!normalizedHours?.isStructured && !!normalizedHours?.hasAnyOpen;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050308] text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#9b5cff]" />
      </div>
    );
  }

  if (!gym) return null;

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
              gym.status
            )}`}
          >
            {prettyStatus(gym.status)}
          </div>
        </div>

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Left: main info */}
          <div className="lg:col-span-2 rounded-2xl bg-[#0A0812] border border-white/10 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold flex items-center gap-2">
                  {gym.name}
                  {gym.verified && (
                    <ShieldCheck className="text-emerald-400" size={20} />
                  )}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} className="text-[#9b5cff]" />
                    {gym.city || "Unknown city"}
                  </span>
                  {gym.address && (
                    <span className="text-slate-400">• {gym.address}</span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs">
                    {gym.businessType || "gym"}
                  </span>
                </div>

                {/* Rating */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="inline-flex items-center gap-1 text-amber-300">
                    <Star size={16} fill="currentColor" />
                    <span className="font-semibold">
                      {avgRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    ({reviews.length} reviews)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 min-w-[140px]">
                {gym.status !== "approved" && (
                  <button
                    disabled={acting}
                    onClick={() => handleVerify("approved")}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                )}

                {gym.status !== "rejected" && (
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
                About Gym
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {gym.description || "No description provided."}
              </p>
            </div>

            {/* Facilities / tags */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-2">
                  Facilities
                </h4>
                {facilities.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No facilities listed.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-200"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-2">
                  Tags
                </h4>
                {tags.length === 0 ? (
                  <p className="text-xs text-slate-500">No tags added.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-200"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Opening hours */}
            {openingHoursSource && normalizedHours && (
              <div className="mt-5">
                <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                  <Clock size={16} className="text-sky-400" />
                  <span className="font-semibold">Opening hours</span>
                </div>

                {/* Old string form */}
                {!normalizedHours.isStructured && normalizedHours.label && (
                  <p className="text-sm text-slate-300 ml-6">
                    {normalizedHours.label}
                  </p>
                )}

                {/* Structured weekly schedule */}
                {hasStructuredOpeningHours &&
                  normalizedHours.list &&
                  normalizedHours.list.length > 0 && (
                    <div className="ml-6 space-y-1 text-xs text-slate-300">
                      {normalizedHours.list.map((day) => {
                        const isToday =
                          typeof day.jsDay === "number" &&
                          day.jsDay === new Date().getDay();

                        let label;
                        if (day.closed) {
                          label = "Closed";
                        } else if (day.open && day.close) {
                          label = `${day.open} – ${day.close}`;
                        } else if (
                          typeof day.raw === "string" &&
                          day.raw.trim()
                        ) {
                          label = day.raw;
                        } else if (day.open) {
                          label = day.open;
                        } else {
                          label = "Closed";
                        }

                        return (
                          <div
                            key={day.key}
                            className="flex items-center justify-between"
                          >
                            <span
                              className={`w-16 ${
                                isToday ? "font-semibold text-white" : ""
                              }`}
                            >
                              {day.short}
                            </span>
                            <span
                              className={
                                day.closed
                                  ? "text-slate-500"
                                  : isToday
                                  ? "text-emerald-300"
                                  : "text-slate-300"
                              }
                            >
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Right: contact + docs quick */}
          <div className="rounded-2xl bg-[#0A0812] border border-white/10 p-5 h-fit">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              Contact & Links
            </h3>

            <div className="space-y-2 text-sm text-slate-300">
              {gym.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-emerald-300" />
                  <span>{gym.phone}</span>
                </div>
              )}
              {gym.website && (
                <a
                  href={gym.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-white"
                >
                  <Globe size={14} className="text-sky-300" />
                  <span className="truncate">{gym.website}</span>
                </a>
              )}
              {gym.instagram && (
                <a
                  href={gym.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-white"
                >
                  <Instagram size={14} className="text-pink-300" />
                  <span className="truncate">{gym.instagram}</span>
                </a>
              )}
              {gym.googleMapLink && (
                <a
                  href={gym.googleMapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-white"
                >
                  <MapPin size={14} className="text-[#9b5cff]" />
                  <span className="truncate">Open Map</span>
                </a>
              )}
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <h4 className="text-xs font-semibold text-slate-400 mb-2">
                Verification Docs
              </h4>

              <div className="space-y-2">
                <DocRow
                  label="Business Proof"
                  icon={FileText}
                  url={gym.businessProof}
                />
                <DocRow
                  label="Owner ID Proof"
                  icon={FileText}
                  url={gym.ownerIdProof}
                />
                <DocRow label="Intro Video" icon={Video} url={gym.video} />
              </div>
            </div>
          </div>
        </div>

        {/* Images gallery */}
        <section className="rounded-2xl bg-[#0A0812] border border-white/10 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <ImageIcon size={16} className="text-[#9b5cff]" />
            Gym Photos
          </h2>

          {images.length === 0 ? (
            <div className="text-sm text-slate-400 flex items-center gap-2">
              <ImageIcon size={16} />
              No images uploaded.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((img, i) => {
                const finalUrl = toMediaUrl(img);
                if (!finalUrl) return null;
                return (
                  <a
                    key={i}
                    href={finalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/30"
                  >
                    <img
                      src={finalUrl}
                      alt={`gym-${i}`}
                      className="w-full h-36 object-cover group-hover:scale-105 transition"
                    />
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* Passes */}
        <section className="rounded-2xl bg-[#0A0812] border border-white/10 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Dumbbell size={16} className="text-sky-400" />
            Pass Pricing
          </h2>

          {passes.length === 0 ? (
            <p className="text-sm text-slate-400">No passes configured.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-400 text-xs">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2">Duration (days)</th>
                    <th className="text-left py-2">Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {passes.map((p, i) => {
                    const duration =
                      p.duration ||
                      p.durationDays ||
                      (typeof p.label === "string" ? p.label : "-");
                    const price = pickNumber(
                      p.salePrice,
                      p.price,
                      p.basePrice
                    );
                    return (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-2 text-slate-100">
                          {typeof duration === "number"
                            ? duration
                            : duration || "-"}
                        </td>
                        <td className="py-2 text-slate-100 font-semibold">
                          {price
                            ? `₹${Number(price).toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Reviews snapshot */}
        <section className="rounded-2xl bg-[#0A0812] border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Star size={16} className="text-amber-300" />
            Recent Reviews
          </h2>

          {latestReviews.length === 0 ? (
            <p className="text-sm text-slate-400">No reviews yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {latestReviews.map((r, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-black/30 border border-white/10 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                    <div className="inline-flex items-center gap-1 text-amber-300 text-xs font-semibold">
                      <Star size={12} fill="currentColor" />
                      {r.rating}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-100 line-clamp-3">
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Reject modal */}
      {showReject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-[#0A0812] border border-white/10 p-5">
            <h3 className="text-lg font-bold">Reject Gym</h3>
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

const DocRow = ({ label, icon: Icon, url }) => {
  const finalUrl = toMediaUrl(url);
  return (
    <div className="flex items-center justify-between rounded-xl bg-black/30 border border-white/10 px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-slate-200">
        <Icon size={14} className="text-slate-400" />
        {label}
      </div>
      {url && finalUrl ? (
        <a
          href={finalUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#9b5cff] hover:text-white"
        >
          View
        </a>
      ) : (
        <span className="text-[11px] text-slate-500">Not uploaded</span>
      )}
    </div>
  );
};

export default AdminGymDetails;
