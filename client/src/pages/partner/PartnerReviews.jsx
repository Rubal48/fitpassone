// src/pages/partner/PartnerReviews.jsx
import React from "react";

const PartnerReviews = () => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500 mb-1">
          reviews
        </p>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          Member reviews & feedback
        </h1>
        <p className="text-xs text-gray-400 mt-1 max-w-xl">
          We&apos;ll list user reviews, ratings and allow partner responses in
          this section once wired to your review backend.
        </p>
      </div>
      <div className="text-xs text-gray-400 border border-white/10 rounded-2xl p-4 bg-black/40">
        Reviews module coming soon: filtering, reply to users and insights like
        average rating per month.
      </div>
    </div>
  );
};

export default PartnerReviews;
