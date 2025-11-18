// src/pages/Partner.jsx (or PartnerWithUs, wherever you use it)
import React, { useState } from "react";
import {
  Loader2,
  CheckCircle,
  DollarSign,
  Phone,
  Plus,
  Trash2,
  Shield,
  Users,
  Sparkles,
  MapPin,
} from "lucide-react";
import API from "../utils/api";

export default function Partner() {
  /* -------------------------------------------------------
     STATE & CONSTANTS (same logic as before)
  -------------------------------------------------------- */
  const [formData, setFormData] = useState({
    name: "",
    businessType: "gym",
    city: "",
    address: "",
    phone: "",
    description: "",
    tags: "",
    website: "",
    instagram: "",
    googleMapLink: "",
  });

  const [passes, setPasses] = useState([{ duration: 1, price: "" }]);
  const [images, setImages] = useState([]);
  const [businessProof, setBusinessProof] = useState(null);
  const [ownerIdProof, setOwnerIdProof] = useState(null);
  const [video, setVideo] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const amenitiesList = [
    "WiFi",
    "Parking",
    "Showers",
    "Lockers",
    "Steam Room",
    "AC",
    "Cafeteria",
    "Women-Only Section",
  ];

  /* -------------------------------------------------------
     HANDLERS (same backend behavior)
  -------------------------------------------------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePassChange = (index, field, value) => {
    const updated = [...passes];
    updated[index][field] = value;
    setPasses(updated);
  };

  const addPass = () => setPasses([...passes, { duration: "", price: "" }]);
  const removePass = (index) =>
    setPasses(passes.filter((_, i) => i !== index));

  const handleFacilityChange = (e) => {
    const { value, checked } = e.target;
    setFacilities((prev) =>
      checked ? [...prev, value] : prev.filter((f) => f !== value)
    );
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const formDataUpload = new FormData();
    files.forEach((file) => formDataUpload.append("images", file));

    try {
      setUploading(true);
      const res = await API.post("/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages(res.data.images);
      setError("");
    } catch {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleProofUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await API.post("/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (type === "business") setBusinessProof(res.data.images[0]);
      if (type === "owner") setOwnerIdProof(res.data.images[0]);
      if (type === "video") setVideo(res.data.images[0]);
      setError("");
    } catch {
      setError("Document upload failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.name || !formData.city || !formData.phone) {
      setError("Please fill all required fields.");
      return;
    }

    if (passes.some((p) => !p.duration || !p.price)) {
      setError("Please fill duration and price for all passes.");
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        passes: passes.map((p) => ({
          duration: Number(p.duration),
          price: Number(p.price),
        })),
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : [],
        facilities,
        images,
        businessProof,
        ownerIdProof,
        video,
        status: "pending",
      };

      const res = await API.post("/gyms", payload);
      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setFormData({
          name: "",
          businessType: "gym",
          city: "",
          address: "",
          phone: "",
          description: "",
          tags: "",
          website: "",
          instagram: "",
          googleMapLink: "",
        });
        setFacilities([]);
        setImages([]);
        setBusinessProof(null);
        setOwnerIdProof(null);
        setVideo(null);
        setPasses([{ duration: 1, price: "" }]);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     UI
  -------------------------------------------------------- */
  return (
    <div
      className="min-h-screen text-gray-100"
      style={{
        backgroundColor: "#050308",
        backgroundImage:
          "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
      }}
    >
      {/* ===========================
          HERO — pitch to partners
      ============================ */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-[#050308] via-[#13071A] to-[#2B0A18]" />
        <div className="absolute inset-0 opacity-25 bg-[url('https://images.pexels.com/photos/4162443/pexels-photo-4162443.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center mix-blend-soft-light" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
          {/* LEFT: copy + benefits */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/20 text-[11px] uppercase tracking-[0.25em] text-gray-200 mb-5">
              <Sparkles className="w-3.5 h-3.5 text-orange-200" />
              <span>For gyms · studios · event hosts</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-[2.7rem] font-black tracking-tight text-white leading-tight">
              Turn your{" "}
              <span className="text-orange-300">space</span> into a{" "}
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(120deg,#FF4B5C,#FF9F68)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                traveler magnet
              </span>
              .
            </h1>

            <p className="mt-4 text-sm md:text-base text-gray-200 max-w-xl leading-relaxed">
              List your gym, yoga studio, MMA academy or fitness event on{" "}
              <span className="font-semibold text-orange-200">
                Passiify
              </span>{" "}
              and start getting high-intent one-day visitors — travelers,
              GenZ, remote workers and movers who want to train without the
              long-term commitment.
            </p>

            <div className="mt-6 grid sm:grid-cols-3 gap-4 text-xs md:text-sm">
              <div className="rounded-2xl bg-white/5 border border-white/15 px-4 py-3">
                <div className="flex items-center gap-2 text-orange-200 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold text-gray-100">
                    New Footfall
                  </span>
                </div>
                <p className="text-gray-300">
                  Attract travelers & nearby users who normally never discover
                  your space.
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/15 px-4 py-3">
                <div className="flex items-center gap-2 text-emerald-200 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold text-gray-100">
                    Extra Revenue
                  </span>
                </div>
                <p className="text-gray-300">
                  Monetise empty slots & off-peak hours with one-day passes.
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/15 px-4 py-3">
                <div className="flex items-center gap-2 text-blue-200 mb-1">
                  <Shield className="w-4 h-4" />
                  <span className="font-semibold text-gray-100">
                    Verified Network
                  </span>
                </div>
                <p className="text-gray-300">
                  Become part of a curated, quality-first fitness ecosystem.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: compact highlight card */}
          <div className="hidden md:block">
            <div className="rounded-3xl bg-black/60 border border-white/18 shadow-[0_24px_80px_rgba(0,0,0,0.95)] px-6 py-7 space-y-4">
              <h2 className="text-lg font-semibold text-gray-50 mb-2">
                Why hosts love Passiify
              </h2>
              <ul className="space-y-3 text-xs text-gray-200">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-300" />
                  <span>
                    <span className="font-semibold">
                      Flexible pricing:
                    </span>{" "}
                    you fully control your one-day pass durations & rates.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-300" />
                  <span>
                    <span className="font-semibold">
                      Zero long-term lock-in:
                    </span>{" "}
                    list, test performance, and adjust anytime.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-300" />
                  <span>
                    <span className="font-semibold">
                      Smart discovery:
                    </span>{" "}
                    your listing appears in relevant city, category &
                    experience searches.
                  </span>
                </li>
              </ul>
              <p className="text-[11px] text-gray-400 pt-1 border-t border-white/10">
                Fill out the partner form below — our team reviews new
                listings to keep the network high quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===========================
          MAIN SECTION — form + copy
      ============================ */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16 grid lg:grid-cols-[1.1fr,1.2fr] gap-10">
        {/* LEFT: small reassurance / guidelines (mobile) */}
        <div className="lg:hidden mb-2">
          <div className="rounded-2xl bg-black/60 border border-white/15 px-4 py-4 text-xs text-gray-200 space-y-2">
            <h3 className="text-sm font-semibold text-gray-50 mb-1">
              What we look for in partners
            </h3>
            <p>
              Clean, safe, professionally-run gyms, studios, boxes or
              academies that welcome day-pass users and travelers.
            </p>
            <p className="flex items-center gap-1 text-[11px] text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-orange-200" />
              Priority to centrally located or easily accessible spaces.
            </p>
          </div>
        </div>

        {/* LEFT DESKTOP: guidelines / expectations */}
        <div className="hidden lg:flex flex-col gap-4">
          <div className="rounded-2xl bg-black/60 border border-white/15 px-5 py-5 text-xs md:text-sm text-gray-200 space-y-3">
            <h3 className="text-sm md:text-base font-semibold text-gray-50 mb-1">
              What makes a great Passiify listing
            </h3>
            <p>
              We highlight hosts who care about community, safety and
              experience. If you maintain a respectful environment, clean
              equipment and clear communication — you&apos;re exactly who
              we want.
            </p>
            <ul className="space-y-1.5 text-[11px] text-gray-300">
              <li>• Clear signage & dedicated check-in process.</li>
              <li>• Transparent rules around footwear, clothing & filming.</li>
              <li>• Staff present during peak hours for support.</li>
              <li>• Open to travelers & new movers, not just regular members.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-black/60 border border-white/15 px-5 py-4 text-[11px] text-gray-300 space-y-1.5">
            <p>
              Once submitted, our team reviews your details, may ask for
              extra info, and then your space goes live on{" "}
              <span className="font-semibold text-orange-200">Passiify</span>.
            </p>
            <p className="text-[10px] text-gray-500">
              You&apos;ll always have control over pricing, availability
              and how you want to present your brand.
            </p>
          </div>
        </div>

        {/* RIGHT: FORM CARD */}
        <div className="bg-black/70 border border-white/14 rounded-3xl shadow-[0_26px_90px_rgba(0,0,0,0.95)] px-5 py-6 md:px-7 md:py-8">
          {success ? (
            /* -------------------------
               SUCCESS STATE
            -------------------------- */
            <div className="text-center flex flex-col items-center py-6">
              <CheckCircle className="w-14 h-14 mb-3 text-emerald-400" />
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-50">
                Centre submitted for review
              </h2>
              <p className="text-xs md:text-sm text-gray-300 mb-5 max-w-md">
                Thank you for partnering with{" "}
                <span className="text-orange-300 font-semibold">
                  Passiify
                </span>
                . Our team will review and verify your details before your
                listing goes live.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold bg-white text-gray-900 hover:scale-[1.02] transition shadow-[0_18px_60px_rgba(0,0,0,0.95)]"
              >
                Add another centre
              </button>
            </div>
          ) : (
            <>
              {/* -------------------------
                 FORM HEADER
              -------------------------- */}
              <div className="mb-5 text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold text-gray-50">
                  List your gym / studio / academy
                </h2>
                <p className="text-xs md:text-sm text-gray-400 mt-1.5">
                  Fill in a few details about your space. You can always
                  update information later after approval.
                </p>
              </div>

              {error && (
                <p className="text-red-400 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2 text-xs mb-4 text-center">
                  {error}
                </p>
              )}

              {/* -------------------------
                 FORM
              -------------------------- */}
              <form onSubmit={handleSubmit} className="space-y-6 text-xs md:text-sm">
                {/* Business Type */}
                <div>
                  <label className="block font-semibold mb-1.5 text-gray-100">
                    Business type *
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-gray-100 focus:outline-none focus:border-white/50"
                  >
                    <option value="gym">Gym / Fitness Centre</option>
                    <option value="mma">MMA / Combat Academy</option>
                    <option value="yoga">Yoga / Meditation Studio</option>
                    <option value="event">Event / Workshop Organizer</option>
                  </select>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1.5 text-gray-100">
                      Centre name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Example: Iron Pulse Fitness"
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1.5 text-gray-100">
                      Business phone *
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="text-orange-300 w-4 h-4" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Owner / front desk number"
                        className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/50"
                      />
                    </div>
                  </div>
                </div>

                {/* City & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1.5 text-gray-100">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Delhi, Mumbai, Goa"
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1.5 text-gray-100">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street, building, nearby landmark"
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/50"
                    />
                  </div>
                </div>

                {/* Passes */}
                <div>
                  <label className="block font-semibold mb-1.5 text-gray-100">
                    Custom passes (duration & price) *
                  </label>
                  <p className="text-[11px] text-gray-500 mb-2">
                    Add one-day, 3-day, 7-day or any short-term passes you want
                    to offer.
                  </p>
                  {passes.map((pass, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 mb-2 bg-black/40 border border-white/18 rounded-2xl px-3 py-2.5"
                    >
                      <input
                        type="number"
                        min="1"
                        placeholder="Duration (days)"
                        value={pass.duration}
                        onChange={(e) =>
                          handlePassChange(index, "duration", e.target.value)
                        }
                        className="w-1/2 bg-transparent border border-white/20 rounded-xl px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/50"
                      />
                      <div className="relative w-1/2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                          ₹
                        </span>
                        <input
                          type="number"
                          placeholder="Price"
                          value={pass.price}
                          onChange={(e) =>
                            handlePassChange(index, "price", e.target.value)
                          }
                          className="w-full bg-transparent border border-white/20 rounded-xl pl-6 pr-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/50"
                        />
                      </div>
                      {passes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePass(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPass}
                    className="mt-1 inline-flex items-center text-[11px] text-orange-200 hover:text-orange-100 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add another pass
                  </button>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold mb-1.5 text-gray-100">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about your vibe, coaching, community, peak hours, etc."
                    rows="3"
                    className="w-full bg-black/50 border border-white/20 rounded-2xl px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/50 resize-none"
                  />
                </div>

                {/* Facilities */}
                <div>
                  <label className="block font-semibold mb-1.5 text-gray-100">
                    Available facilities
                  </label>
                  <p className="text-[11px] text-gray-500 mb-2">
                    Select whatever is consistently available for day-pass
                    users.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {amenitiesList.map((item) => (
                      <label
                        key={item}
                        className="flex items-center space-x-2 text-[11px] md:text-xs text-gray-200 bg-black/40 border border-white/15 rounded-xl px-2.5 py-2 cursor-pointer hover:border-white/40"
                      >
                        <input
                          type="checkbox"
                          value={item}
                          onChange={handleFacilityChange}
                          checked={facilities.includes(item)}
                          className="accent-orange-400"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Verification Proofs */}
                <div>
                  <label className="block font-semibold mb-1.5 text-gray-100">
                    Verification documents
                  </label>
                  <p className="text-[11px] text-gray-500 mb-2">
                    These are kept private and used only for trust & safety
                    checks.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[11px] text-gray-300 mb-1">
                        Business proof (GST / registration)
                      </p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleProofUpload(e, "business")}
                        className="w-full text-[11px] bg-black/40 border border-white/20 rounded-xl px-2 py-2 text-gray-200"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-300 mb-1">
                        Owner ID (Aadhaar / PAN)
                      </p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleProofUpload(e, "owner")}
                        className="w-full text-[11px] bg-black/40 border border-white/20 rounded-xl px-2 py-2 text-gray-200"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-300 mb-1">
                        Intro video (optional)
                      </p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleProofUpload(e, "video")}
                        className="w-full text-[11px] bg-black/40 border border-white/20 rounded-xl px-2 py-2 text-gray-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block font-semibold mb-1.5 text-gray-100">
                    Upload centre images *
                  </label>
                  <p className="text-[11px] text-gray-500 mb-2">
                    Add your best angle: exterior, floor, equipment, class
                    setup etc.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-[11px] bg-black/40 border border-white/20 rounded-xl px-2 py-2 text-gray-200"
                  />
                  {uploading && (
                    <p className="text-orange-200 text-[11px] mt-1 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading
                      images...
                    </p>
                  )}
                  {images.length > 0 && (
                    <p className="text-emerald-300 text-[11px] mt-1">
                      {images.length} image(s) uploaded successfully.
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-full font-semibold flex items-center justify-center text-xs md:text-sm bg-gradient-to-r from-[#FF4B5C] to-[#FF9F68] text-gray-900 hover:opacity-95 hover:scale-[1.01] transition shadow-[0_22px_80px_rgba(0,0,0,0.95)]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                      Submitting...
                    </>
                  ) : (
                    "Submit partner details"
                  )}
                </button>

                <p className="text-[10px] text-gray-500 text-center mt-1">
                  By submitting, you confirm that all details are accurate and
                  that you have the authority to represent this business.
                </p>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
