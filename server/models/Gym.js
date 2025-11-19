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

// ✅ Sub-schema for custom passes
const passSchema = new mongoose.Schema(
  {
    duration: { type: Number, required: true }, // in days
    price: { type: Number, required: true },
  },
  { _id: false }
);

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

    // ✅ Pricing via passes (already used in your frontend)
    passes: {
      type: [passSchema],
      default: [{ duration: 1, price: 250 }], // default 1-day pass
    },

    // ✅ Rating & reviews
    rating: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    description: { type: String },
    tags: { type: [String], default: [] },

    reviews: [reviewSchema], // quick snapshot; full reviews in Review model

    // ✅ Facilities / amenities
    facilities: {
      type: [String],
      default: [], // e.g. ["WiFi", "Parking", "Showers"]
    },
    openingHours: {
      type: String, // "6:00 AM – 10:00 PM"
    },

    // ✅ Contact & links (matching Partner form)
    phone: { type: String },
    website: { type: String },
    instagram: { type: String },
    googleMapLink: { type: String },

    // ✅ Verification docs
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

// 🧮 Auto-calculate average rating from embedded reviews
gymSchema.pre("save", function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const avg =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.rating = Math.round(avg * 10) / 10;
  } else if (!this.rating) {
    this.rating = 0;
  }
  next();
});

const Gym = mongoose.model("Gym", gymSchema);
export default Gym;
