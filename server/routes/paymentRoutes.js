// routes/paymentRoutes.js
import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  createGymOrder,
  verifyGymPayment,
  createEventOrder,
  verifyEventPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

/* =========================================================
   GYM PASSES
   Base path: /api/payments
========================================================= */

// 1️⃣ Create Razorpay order for a gym pass
// POST /api/payments/gym/create-order
router.post("/gym/create-order", verifyToken, createGymOrder);

// 2️⃣ Verify Razorpay payment + create Booking
// POST /api/payments/gym/verify-payment
router.post("/gym/verify-payment", verifyToken, verifyGymPayment);

/* =========================================================
   EVENTS
   Base path: /api/payments
========================================================= */

// 3️⃣ Create Razorpay order for an event booking
// POST /api/payments/event/create-order
router.post("/event/create-order", verifyToken, createEventOrder);

// 4️⃣ Verify Razorpay payment + create EventBooking
// POST /api/payments/event/verify-payment
router.post("/event/verify-payment", verifyToken, verifyEventPayment);

export default router;
