import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
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
    date: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    // ✅ New field for selected pass duration
    duration: {
      type: Number, // in days (e.g., 1, 3, 7, 10)
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "checked-in", "cancelled", "expired"],
      default: "confirmed",
    },

    // ✅ QR & Verification Fields
    bookingCode: {
      type: String, // Example: PASSIIFY-8JXKQ
      unique: true,
    },
    qrCode: {
      type: String, // Will store the QR code image (Base64)
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "paid",
    },
    verifiedAt: {
      type: Date, // When gym verifies QR
    },
  },
  { timestamps: true }
);

// ✅ Auto-generate unique booking code
bookingSchema.pre("save", function (next) {
  if (!this.bookingCode) {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.bookingCode = `PASSIIFY-${random}`;
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
