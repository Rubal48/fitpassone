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

    /**
     * FINAL amount the user pays for this booking
     * after all offers/coupons/platform discounts.
     */
    price: { type: Number, required: true },

    /* --- Pricing Snapshot (MRP vs discount) --- */
    /**
     * basePrice  -> Original MRP / listed price at time of booking
     * salePrice  -> Price after Passiify offer (before extra coupons)
     * discountPercent -> (basePrice - salePrice) / basePrice * 100
     * offerLabel -> e.g. "Launch Offer", "New Year Sale", "Early Bird"
     *
     * NOTE:
     * - For old bookings or no-offer bookings, basePrice/salePrice may be equal.
     * - Controllers should store a snapshot here so you always know
     *   what discount was applied when the booking was created.
     */
    basePrice: { type: Number },
    salePrice: { type: Number },
    discountPercent: { type: Number, default: 0 },
    offerLabel: String,

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

    // 👉 your commission per booking (snapshot)
    platformFee: { type: Number, default: 0 },

    // 👉 Razorpay charges you paid for this booking (snapshot)
    razorpayFee: { type: Number, default: 0 }, // NEW

    // 👉 what should ultimately go to the gym for this booking
    gymPayout: { type: Number, default: 0 },

    // 👉 status of payout to partner (for settlements)
    payoutStatus: {
      type: String,
      enum: ["pending", "processing", "paid", "failed"],
      default: "pending",
    }, // NEW
    payoutAt: Date, // when you mark it as paid in admin
    payoutBatchId: String, // optional (for grouping payouts)
    payoutNote: String, // e.g. "Paid via NEFT TXN123"

    /**
     * couponCode       -> any code applied (e.g. PASS10)
     * discountAmount   -> total discount in ₹ applied on this booking
     *                    (can include both offer + coupon if you want)
     */
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

  // 🧮 Backfill base/sale price for old bookings if missing
  if (!this.basePrice && this.price && !this.salePrice) {
    this.basePrice = this.price;
    this.salePrice = this.price;
  }

  // 🧮 Auto-calc discountPercent if we have a real offer
  if (this.basePrice && this.salePrice && this.salePrice < this.basePrice) {
    const diff = this.basePrice - this.salePrice;
    this.discountPercent = Math.round((diff / this.basePrice) * 100);
  } else {
    this.discountPercent = 0;
  }

  // 🧮 Safety: if gymPayout is not set, default to "user paid - fees"
  if (!this.gymPayout && this.price) {
    const pf = this.platformFee || 0;
    const rf = this.razorpayFee || 0;
    this.gymPayout = Math.max(0, this.price - pf - rf);
  }

  next();
});

export default mongoose.model("Booking", bookingSchema);
