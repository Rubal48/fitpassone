import mongoose from "mongoose";

// Sub-schema for reviews
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ✅ New Sub-schema for custom passes
const passSchema = new mongoose.Schema(
  {
    duration: { type: Number, required: true }, // e.g. 1, 3, 7 days
    price: { type: Number, required: true },
  },
  { _id: false }
);

const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    // ❌ removed fixed price
    passes: {
      type: [passSchema], // ✅ now supports multiple custom passes
      default: [{ duration: 1, price: 250 }], // default 1-day pass
    },
    rating: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    description: { type: String },
    tags: { type: [String], default: [] },

    verified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },

    reviews: [reviewSchema],

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🧮 Auto-calculate average rating
gymSchema.pre("save", function (next) {
  if (this.reviews.length > 0) {
    const avg =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.rating = Math.round(avg * 10) / 10;
  } else {
    this.rating = 0;
  }
  next();
});

const Gym = mongoose.model("Gym", gymSchema);
export default Gym;
