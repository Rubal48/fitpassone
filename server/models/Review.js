// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🎯 Target: right now gym, later event support too
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },

    type: {
      type: String,
      enum: ["gym", "event"],
      default: "gym",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔐 Moderation
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    flaggedReason: {
      type: String,
      default: "",
    },

    // Admin reply for transparency
    adminReply: {
      message: { type: String, default: "" },
      repliedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// 🧮 Recalculate average rating on target entity
reviewSchema.statics.calculateAverageRating = async function ({ gymId, eventId }) {
  const match = gymId ? { gym: gymId, type: "gym", status: "approved" } : { event: eventId, type: "event", status: "approved" };

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  const avg = stats.length > 0 ? stats[0].avgRating : 0;

  if (gymId) {
    await mongoose.model("Gym").findByIdAndUpdate(gymId, { rating: avg });
  } else if (eventId) {
    await mongoose.model("Event").findByIdAndUpdate(eventId, { rating: avg });
  }
};

// ⚡ Run after save
reviewSchema.post("save", function () {
  if (this.type === "gym" && this.gym) {
    this.constructor.calculateAverageRating({ gymId: this.gym });
  } else if (this.type === "event" && this.event) {
    this.constructor.calculateAverageRating({ eventId: this.event });
  }
});

// ⚡ Run after remove
reviewSchema.post("remove", function () {
  if (this.type === "gym" && this.gym) {
    this.constructor.calculateAverageRating({ gymId: this.gym });
  } else if (this.type === "event" && this.event) {
    this.constructor.calculateAverageRating({ eventId: this.event });
  }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
