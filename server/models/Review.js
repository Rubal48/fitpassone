import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
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
  },
  { timestamps: true }
);

// 🧮 Automatically calculate gym’s average rating
reviewSchema.statics.calculateAverageRating = async function (gymId) {
  const stats = await this.aggregate([
    { $match: { gym: gymId } },
    {
      $group: {
        _id: "$gym",
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("Gym").findByIdAndUpdate(gymId, {
      rating: stats[0].avgRating,
    });
  } else {
    await mongoose.model("Gym").findByIdAndUpdate(gymId, { rating: 0 });
  }
};

// ⚡ Run after save or remove
reviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.gym);
});

reviewSchema.post("remove", function () {
  this.constructor.calculateAverageRating(this.gym);
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
