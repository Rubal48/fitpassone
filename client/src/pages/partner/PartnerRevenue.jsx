// src/pages/partner/PartnerRevenue.jsx
import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Wallet,
  ArrowUpRight,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import API from "../../utils/api";

const THEME = {
  card: "rgba(15, 10, 24, 0.96)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
};

const PartnerRevenue = () => {
  const { gym, isGym, isEventHost } = useOutletContext();

  const [stats, setStats] = useState({
    lifetimeRevenue: 0,
    revenueThisMonth: 0,
    pendingPayout: 0,
    lastPayoutAmount: 0,
    lastPayoutDate: null,
    growthRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const brandName = gym?.name || (isEventHost ? "your brand" : "your gym");

  /* ============================
     FETCH REVENUE STATS
  ============================= */
  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      setError("");

      try {
        if (isEventHost && !isGym) {
          // 🎟 Event organiser – use event bookings overview
          const res = await API.get("/event-bookings/host/overview");
          const data = res.data || {};

          setStats((prev) => ({
            ...prev,
            lifetimeRevenue: data.lifetimeRevenue ?? prev.lifetimeRevenue ?? 0,
            revenueThisMonth: data.revenueThisMonth ?? 0,
            pendingPayout: data.pendingPayout ?? prev.pendingPayout ?? 0,
            lastPayoutAmount:
              data.lastPayoutAmount ?? prev.lastPayoutAmount ?? 0,
            lastPayoutDate: data.lastPayoutDate ?? prev.lastPayoutDate ?? null,
            growthRate: data.growthRate ?? 0,
          }));
        } else {
          // 🏋️ Gym partner (or mixed) – use gym stats
          const res = await API.get("/gyms/me/stats");
          const data = res.data || {};

          setStats((prev) => ({
            ...prev,
            lifetimeRevenue: data.lifetimeRevenue ?? prev.lifetimeRevenue ?? 0,
            revenueThisMonth: data.revenueThisMonth ?? 0,
            pendingPayout: data.pendingPayout ?? prev.pendingPayout ?? 0,
            lastPayoutAmount:
              data.lastPayoutAmount ?? prev.lastPayoutAmount ?? 0,
            lastPayoutDate: data.lastPayoutDate ?? prev.lastPayoutDate ?? null,
            growthRate: data.growthRate ?? 0,
          }));
        }
      } catch (err) {
        console.error("Error loading revenue stats:", err);
        const msg =
          err?.response?.data?.message ||
          "Unable to load revenue stats right now.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [isEventHost, isGym]);

  /* ============================
     DERIVED LABELS
  ============================= */
  const lifetimeLabelValue = `₹${Number(
    stats.lifetimeRevenue || 0
  ).toLocaleString()}`;

  const monthLabelValue = `₹${Number(
    stats.revenueThisMonth || 0
  ).toLocaleString()}`;

  const pendingLabelValue = `₹${Number(
    stats.pendingPayout || 0
  ).toLocaleString()}`;

  const lastPayoutLabelValue =
    stats.lastPayoutAmount && stats.lastPayoutAmount > 0
      ? `₹${Number(stats.lastPayoutAmount).toLocaleString()}${
          stats.lastPayoutDate
            ? ` · ${new Date(stats.lastPayoutDate).toLocaleDateString()}`
            : ""
        }`
      : "—";

  const growthHelper =
    stats.growthRate === 0
      ? "+0% vs last month"
      : `${stats.growthRate > 0 ? "+" : ""}${stats.growthRate}% vs last month`;

  const revenueCards = [
    {
      label: "Lifetime revenue",
      value: lifetimeLabelValue,
      helper: "Approx total before fees",
      icon: Wallet,
    },
    {
      label: "This month (gross)",
      value: monthLabelValue,
      helper: growthHelper,
      icon: ArrowUpRight,
    },
    {
      label: "Pending payout",
      value: pendingLabelValue,
      helper: "Estimated next settlement",
      icon: Wallet,
    },
    {
      label: "Last payout",
      value: lastPayoutLabelValue,
      helper: stats.lastPayoutAmount
        ? "Most recent completed payout"
        : "No payouts processed yet",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="mb-1 text-xs uppercase tracking-[0.22em] text-gray-500">
          revenue
        </p>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {isEventHost ? "Ticket revenue & payouts" : "Revenue & payouts"}
        </h1>
        <p className="mt-1 max-w-xl text-xs text-gray-400">
          {isEventHost
            ? `Track ticket revenue from your events, settlement timelines and downloadable statements for ${brandName}. Connected to your event bookings so it can reflect real sales once your billing APIs are wired.`
            : `Track earnings from passes, bookings and add-ons for ${brandName}. Connected to your gym stats so it can reflect live monthly earnings once your payouts are plugged in.`}
        </p>
        <p className="mt-2 text-[11px] text-orange-300/80">
          {loading
            ? "Syncing latest revenue numbers…"
            : "Some values may still be placeholders until full billing & payout APIs are connected."}
        </p>
      </div>

      {/* Error banner (if any) */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {revenueCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex flex-col justify-between rounded-2xl border p-4 shadow-lg shadow-black/40"
              style={{
                background:
                  card.label === "This month (gross)"
                    ? "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(10,8,18,0.98))"
                    : THEME.card,
                borderColor: THEME.borderSubtle,
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                  {card.label}
                </p>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/5">
                  <Icon className="h-3.5 w-3.5 text-gray-100" />
                </div>
              </div>
              <p className="text-xl font-semibold text-gray-50">
                {card.value}
              </p>
              <p className="mt-1 text-[11px] text-gray-400">{card.helper}</p>
            </div>
          );
        })}
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue analytics explanation */}
        <div
          className="space-y-2 rounded-2xl border bg-black/40 p-4 text-xs text-gray-300 shadow-lg shadow-black/40"
          style={{
            backgroundColor: THEME.card,
            borderColor: THEME.borderSubtle,
          }}
        >
          <p className="text-sm font-medium">
            {isEventHost
              ? "Revenue analytics for hosts"
              : "Revenue analytics for gyms"}
          </p>
          <ul className="list-inside list-disc space-y-1 text-[11px] text-gray-400">
            {isEventHost ? (
              <>
                <li>
                  Breakdown of ticket revenue by event, ticket tier and date.
                </li>
                <li>
                  Overview of Passiify fees vs net payouts to your account.
                </li>
                <li>Upcoming settlement schedule for completed events.</li>
                <li>
                  Exports for GST/invoicing and accountant use (CSV / PDF).
                </li>
              </>
            ) : (
              <>
                <li>
                  Monthly revenue from passes, one-time bookings and add-ons.
                </li>
                <li>
                  Breakdown of Passiify fees vs net payouts to your gym.
                </li>
                <li>Settlement timelines and payout status for each period.</li>
                <li>Exports for accounting and tax filing (CSV / PDF).</li>
              </>
            )}
          </ul>
          <p className="mt-1 text-[11px] text-gray-500">
            Once your billing and payouts APIs are ready, we&apos;ll plug them
            in here without changing the UI — giving you a live
            Stripe/Paytm-style view of your business inside Passiify.
          </p>
        </div>

        {/* Payout schedule / statements */}
        <div
          className="space-y-3 rounded-2xl border bg-black/40 p-4 text-xs text-gray-300 shadow-lg shadow-black/40"
          style={{
            backgroundColor: THEME.card,
            borderColor: THEME.borderSubtle,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Payouts</p>
              <p className="text-sm font-semibold">Payout schedule</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-200">
              Sample preview
            </span>
          </div>

          <div className="space-y-2 text-[11px] text-gray-400">
            <p>
              Typically, payouts can be configured as{" "}
              <span className="font-medium text-gray-200">
                weekly or bi-weekly
              </span>{" "}
              depending on your agreement with Passiify and your payment
              gateway (Stripe, Razorpay, etc.).
            </p>
            <p>
              Here you&apos;ll see each settlement window with:
              <br />
              • Gross revenue · Platform fees · Taxes · Final payout
            </p>
          </div>

          <div className="mt-2 rounded-xl border border-dashed border-white/15 bg-black/30 p-3 text-[11px] text-gray-400">
            <p className="mb-1 text-xs font-medium text-gray-200">
              Statements & exports
            </p>
            <p>
              Partners will be able to download:
              <br />
              • Monthly PDF statements
              <br />
              • CSV exports for accountants
              <br />• Event / pass-level reports
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerRevenue;
