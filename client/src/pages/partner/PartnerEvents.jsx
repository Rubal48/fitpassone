// src/pages/partner/PartnerEvents.jsx
import React from "react";
import { useOutletContext } from "react-router-dom";

const PartnerEvents = () => {
  const { gym, isGym, isEventHost } = useOutletContext();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500 mb-1">
          events
        </p>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          {isEventHost
            ? `Events hosted by ${gym?.name || "your brand"}`
            : `Classes & events for ${gym?.name || "your space"}`}
        </h1>
        <p className="text-xs text-gray-400 mt-1 max-w-xl">
          {isEventHost
            ? "Manage your live and upcoming events, ticket types and capacity here. We’ll connect this to your /events backend so sales and attendance stay in sync."
            : "Use events for bootcamps, challenges or one-off workshops. Later we’ll plug this into your /events backend for full calendar, capacity and live attendance tracking."}
        </p>
      </div>

      <div className="text-xs text-gray-400 border border-white/10 rounded-2xl p-4 bg-black/40 space-y-2">
        <p className="text-sm font-medium">
          {isEventHost ? "Events module for hosts" : "Events module for gyms"}
        </p>
        <ul className="list-disc list-inside text-[11px] text-gray-400 space-y-1">
          {isEventHost ? (
            <>
              <li>Create and publish events with different ticket tiers.</li>
              <li>See ticket sales and remaining capacity in real-time.</li>
              <li>Use QR-based check-in at the door for each event.</li>
            </>
          ) : (
            <>
              <li>Schedule special classes, workshops and bootcamps.</li>
              <li>Track signups alongside your regular passes and bookings.</li>
              <li>Later: connect to your events calendar for live attendance.</li>
            </>
          )}
        </ul>
        <p className="text-[11px] text-gray-500">
          This section is UI-ready. Once your `/events` APIs are final, we&apos;ll
          wire it to real data (events list, capacity, check-ins).
        </p>
      </div>
    </div>
  );
};

export default PartnerEvents;
