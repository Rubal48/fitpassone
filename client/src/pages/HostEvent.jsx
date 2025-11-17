import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  CalendarDays,
  Users,
  IndianRupee,
  ImageIcon,
  PenTool,
  Eye,
} from "lucide-react";
import API from "../utils/api";

/**
 * HostEvent.jsx
 * Multi-step premium Passiify "Host an Event" page (single-file)
 *
 * - Matches backend fields: name, description, location, date, category,
 *   price, capacity, image, organizer, personalNote
 * - Horizontal icon + label stepper (traveler-friendly)
 */

const categories = [
  { value: "adventure", label: "Adventure" },
  { value: "yoga", label: "Yoga" },
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "mindfulness", label: "Mindfulness" },
];

const StepIcon = ({ idx, active, done, Icon, label }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md transition ${
        done
          ? "bg-blue-600"
          : active
          ? "bg-gradient-to-r from-blue-600 to-orange-500"
          : "bg-gray-200 text-gray-600"
      }`}
    >
      {done ? <CheckCircle size={20} /> : <Icon size={18} />}
    </div>
    <span className={`mt-2 text-sm ${active ? "text-blue-700" : "text-gray-500"}`}>
      {label}
    </span>
  </div>
);

const HostEvent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "adventure",
    location: "",
    date: "",
    price: "",
    capacity: "",
    image: "",
    personalNote: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const steps = [
    { id: 0, label: "Basics", Icon: PenTool },
    { id: 1, label: "Details", Icon: CalendarDays },
    { id: 2, label: "Note & Image", Icon: ImageIcon },
    { id: 3, label: "Review", Icon: Eye },
  ];

  const update = (key, value) => {
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = "Event name is required";
      if (!form.description.trim()) e.description = "Description is required";
      if (!form.location.trim()) e.location = "Location is required";
    }
    if (s === 1) {
      if (!form.date) e.date = "Date is required";
      if (!form.price || Number(form.price) <= 0) e.price = "Enter a valid price";
      if (!form.capacity || Number(form.capacity) <= 0) e.capacity = "Enter capacity";
    }
    // step 2: optional checks for image/personalNote length
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep((p) => Math.min(p + 1, steps.length - 1));
  };

  const prevStep = () => setStep((p) => Math.max(p - 1, 0));

  const handlePublish = async () => {
    // final validation for all required fields
    const finalErrors = {};
    if (!form.name.trim()) finalErrors.name = "Event name is required";
    if (!form.description.trim()) finalErrors.description = "Description is required";
    if (!form.location.trim()) finalErrors.location = "Location is required";
    if (!form.date) finalErrors.date = "Date is required";
    if (!form.price || Number(form.price) <= 0) finalErrors.price = "Enter a valid price";
    if (!form.capacity || Number(form.capacity) <= 0) finalErrors.capacity = "Enter capacity";
    setErrors(finalErrors);
    if (Object.keys(finalErrors).length) {
      setStep(0);
      return;
    }

    // Organizer name from logged-in user (backend expects string)
    const organizerName = user?.name || user?.user?.name || form.organizer || "Passiify Community";

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      date: form.date,
      category: form.category || "adventure",
      price: Number(form.price),
      capacity: Number(form.capacity),
      image: form.image || undefined,
      organizer: organizerName,
      personalNote: form.personalNote || "",
    };

    try {
      setSubmitting(true);
      const res = await API.post("/events", payload);
      if (res?.data?.success) {
        // navigate to the newly created event detail
        const newEventId = res.data.event._id;
        navigate(`/events/${newEventId}`);
      } else {
        alert(res?.data?.message || "Failed to create event. Try again.");
      }
    } catch (err) {
      console.error("Create event failed:", err);
      alert("Server error while creating event. Check console.");
    } finally {
      setSubmitting(false);
    }
  };

  // simple preview thumbnail validity check
  const imagePreview = useMemo(() => {
    if (!form.image) return null;
    try {
      new URL(form.image);
      return form.image;
    } catch {
      return null;
    }
  }, [form.image]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white text-gray-800">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 font-medium hover:text-orange-500 transition"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="text-center">
          <h1 className="text-xl font-extrabold text-blue-700">Host an Event</h1>
          <p className="text-sm text-gray-500">Create a listing that travelers will love</p>
        </div>

        <div className="w-20" /> {/* placeholder for spacing */}
      </div>

      {/* Stepper */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="bg-white rounded-3xl shadow-md p-6">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => {
              const done = idx < step;
              const active = idx === step;
              return (
                <div key={s.id} className="flex-1">
                  <div className="flex items-center justify-center">
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        // allow jumping backwards but not to future steps
                        if (idx <= step) setStep(idx);
                      }}
                    >
                      <StepIcon
                        idx={idx}
                        Icon={s.Icon}
                        active={active}
                        done={done}
                        label={s.label}
                      />
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-1 mx-auto rounded-full mt-3 ${
                        idx < step ? "bg-blue-600" : "bg-gray-200"
                      }`}
                      style={{ width: "60%" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          {/* CONTENT FOR EACH STEP */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-blue-700">Event Basics</h2>
              <p className="text-gray-600">Name, short description, category and location.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Event Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g., Sunrise Trek to Triund"
                    className={`mt-2 w-full px-4 py-3 rounded-xl border ${
                      errors.name ? "border-red-400" : "border-gray-200"
                    } focus:ring-2 focus:ring-blue-200 outline-none`}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={4}
                    placeholder="Write a short, clear description about what attendees should expect..."
                    className={`mt-2 w-full px-4 py-3 rounded-xl border ${
                      errors.description ? "border-red-400" : "border-gray-200"
                    } focus:ring-2 focus:ring-blue-200 outline-none`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">Location</label>
                  <div className="mt-2 relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      value={form.location}
                      onChange={(e) => update("location", e.target.value)}
                      placeholder="e.g., Rishikesh, Uttarakhand"
                      className={`pl-10 w-full px-4 py-3 rounded-xl border ${
                        errors.location ? "border-red-400" : "border-gray-200"
                      } focus:ring-2 focus:ring-blue-200 outline-none`}
                    />
                  </div>
                  {errors.location && (
                    <p className="text-sm text-red-500 mt-1">{errors.location}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-blue-700">Pricing & Logistics</h2>
              <p className="text-gray-600">Set price, capacity and the event date.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Price (₹)</label>
                  <div className="mt-2 relative">
                    <IndianRupee className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(e) => update("price", e.target.value)}
                      placeholder="e.g., 499"
                      className={`pl-10 w-full px-4 py-3 rounded-xl border ${
                        errors.price ? "border-red-400" : "border-gray-200"
                      } focus:ring-2 focus:ring-blue-200 outline-none`}
                    />
                  </div>
                  {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">Capacity</label>
                  <div className="mt-2 relative">
                    <Users className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="number"
                      min="1"
                      value={form.capacity}
                      onChange={(e) => update("capacity", e.target.value)}
                      placeholder="e.g., 30"
                      className={`pl-10 w-full px-4 py-3 rounded-xl border ${
                        errors.capacity ? "border-red-400" : "border-gray-200"
                      } focus:ring-2 focus:ring-blue-200 outline-none`}
                    />
                  </div>
                  {errors.capacity && (
                    <p className="text-sm text-red-500 mt-1">{errors.capacity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">Event Date</label>
                  <div className="mt-2 relative">
                    <CalendarDays className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => update("date", e.target.value)}
                      className={`pl-10 w-full px-4 py-3 rounded-xl border ${
                        errors.date ? "border-red-400" : "border-gray-200"
                      } focus:ring-2 focus:ring-blue-200 outline-none`}
                    />
                  </div>
                  {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-blue-700">Image & Personal Note</h2>
              <p className="text-gray-600">
                Add a hero image and share a short personal note for travellers.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">Event Image URL</label>
                  <div className="mt-2 relative">
                    <ImageIcon className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      value={form.image}
                      onChange={(e) => update("image", e.target.value)}
                      placeholder="Paste image URL (recommended 1200x700)"
                      className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Tip: Use a bright, clear photo — travelers respond well to outdoor images.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center border border-dashed rounded-xl p-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-36 object-cover rounded-xl" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon size={40} />
                      <p className="text-sm mt-2">Preview will appear here</p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700">Organizer's Personal Note</label>
                  <textarea
                    value={form.personalNote}
                    onChange={(e) => update("personalNote", e.target.value)}
                    rows={4}
                    placeholder="Share why you run this event. Make it warm and personal — travellers love stories."
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-200 outline-none italic"
                  />
                  <p className="text-sm text-gray-400 mt-1">This will appear on the event page as a personal note.</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-blue-700">Review & Publish</h2>
              <p className="text-gray-600">Check everything. When ready, publish your event.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: preview card */}
                <div className="md:col-span-2 bg-gradient-to-b from-white to-blue-50 rounded-2xl p-4 shadow-md">
                  <div className="rounded-xl overflow-hidden">
                    <img
                      src={imagePreview || "/images/default-event.jpg"}
                      alt="hero"
                      className="w-full h-48 object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-bold text-blue-700">{form.name || "Untitled Event"}</h3>
                    <p className="text-sm text-gray-600 mt-2">{form.description}</p>

                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} /> {form.location || "-"}
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} /> {form.date || "-"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} /> {form.capacity || "-"} seats
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600">Category: <span className="font-medium text-gray-800">{(categories.find(c=>c.value===form.category)||{}).label || "Adventure"}</span></div>
                      <div className="text-lg font-bold text-blue-700">₹{form.price || "0"}</div>
                    </div>

                    {form.personalNote && (
                      <div className="mt-6 bg-gradient-to-br from-blue-50 to-orange-50 p-4 rounded-xl border border-blue-100 italic text-gray-700">
                        “{form.personalNote}”
                        <div className="mt-3 text-right text-sm text-orange-600 font-medium">— {user?.name || "Organizer"}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-gray-600">Organizer</div>
                    <div className="mt-2 font-semibold text-gray-800">{user?.name || "Passiify Community"}</div>
                    <div className="text-xs text-gray-400 mt-1">Make sure this is the name you want shown publicly.</div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-gray-600">Publish</div>
                    <div className="mt-2">
                      <button
                        onClick={handlePublish}
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-blue-700 to-orange-500 text-white px-4 py-3 rounded-full font-semibold hover:opacity-95 transition disabled:opacity-60"
                      >
                        {submitting ? "Publishing..." : "Publish Event"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">You can always edit the event later.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NAV BUTTONS */}
          <div className="mt-8 flex items-center justify-between">
            <div>
              {step > 0 && (
                <button
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-full shadow-sm hover:bg-gray-100 transition"
                >
                  ← Back
                </button>
              )}
            </div>

            <div>
              {step < steps.length - 1 && (
                <button
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-700 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center py-12 mt-10">
        <p className="text-sm text-gray-500">Need help? Reach out to the Passiify team.</p>
      </div>
    </div>
  );
};

export default HostEvent;
