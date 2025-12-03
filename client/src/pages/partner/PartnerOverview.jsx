// src/pages/partner/PartnerOverview.jsx
import React, { useEffect, useState } from "react";
import {
  Activity,
  Users,
  CalendarDays,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  MapPin,
  Clock,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import API from "../../utils/api";

const THEME = {
  card: "rgba(15, 10, 24, 0.96)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
};

const PartnerOverview = () => {
  const { gym, isGym, isEventHost } = useOutletContext();

  const [stats, setStats] = useState({
    bookingsToday: 0,
    activePasses: 0, // for gyms: active passes; for events: active events
    revenueThisMonth: 0,
    growthRate: 0,
    rating: 4.8,
    upcomingEvents: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // 🔥 new: top events for event hosts
  const [topEvents, setTopEvents] = useState([]);

  useEffect(() => {
    const fetchStatsAndTop = async () => {
      setLoadingStats(true);
      try {
        if (isEventHost) {
          // ⭐ EVENT ORGANISER MODE → use event bookings + top events
          const [overviewRes, topRes] = await Promise.all([
            API.get("/event-bookings/host/overview"),
            API.get("/event-bookings/host/top-events").catch(() => null),
          ]);

          const data = overviewRes?.data || {};

          setStats((prev) => ({
            ...prev,
            bookingsToday: data.bookingsToday ?? prev.bookingsToday,
            activePasses: data.activePasses ?? prev.activePasses, // here: active events
            revenueThisMonth:
              data.revenueThisMonth ?? prev.revenueThisMonth,
            growthRate: data.growthRate ?? prev.growthRate,
            rating: data.rating ?? prev.rating,
            upcomingEvents: data.upcomingEvents ?? prev.upcomingEvents,
          }));

          const items = topRes?.data?.items;
          if (Array.isArray(items)) {
            setTopEvents(items);
          } else {
            setTopEvents([]);
          }
        } else {
          // 🧱 GYM PARTNER MODE → existing gym stats endpoint
          const res = await API.get("/gyms/me/stats").catch(() => null);
          const data = res?.data || {};

          setStats((prev) => ({
            ...prev,
            bookingsToday: data.bookingsToday ?? prev.bookingsToday,
            activePasses: data.activePasses ?? prev.activePasses,
            revenueThisMonth:
              data.revenueThisMonth ?? prev.revenueThisMonth,
            growthRate: data.growthRate ?? prev.growthRate,
            rating: data.rating ?? prev.rating,
            upcomingEvents: data.upcomingEvents ?? prev.upcomingEvents,
          }));

          // topEvents only used for event hosts
          setTopEvents([]);
        }
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatsAndTop();
  }, [isEventHost]);

  const isVerified = gym?.status === "approved" || gym?.verified;

  // ✅ Safely format opening hours (string OR object with monday–sunday)
  const openingHours = gym?.openingHours;
  let openingHoursLabel = "";

  if (typeof openingHours === "string") {
    openingHoursLabel = openingHours;
  } else if (openingHours && typeof openingHours === "object") {
    openingHoursLabel = Object.entries(openingHours)
      .filter(([_, val]) => !!val)
      .map(([day, hours]) => {
        const short =
          day.toLowerCase().startsWith("mon") ? "Mon" :
          day.toLowerCase().startsWith("tue") ? "Tue" :
          day.toLowerCase().startsWith("wed") ? "Wed" :
          day.toLowerCase().startsWith("thu") ? "Thu" :
          day.toLowerCase().startsWith("fri") ? "Fri" :
          day.toLowerCase().startsWith("sat") ? "Sat" :
          day.toLowerCase().startsWith("sun") ? "Sun" :
          day[0].toUpperCase() + day.slice(1);
        return `${short}: ${hours}`;
      })
      .join(" · ");
  }

  // 🔢 Stat cards adapt to partner type
  const statCards = [
    {
      key: "today",
      label: isEventHost ? "Tickets sold today" : "Bookings today",
      value: stats.bookingsToday,
      icon: Activity,
      helper: `${stats.growthRate >= 0 ? "+" : ""}${stats.growthRate}% vs last week`,
      helperColor: stats.growthRate >= 0 ? "text-emerald-300" : "text-red-300",
      helperIcon: stats.growthRate >= 0 ? ArrowUpRight : ArrowDownRight,
    },
    {
      key: "active",
      label: isEventHost ? "Active events" : "Active passes",
      value: stats.activePasses,
      icon: Users,
      helper: isEventHost ? "Live on Passiify" : "Currently purchasable",
      helperColor: "text-gray-400",
    },
    {
      key: "revenue",
      label: "Revenue this month",
      value: `₹${Number(stats.revenueThisMonth || 0).toLocaleString()}`,
      icon: Wallet,
      helper: "Payouts auto-calculated",
      helperColor: "text-gray-400",
    },
    {
      key: "upcoming",
      label: "Upcoming events",
      value: stats.upcomingEvents,
      icon: CalendarDays,
      helper: "Based on your schedule",
      helperColor: "text-gray-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-gray-500">
            partner dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Welcome back, {gym?.ownerName || gym?.name || "Partner"} 👋
          </h1>
          <p className="mt-1 max-w-xl text-sm text-gray-400">
            {isEventHost
              ? "Track your events, ticket sales and revenue in one clean view. All synced with Passiify in real-time."
              : "Track your passes, bookings and revenue in one clean view. All synced with Passiify in real-time."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loadingStats && (
            <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-300 md:inline-flex">
              Syncing latest numbers…
            </span>
          )}
          <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition">
            View public listing
          </button>
          <button className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-2 text-xs font-medium text-black shadow shadow-orange-500/40">
            {isEventHost
              ? "+ Create event"
              : isGym
              ? "+ Create pass"
              : "+ Create event"}
          </button>
        </div>
      </div>

      {/* Gym / Brand Info Card */}
      <div
        className="flex flex-col gap-5 rounded-2xl border bg-black/40 p-4 md:flex-row md:p-5"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(249,115,22,0.22), transparent 55%), rgba(10,8,18,0.96)",
          borderColor: THEME.borderSubtle,
        }}
      >
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {gym?.name ||
                (isEventHost ? "Your Event Brand" : "Your Gym Name")}
            </h2>
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Verified
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-xs text-gray-400">
            {gym?.description ||
              (isEventHost
                ? "Describe your events, vibe and audience so users know why they should attend."
                : "Describe your space, vibe and training style so users know what to expect.")}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-gray-300">
            {gym?.city && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                <MapPin className="h-3 w-3" />
                {gym.city}
              </span>
            )}
            {openingHoursLabel && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 max-w-[230px]">
                <Clock className="h-3 w-3" />
                <span className="truncate">{openingHoursLabel}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
              <Star className="h-3 w-3 text-amber-300" />
              {stats.rating.toFixed(1)} rating
            </span>
          </div>
        </div>

        <div className="flex w-full items-stretch justify-between gap-3 border-t border-white/10 pt-3 text-xs md:ml-2 md:w-64 md:flex-col md:border-l md:border-t-0 md:pl-4">
          <div>
            <p className="mb-1 text-[11px] text-gray-400">This week</p>
            <p className="text-sm font-medium">
              {stats.bookingsToday}{" "}
              {isEventHost ? "tickets today" : "bookings today"}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              {stats.growthRate >= 0 ? (
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <ArrowUpRight className="h-3 w-3" />
                  {stats.growthRate}% vs last week
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-300">
                  <ArrowDownRight className="h-3 w-3" />
                  {Math.abs(stats.growthRate)}% vs last week
                </span>
              )}
            </p>
          </div>
          <div className="text-right md:text-left">
            <p className="mb-1 text-[11px] text-gray-400">Monthly revenue</p>
            <p className="text-lg font-semibold">
              ₹{Number(stats.revenueThisMonth || 0).toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-gray-500">
              Payouts handled by Passiify
            </p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const HelperIcon = card.helperIcon;
          return (
            <div
              key={card.key}
              className="flex flex-col justify-between rounded-2xl border p-4 shadow-lg shadow-black/40"
              style={{
                background:
                  card.key === "today"
                    ? "linear-gradient(135deg, rgba(249,115,22,0.18), rgba(10,8,18,0.98))"
                    : THEME.card,
                borderColor: THEME.borderSubtle,
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                  {card.label}
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/5">
                  <Icon className="h-3.5 w-3.5 text-gray-100" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-semibold">{card.value}</span>
              </div>
              <div
                className={`mt-1 flex items-center gap-1 text-[11px] ${card.helperColor}`}
              >
                {HelperIcon && <HelperIcon className="h-3 w-3" />}
                <span>{card.helper}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lower section: Top passes / events + Upcoming events */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top passes / events */}
        <div
          className="rounded-2xl border p-4"
          style={{
            backgroundColor: THEME.card,
            borderColor: THEME.borderSubtle,
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Performance</p>
              <h3 className="text-sm font-semibold">
                {isEventHost ? "Top events" : "Top passes"}
              </h3>
            </div>
            <button className="text-[11px] text-gray-400 hover:text-gray-200">
              View all
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* 🔥 Event organiser: real top events from backend */}
            {isEventHost ? (
              topEvents.length > 0 ? (
                topEvents.map((item) => (
                  <div
                    key={item.eventId}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {item.totalTickets} tickets · ₹
                        {Math.round(item.averagePrice || 0)} avg
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-300">
                      <ArrowUpRight className="h-3 w-3" />
                      Top performer
                    </span>
                  </div>
                ))
              ) : (
                // fallback when no data yet
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">No event data yet</p>
                      <p className="text-[11px] text-gray-400">
                        Create your first event to see performance here.
                      </p>
                    </div>
                  </div>
                </>
              )
            ) : (
              // Gym partners: placeholder top passes for now
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Day Pass</p>
                    <p className="text-[11px] text-gray-400">
                      129 sold · ₹249 each
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-300">
                    <ArrowUpRight className="h-3 w-3" />
                    +18%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Unlimited</p>
                    <p className="text-[11px] text-gray-400">
                      62 sold · ₹1,299 each
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-300">
                    <ArrowUpRight className="h-3 w-3" />
                    +9%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Class Pack (10)</p>
                    <p className="text-[11px] text-gray-400">
                      34 sold · ₹1,999 each
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-red-300">
                    <ArrowDownRight className="h-3 w-3" />
                    -4%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Upcoming events (placeholder for now) */}
        <div
          className="rounded-2xl border p-4"
          style={{
            backgroundColor: THEME.card,
            borderColor: THEME.borderSubtle,
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">
                {isEventHost ? "Live schedule" : "Schedule"}
              </p>
              <h3 className="text-sm font-semibold">Upcoming events</h3>
            </div>
            <button className="text-[11px] text-gray-400 hover:text-gray-200">
              Manage
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {isEventHost ? "City Fitness Carnival" : "Morning HIIT"}
                </p>
                <p className="text-[11px] text-gray-400">
                  Tomorrow · 7:00 AM · 18/25 booked
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {isEventHost ? "Night Run: 5K" : "Strength & Conditioning"}
                </p>
                <p className="text-[11px] text-gray-400">
                  Thu · 6:30 PM · 12/20 booked
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {isEventHost
                    ? "Weekend Endurance Camp"
                    : "Weekend Bootcamp"}
                </p>
                <p className="text-[11px] text-gray-400">
                  Sat · 8:00 AM · 22/30 booked
                </p>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              Later we&apos;ll wire this directly to your <code>/events</code>{" "}
              backend for live schedules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerOverview;
