// src/pages/partner/PartnerReviews.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Star,
  MessageCircle,
  TrendingUp,
  Filter,
  ThumbsUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import API from "../../utils/api";

const THEME = {
  card: "rgba(15, 10, 24, 0.96)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
};

const PartnerReviews = () => {
  const { gym, isGym, isEventHost } = useOutletContext();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔁 Fetch reviews for this gym (gym partners only)
  const fetchReviews = async () => {
    if (!gym?._id || !isGym) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // backend route: GET /reviews/:gymId
      const res = await API.get(`/reviews/${gym._id}`);
      setReviews(res.data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      const msg =
        err?.response?.data?.message ||
        "Unable to load reviews. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGym) {
      fetchReviews();
    } else {
      setLoading(false);
    }
  }, [gym?._id, isGym]); // eslint-disable-line react-hooks/exhaustive-deps

  // 📊 Derived stats from reviews
  const stats = useMemo(() => {
    if (!reviews.length) {
      return {
        rating: gym?.rating || 0,
        totalReviews: 0,
        thisMonth: 0,
        promoters: 0,
        detractors: 0,
        distribution: [5, 4, 3, 2, 1].map((stars) => ({
          stars,
          count: 0,
        })),
      };
    }

    const totalReviews = reviews.length;
    const now = new Date();
    const thisMonth = reviews.filter((r) => {
      if (!r.createdAt) return false;
      const d = new Date(r.createdAt);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;

    const sumRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const rating = sumRating / totalReviews;

    const promoters = reviews.filter((r) => (r.rating || 0) >= 4).length;
    const detractors = reviews.filter((r) => (r.rating || 0) <= 2).length;

    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((r) => r.rating === stars).length,
    }));

    return {
      rating,
      totalReviews,
      thisMonth,
      promoters,
      detractors,
      distribution,
    };
  }, [reviews, gym?.rating]);

  const renderStars = (count) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < count ? "text-amber-300 fill-amber-300" : "text-gray-600"
          }`}
        />
      ))}
    </div>
  );

  const brandLabel =
    gym?.name || (isEventHost ? "your brand" : "your gym");

  /* 🎟 Event-host view — keep as “coming soon” until you add event review routes */
  if (isEventHost && !isGym) {
    return (
      <div className="space-y-5">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.22em] text-gray-500">
            reviews
          </p>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            Attendee reviews & feedback
          </h1>
          <p className="mt-1 max-w-xl text-xs text-gray-400">
            This page will show reviews for your events (rating, comments and replies).
            Your Review model and routes are already in place — once you add event
            review endpoints, we’ll plug them in here.
          </p>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-orange-300/80">
            <AlertCircle className="h-3 w-3" />
            For now, this is a preview of how the event review dashboard will look.
          </p>
        </div>

        <div
          className="space-y-3 rounded-2xl border p-4 text-xs text-gray-300 shadow-lg shadow-black/40"
          style={{
            backgroundColor: THEME.card,
            borderColor: THEME.borderSubtle,
          }}
        >
          <p className="text-sm font-medium">What you’ll see here</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-[11px] text-gray-400">
            <li>Rating breakdown per event (1–5★) and over time.</li>
            <li>Full attendee comments with the ability to reply.</li>
            <li>Flags for inappropriate reviews (using your moderation fields).</li>
            <li>Average rating synced back to your Event model.</li>
          </ul>
          <p className="mt-2 text-[11px] text-gray-500">
            Once you add event-specific review routes (e.g. <code>/reviews/event/:eventId</code>),
            you can reuse this same UI for real data.
          </p>
        </div>
      </div>
    );
  }

  /* 🏋️ Gym partner view – live reviews from /reviews/:gymId */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="mb-1 text-xs uppercase tracking-[0.22em] text-gray-500">
          reviews
        </p>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Member reviews & feedback
        </h1>
        <p className="mt-1 max-w-xl text-xs text-gray-400">
          See what members are saying about {brandLabel}. Use this to improve
          experience, highlight wins and spot issues early.
        </p>
        <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-500">
          <AlertCircle className="h-3 w-3" />
          Data is coming directly from your <code>/reviews/:gymId</code> backend.
        </p>
      </div>

      {/* Loading / error / no-gym states */}
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading reviews…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* If no reviews at all */}
      {!loading && !error && !stats.totalReviews && (
        <div
          className="rounded-2xl border p-4 text-xs text-gray-300 shadow-lg shadow-black/40"
          style={{
            backgroundColor: THEME.card,
            borderColor: THEME.borderSubtle,
          }}
        >
          <p className="text-sm font-medium">No reviews yet</p>
          <p className="mt-1 text-[11px] text-gray-400">
            Once members start leaving reviews for {brandLabel}, you&apos;ll see
            their ratings and comments here. Encourage users to review you after
            their visit for stronger social proof.
          </p>
        </div>
      )}

      {/* Only show the full dashboard if we have reviews OR loaded cleanly */}
      {(stats.totalReviews > 0 || (!loading && !error)) && (
        <>
          {/* Top: rating overview + insights */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Rating overview */}
            <div
              className="space-y-3 rounded-2xl border p-4 shadow-lg shadow-black/40"
              style={{
                background:
                  "radial-gradient(circle at top left, rgba(249,115,22,0.18), transparent 55%), " +
                  THEME.card,
                borderColor: THEME.borderSubtle,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400">
                    Overall rating for{" "}
                    <span className="font-medium text-gray-100">
                      {brandLabel}
                    </span>
                  </p>
                  <div className="mt-2 flex items-end gap-3">
                    <div>
                      <p className="text-3xl font-semibold text-gray-50">
                        {stats.rating ? stats.rating.toFixed(1) : "—"}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {stats.totalReviews > 0
                          ? `Based on ${stats.totalReviews} review${
                              stats.totalReviews > 1 ? "s" : ""
                            }`
                          : "No reviews yet"}
                      </p>
                    </div>
                    {renderStars(Math.round(stats.rating || 0))}
                  </div>
                </div>
                <div className="flex flex-col items-end text-[11px] text-gray-300">
                  <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1">
                    <ThumbsUp className="h-3 w-3 text-emerald-300" />
                    <span>{stats.promoters} promoters</span>
                  </div>
                  <span className="mt-1 text-[11px] text-gray-500">
                    {stats.detractors} critical review
                    {stats.detractors === 1 ? "" : "s"}
                  </span>
                  {stats.thisMonth > 0 && (
                    <span className="mt-1 text-[11px] text-gray-400">
                      {stats.thisMonth} new this month
                    </span>
                  )}
                </div>
              </div>

              {/* Distribution */}
              <div className="mt-3 space-y-1.5 text-[11px] text-gray-300">
                {stats.distribution.map((row) => {
                  const total = stats.totalReviews || 1;
                  const pct = (row.count / total) * 100;
                  return (
                    <div key={row.stars} className="flex items-center gap-2">
                      <div className="flex w-10 items-center gap-0.5">
                        <span>{row.stars}</span>
                        <Star className="h-3 w-3 text-amber-300" />
                      </div>
                      <div className="flex-1 rounded-full bg-black/60">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-[10px] text-gray-500">
                        {row.count}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="mt-2 text-[11px] text-gray-500">
                Your Review model already updates average rating on the Gym
                document — this card simply visualises it in the dashboard.
              </p>
            </div>

            {/* Insights explainer */}
            <div
              className="space-y-3 rounded-2xl border p-4 text-xs text-gray-300 shadow-lg shadow-black/40"
              style={{
                backgroundColor: THEME.card,
                borderColor: THEME.borderSubtle,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Insights</p>
                  <p className="text-sm font-semibold">
                    How to use this page
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <Filter className="h-3.5 w-3.5" />
                  Filters (later)
                </div>
              </div>

              <ul className="list-inside list-disc space-y-1 text-[11px] text-gray-400">
                <li>Scan recent reviews after busy days or campaigns.</li>
                <li>
                  Watch for repeat patterns in complaints (timing, staff,
                  crowding).
                </li>
                <li>
                  Pull top 3–5 reviews to highlight on marketing or your
                  website.
                </li>
                <li>
                  In future, you&apos;ll be able to reply inline and filter by
                  rating or date.
                </li>
              </ul>

              <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-[11px]">
                <div className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-100">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                  Rating impact on conversions
                </div>
                <p className="text-gray-400">
                  Partners with an average rating above{" "}
                  <span className="font-medium text-gray-100">4.5★</span>{" "}
                  typically see higher pass purchases and better repeat
                  attendance. This card helps you stay in that zone.
                </p>
              </div>
            </div>
          </div>

          {/* Recent reviews list */}
          {stats.totalReviews > 0 && (
            <div
              className="rounded-2xl border p-4 shadow-lg shadow-black/40"
              style={{
                backgroundColor: THEME.card,
                borderColor: THEME.borderSubtle,
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Member voices</p>
                  <h2 className="text-sm font-semibold">
                    Recent reviews
                  </h2>
                </div>
                <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-200 opacity-60 hover:bg-white/10">
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    Reply (coming soon)
                  </span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {reviews.map((r) => {
                  let dateText = "";
                  if (r.createdAt) {
                    try {
                      dateText = new Date(r.createdAt).toLocaleDateString();
                    } catch {
                      dateText = r.createdAt;
                    }
                  }

                  return (
                    <div
                      key={r._id}
                      className="rounded-xl border border-white/5 bg-black/30 p-3"
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-100">
                              {r.user?.name || "Member"}
                            </p>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                            {renderStars(r.rating || 0)}
                            <span>{(r.rating || 0).toFixed(1)}</span>
                            {dateText && (
                              <span className="text-gray-500">· {dateText}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-300">
                        {r.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PartnerReviews;
