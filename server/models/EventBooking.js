// models/EventBooking.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const eventBookingSchema = new Schema(
  {
    // Who & which event
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    // Basic info
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    eventDate: {
      type: Date, // denormalised from Event.date at booking time
    },

    tickets: {
      type: Number,
      default: 1,
      min: 1,
    },

    // Pricing
    totalPrice: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },

    // Payment
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "paid",
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "wallet", "cash", "test"],
      default: "upi",
    },
    paymentProvider: {
      type: String, // e.g. "razorpay", "stripe"
    },
    paymentRef: {
      type: String, // gateway transaction ID / reference
    },

    // Platform economics
    platformFee: {
      type: Number,
      default: 0,
    },
    hostPayout: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },

    // Booking lifecycle
    status: {
      type: String,
      enum: ["active", "cancelled", "checked-in", "no-show", "expired"],
      default: "active",
    },

    // Check-in data
    checkInAt: {
      type: Date,
    },

    // Cancellation / refunds
    cancelledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
    refundStatus: {
      type: String,
      enum: ["none", "requested", "processing", "completed", "rejected"],
      default: "none",
    },
    refundAmount: {
      type: Number,
      default: 0,
    },

    // QR / ticket code
    bookingCode: {
      type: String, // e.g. PASSIIFY-EVT-8JXKQ
      unique: true,
    },
    qrCode: {
      type: String, // Base64 string or URL
    },

    // Meta
    source: {
      type: String,
      enum: ["web", "mobile", "admin"],
      default: "web",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// ✅ Auto-generate unique booking code & copy eventDate
eventBookingSchema.pre("save", function (next) {
  if (!this.bookingCode) {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.bookingCode = `PASSIIFY-EVT-${random}`;
  }

  // ensure eventDate set if not
  if (!this.eventDate && this.populated("event") == null) {
    // we will normally set eventDate in controller,
    // but leaving here as a fallback
    // (no-op here, controller will handle)
  }

  next();
});

const EventBooking = mongoose.model("EventBooking", eventBookingSchema);
export default EventBooking;
