import express from "express";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

/* ======================================================
   📋 GET ALL REVIEWS FOR A GYM
====================================================== */
router.get("/:gymId", async (req, res) => {
  try {
    const reviews = await Review.find({ gym: req.params.gymId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("❌ Error fetching reviews:", error.message);
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

/* ======================================================
   ✍️ ADD REVIEW — ONLY IF USER BOOKED THE GYM
====================================================== */
router.post("/:gymId", verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Check if the user has booked this gym
    const booking = await Booking.findOne({
      user: req.user._id,
      gym: req.params.gymId,
    });

    if (!booking) {
      return res.status(403).json({
        message: "You can only review gyms you’ve booked.",
      });
    }

    // Prevent duplicate reviews
    const existingReview = await Review.findOne({
      user: req.user._id,
      gym: req.params.gymId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this gym.",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      gym: req.params.gymId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("❌ Error adding review:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   ❌ DELETE A REVIEW (Optional - for testing)
====================================================== */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting review:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
