// src/pages/partner/PartnerRevenue.jsx
import React from "react";
import { useOutletContext } from "react-router-dom";

const THEME = {
  card: "rgba(15, 10, 24, 0.96)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
};

const PartnerRevenue = () => {
  const { gym, isGym, isEventHost } = useOutletContext();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500 mb-1">
          revenue
        </p>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          {isEventHost
            ? "Ticket revenue & payouts"
            : "Revenue & payouts"}
        </h1>
        <p className="text-xs text-gray-400 mt-1 max-w-xl">
          {isEventHost
            ? `Track ticket revenue from your events, settlement timelines and downloadable statements for ${gym?.name || "your brand"}. Once connected to your revenue endpoints, this will stay in sync with real-time ticket sales.`
            : `Track earnings from passes, bookings and add-ons for ${gym?.name || "your gym"}. Once connected to your revenue endpoints, this will show monthly earnings, payout timelines and downloadable financial reports.`}
        </p>
      </div>

      <div
        className="text-xs text-gray-400 border border-white/10 rounded-2xl p-4 bg-black/40 space-y-2"
        style={{ backgroundColor: THEME.card, borderColor: THEME.borderSubtle }}
      >
        <p className="text-sm font-medium">
          {isEventHost ? "Revenue analytics for hosts" : "Revenue analytics for gyms"}
        </p>
        <ul className="list-disc list-inside text-[11px] text-gray-400 space-y-1">
          {isEventHost ? (
            <>
              <li>Breakdown of ticket revenue by event, ticket tier and date.</li>
              <li>Overview of Passiify fees vs net payouts to your account.</li>
              <li>Upcoming settlement schedule for completed events.</li>
              <li>Exports for GST/invoicing and accountant use (CSV / PDF).</li>
            </>
          ) : (
            <>
              <li>Monthly revenue from passes, one-time bookings and add-ons.</li>
              <li>Breakdown of Passiify fees vs net payouts to your gym.</li>
              <li>Settlement timelines and payout status for each period.</li>
              <li>Exports for accounting and tax filing (CSV / PDF).</li>
            </>
          )}
        </ul>
        <p className="text-[11px] text-gray-500 mt-1">
          Once your billing and payouts APIs are ready, we&apos;ll plug them in
          here without changing the UI — giving you a live Stripe/PayTM-style
          view of your business inside Passiify.
        </p>
      </div>
    </div>
  );
};

export default PartnerRevenue;
