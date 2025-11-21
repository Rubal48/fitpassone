// src/pages/partner/PartnerPasses.jsx
import React, { useEffect, useState } from "react";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import API from "../../utils/api";

const THEME = {
  card: "rgba(15, 10, 24, 0.96)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
};

const PartnerPasses = () => {
  const { gym, isGym, isEventHost } = useOutletContext();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    durationDays: "",
    price: "",
    maxCheckIns: "",
    isActive: true,
  });

  const fetchPasses = async () => {
    if (!isGym) return; // 🔒 do nothing if not a gym-type partner

    setLoading(true);
    try {
      // Adjust to your backend:
      // e.g. GET /gyms/me/passes  or  GET /passes?gymId=...
      const res = await API.get("/gyms/me/passes");
      setPasses(res.data?.passes || res.data || []);
    } catch (err) {
      console.error("Error loading passes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGym) {
      fetchPasses();
    } else {
      setLoading(false);
    }
  }, [isGym]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isGym) return;

    setCreating(true);
    try {
      const payload = {
        name: form.name,
        durationDays: Number(form.durationDays) || 1,
        price: Number(form.price) || 0,
        maxCheckIns: Number(form.maxCheckIns) || 0,
        isActive: form.isActive,
      };

      // Adjust to your backend:
      // e.g. POST /gyms/me/passes
      await API.post("/gyms/me/passes", payload);
      setForm({
        name: "",
        durationDays: "",
        price: "",
        maxCheckIns: "",
        isActive: true,
      });
      fetchPasses();
    } catch (err) {
      console.error("Error creating pass:", err);
    } finally {
      setCreating(false);
    }
  };

  // 🧱 If this is an event host, show info instead of passes UI
  if (!isGym) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 mb-1">
            passes
          </p>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Passes are only for gym partners
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            This account is set up as an event host. You can manage your events
            and tickets from the{" "}
            <span className="font-medium">My Events</span> and{" "}
            <span className="font-medium">Ticket Sales</span> sections instead
            of creating gym passes.
          </p>
        </div>

        <div
          className="rounded-2xl border p-4 text-xs text-gray-300"
          style={{ backgroundColor: THEME.card, borderColor: THEME.borderSubtle }}
        >
          <p className="mb-1 font-medium text-sm">How it works for hosts</p>
          <ul className="list-disc list-inside text-[11px] text-gray-400 space-y-1">
            <li>Create and manage events from the <b>My Events</b> tab.</li>
            <li>Configure ticket tiers and pricing per event.</li>
            <li>Track ticket sales and check-ins under <b>Ticket Sales</b>.</li>
          </ul>
        </div>
      </div>
    );
  }

  // 🏋️ Gym partner view (full pass management)
  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 mb-1">
            passes
          </p>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Flexible passes for {gym?.name || "your gym"}
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Create daily, weekly or pack-based passes and control pricing,
            limits and availability.
          </p>
        </div>
      </div>

      {/* Create pass form */}
      <div
        className="rounded-2xl border p-4 space-y-3"
        style={{ backgroundColor: THEME.card, borderColor: THEME.borderSubtle }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Create new pass</h2>
          <span className="text-[11px] text-gray-400">
            Keep passes simple & clear for users
          </span>
        </div>
        <form
          className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs"
          onSubmit={handleCreate}
        >
          <div className="md:col-span-2">
            <label className="block mb-1 text-[11px] text-gray-400">
              Pass name
            </label>
            <input
              type="text"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none focus:border-orange-500"
              placeholder="Day Pass, Weekly Unlimited, Class Pack…"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[11px] text-gray-400">
              Duration (days)
            </label>
            <input
              type="number"
              min="1"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none focus:border-orange-500"
              placeholder="7"
              value={form.durationDays}
              onChange={(e) =>
                setForm((f) => ({ ...f, durationDays: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[11px] text-gray-400">
              Price (₹)
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none focus:border-orange-500"
              placeholder="599"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[11px] text-gray-400">
              Max check-ins
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none focus:border-orange-500"
              placeholder="0 = unlimited"
              value={form.maxCheckIns}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxCheckIns: e.target.value }))
              }
            />
          </div>

          <div className="flex items-end gap-2 md:col-span-5 justify-between">
            <label className="inline-flex items-center gap-2 text-[11px] text-gray-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
                className="w-3.5 h-3.5 rounded border border-white/20 bg-black/60"
              />
              Active & visible to users
            </label>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-gradient-to-r from-orange-500 to-amber-400 text-black font-medium shadow shadow-orange-500/40 disabled:opacity-60"
            >
              {creating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Create pass
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Passes table */}
      <div
        className="rounded-2xl border"
        style={{ backgroundColor: THEME.card, borderColor: THEME.borderSubtle }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-medium">Existing passes</h2>
          <p className="text-[11px] text-gray-400">
            {passes.length} {passes.length === 1 ? "pass" : "passes"} active
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-300 gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading passes…
          </div>
        ) : passes.length === 0 ? (
          <div className="px-4 py-6 text-xs text-gray-400">
            No passes yet. Create your first pass above to start selling access.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-black/30 text-gray-400">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-4 py-2 font-medium">Duration</th>
                  <th className="text-left px-4 py-2 font-medium">Price</th>
                  <th className="text-left px-4 py-2 font-medium">
                    Max check-ins
                  </th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-right px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {passes.map((p) => (
                  <tr
                    key={p._id || p.id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-100">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {p.description || "No description"}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {p.durationDays || p.duration || "-"} days
                    </td>
                    <td className="px-4 py-2">
                      ₹{(p.price || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      {p.maxCheckIns === 0 || p.maxCheckIns == null
                        ? "Unlimited"
                        : p.maxCheckIns}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] ${
                          p.isActive
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                            : "bg-gray-500/10 text-gray-300 border border-gray-500/40"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-red-600/40">
                          <Trash2 className="w-3.5 h-3.5 text-red-300" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerPasses;
