// src/pages/partner/PartnerPasses.jsx
import React, { useEffect, useState } from "react";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import API from "../../utils/api";

const THEME = {
  card: "rgba(15, 10, 24, 0.96)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
};

const initialFormState = {
  name: "",
  durationDays: "",
  basePrice: "",
  discountPercent: "",
  maxCheckIns: "",
  isActive: true,
  offerLabel: "",
};

const PartnerPasses = () => {
  const { gym, isGym } = useOutletContext();

  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(initialFormState);

  /* ============================
     Fetch passes
  ============================ */
  const fetchPasses = async () => {
    if (!isGym) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await API.get("/gyms/me/passes");
      const raw = res.data?.passes || res.data || [];
      // Make sure we always have an index to work with
      const withIndex = raw.map((p, index) => ({
        ...p,
        _index: index,
      }));
      setPasses(withIndex);
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

  /* ============================
     Derived preview values
  ============================ */
  const numericBasePrice = Number(form.basePrice) || 0;
  const numericDiscountPercent = Number(form.discountPercent) || 0;

  const clampedDiscount =
    numericDiscountPercent < 0
      ? 0
      : numericDiscountPercent > 95
      ? 95
      : numericDiscountPercent;

  const estimatedSalePrice =
    numericBasePrice > 0
      ? Math.round(
          numericBasePrice - (numericBasePrice * clampedDiscount) / 100
        )
      : 0;

  const estimatedSavings =
    numericBasePrice > 0 && estimatedSalePrice > 0
      ? numericBasePrice - estimatedSalePrice
      : 0;

  const resetForm = () => {
    setForm(initialFormState);
    setEditingIndex(null);
  };

  /* ============================
     Create / update pass
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isGym) return;

    setSaving(true);
    try {
      const duration = Number(form.durationDays) || 1;
      const basePrice = Number(form.basePrice) || 0;
      const discountRaw = Number(form.discountPercent) || 0;

      const discountPercent =
        discountRaw < 0 ? 0 : discountRaw > 95 ? 95 : discountRaw;

      const salePrice =
        basePrice > 0
          ? Math.round(basePrice - (basePrice * discountPercent) / 100)
          : 0;

      const payload = {
        name: (form.name || "").trim(),
        duration,
        durationDays: duration, // compatibility
        basePrice,
        salePrice,
        discountPercent,
        price: salePrice, // legacy compatibility
        maxCheckIns: Number(form.maxCheckIns) || 0,
        isActive: !!form.isActive,
        offerLabel: form.offerLabel?.trim() || undefined,
      };

      if (editingIndex !== null && editingIndex !== undefined) {
        // Update existing pass at this index
        await API.put(`/gyms/me/passes/${editingIndex}`, payload);
      } else {
        // Create new pass
        await API.post("/gyms/me/passes", payload);
      }

      resetForm();
      fetchPasses();
    } catch (err) {
      console.error("Error saving pass:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ============================
     Edit existing pass
  ============================ */
  const handleEditClick = (p, index) => {
    // Derive basePrice if it's missing but we have salePrice + discount
    let basePrice = 0;
    if (typeof p.basePrice === "number") {
      basePrice = p.basePrice;
    } else if (typeof p.mrp === "number") {
      basePrice = p.mrp;
    } else if (
      typeof p.salePrice === "number" &&
      typeof p.discountPercent === "number" &&
      p.discountPercent > 0
    ) {
      basePrice = Math.round(
        (p.salePrice * 100) / (100 - p.discountPercent)
      );
    } else if (typeof p.price === "number") {
      basePrice = p.price;
    }

    setEditingIndex(index);
    setForm({
      name: p.name || "",
      durationDays: p.durationDays || p.duration || "",
      basePrice: basePrice || "",
      discountPercent:
        typeof p.discountPercent === "number" ? p.discountPercent : "",
      maxCheckIns:
        typeof p.maxCheckIns === "number" ? p.maxCheckIns : "",
      isActive:
        typeof p.isActive === "boolean" ? p.isActive : true,
      offerLabel: p.offerLabel || "",
    });
  };

  /* ============================
     Delete pass
  ============================ */
  const handleDelete = async (index) => {
    const confirmed = window.confirm(
      "Remove this pass? It will no longer be visible to users."
    );
    if (!confirmed) return;

    setDeletingIndex(index);
    try {
      await API.delete(`/gyms/me/passes/${index}`);
      if (editingIndex === index) {
        resetForm();
      }
      fetchPasses();
    } catch (err) {
      console.error("Error deleting pass:", err);
    } finally {
      setDeletingIndex(null);
    }
  };

  /* ============================
     Non-gym partners
  ============================ */
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
            and tickets from the <span className="font-medium">My Events</span>{" "}
            and <span className="font-medium">Ticket Sales</span> sections
            instead of creating gym passes.
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

  /* ============================
     Gym partner view
  ============================ */
  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 mb-1">
            passes
          </p>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Flexible passes & discounts for {gym?.name || "your gym"}
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Set MRP and discounts for day, week or pack-based passes. Members
            will see the discounted price and how much they save on the Explore
            & booking pages.
          </p>
        </div>
      </div>

      {/* Create / edit pass form */}
      <div
        className="rounded-2xl border p-4 space-y-3"
        style={{ backgroundColor: THEME.card, borderColor: THEME.borderSubtle }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">
            {editingIndex !== null && editingIndex !== undefined
              ? "Edit pass"
              : "Create new pass"}
          </h2>
          <span className="text-[11px] text-gray-400">
            {editingIndex !== null && editingIndex !== undefined
              ? "Update MRP or discount, then save."
              : "Keep passes simple & clear for users"}
          </span>
        </div>

        <form
          className="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs"
          onSubmit={handleSubmit}
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
              placeholder="1, 3, 7…"
              value={form.durationDays}
              onChange={(e) =>
                setForm((f) => ({ ...f, durationDays: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[11px] text-gray-400">
              MRP (₹)
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none focus:border-orange-500"
              placeholder="e.g. 600"
              value={form.basePrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, basePrice: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[11px] text-gray-400">
              Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="95"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none focus:border-orange-500"
              placeholder="e.g. 20"
              value={form.discountPercent}
              onChange={(e) =>
                setForm((f) => ({ ...f, discountPercent: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block mb-1 text-[11px] text-gray-400">
              Offer label (optional)
            </label>
            <input
              type="text"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none focus:border-orange-500"
              placeholder="Launch offer, Weekend deal…"
              value={form.offerLabel}
              onChange={(e) =>
                setForm((f) => ({ ...f, offerLabel: e.target.value }))
              }
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

          {/* Preview + active toggle + submit */}
          <div className="md:col-span-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3 pt-1">
            <div className="space-y-1 text-[11px] text-gray-300">
              <label className="inline-flex items-center gap-2">
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

              <div className="text-[11px] text-gray-300">
                {numericBasePrice > 0 ? (
                  <>
                    User sees:{" "}
                    <span className="font-semibold">
                      ₹{estimatedSalePrice || numericBasePrice}
                    </span>{" "}
                    {clampedDiscount > 0 && estimatedSavings > 0 && (
                      <span className="text-emerald-300">
                        ({clampedDiscount}% OFF · You save ₹{estimatedSavings})
                      </span>
                    )}
                  </>
                ) : (
                  "Enter MRP and discount to see what users will pay."
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 md:justify-end">
              {editingIndex !== null && editingIndex !== undefined && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 rounded-xl text-xs border border-white/15 text-gray-200 bg-black/40 hover:bg-black/60"
                  disabled={saving}
                >
                  Cancel edit
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-gradient-to-r from-orange-500 to-amber-400 text-black font-medium shadow shadow-orange-500/40 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {editingIndex !== null && editingIndex !== undefined
                      ? "Saving…"
                      : "Creating…"}
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    {editingIndex !== null && editingIndex !== undefined
                      ? "Save changes"
                      : "Create pass"}
                  </>
                )}
              </button>
            </div>
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
            {passes.length} {passes.length === 1 ? "pass" : "passes"} total
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
                  <th className="text-left px-4 py-2 font-medium">Pricing</th>
                  <th className="text-left px-4 py-2 font-medium">
                    Max check-ins
                  </th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-right px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {passes.map((p, index) => {
                  // derive pricing safely
                  let basePrice =
                    typeof p.basePrice === "number"
                      ? p.basePrice
                      : typeof p.mrp === "number"
                      ? p.mrp
                      : typeof p.price === "number"
                      ? p.price
                      : 0;

                  let salePrice =
                    typeof p.salePrice === "number"
                      ? p.salePrice
                      : typeof p.price === "number"
                      ? p.price
                      : basePrice;

                  const hasDiscount =
                    basePrice && salePrice && salePrice < basePrice;

                  let discountPercent =
                    typeof p.discountPercent === "number" &&
                    p.discountPercent > 0
                      ? p.discountPercent
                      : hasDiscount
                      ? Math.round(
                          ((basePrice - salePrice) / basePrice) * 100
                        )
                      : 0;

                  if (discountPercent < 0) discountPercent = 0;

                  const savings =
                    basePrice && salePrice && salePrice < basePrice
                      ? basePrice - salePrice
                      : 0;

                  return (
                    <tr
                      key={index}
                      className="border-t border-white/5 hover:bg-white/5"
                    >
                      <td className="px-4 py-2">
                        <div className="font-medium text-gray-100">
                          {p.name || "Unnamed pass"}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {p.offerLabel
                            ? p.offerLabel
                            : p.description || "No description"}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {p.durationDays || p.duration || "-"} days
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col">
                          <div className="text-gray-100">
                            ₹{(salePrice || 0).toLocaleString()}
                          </div>
                          {hasDiscount && (
                            <div className="text-[11px] text-emerald-300">
                              <span className="line-through text-gray-400 mr-1">
                                ₹{(basePrice || 0).toLocaleString()}
                              </span>
                              {discountPercent}% OFF · Save ₹
                              {savings.toLocaleString()}
                            </div>
                          )}
                          {!hasDiscount && basePrice > 0 && (
                            <div className="text-[11px] text-gray-400">
                              Standard price (no discount)
                            </div>
                          )}
                        </div>
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
                          <button
                            type="button"
                            onClick={() => handleEditClick(p, index)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(index)}
                            disabled={deletingIndex === index}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-600/40 disabled:opacity-60"
                          >
                            {deletingIndex === index ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-300" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5 text-red-300" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerPasses;
