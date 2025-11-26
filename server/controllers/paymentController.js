// controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import QRCode from "qrcode";

import Booking from "../models/Booking.js";
import Gym from "../models/Gym.js";
import Event from "../models/Event.js";
import EventBooking from "../models/EventBooking.js";

/* =========================================================
   Helper: get Razorpay instance safely
========================================================= */
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret =
    process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;

  if (!key_id || !key_secret) {
    // IMPORTANT: don't crash server, just throw and we handle it below
    throw new Error(
      "Razorpay key_id/key_secret missing. Check .env (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET)."
    );
  }

  return new Razorpay({ key_id, key_secret });
};

const getRazorpaySecret = () => {
  const secret =
    process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;
  if (!secret) {
    throw new Error(
      "Razorpay KEY SECRET missing. Set RAZORPAY_KEY_SECRET in .env."
    );
  }
  return secret;
};

/* =========================================================
   Helper: resolve event price (matches frontend getPrice)
========================================================= */
const getEventPrice = (event) => {
  if (!event) return 0;

  const rawPrice =
    event.price ??
    event.passPrice ??
    event.amount ??
    (event.pricing && event.pricing.price);

  const priceNum = Number(rawPrice);
  if (!rawPrice || Number.isNaN(priceNum) || priceNum <= 0) {
    return 0;
  }
  return priceNum;
};

/* =========================================================
   1️⃣ GYM — CREATE ORDER
   POST /api/payments/gym/create-order
========================================================= */
export const createGymOrder = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { gymId, date, duration, price } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    if (!gymId || !date || !duration || !price) {
      return res.status(400).json({
        success: false,
        message: "gymId, date, duration and price are required",
      });
    }

    const gym = await Gym.findById(gymId);
    if (!gym || gym.status !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Gym not found or not approved.",
      });
    }

    const numericPrice = Number(price);
    const amount = Math.round(numericPrice * 100); // Razorpay works in paise

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price / amount for payment",
      });
    }

    const razorpay = getRazorpayInstance();

    // ✅ SHORT RECEIPT (max 40 chars for Razorpay)
    const gymIdStr = gymId.toString();
    const shortGymId = gymIdStr.slice(-6); // last 6 chars of ObjectId
    const shortTime = Date.now().toString().slice(-6); // last 6 digits of timestamp
    const receiptId = `GYM_${shortGymId}_${shortTime}`; // e.g. GYM_AB12CD_918273

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: receiptId,
      notes: {
        gymId: gymId.toString(),
        userId: userId.toString(),
        date,
        duration: String(duration),
      },
    });

    return res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order,
      meta: {
        gym: {
          _id: gym._id,
          name: gym.name,
          city: gym.city,
        },
        date,
        duration,
        price: numericPrice,
      },
    });
  } catch (error) {
    console.error("❌ createGymOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

/* =========================================================
   2️⃣ GYM — VERIFY PAYMENT & CREATE BOOKING
   POST /api/payments/gym/verify-payment
========================================================= */
export const verifyGymPayment = async (req, res) => {
  try {
    const userId = req.user?._id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      gymId,
      date,
      duration,
      price,
    } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment details",
      });
    }

    const secret = getRazorpaySecret();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    const gym = await Gym.findById(gymId);
    if (!gym || gym.status !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Gym not found or not approved.",
      });
    }

    const numericPrice = Number(price);

    // 👉 Same logic as createBooking, but with payment gateway fields
    const booking = new Booking({
      user: userId,
      gym: gymId,
      date,
      duration,
      price: numericPrice,
      paymentMethod: "upi",
      paymentProvider: "razorpay",
      paymentRef: razorpay_payment_id,
      paymentStatus: "paid",
      platformFee: Math.round(numericPrice * 0.1),
      gymPayout: Math.round(numericPrice * 0.9),
      source: "web",
      paymentLogs: [
        {
          status: "paid",
          amount: numericPrice,
          transactionId: razorpay_payment_id,
        },
      ],
    });

    // QR code, same as in bookingController
    const qr = await QRCode.toDataURL(booking._id.toString());
    booking.qrCode = qr;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified, booking created",
      booking,
    });
  } catch (error) {
    console.error("❌ verifyGymPayment error:", error);
    return res.status(500).json({
      success: false,
      message: "Gym payment verification failed",
      error: error.message,
    });
  }
};

/* =========================================================
   3️⃣ EVENT — CREATE ORDER
   POST /api/payments/event/create-order
========================================================= */
export const createEventOrder = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { eventId, tickets = 1 } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    if (!eventId) {
      return res
        .status(400)
        .json({ success: false, message: "eventId is required" });
    }

    const [event, existingActive] = await Promise.all([
      Event.findById(eventId),
      EventBooking.findOne({
        user: userId,
        event: eventId,
        status: { $in: ["active", "checked-in"] },
      }),
    ]);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (event.status && event.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "This event is not open for bookings yet",
      });
    }

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: "You already have an active booking for this event",
      });
    }

    const qty = Math.max(1, Number(tickets) || 1);

    const baseCapacity =
      typeof event.capacity === "number"
        ? event.capacity
        : typeof event.totalSlots === "number"
        ? event.totalSlots
        : null;

    const remaining =
      typeof event.remainingSeats === "number"
        ? event.remainingSeats
        : baseCapacity;

    if (typeof remaining === "number" && qty > remaining) {
      return res.status(400).json({
        success: false,
        message: `Only ${remaining} spots left`,
      });
    }

    const pricePerTicket = getEventPrice(event);

    if (!pricePerTicket) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid event price. Please set a valid price for this event in the dashboard.",
      });
    }

    const grossTotal = pricePerTicket * qty;
    const amount = Math.round(grossTotal * 100);

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid event price / amount",
      });
    }

    const razorpay = getRazorpayInstance();

    // ✅ SHORT RECEIPT (max 40 chars for Razorpay)
    const eventIdStr = eventId.toString();
    const shortEventId = eventIdStr.slice(-6);
    const shortTimeEvt = Date.now().toString().slice(-6);
    const eventReceiptId = `EVT_${shortEventId}_${shortTimeEvt}`; // e.g. EVT_CD34EF_918273

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: eventReceiptId,
      notes: {
        eventId: eventId.toString(),
        userId: userId.toString(),
        tickets: String(qty),
      },
    });

    return res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order,
      meta: {
        event: {
          _id: event._id,
          name: event.name,
          location: event.location,
          date: event.date,
        },
        tickets: qty,
        pricePerTicket,
        total: grossTotal,
      },
    });
  } catch (error) {
    console.error("❌ createEventOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create event payment order",
      error: error.message,
    });
  }
};

/* =========================================================
   4️⃣ EVENT — VERIFY PAYMENT & CREATE EventBooking
   POST /api/payments/event/verify-payment
========================================================= */
export const verifyEventPayment = async (req, res) => {
  try {
    const userId = req.user?._id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      tickets,
    } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment details",
      });
    }

    const secret = getRazorpaySecret();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const qty = Math.max(1, Number(tickets) || 1);
    const pricePerTicket = getEventPrice(event);

    if (!pricePerTicket) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid event price. Please set a valid price for this event in the dashboard.",
      });
    }

    const grossTotal = pricePerTicket * qty;

    if (!grossTotal || Number.isNaN(grossTotal) || grossTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid event price / amount",
      });
    }

    const platformFee = Math.round(grossTotal * 0.1);
    const hostPayout = grossTotal - platformFee;

    const booking = new EventBooking({
      user: userId,
      event: eventId,
      eventDate: event.date,
      tickets: qty,
      totalPrice: grossTotal,
      currency: "INR",
      paymentStatus: "paid",
      paymentMethod: "upi",
      paymentProvider: "razorpay",
      paymentRef: razorpay_payment_id,
      platformFee,
      hostPayout,
      source: "web",
    });

    await booking.save();

    // update event capacity & stats (legacy-safe)
    if (typeof event.decrementSeats === "function") {
      event.decrementSeats(qty);
    } else {
      const capacityForRemaining =
        typeof event.remainingSeats === "number"
          ? event.remainingSeats
          : typeof event.capacity === "number"
          ? event.capacity
          : typeof event.totalSlots === "number"
          ? event.totalSlots
          : qty;

      const newRemaining = capacityForRemaining - qty;
      event.remainingSeats = Math.max(
        0,
        Number.isNaN(newRemaining) ? 0 : newRemaining
      );
      event.ticketsSold = (event.ticketsSold || 0) + qty;
    }

    event.totalRevenue = (event.totalRevenue || 0) + grossTotal;

    if (!event.stats) {
      event.stats = {
        totalBookings: 0,
        totalAttendees: 0,
        totalCancellations: 0,
      };
    }
    event.stats.totalBookings = (event.stats.totalBookings || 0) + 1;
    event.stats.totalAttendees = (event.stats.totalAttendees || 0) + qty;

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Event payment verified, booking created",
      booking,
    });
  } catch (error) {
    console.error("❌ verifyEventPayment error:", error);
    return res.status(500).json({
      success: false,
      message: "Event payment verification failed",
      error: error.message,
    });
  }
};
