import express from "express";
import asyncHandler from "express-async-handler";
import Booking from "../models/Booking.js";
import Gym from "../models/Gym.js";
import verifyToken from "../middleware/authMiddleware.js"; // ✅ using default export

const router = express.Router();

/**
 * 🧾 @desc    Create a new booking
 * @route     POST /api/bookings
 * @access    Private
 */
router.post(
  "/",
  verifyToken, // ✅ updated
  asyncHandler(async (req, res) => {
    const { gymId, date } = req.body;

    // Validate inputs
    if (!gymId || !date) {
      res.status(400);
      throw new Error("Gym ID and date are required");
    }

    // Find gym
    const gym = await Gym.findById(gymId);
    if (!gym) {
      res.status(404);
      throw new Error("Gym not found");
    }

    console.log("✅ Logged in user:", req.user?._id);

    // ✅ Create booking linked to logged-in user
    const booking = await Booking.create({
      user: req.user._id,
      gym: gym._id,
      date,
      price: gym.price,
      status: "confirmed",
    });

    // Populate gym info for immediate frontend use
    const populatedBooking = await Booking.findById(booking._id).populate(
      "gym",
      "name city price images"
    );

    res.status(201).json(populatedBooking);
  })
);

/**
 * 🧠 @desc    Get all bookings for a specific user
 * @route     GET /api/bookings/user
 * @access    Private
 */
router.get(
  "/user",
  verifyToken, // ✅ updated
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("gym", "name city price images")
      .sort({ createdAt: -1 });

    res.json(bookings);
  })
);

/**
 * 🎉 @desc    Get single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
router.get(
  "/:id",
  verifyToken, // ✅ updated
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
      .populate("gym", "name city price images")
      .populate("user", "name email"); // ✅ populate user too

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    // ✅ Safety check — only if booking.user exists
    if (booking.user && booking.user._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Unauthorized access to this booking");
    }

    res.json(booking);
  })
);

export default router;
