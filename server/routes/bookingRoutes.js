import express from "express";
import {
  createBooking,
  verifyBooking,
  getBookingById,
} from "../controllers/bookingController.js";
import verifyToken from "../middleware/authMiddleware.js";
import Booking from "../models/Booking.js";

const router = express.Router();

/**
 * 🧾 Create a new booking
 * @route POST /api/bookings
 * @access Private
 */
router.post("/", verifyToken, createBooking);

/**
 * ✅ Verify a booking via booking code (QR/scan)
 * @route GET /api/bookings/verify/:bookingCode
 * @access Private
 */
router.get("/verify/:bookingCode", verifyToken, verifyBooking);

/**
 * 📜 Fetch all bookings for logged-in user
 * @route GET /api/bookings/user
 * @access Private
 */
router.get("/user", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("gym", "name city images")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("❌ Fetch user bookings failed:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

/**
 * ✅ Fetch single booking by ID (for BookingSuccess.jsx)
 * @route GET /api/bookings/:id
 * @access Private
 */
router.get("/:id", verifyToken, getBookingById);

export default router;
