// src/pages/partner/PartnerProfile.jsx
import React, { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
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
    try {
      // PUT /gyms/me updates the current partner's gym
      await API.put("/gyms/me", form);
      refetchGym();
    } catch (err) {
      console.error("Error updating gym:", err);
    } finally {
      setSaving(false);
    }
  };

  const nameLabel = isEventHost ? "Brand / organiser name" : "Gym name";
  const descriptionPlaceholder = isEventHost
    ? "Example: Fitness festival and community events brand, focused on outdoor runs, bootcamps and city-wide wellness experiences…"
    : "Example: A strength-focused studio with small group coaching, open 6 AM – 10 PM with certified trainers…";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500 mb-1">
          profile
        </p>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          Public listing & details
        </h1>
        <p className="text-xs text-gray-400 mt-1 max-w-xl">
          {isEventHost
            ? "This is how your event brand appears on Passiify. Keep it clear, trustworthy and exciting for attendees."
            : "This is what users see on Passiify when they discover your gym. Keep it crisp, trustworthy and attractive."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div
          className="rounded-2xl border p-4 space-y-3"
          style={{ backgroundColor: THEME.card, borderColor: THEME.borderSubtle }}
        >
          <h2 className="text-sm font-medium">Basic info</h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block mb-1 text-[11px] text-gray-400">
                {nameLabel}
              </label>
              <input
                type="text"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none focus:border-orange-500"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] text-gray-400">
                  Phone
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none focus:border-orange-500"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block mb-1 text-[11px] text-gray-400">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none focus:border-orange-500"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] text-gray-400">
                  City
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none focus:border-orange-500"
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block mb-1 text-[11px] text-gray-400">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none focus:border-orange-500"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border p-4 flex flex-col justify-between"
          style={{ backgroundColor: THEME.card, borderColor: THEME.borderSubtle }}
        >
          <div className="space-y-3 text-xs">
            <div>
              <h2 className="text-sm font-medium">
                {isEventHost ? "Story & vibe (brand)" : "Story & vibe"}
              </h2>
              <p className="text-[11px] text-gray-400 mt-1">
                {isEventHost
                  ? "Tell attendees what kind of events you run, your community and what they can expect."
                  : "Tell users what makes your space special. This appears in the listing."}
              </p>
            </div>
            <div>
              <label className="block mb-1 text-[11px] text-gray-400">
                Description
              </label>
              <textarea
                rows={6}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none focus:border-orange-500 resize-none"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder={descriptionPlaceholder}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs bg-gradient-to-r from-orange-500 to-amber-400 text-black font-medium shadow shadow-orange-500/40 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
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
