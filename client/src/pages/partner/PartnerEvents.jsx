// src/pages/partner/PartnerEvents.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  Ticket,
  Eye,
  ShieldCheck,
  Star,
  Globe2,
  Clock,
  Filter,
  Search,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import API from "../../utils/api";

const THEME = {
  card: "rgba(15, 10, 24, 0.96)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
};

const PartnerEvents = () => {
  const { gym, isGym, isEventHost } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [timeFilter, setTimeFilter] = useState("all"); // all | upcoming | past
  const [searchQuery, setSearchQuery] = useState("");

  const brandName =
    gym?.name || (isEventHost ? "your brand" : "your space");

  /* ===========================
     FETCH EVENTS FROM BACKEND
  ============================ */
  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      // Backend: GET /events  → { success, events }
      const res = await API.get("/events");
      const data = res.data?.events || res.data || [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading events:", err);
      const msg =
        err?.response?.data?.message || "Unable to load events. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* ===========================
     DERIVED METRICS
  ============================ */
  const metrics = useMemo(() => {
    if (!events.length) {
      return {
        totalEvents: 0,
        upcomingEvents: 0,
        pastEvents: 0,
        totalTicketsSold: 0,
        grossRevenue: 0,
        avgRating: 0,
      };
    }

    const now = new Date();
    let upcoming = 0;
    let past = 0;
    let sold = 0;
    let revenue = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    events.forEach((e) => {
      const date = e.date ? new Date(e.date) : null;
      if (date) {
        if (date >= now) upcoming += 1;
        else past += 1;
      }

      const ticketsSold = e.ticketsSold || 0;
      sold += ticketsSold;

      const totalRevenue =
        e.totalRevenue != null
          ? e.totalRevenue
          : (e.price || 0) * ticketsSold;
      revenue += totalRevenue;

      if (typeof e.rating === "number") {
        ratingSum += e.rating;
        ratingCount += 1;
      }
    });

    return {
      totalEvents: events.length,
      upcomingEvents: upcoming,
      pastEvents: past,
      totalTicketsSold: sold,
      grossRevenue: revenue,
      avgRating: ratingCount ? ratingSum / ratingCount : 0,
    };
  }, [events]);

  /* ===========================
     FILTERED EVENTS
  ============================ */
  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events.filter((e) => {
      const date = e.date ? new Date(e.date) : null;

      if (timeFilter === "upcoming" && date && date < now) return false;
      if (timeFilter === "past" && date && date >= now) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const fields = [
        e.name,
        e.location,
        e.category,
        e.organizer,
        ...(e.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return fields.includes(q);
    });
  }, [events, timeFilter, searchQuery]);

  /* ===========================
     HELPERS
  ============================ */
  const formatDate = (dateStr) => {
    if (!dateStr) return "TBA";
    try {
      const d = new Date(dateStr);
      const day = d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        weekday: "short",
      });
      const time = d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${day} • ${time}`;
    } catch {
      return "TBA";
    }
  };

  const moderationChipClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/40";
      case "pending":
        return "bg-amber-500/10 text-amber-300 border-amber-500/40";
      case "rejected":
        return "bg-red-500/10 text-red-300 border-red-500/40";
      default:
        return "bg-white/5 text-gray-300 border-white/15";
    }
  };

  const categoryLabel = (cat) => {
    if (!cat) return "General";
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const cancellationSummary = (policy) => {
    if (!policy || policy.type === "none") return "No refunds";
    const type = policy.type || "flexible";
    if (type === "flexible") {
      return `Full refund until ${policy.freeCancellationHours || 24}h before`;
    }
    if (type === "moderate") {
      return "Partial refund before event";
    }
    if (type === "strict") {
      return "Strict: refunds only in special cases";
    }
    return "Custom policy";
  };

  /* ===========================
     RENDER
  ============================ */

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.22em] text-gray-500">
            events
          </p>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {isEventHost
              ? `Events hosted by ${brandName}`
              : `Classes & events for ${brandName}`}
          </h1>
          <p className="mt-1 max-w-xl text-xs text-gray-400">
            {isEventHost
              ? "See all events on Passiify with their capacity, ticket sales and status. Later, this view will filter to only your hosted events."
              : "Use this view to understand which special classes and events are driving the most bookings and revenue."}
          </p>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-500">
            <AlertCircle className="h-3 w-3" />
            Connected to your <code>/events</code> backend. Host-specific
            filtering can be added later.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-200 hover:bg-white/10 md:inline-flex">
            Duplicate last event
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-2 text-xs font-medium text-black shadow shadow-orange-500/40">
            + Create event
          </button>
        </div>
      </div>

      {/* Loading / error */}
      {loading && (
        <div className="text-xs text-gray-300">Loading events…</div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          className="space-y-1 rounded-2xl border p-4 shadow-lg shadow-black/40"
          style={{
            background:
              "linear-gradient(135deg, rgba(249,115,22,0.24), rgba(10,8,18,0.98))",
            borderColor: THEME.borderSubtle,
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-300">
            upcoming events
          </p>
          <p className="text-2xl font-semibold text-gray-50">
            {metrics.upcomingEvents}
          </p>
          <p className="text-[11px] text-gray-400">
            {metrics.totalEvents} total on Passiify
          </p>
        </div>

        <div
          className="space-y-1 rounded-2xl border p-4"
          style={{
            backgroundColor: THEME.card,
            borderColor: THEME.borderSubtle,
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-300">
            tickets sold (approx)
          </p>
          <p className="text-2xl font-semibold text-gray-50">
            {metrics.totalTicketsSold}
          </p>
          <p className="text-[11px] text-gray-400">
            Sum of <code>ticketsSold</code> across events
          </p>
        </div>

        <div
          className="space-y-1 rounded-2xl border p-4"
          style={{
            backgroundColor: THEME.card,
            borderColor: THEME.borderSubtle,
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-300">
            gross revenue (approx)
          </p>
          <p className="text-2xl font-semibold text-gray-50">
            ₹{metrics.grossRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-400">
            Based on <code>totalRevenue</code> or price × tickets
          </p>
        </div>

        <div
          className="space-y-1 rounded-2xl border p-4"
          style={{
            backgroundColor: THEME.card,
            borderColor: THEME.borderSubtle,
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-300">
            average rating
          </p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-semibold text-gray-50">
              {metrics.avgRating ? metrics.avgRating.toFixed(1) : "—"}
            </p>
            {metrics.avgRating > 0 && (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.round(metrics.avgRating)
                        ? "text-amber-300 fill-amber-300"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-400">
            From event <code>rating</code> fields
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="flex flex-col gap-3 rounded-2xl border px-4 py-3 shadow-lg shadow-black/40 md:flex-row md:items-center md:justify-between"
        style={{
          backgroundColor: THEME.card,
          borderColor: THEME.borderSubtle,
        }}
      >
        <div className="text-xs text-gray-300">
          <p className="font-medium">
            {filteredEvents.length} event
            {filteredEvents.length === 1 ? "" : "s"} shown
          </p>
          <p className="text-[11px] text-gray-500">
            Filter by time and search across name, location, category and tags.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-[11px] md:flex-row md:items-center">
          {/* Time filter */}
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1">
            <Clock className="h-3 w-3 text-gray-400" />
            {["all", "upcoming", "past"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`rounded-full px-2 py-0.5 capitalize transition ${
                  timeFilter === t
                    ? "bg-orange-500/80 text-black font-medium"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2 py-1">
            <Search className="h-3.5 w-3.5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event, location, category…"
              className="w-40 bg-transparent text-[11px] text-gray-100 placeholder:text-gray-500 focus:outline-none md:w-56"
            />
          </div>
        </div>
      </div>

      {/* Events table */}
      <div
        className="overflow-hidden rounded-2xl border shadow-lg shadow-black/40"
        style={{
          backgroundColor: THEME.card,
          borderColor: THEME.borderSubtle,
        }}
      >
        {!loading && filteredEvents.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-gray-400">
            <p>No events match your filters.</p>
            <p className="mt-1 text-[11px] text-gray-500">
              Adjust the time filter or clear the search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-black/40 text-gray-400">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Event</th>
                  <th className="px-4 py-2 text-left font-medium">
                    Date & time
                  </th>
                  <th className="px-4 py-2 text-left font-medium">Location</th>
                  <th className="px-4 py-2 text-left font-medium">
                    Capacity & sales
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Revenue
                  </th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">
                    Experience
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((e) => {
                  const capacity = e.capacity || 0;
                  const ticketsSold = e.ticketsSold || 0;
                  const remaining =
                    e.remainingSeats != null
                      ? e.remainingSeats
                      : Math.max(capacity - ticketsSold, 0);

                  const totalRevenue =
                    e.totalRevenue != null
                      ? e.totalRevenue
                      : (e.price || 0) * ticketsSold;

                  const occupancy =
                    capacity > 0
                      ? Math.round((ticketsSold / capacity) * 100)
                      : null;

                  return (
                    <tr
                      key={e._id}
                      className="border-t border-white/5 bg-black/20 hover:bg-white/5"
                    >
                      {/* Event name / category / rating */}
                      <td className="px-4 py-3 align-top">
                        <div className="text-gray-100">{e.name}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-gray-400">
                          <span className="rounded-full bg-white/5 px-2 py-0.5">
                            {categoryLabel(e.category)}
                          </span>
                          {typeof e.rating === "number" && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-black/50 px-2 py-0.5">
                              <Star className="h-3 w-3 text-amber-300" />
                              {e.rating.toFixed(1)}
                              {e.ratingCount > 0 && (
                                <span className="text-[10px] text-gray-500">
                                  ({e.ratingCount})
                                </span>
                              )}
                            </span>
                          )}
                          {e.featured && (
                            <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-orange-300">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-1 text-[11px] text-gray-300">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(e.date)}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 align-top">
                        {e.isOnline ? (
                          <div className="flex items-center gap-1 text-[11px] text-gray-300">
                            <Globe2 className="h-3 w-3" />
                            Online event
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] text-gray-300">
                            <MapPin className="h-3 w-3" />
                            {e.location}
                          </div>
                        )}
                        {e.meetingPoint && (
                          <p className="mt-0.5 text-[10px] text-gray-500">
                            Meeting: {e.meetingPoint}
                          </p>
                        )}
                      </td>

                      {/* Capacity & sales */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-1 text-[11px] text-gray-100">
                          <Ticket className="h-3 w-3" />
                          {ticketsSold}/{capacity || "∞"} sold
                        </div>
                        {occupancy != null && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/60">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-orange-500"
                                style={{ width: `${occupancy}%` }}
                              />
                            </div>
                            <span>{occupancy}% full</span>
                          </div>
                        )}
                        <p className="mt-0.5 text-[10px] text-gray-500">
                          {remaining} seats left
                        </p>
                      </td>

                      {/* Revenue */}
                      <td className="px-4 py-3 align-top">
                        <p className="text-gray-100">
                          ₹{totalRevenue.toLocaleString()}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-400">
                          ₹{(e.price || 0).toLocaleString()} / ticket
                        </p>
                      </td>

                      {/* Status / verification */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1 text-[11px] text-gray-300">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${moderationChipClass(
                              e.status
                            )}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {e.status || "pending"}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {e.verified && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                                <ShieldCheck className="h-3 w-3" />
                                Verified
                              </span>
                            )}
                            {e.checkInRequired && (
                              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-gray-300">
                                Check-in required
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Experience / policy / languages */}
                      <td className="px-4 py-3 text-right align-top">
                        <div className="flex flex-col items-end gap-1 text-[11px] text-gray-300">
                          <div className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                            <Users className="h-3 w-3" />
                            {Array.isArray(e.languages) && e.languages.length > 0
                              ? e.languages.join(", ")
                              : "English"}
                          </div>
                          <div className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                            <Eye className="h-3 w-3" />
                            {cancellationSummary(e.cancellationPolicy)}
                          </div>
                          {e.personalNote && (
                            <button className="mt-1 inline-flex items-center gap-1 text-[10px] text-orange-300 hover:text-orange-200">
                              <ArrowUpRight className="h-3 w-3" />
                              View host note
                            </button>
                          )}
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

      {/* Backend note */}
      <p className="text-[11px] text-gray-500">
        This view reads from your <code>Event</code> model via{" "}
        <code>GET /events</code>. Later, you can add host-specific routes
        (e.g. <code>GET /events/host/me</code> or query by <code>host</code>) and
        event analytics from <code>/event-bookings/event/:eventId/analytics</code>{" "}
        without changing this UI.
      </p>
    </div>
  );
};

export default PartnerEvents;
