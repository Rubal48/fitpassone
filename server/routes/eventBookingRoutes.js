// routes/eventBookingRoutes.js
import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  createEventBooking,
  getMyEventBookings,
  getEventBookingsByUserId,
  getEventBookingById,
  verifyEventBooking,
  cancelEventBooking,
  getEventAttendanceList,
  getEventAnalytics,
  getEventHostOverview,   // host overview stats
  getEventHostTopEvents,  // host top-events
  getHostEventBookings,   // 👈 NEW: host /me bookings
} from "../controllers/eventBookingController.js";

const router = express.Router();

/**
 * 🧾 Create a new event booking
 * POST /api/event-bookings
 */
router.post("/", verifyToken, createEventBooking);

/**
 * 📜 Get bookings for logged-in user
 * GET /api/event-bookings/me
 */
router.get("/me", verifyToken, getMyEventBookings);

/**
 * 👤 Host-level event bookings (for PartnerBookings)
 * GET /api/event-bookings/host/me
 */
router.get("/host/me", verifyToken, getHostEventBookings);

/**
 * 📊 Host / event organiser overview stats
 * GET /api/event-bookings/host/overview
 */
router.get("/host/overview", verifyToken, getEventHostOverview);

/**
 * 🥇 Top events for this host
 * GET /api/event-bookings/host/top-events
 */
router.get("/host/top-events", verifyToken, getEventHostTopEvents);

/**
 * 📜 Get bookings by user ID (admin usage)
 * GET /api/event-bookings/user/:userId
 */
router.get("/user/:userId", getEventBookingsByUserId); // later: add admin middleware

/**
 * ✅ Verify ticket / check-in (QR scan)
 * GET /api/event-bookings/verify/:bookingCode
 */
router.get("/verify/:bookingCode", verifyEventBooking);

/**
 * 👥 Attendance list for host/admin
 * GET /api/event-bookings/event/:eventId/attendance
 */
router.get("/event/:eventId/attendance", getEventAttendanceList);

/**
 * 📊 Event-level analytics
 * GET /api/event-bookings/event/:eventId/analytics
 */
router.get("/event/:eventId/analytics", getEventAnalytics);

/**
 * 📄 Get single booking
 * GET /api/event-bookings/:id
 */
router.get("/:id", verifyToken, getEventBookingById);

/**
 * ❌ Cancel booking (user)
 * POST /api/event-bookings/:id/cancel
 */
router.post("/:id/cancel", verifyToken, cancelEventBooking);

export default router;
