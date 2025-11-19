// src/pages/HostEvent.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  CalendarDays,
  Users,
  IndianRupee,
  ImageIcon,
  PenTool,
  Eye,
  Globe2,
  ShieldCheck,
  Tag,
  Languages,
  Clock3,
  Info,
  Sparkles,
} from "lucide-react";
import API from "../utils/api";

/**
 * Passiify · HostEvent
 * Premium, multi-step host flow aligned with Event schema:
 * - name, description, location, date, category, price, capacity, image
 * - organizer, personalNote
 * - isOnline, meetingPoint, meetingInstructions
 * - languages (array), tags (array)
 * - checkInRequired (bool)
 * - cancellationPolicy { type, freeCancellationHours, refundPercentBefore, refundPercentAfter }
 */

const categories = [
  { value: "adventure", label: "Adventure" },
  { value: "yoga", label: "Yoga" },
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "mindfulness", label: "Mindfulness" },
];

const cancellationOptions = [
  {
    value: "flexible",
    label: "Flexible",
    description: "Full refund until 24 hours before, partial after.",
    defaultHours: 24,
    defaultBefore: 100,
    defaultAfter: 50,
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Full refund until 72 hours before, no refund after.",
    defaultHours: 72,
    defaultBefore: 100,
    defaultAfter: 0,
  },
  {
    value: "strict",
    label: "Strict",
    description: "Partial refund until 7 days before.",
    defaultHours: 168,
    defaultBefore: 50,
    defaultAfter: 0,
  },
  {
    value: "none",
    label: "No refunds",
    description: "All sales final. Use only for very limited spots.",
    defaultHours: 0,
    defaultBefore: 0,
    defaultAfter: 0,
  },
];

const StepIcon = ({ active, done, Icon, label }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-[0_10px_30px_rgba(15,23,42,0.45)] border transition
      ${
        done
          ? "bg-gradient-to-r from-emerald-400 to-sky-500 text-slate-950 border-emerald-300"
          : active
          ? "bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-white border-white/60"
          : "bg-white/70 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-slate-200/70 dark:border-slate-700/70"
      }`}
    >
      {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
    </div>
    <span
      className={`mt-2 text-[11px] sm:text-xs font-medium ${
        active
          ? "text-slate-900 dark:text-slate-50"
          : "text-slate-500 dark:text-slate-400"
      }`}
    >
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
    // extended fields:
    isOnline: false,
    meetingPoint: "",
    meetingInstructions: "",
    languagesInput: "English, Hindi",
    tagsInput: "sunrise, outdoors, beginner-friendly",
    cancellationType: "flexible",
    freeCancellationHours: 24,
    refundPercentBefore: 100,
    refundPercentAfter: 50,
    checkInRequired: true,
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
    { id: 0, label: "Event basics", Icon: PenTool },
    { id: 1, label: "Pricing & date", Icon: CalendarDays },
    { id: 2, label: "Experience vibe", Icon: Globe2 },
    { id: 3, label: "Policy & review", Icon: Eye },
  ];

  const update = (key, value) => {
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggle = (key) => {
    setForm((s) => ({ ...s, [key]: !s[key] }));
  };

  const applyCancellationPreset = (value) => {
    const option = cancellationOptions.find((c) => c.value === value);
    if (!option) return;
    setForm((s) => ({
      ...s,
      cancellationType: value,
      freeCancellationHours: option.defaultHours,
      refundPercentBefore: option.defaultBefore,
      refundPercentAfter: option.defaultAfter,
    }));
    setErrors((e) => ({ ...e, cancellationType: undefined }));
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = "Event name is required.";
      if (!form.description.trim())
        e.description = "Tell guests what this experience is about.";
      if (!form.location.trim())
        e.location = "Location or city is required.";
    }
    if (s === 1) {
      if (!form.date) e.date = "Pick a date for your event.";
      if (!form.price || Number(form.price) <= 0)
        e.price = "Enter a valid price.";
      if (!form.capacity || Number(form.capacity) <= 0)
        e.capacity = "Add a seat limit (can be approximate).";
    }
    if (s === 3) {
      if (!form.cancellationType)
        e.cancellationType = "Choose a cancellation policy.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep((p) => Math.min(p + 1, steps.length - 1));
  };

  const prevStep = () => setStep((p) => Math.max(p - 1, 0));

  const languagesArray = useMemo(
    () =>
      (form.languagesInput || "")
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
    [form.languagesInput]
  );

  const tagsArray = useMemo(
    () =>
      (form.tagsInput || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [form.tagsInput]
  );

  const imagePreview = useMemo(() => {
    if (!form.image) return null;
    try {
      new URL(form.image);
      return form.image;
    } catch {
      return null;
    }
  }, [form.image]);

  const selectedCategoryLabel =
    categories.find((c) => c.value === form.category)?.label || "Adventure";

  const selectedPolicy = cancellationOptions.find(
    (c) => c.value === form.cancellationType
  );

  const handlePublish = async () => {
    // final validation
    const finalErrors = {};
    if (!form.name.trim()) finalErrors.name = "Event name is required.";
    if (!form.description.trim())
      finalErrors.description = "Description is required.";
    if (!form.location.trim())
      finalErrors.location = "Location is required.";
    if (!form.date) finalErrors.date = "Date is required.";
    if (!form.price || Number(form.price) <= 0)
      finalErrors.price = "Enter a valid price.";
    if (!form.capacity || Number(form.capacity) <= 0)
      finalErrors.capacity = "Enter capacity.";
    if (!form.cancellationType)
      finalErrors.cancellationType = "Choose a cancellation policy.";

    setErrors(finalErrors);
    if (Object.keys(finalErrors).length) {
      setStep(0);
      return;
    }

    const organizerName =
      user?.name || user?.user?.name || "Passiify Community";

    const cancellationPolicy = {
      type: form.cancellationType,
      freeCancellationHours: Number(form.freeCancellationHours) || 24,
      refundPercentBefore: Number(form.refundPercentBefore) || 100,
      refundPercentAfter: Number(form.refundPercentAfter) || 0,
    };

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
      isOnline: !!form.isOnline,
      meetingPoint: form.meetingPoint || undefined,
      meetingInstructions: form.meetingInstructions || undefined,
      languages: languagesArray.length ? languagesArray : undefined,
      tags: tagsArray.length ? tagsArray : undefined,
      checkInRequired: !!form.checkInRequired,
      cancellationPolicy,
    };

    try {
      setSubmitting(true);
      const res = await API.post("/events", payload);
      if (res?.data?.success && res.data.event?._id) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[360px] h-[360px] bg-sky-500/20 dark:bg-sky-500/28 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[380px] h-[380px] bg-orange-500/18 dark:bg-orange-500/25 rounded-full blur-3xl" />
      </div>

      {/* Top header bar */}
      <header className="relative border-b border-slate-200/70 dark:border-slate-800/80 bg-white/75 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-orange-300 transition"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
              Passiify · Host an experience
            </p>
            <h1 className="text-base sm:text-lg font-semibold mt-1">
              Turn your idea into a bookable event
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Protected payouts & guest support</span>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        {/* Hero / value strip */}
        <section className="mb-6 sm:mb-8 grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4 sm:gap-6 items-stretch">
          <div className="rounded-3xl bg-white/80 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800/80 shadow-[0_18px_70px_rgba(15,23,42,0.35)] backdrop-blur-xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Host with{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 bg-clip-text text-transparent">
                    Passiify
                  </span>
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg">
                  Publish a morning trek, yoga circle, mindfulness retreat or
                  pop-up workout. We’ll handle tickets, check-ins and payouts,
                  you focus on the experience.
                </p>
              </div>
              <div className="hidden sm:flex flex-col items-end text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Early host program
                </span>
                <span className="mt-1 opacity-80">
                  Lower fees & priority features
                </span>
              </div>
            </div>

            {/* Stepper */}
            <div className="mt-4">
              <div className="flex items-center justify-between gap-1 sm:gap-2">
                {steps.map((s, idx) => {
                  const done = idx < step;
                  const active = idx === step;
                  return (
                    <div key={s.id} className="flex-1">
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          className="focus:outline-none"
                          onClick={() => {
                            if (idx <= step) setStep(idx);
                          }}
                        >
                          <StepIcon
                            Icon={s.Icon}
                            active={active}
                            done={done}
                            label={s.label}
                          />
                        </button>
                        {idx < steps.length - 1 && (
                          <div className="w-full flex justify-center">
                            <div
                              className={`h-1 mt-3 rounded-full transition-all duration-300 w-4/5 ${
                                idx < step
                                  ? "bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400"
                                  : "bg-slate-200 dark:bg-slate-800"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="hidden lg:flex flex-col justify-between rounded-3xl bg-gradient-to-b from-blue-600 via-sky-500 to-orange-500 text-slate-950 shadow-[0_22px_80px_rgba(15,23,42,0.45)] border border-white/70 backdrop-blur-xl p-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 text-[11px] font-semibold uppercase tracking-[0.2em]">
                <Globe2 className="w-3.5 h-3.5" />
                Travel-ready guests
              </div>
              <p className="mt-3 text-sm">
                List once. We surface your event to travellers, expats and
                locals who want one-off experiences — not memberships.
              </p>
            </div>
            <div className="mt-4 text-[11px] space-y-1 opacity-90">
              <p className="font-semibold text-sm mb-1">Why hosts love it</p>
              <p>• Simple, one-page setup and edit anytime</p>
              <p>• Auto-generated tickets & check-in tools</p>
              <p>• Clear payout view for each event</p>
            </div>
          </aside>
        </section>

        {/* Form / content card */}
        <section className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] gap-6 items-start">
          <div className="bg-white/90 dark:bg-slate-950/85 border border-slate-200/70 dark:border-slate-800/80 rounded-3xl shadow-[0_22px_80px_rgba(15,23,42,0.4)] backdrop-blur-xl p-5 sm:p-7">
            {/* STEP 0: basics */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
                    Event basics
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Name, category, story and where this happens.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Event name
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g., Sunrise Trek to Triund"
                      className={`mt-2 w-full px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40 bg-white/90 dark:bg-slate-950/90 ${
                        errors.name
                          ? "border-rose-400"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => update("category", e.target.value)}
                      className="mt-2 w-full px-4 py-3 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-950/90 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40"
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      rows={4}
                      placeholder="What happens, who is it for, what should guests expect?"
                      className={`mt-2 w-full px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40 bg-white/90 dark:bg-slate-950/90 ${
                        errors.description
                          ? "border-rose-400"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    />
                    {errors.description && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Location / city
                    </label>
                    <div className="mt-2 relative">
                      <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        value={form.location}
                        onChange={(e) => update("location", e.target.value)}
                        placeholder="e.g., Old Manali, Himachal Pradesh"
                        className={`pl-9 w-full px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40 bg-white/90 dark:bg-slate-950/90 ${
                          errors.location
                            ? "border-rose-400"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {errors.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: pricing & date */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
                    Pricing & logistics
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Set your price, capacity and event date.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Price (per guest)
                    </label>
                    <div className="mt-2 relative">
                      <IndianRupee className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(e) => update("price", e.target.value)}
                        placeholder="e.g., 999"
                        className={`pl-9 w-full px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40 bg-white/90 dark:bg-slate-950/90 ${
                          errors.price
                            ? "border-rose-400"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Capacity
                    </label>
                    <div className="mt-2 relative">
                      <Users className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min="1"
                        value={form.capacity}
                        onChange={(e) => update("capacity", e.target.value)}
                        placeholder="e.g., 20"
                        className={`pl-9 w-full px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40 bg-white/90 dark:bg-slate-950/90 ${
                          errors.capacity
                            ? "border-rose-400"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                    </div>
                    {errors.capacity && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {errors.capacity}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Event date
                    </label>
                    <div className="mt-2 relative">
                      <CalendarDays className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => update("date", e.target.value)}
                        className={`pl-9 w-full px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40 bg-white/90 dark:bg-slate-950/90 ${
                          errors.date
                            ? "border-rose-400"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {errors.date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60 p-4 flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <Info className="w-4 h-4 mt-0.5 text-sky-500" />
                  <div>
                    <p className="font-semibold mb-1">
                      You control your pricing.
                    </p>
                    <p>
                      You can edit price, date or capacity later from your host
                      dashboard. Passiify adds a small guest fee on top.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: experience vibe */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
                    Experience vibe
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Make it easy for guests to understand the mood, format and
                    logistics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Event image URL
                    </label>
                    <div className="mt-2 relative">
                      <ImageIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        value={form.image}
                        onChange={(e) => update("image", e.target.value)}
                        placeholder="Paste an image URL (ideally 1200x700, bright and clear)"
                        className="pl-9 w-full px-4 py-3 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-950/90 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Languages
                    </label>
                    <div className="mt-2 relative">
                      <Languages className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        value={form.languagesInput}
                        onChange={(e) =>
                          update("languagesInput", e.target.value)
                        }
                        placeholder="e.g., English, Hindi"
                        className="pl-9 w-full px-4 py-3 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-950/90 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Guests see this on the event card.
                    </p>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Tags
                    </label>
                    <div className="mt-2 relative">
                      <Tag className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        value={form.tagsInput}
                        onChange={(e) => update("tagsInput", e.target.value)}
                        placeholder="e.g., beginner, sunrise, women-only"
                        className="pl-9 w-full px-4 py-3 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-950/90 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Comma-separated — we’ll turn them into chips.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Is this online?
                    </label>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggle("isOnline")}
                        className={`relative inline-flex items-center h-7 w-12 rounded-full border transition ${
                          form.isOnline
                            ? "bg-emerald-500 border-emerald-400"
                            : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ${
                            form.isOnline ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        {form.isOnline
                          ? "Yes, this happens fully online."
                          : "No, guests meet you at a physical location."}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Meeting point (for offline events)
                    </label>
                    <input
                      value={form.meetingPoint}
                      onChange={(e) => update("meetingPoint", e.target.value)}
                      placeholder="e.g., Gate 3, Lodhi Garden"
                      className="mt-2 w-full px-4 py-3 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-950/90 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Meeting instructions
                    </label>
                    <textarea
                      value={form.meetingInstructions}
                      onChange={(e) =>
                        update("meetingInstructions", e.target.value)
                      }
                      rows={3}
                      placeholder="Landmarks, what to bring, how to find you, any safety notes."
                      className="mt-2 w-full px-4 py-3 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-950/90 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Personal note to guests
                    </label>
                    <textarea
                      value={form.personalNote}
                      onChange={(e) =>
                        update("personalNote", e.target.value)
                      }
                      rows={3}
                      placeholder="Why you host this, what kind of people usually join, anything encouraging. This appears on the event page."
                      className="mt-2 w-full px-4 py-3 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-950/90 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40 italic"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: policy & review */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
                    Cancellation & review
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Choose a refund policy and preview how guests will see
                    your event.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] gap-5">
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Cancellation policy
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {cancellationOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => applyCancellationPreset(opt.value)}
                          className={`text-left rounded-2xl border p-3 text-xs sm:text-sm transition bg-white/90 dark:bg-slate-950/90 hover:border-sky-400/70 hover:shadow-sm ${
                            form.cancellationType === opt.value
                              ? "border-sky-500 dark:border-sky-400 shadow-[0_12px_40px_rgba(15,23,42,0.35)]"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold">{opt.label}</span>
                            {form.cancellationType === opt.value && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {opt.description}
                          </p>
                        </button>
                      ))}
                    </div>
                    {errors.cancellationType && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {errors.cancellationType}
                      </p>
                    )}

                    {form.cancellationType !== "none" && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                            Free cancel (hours)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={form.freeCancellationHours}
                            onChange={(e) =>
                              update(
                                "freeCancellationHours",
                                e.target.value
                              )
                            }
                            className="mt-1 w-full px-3 py-2 rounded-2xl text-xs border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-950/90 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                            Refund before (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={form.refundPercentBefore}
                            onChange={(e) =>
                              update(
                                "refundPercentBefore",
                                e.target.value
                              )
                            }
                            className="mt-1 w-full px-3 py-2 rounded-2xl text-xs border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-950/90 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                            Refund after (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={form.refundPercentAfter}
                            onChange={(e) =>
                              update(
                                "refundPercentAfter",
                                e.target.value
                              )
                            }
                            className="mt-1 w-full px-3 py-2 rounded-2xl text-xs border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-950/90 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40"
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-3 text-xs sm:text-sm">
                      <button
                        type="button"
                        onClick={() => toggle("checkInRequired")}
                        className={`relative inline-flex items-center h-7 w-12 rounded-full border transition ${
                          form.checkInRequired
                            ? "bg-emerald-500 border-emerald-400"
                            : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ${
                            form.checkInRequired
                              ? "translate-x-5"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          Check-in required
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Hosts can scan or verify tickets at the venue before
                          guests join.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60 p-3 flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <Clock3 className="w-4 h-4 mt-0.5 text-sky-500" />
                      <p>
                        Guests see a simple line like:{" "}
                        <span className="font-medium">
                          {selectedPolicy?.label || "Flexible"} · Free cancel{" "}
                          {form.freeCancellationHours || 24}h before ·{" "}
                          {form.refundPercentBefore || 100}% refund before,
                          {` `}
                          {form.refundPercentAfter || 0}% after.
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Preview card */}
                  <div className="bg-gradient-to-b from-white/95 via-sky-50/70 to-slate-50/80 dark:from-slate-950/95 dark:via-slate-950/90 dark:to-slate-950/95 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-[0_16px_60px_rgba(15,23,42,0.4)] overflow-hidden">
                    <div className="relative h-40 sm:h-48 overflow-hidden">
                      <img
                        src={
                          imagePreview ||
                          "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1200&auto=format&fit=crop&q=80"
                        }
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute top-3 left-3 text-[11px] px-2.5 py-1 rounded-full bg-black/50 text-white flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-orange-300" />
                        <span>{form.date || "Choose date"}</span>
                      </div>
                      <div className="absolute top-3 right-3 text-[11px] px-2.5 py-1 rounded-full bg-black/50 text-white flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-300" />
                        <span>
                          {form.capacity ? `${form.capacity} spots` : "Capacity"}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-1">
                          {form.name || "Untitled Passiify Experience"}
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {form.location || "Add location"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 text-xs sm:text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <Globe2 className="w-3.5 h-3.5" />
                          {form.isOnline ? "Online session" : "Offline meetup"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          ₹{form.price || "—"}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                        {form.description ||
                          "Your description preview will appear here so you can feel what guests see on the listing."}
                      </p>

                      {tagsArray.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tagsArray.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                            >
                              #{tag}
                            </span>
                          ))}
                          {tagsArray.length > 4 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                              +{tagsArray.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {form.personalNote && (
                        <div className="mt-1 bg-gradient-to-br from-sky-50 to-orange-50 dark:from-slate-900 dark:to-slate-900/80 p-3 rounded-xl border border-sky-100/80 dark:border-slate-700/80 italic text-[11px] text-slate-700 dark:text-slate-100">
                          “{form.personalNote}”
                          <div className="mt-2 text-right text-[11px] text-orange-600 dark:text-orange-300 font-medium">
                            — {user?.name || "Host"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom nav buttons */}
            <div className="mt-7 flex items-center justify-between">
              <div>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                )}
              </div>

              <div>
                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-sky-500 to-orange-500 text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-[0_18px_60px_rgba(15,23,42,0.7)] hover:scale-[1.03] hover:shadow-[0_22px_80px_rgba(15,23,42,0.9)] transition-transform"
                  >
                    Next step
                    <ArrowLeft
                      size={14}
                      className="rotate-180 translate-y-[0.5px]"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-sky-500 to-orange-500 text-slate-950 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-[0_20px_70px_rgba(15,23,42,0.9)] hover:scale-[1.03] hover:shadow-[0_24px_90px_rgba(15,23,42,1)] transition-transform disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {submitting ? "Publishing…" : "Publish experience"}
                    {!submitting && <Sparkles className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right side: host summary */}
          <aside className="space-y-4">
            <div className="rounded-3xl bg-white/90 dark:bg-slate-950/85 border border-slate-200/70 dark:border-slate-800/80 shadow-[0_18px_70px_rgba(15,23,42,0.4)] backdrop-blur-xl p-5 text-xs sm:text-sm">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em] mb-2">
                Host profile
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {user?.name || "Passiify host"}
              </p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                This name appears on your event pages. You can change it in
                your account settings.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-900/95 dark:bg-black/80 border border-slate-700/80 text-slate-100 shadow-[0_18px_70px_rgba(15,23,42,0.7)] p-5 text-xs sm:text-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <p className="font-semibold">Host protections</p>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li>• Guests pay upfront, you see clear payouts per event.</li>
                <li>• Built-in check-in tools prevent casual fraud.</li>
                <li>• Support team to help with disputes or no-shows.</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default HostEvent;
