import mongoose from "mongoose";

// Sub-schema for reviews
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false } // optional, avoids nested _id for each review
);

const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 }, // Average rating (auto-calculated)
    images: { type: [String], default: [] },
    description: { type: String },
    tags: { type: [String], default: [] },

    // ✅ Gym verification (admin badge)
    verified: { type: Boolean, default: false },

    // ✅ Gym approval for listing visibility
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },

    // ✅ User reviews
    reviews: [reviewSchema],

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🧮 Middleware: Auto-update average rating when reviews change
gymSchema.pre("save", function (next) {
  if (this.reviews.length > 0) {
    const avg =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.rating = Math.round(avg * 10) / 10; // round to 1 decimal (e.g., 4.3)
  } else {
    this.rating = 0;
  }
  next();
});

const Gym = mongoose.model("Gym", gymSchema);
export default Gym;
