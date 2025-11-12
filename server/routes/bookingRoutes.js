import express from "express";
import {
  createBooking,
  verifyBooking,
  getBookingById,
  getBookingsByUserId, // ✅ added new controller
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
 * 📜 Fetch all bookings for logged-in user (existing)
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
 * 🆕 Fetch bookings by user ID (for Dashboard.jsx)
 * @route GET /api/bookings/user/:id
 * @access Public (or protect if you want)
 */
router.get("/user/:id", async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.id })
      .populate("gym", "name city images")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("❌ Error fetching user bookings by ID:", error);
    res.status(500).json({ message: "Failed to fetch user bookings" });
  }
});

/**
 * ✅ Fetch single booking by ID (for BookingSuccess.jsx)
 * @route GET /api/bookings/:id
 * @access Private
 */
router.get("/:id", verifyToken, getBookingById);

export default router;
