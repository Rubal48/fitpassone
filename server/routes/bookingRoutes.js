// routes/bookingRoutes.js
import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  createBooking,
  verifyBooking,
  getBookingById,
  getBookingsByUser,
  getBookingsByUserId,
  cancelBooking,
  requestModification,
  handleModification,
  getAttendanceList,
  getAnalytics,
} from "../controllers/bookingController.js";

const router = express.Router();

/* User routes */
router.post("/", verifyToken, createBooking);

// Current logged-in user's bookings (used by MyBookings)
router.get("/user", verifyToken, getBookingsByUser);

// By explicit userId (used by dashboards / HostEvent etc.)
router.get("/user/:userId", getBookingsByUserId);

/* QR / Verification */
router.get("/verify/:bookingCode", verifyBooking);

/* Cancellation */
router.put("/cancel/:id", verifyToken, cancelBooking);

/* Modification */
router.post("/modify/:id", verifyToken, requestModification);

/* Admin approve/reject modification */
router.put("/modify/:id/admin", handleModification);

/* Attendance List (Gym Panel) */
router.get("/attendance/:gymId", getAttendanceList);

/* Analytics */
router.get("/analytics/data", getAnalytics);

/* Single booking (keep AFTER special routes) */
router.get("/:id", verifyToken, getBookingById);

export default router;
