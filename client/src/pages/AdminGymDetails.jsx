import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import {
  Loader2,
  CheckCircle,
  XCircle,
  MapPin,
  IndianRupee,
  Dumbbell,
  Image as ImageIcon,
  Trash2,
  FileText,
  Video,
  ArrowLeft,
  ShieldCheck,
  Phone,
  Globe,
  Instagram,
  Link2,
  Tag,
} from "lucide-react";

const AdminGymDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const { data } = await API.get(`/admin/gyms/${id}`);
        setGym(data);
      } catch (error) {
        console.error("Error fetching gym:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGym();
  }, [id]);

  const handleVerification = async (status) => {
    if (!window.confirm(`Are you sure you want to mark this gym as ${status}?`))
      return;

    try {
      await API.put(`/admin/gyms/${id}/verify`, {
        status,
        verified: status === "approved",
      });
      alert(
        `Gym ${
          status === "approved" ? "verified ✅" : "rejected ❌"
        } successfully!`
      );
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error updating verification status.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this gym permanently?")) return;
    try {
      await API.delete(`/admin/gyms/${id}`);
      alert("Gym deleted successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error deleting this gym.");
    }
  };

  const statusClass = (status) => {
    const s = status || "pending";
    if (s === "approved")
      return "bg-emerald-500/15 text-emerald-300 border-emerald-400/40";
    if (s === "rejected")
      return "bg-red-500/15 text-red-300 border-red-400/40";
    return "bg-amber-500/15 text-amber-300 border-amber-400/40";
  };

  const prettyStatus = (status) =>
    (status || "pending").charAt(0).toUpperCase() +
    (status || "pending").slice(1);

  const bestPass = useMemo(() => {
    if (!gym?.passes || gym.passes.length === 0) return null;
    const withPerDay = gym.passes.map((p) => ({
      ...p,
      perDay: Number(p.price) / Number(p.duration || 1),
    }));
    return withPerDay.reduce((a, b) => (a.perDay <= b.perDay ? a : b));
  }, [gym]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <Loader2 className="animate-spin w-10 h-10 text-sky-400" />
      </div>
    );

  if (!gym)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-sm text-slate-400">Gym not found.</p>
      </div>
    );

  const mainImage =
    gym.images && gym.images.length > 0 ? gym.images[0] : null;
  const otherImages =
    gym.images && gym.images.length > 1 ? gym.images.slice(1) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-sky-400 transition"
          >
            <ArrowLeft size={14} />
            Back to dashboard
          </button>

          <div className="flex flex-wrap gap-2 justify-between md:justify-end">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-semibold ${statusClass(
                gym.status
              )}`}
            >
              <ShieldCheck size={13} />
              {prettyStatus(gym.status)}
              {gym.verified && (
                <span className="text-[10px] uppercase tracking-wide">
                  • Verified
                </span>
              )}
            </span>

            <div className="inline-flex flex-wrap gap-2">
              <button
                onClick={() => handleVerification("approved")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400 transition"
              >
                <CheckCircle size={14} />
                Approve
              </button>
              <button
                onClick={() => handleVerification("rejected")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 text-xs font-semibold hover:bg-amber-400 transition"
              >
                <XCircle size={14} />
                Reject
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-slate-50 text-xs font-semibold hover:bg-red-500 transition"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Header card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-[0_18px_80px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-5">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
              {gym.name}
              {gym.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-[10px] text-emerald-200 uppercase tracking-wide">
                  <ShieldCheck size={12} />
                  Verified
                </span>
              )}
            </h1>
            <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin size={13} className="text-sky-400" />
              {gym.address ? (
                <>
                  <span className="truncate">{gym.address}</span>
                  {gym.city && (
                    <span className="text-slate-500">• {gym.city}</span>
                  )}
                </>
              ) : (
                <span>{gym.city || "Location not specified"}</span>
              )}
            </p>
            {gym.businessType && (
              <p className="mt-2 text-[11px] text-slate-400">
                Business Type:{" "}
                <span className="text-slate-100 font-medium">
                  {gym.businessType}
                </span>
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-4 items-center text-xs">
              <div className="inline-flex items-center gap-1 text-slate-200">
                <IndianRupee size={12} className="text-emerald-300" />
                {gym.price
                  ? `Base price: ₹${gym.price} / day`
                  : "Base price: Custom passes only"}
              </div>

              {bestPass && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-sky-500/15 border border-sky-400/50 text-sky-100">
                  <Dumbbell size={12} />
                  Best Value: {bestPass.duration}-Day @ ₹{bestPass.price} (
                  ₹{bestPass.perDay.toFixed(0)}/day)
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1 text-[11px] text-slate-500">
            {gym.createdAt && (
              <p>
                Created:{" "}
                {new Date(gym.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
            {gym.updatedAt && (
              <p>
                Last updated:{" "}
                {new Date(gym.updatedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
            {gym.googleMapLink && (
              <a
                href={gym.googleMapLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sky-400 hover:text-sky-300"
              >
                <Link2 size={12} />
                Open in Google Maps
              </a>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Images + Description + Facilities + Pricing */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
                <ImageIcon size={16} className="text-sky-400" />
                Visual Proofs
              </h2>

              {mainImage ? (
                <div className="space-y-3">
                  <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                    <img
                      src={mainImage}
                      alt="Main gym"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {otherImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {otherImages.map((img, i) => (
                        <div
                          key={i}
                          className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-slate-900"
                        >
                          <img
                            src={img}
                            alt={`Gym ${i + 2}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 rounded-2xl bg-slate-900 text-slate-500 text-xs gap-2 border border-slate-800">
                  <ImageIcon size={16} />
                  No images uploaded
                </div>
              )}
            </div>

            {/* Description */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
              <h2 className="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
                Gym Story & Description
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                {gym.description || "No description provided by the partner."}
              </p>
            </div>

            {/* Facilities + Tags */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
                  Facilities
                </h2>
                {gym.facilities && gym.facilities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {gym.facilities.map((a, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1 rounded-full text-[11px]"
                      >
                        <Dumbbell size={12} className="text-orange-300" />
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    No facilities listed.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-100 mb-1 flex items-center gap-1.5">
                  <Tag size={13} className="text-sky-400" />
                  Tags / Highlights
                </h3>
                {gym.tags && gym.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {gym.tags.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] text-slate-300"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    No tags added by partner.
                  </p>
                )}
              </div>
            </div>

            {/* Pricing: Custom & Passes */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <IndianRupee size={16} className="text-emerald-300" />
                Pricing Structure
              </h2>

              {/* Custom Prices */}
              {gym.customPrice && Object.keys(gym.customPrice).length > 0 && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
                  <h3 className="text-xs font-semibold text-slate-200 mb-2">
                    Custom Price Mapping
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                    {Object.entries(gym.customPrice).map(([days, price]) => (
                      <div
                        key={days}
                        className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 flex flex-col gap-0.5"
                      >
                        <span className="text-slate-400 text-[10px]">
                          {days}-Day Pass
                        </span>
                        <span className="text-slate-50 font-semibold">
                          ₹{price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Passes */}
              {gym.passes && gym.passes.length > 0 && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
                  <h3 className="text-xs font-semibold text-slate-200 mb-2">
                    Active Passes (Frontend Usage)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                    {gym.passes.map((p, i) => {
                      const isBest =
                        bestPass &&
                        Number(bestPass.duration) === Number(p.duration) &&
                        Number(bestPass.price) === Number(p.price);
                      return (
                        <div
                          key={i}
                          className={`rounded-xl px-3 py-2 border ${
                            isBest
                              ? "bg-emerald-500/10 border-emerald-400/60"
                              : "bg-slate-950 border-slate-800"
                          } flex flex-col gap-0.5`}
                        >
                          <span className="text-slate-400 text-[10px]">
                            {p.duration}-Day Pass
                          </span>
                          <span className="text-slate-50 font-semibold">
                            ₹{p.price}
                          </span>
                          {isBest && (
                            <span className="text-[9px] text-emerald-300 mt-1 uppercase tracking-wide">
                              Best Value
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!gym.customPrice &&
                (!gym.passes || gym.passes.length === 0) && (
                  <p className="text-[11px] text-slate-500">
                    No passes or custom pricing configured.
                  </p>
                )}
            </div>
          </div>

          {/* RIGHT: Verification Snapshot + Contact + Documents */}
          <div className="space-y-6">
            {/* Verification Snapshot */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
              <h2 className="text-sm font-semibold text-slate-100 mb-2">
                Verification Snapshot
              </h2>
              <p className="text-[11px] text-slate-400 mb-3">
                Use this to quickly understand if this partner looks legit before
                approving.
              </p>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span
                    className={`px-2 py-0.5 rounded-full border ${statusClass(
                      gym.status
                    )}`}
                  >
                    {prettyStatus(gym.status)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Verified Flag</span>
                  <span className="text-slate-100 font-medium">
                    {gym.verified ? "Yes" : "No"}
                  </span>
                </div>

                {gym.city && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">City</span>
                    <span className="text-slate-100">{gym.city}</span>
                  </div>
                )}

                {gym.businessType && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Business Type</span>
                    <span className="text-slate-100">{gym.businessType}</span>
                  </div>
                )}

                {gym.facilities && gym.facilities.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-400">
                      Key Facilities:
                    </span>
                    <p className="text-[11px] text-slate-100 mt-1 line-clamp-2">
                      {gym.facilities.join(" • ")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-100 mb-1">
                Partner Contact
              </h2>

              <p className="text-[11px] text-slate-200 flex items-center gap-2">
                <Phone size={13} className="text-emerald-300" />
                {gym.phone || "No phone provided"}
              </p>

              {gym.website && (
                <p className="text-[11px] flex items-center gap-2">
                  <Globe size={13} className="text-sky-300" />
                  <a
                    href={gym.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:text-sky-300 underline decoration-dotted"
                  >
                    {gym.website}
                  </a>
                </p>
              )}

              {gym.instagram && (
                <p className="text-[11px] flex items-center gap-2">
                  <Instagram size={13} className="text-pink-400" />
                  <a
                    href={gym.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-300 hover:text-pink-200 underline decoration-dotted"
                  >
                    {gym.instagram}
                  </a>
                </p>
              )}

              {!gym.website && !gym.instagram && (
                <p className="text-[11px] text-slate-500">
                  No external links provided.
                </p>
              )}
            </div>

            {/* Documents */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-100 mb-1">
                Verification Documents
              </h2>

              <div className="space-y-3 text-[11px]">
                {/* Business Proof */}
                <div className="border border-slate-800 rounded-2xl px-3 py-2 bg-slate-950/70">
                  <p className="font-semibold text-slate-200 flex items-center gap-2 mb-1">
                    <FileText size={13} className="text-orange-300" />
                    Business Proof (GST / Registration)
                  </p>
                  {gym.businessProof ? (
                    <a
                      href={gym.businessProof}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:text-sky-300 underline decoration-dotted"
                    >
                      View uploaded document
                    </a>
                  ) : (
                    <p className="text-slate-500">Not uploaded</p>
                  )}
                </div>

                {/* Owner ID */}
                <div className="border border-slate-800 rounded-2xl px-3 py-2 bg-slate-950/70">
                  <p className="font-semibold text-slate-200 flex items-center gap-2 mb-1">
                    <FileText size={13} className="text-orange-300" />
                    Owner ID Proof (Aadhaar / PAN)
                  </p>
                  {gym.ownerIdProof ? (
                    <a
                      href={gym.ownerIdProof}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:text-sky-300 underline decoration-dotted"
                    >
                      View uploaded document
                    </a>
                  ) : (
                    <p className="text-slate-500">Not uploaded</p>
                  )}
                </div>

                {/* Video */}
                <div className="border border-slate-800 rounded-2xl px-3 py-2 bg-slate-950/70">
                  <p className="font-semibold text-slate-200 flex items-center gap-2 mb-2">
                    <Video size={13} className="text-orange-300" />
                    Intro / Walkthrough Video
                  </p>
                  {gym.video ? (
                    <video
                      src={gym.video}
                      controls
                      className="w-full rounded-xl border border-slate-800 bg-black"
                    />
                  ) : (
                    <p className="text-slate-500">Not uploaded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGymDetails;
