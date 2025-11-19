// models/Booking.js
import mongoose from "mongoose";

/* ---------------------- SUB-SCHEMAS ---------------------- */

// Check-in history (multi-use)
const checkinSchema = new mongoose.Schema({
  checkinAt: { type: Date, default: Date.now },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
});

// Modification requests
const modificationSchema = new mongoose.Schema({
  requestedDate: Date,
  requestedDuration: Number,
  requestedPrice: Number,
  reason: String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  adminNote: String,
  createdAt: { type: Date, default: Date.now },
});

// Payment logs
const paymentLogSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "paid",
  },
  amount: Number,
  transactionId: String,
  timestamp: { type: Date, default: Date.now },
});

/* ---------------------- MAIN BOOKING SCHEMA ---------------------- */

const bookingSchema = new mongoose.Schema(
  {
    /* --- Who & Where --- */
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

    /* --- Core Booking Info --- */
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },

    /* --- Usage Window --- */
    startDate: { type: Date },
    endDate: { type: Date },
    expiresAt: { type: Date }, // NEW

    status: {
      type: String,
      enum: ["pending", "confirmed", "checked-in", "cancelled", "expired"],
      default: "confirmed",
    },

    /* --- Check-in fields --- */
    checkInAt: Date,
    checkOutAt: Date,
    checkinHistory: [checkinSchema], // NEW

    /* --- QR Fields --- */
    bookingCode: { type: String, unique: true },
    qrCode: String,
    verifiedAt: Date,

    /* --- Payments & Accounting --- */
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "paid",
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "wallet", "cash", "test"],
      default: "upi",
    },
    paymentProvider: String,
    paymentRef: String,
    currency: { type: String, default: "INR" },
    platformFee: { type: Number, default: 0 },
    gymPayout: Number,
    couponCode: String,
    discountAmount: { type: Number, default: 0 },

    // NEW → payment attempts & refunds
    paymentLogs: [paymentLogSchema],

    /* --- Cancellation / Refunds --- */
    cancelledAt: Date,
    cancelReason: String,
    refundStatus: {
      type: String,
      enum: ["none", "requested", "processing", "completed", "rejected"],
      default: "none",
    },
    refundAmount: { type: Number, default: 0 },

    /* --- Modification Requests --- */
    modificationRequests: [modificationSchema], // NEW

    /* --- Internal Notes --- */
    internalNoteForAdmin: String, // NEW
    internalNoteForGym: String, // NEW

    /* --- Tracking --- */
    source: {
      type: String,
      enum: ["web", "mobile", "admin"],
      default: "web",
    },
    notes: String,
  },
  { timestamps: true }
);

/* ---------------------- PRE-SAVE HOOKS ---------------------- */

bookingSchema.pre("save", function (next) {
  // Unique booking code
  if (!this.bookingCode) {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.bookingCode = `PASSIIFY-${random}`;
  }

  // Auto-fill start and end dates
  if (!this.startDate) this.startDate = this.date;

  if (this.startDate && this.duration && !this.endDate) {
    const end = new Date(this.startDate);
    end.setDate(end.getDate() + this.duration - 1);
    this.endDate = end;
  }

  // Auto-expiry timestamp
  if (!this.expiresAt) {
    const expiry = new Date(this.startDate);
    expiry.setDate(expiry.getDate() + this.duration);
    this.expiresAt = expiry;
  }

  next();
});

export default mongoose.model("Booking", bookingSchema);
