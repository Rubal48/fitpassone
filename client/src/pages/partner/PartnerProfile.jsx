// src/pages/partner/PartnerProfile.jsx
import React, { useState, useEffect } from "react";
import { Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import API from "../../utils/api";

const THEME = {
  card: "rgba(15, 10, 24, 0.96)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
};

const PartnerProfile = () => {
  const { gym, refetchGym, isGym, isEventHost } = useOutletContext();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (gym) {
      setForm({
        name: gym.name || "",
        phone: gym.phone || "",
        email: gym.email || "",
        city: gym.city || "",
        address: gym.address || "",
        description: gym.description || "",
      });
    }
  }, [gym]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      // PUT /gyms/me updates the current partner's gym
      await API.put("/gyms/me", form);
      setSuccessMsg("Profile updated successfully. Your listing is now in sync.");
      refetchGym();
    } catch (err) {
      console.error("Error updating gym:", err);
      const msg =
        err?.response?.data?.message ||
        "Unable to update profile. Please try again.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const nameLabel = isEventHost ? "Brand / organiser name" : "Gym name";
  const descriptionPlaceholder = isEventHost
    ? "Example: Fitness festival and community events brand, focused on outdoor runs, bootcamps and city-wide wellness experiences…"
    : "Example: A strength-focused studio with small group coaching, open 6 AM – 10 PM with certified trainers…";

  const descriptionLength = form.description?.length || 0;
  const descriptionLimit = 400;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="mb-1 text-xs uppercase tracking-[0.22em] text-gray-500">
          profile
        </p>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Public listing & details
        </h1>
        <p className="mt-1 max-w-xl text-xs text-gray-400">
          {isEventHost
            ? "This is how your event brand appears on Passiify. Keep it clear, trustworthy and exciting for attendees."
            : "This is what users see on Passiify when they discover your gym. Keep it crisp, trustworthy and attractive."}
        </p>
      </div>

      {/* Alerts */}
      {(successMsg || errorMsg) && (
        <div className="space-y-2 text-xs">
          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-100">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Form + preview */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        {/* Left: basic info */}
        <div
          className="space-y-3 rounded-2xl border p-4"
          style={{
            backgroundColor: THEME.card,
            borderColor: THEME.borderSubtle,
          }}
        >
          <h2 className="text-sm font-medium">Basic info</h2>
          <p className="text-[11px] text-gray-500">
            These details show up on your public Passiify listing and in
            booking emails.
          </p>
          <div className="space-y-3 text-xs">
            <div>
              <label className="mb-1 block text-[11px] text-gray-400">
                {nameLabel}
              </label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-orange-500"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] text-gray-400">
                  Phone
                </label>
                <input
                  type="tel"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-orange-500"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-gray-400">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-orange-500"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] text-gray-400">
                  City
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-orange-500"
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-gray-400">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-orange-500"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: story, description, preview & save */}
        <div
          className="flex flex-col justify-between rounded-2xl border p-4"
          style={{
            backgroundColor: THEME.card,
            borderColor: THEME.borderSubtle,
          }}
        >
          <div className="space-y-3 text-xs">
            <div>
              <h2 className="text-sm font-medium">
                {isEventHost ? "Story & vibe (brand)" : "Story & vibe"}
              </h2>
              <p className="mt-1 text-[11px] text-gray-400">
                {isEventHost
                  ? "Tell attendees what kind of events you run, your community and what they can expect."
                  : "Tell users what makes your space special. This appears in the listing."}
              </p>
            </div>

            {/* Live preview */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-[11px] text-gray-200">
              <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">
                public preview
              </p>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {form.name || (isEventHost ? "Your Event Brand" : "Your Gym Name")}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {form.city || "Your city"}, {form.address || "Address will appear here"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-gray-300">
                    {form.description ||
                      (isEventHost
                        ? "Describe your events, vibe and audience so users know why they should attend."
                        : "Describe your training style, facilities and vibe so users know what to expect.")}
                  </p>
                </div>
                <span className="rounded-full bg-orange-500/15 px-2 py-1 text-[10px] font-medium text-orange-300">
                  Seen on Passiify
                </span>
              </div>
            </div>

            {/* Description field */}
            <div>
              <label className="mb-1 block text-[11px] text-gray-400">
                Description
              </label>
              <textarea
                rows={6}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-orange-500"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder={descriptionPlaceholder}
                maxLength={descriptionLimit}
              />
              <div className="mt-1 flex justify-between text-[10px] text-gray-500">
                <span>Keep it short & clear. No WhatsApp numbers here.</span>
                <span>
                  {descriptionLength}/{descriptionLimit}
                </span>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 text-xs font-medium text-black shadow shadow-orange-500/40 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PartnerProfile;
