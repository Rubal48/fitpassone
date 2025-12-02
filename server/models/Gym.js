// models/Gym.js
import mongoose from "mongoose";

// Sub-schema for reviews (embedded summary – you also have full Review model)
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ✅ Sub-schema for custom passes (discount + metadata)
const passSchema = new mongoose.Schema(
  {
    // label shown in dashboards / booking UI
    name: { type: String },
    description: { type: String },

    duration: { type: Number, required: true }, // in days

    /**
     * New pricing structure:
     * basePrice  -> MRP / original price for this pass
     * salePrice  -> Discounted price shown to user
     * discountPercent -> Calculated from basePrice & salePrice
     * offerLabel -> e.g. "Launch Offer", "Festival Sale"
     * offerValidTill -> time-limited offer end date
     *
     * price (legacy):
     * - Kept for backward compatibility.
     * - We will keep it in sync with salePrice so old frontend/API
     *   using pass.price keeps working.
     */
    basePrice: { type: Number },
    salePrice: { type: Number },
    discountPercent: { type: Number, default: 0 },
    offerLabel: { type: String },
    offerValidTill: { type: Date },

    // 🔁 Legacy field – do NOT remove yet, used by existing code
    price: { type: Number },

    // Extra control from Partner dashboard
    maxCheckIns: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

// 🧮 Subdocument hook for each pass
passSchema.pre("save", function (next) {
  const pass = this;

  // Normalise discountPercent to a number if present
  let inputDiscount = null;
  if (pass.discountPercent !== undefined && pass.discountPercent !== null) {
    const maybe = Number(pass.discountPercent);
    inputDiscount = Number.isFinite(maybe) ? maybe : null;
  }

  // If we have legacy price + discount% but no base/sale, infer basePrice
  // Example: price = 400, discountPercent = 20  → basePrice ≈ 500, salePrice = 400
  if (
    !pass.basePrice &&
    !pass.salePrice &&
    typeof pass.price === "number" &&
    inputDiscount !== null &&
    inputDiscount > 0 &&
    inputDiscount < 90
  ) {
    pass.salePrice = pass.price;
    const multiplier = 1 - inputDiscount / 100;
    if (multiplier > 0) {
      pass.basePrice = Math.round(pass.price / multiplier);
    } else {
      pass.basePrice = pass.price;
      inputDiscount = 0;
    }
  }

  // If only legacy price is set, treat it as both base & sale (no discount)
  if (!pass.basePrice && !pass.salePrice && typeof pass.price === "number") {
    pass.basePrice = pass.price;
    pass.salePrice = pass.price;
  }

  // If basePrice exists but no salePrice, assume no discount
  if (typeof pass.basePrice === "number" && pass.salePrice == null) {
    pass.salePrice = pass.basePrice;
  }

  // If salePrice exists but no basePrice, also treat as no-discount
  if (pass.basePrice == null && typeof pass.salePrice === "number") {
    pass.basePrice = pass.salePrice;
  }

  // Calculate discountPercent if there is a real discount
  if (
    typeof pass.basePrice === "number" &&
    typeof pass.salePrice === "number" &&
    pass.salePrice < pass.basePrice
  ) {
    const diff = pass.basePrice - pass.salePrice;
    pass.discountPercent = Math.round((diff / pass.basePrice) * 100);
  } else {
    pass.discountPercent = 0;
  }

  // Keep legacy `price` in sync with what user actually pays
  if (typeof pass.salePrice === "number") {
    pass.price = pass.salePrice;
  } else if (typeof pass.basePrice === "number" && pass.price == null) {
    pass.price = pass.basePrice;
  }

  next();
});

const gymSchema = new mongoose.Schema(
  {
    // ✅ Core info
    name: { type: String, required: true },
    businessType: {
      type: String,
      enum: ["gym", "mma", "yoga", "event", "other"],
      default: "gym",
    },
    city: { type: String, required: true },
    address: { type: String },

    // Cached “headline” price – we’ll keep this in sync with cheapest pass
    price: { type: Number },

    // ✅ Pricing via passes
    // Each pass now supports MRP + discount
    passes: {
      type: [passSchema],
      default: [], // 🔥 no more hidden 250₹ default pass
    },

    // ✅ Rating & reviews
    rating: { type: Number, default: 0 },

    // Hero + gallery
    // These now store full URLs (e.g. Cloudinary secure URLs)
    coverImage: { type: String }, // main banner used in cards/detail
    images: { type: [String], default: [] },

    description: { type: String },
    tags: { type: [String], default: [] },

    reviews: [reviewSchema], // quick snapshot; full reviews in Review model

    // ✅ Facilities / amenities
    facilities: {
      type: [String],
      default: [], // e.g. ["WiFi", "Parking", "Showers"]
    },

    /**
     * Opening hours:
     * - OLD data: simple string like "6:00 AM – 10:00 PM"
     * - NEW data: Mon–Sun object from Partner flow:
     *   {
     *     monday:   { open: "06:00", close: "22:00", closed: false },
     *     tuesday:  { ... },
     *     ...
     *   }
     */
    openingHours: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // ✅ Contact & links (matching Partner form)
    phone: { type: String },
    website: { type: String },
    instagram: { type: String },
    googleMapLink: { type: String },

    // ✅ Verification docs (also good place for Cloudinary URLs)
    businessProof: { type: String }, // GST / registration doc URL
    ownerIdProof: { type: String }, // Aadhaar / PAN URL
    video: { type: String }, // intro video URL

    // ✅ Admin flags
    verified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ✅ Ownership / meta
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or "Admin" later if needed
    },

    // Optional geo fields for future maps & search
    locationCoords: {
      lat: { type: Number },
      lng: { type: Number },
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🧮 Auto-calculate average rating + cached price
gymSchema.pre("save", function (next) {
  // Rating
  if (this.reviews && this.reviews.length > 0) {
    const avg =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.rating = Math.round(avg * 10) / 10;
  } else if (!this.rating) {
    this.rating = 0;
  }

  // Cached “headline” price from cheapest active pass
  if (Array.isArray(this.passes) && this.passes.length > 0) {
    let cheapest = null;

    this.passes.forEach((p) => {
      if (p && p.isActive === false) return;

      let userPrice = 0;
      if (typeof p.salePrice === "number") userPrice = p.salePrice;
      else if (typeof p.price === "number") userPrice = p.price;
      else if (typeof p.basePrice === "number") userPrice = p.basePrice;

      if (!userPrice) return;

      if (cheapest == null || userPrice < cheapest) {
        cheapest = userPrice;
      }
    });

    if (cheapest != null) {
      this.price = cheapest;
    }
  }

  next();
});

const Gym = mongoose.model("Gym", gymSchema);
export default Gym;
