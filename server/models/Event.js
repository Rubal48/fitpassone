// server/models/Event.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

// ✅ Optional: cancellation policy per event
const cancellationPolicySchema = new Schema(
  {
    type: {
      type: String,
      enum: ["flexible", "moderate", "strict", "none"],
      default: "flexible",
    },
    // e.g. full refund until 24 hours before start
    freeCancellationHours: {
      type: Number,
      default: 24,
    },
    refundPercentBefore: {
      type: Number,
      default: 100,
    },
    refundPercentAfter: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

// ✅ Optional analytics snapshot (can be filled from bookings)
const eventStatsSchema = new Schema(
  {
    totalBookings: { type: Number, default: 0 },
    totalAttendees: { type: Number, default: 0 },
    totalCancellations: { type: Number, default: 0 },
  },
  { _id: false }
);

const eventSchema = new Schema(
  {
    // Core info
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true }, // human-readable city/venue
    date: { type: Date, required: true },

    category: {
      type: String,
      enum: ["yoga", "strength", "cardio", "adventure", "mindfulness"],
      default: "adventure",
    },

    price: { type: Number, required: true },
    capacity: { type: Number, default: 50 },

    // 🧮 Live capacity tracking
    remainingSeats: {
      type: Number,
      default: null, // will default to capacity if null
    },
    ticketsSold: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800",
    },

    // Ratings
    rating: { type: Number, default: 4.5 },
    ratingCount: { type: Number, default: 0 },

    // Host / organizer
    organizer: { type: String, default: "Passiify Community" },
    host: {
      type: Schema.Types.ObjectId,
      ref: "User", // event host/creator (could later be separate Host model)
    },

    personalNote: { type: String, default: "" },

    // Status + verification (for admin)
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },

    // Experience details
    tags: { type: [String], default: [] },
    languages: {
      type: [String],
      default: ["English", "Hindi"],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    meetingPoint: {
      type: String, // e.g. "Gate 3, Lodhi Garden"
    },
    meetingInstructions: {
      type: String, // finer details shared on the ticket/email
    },

    // Check-in rules
    checkInRequired: {
      type: Boolean,
      default: true,
    },

    // Cancellation policy
    cancellationPolicy: {
      type: cancellationPolicySchema,
      default: () => ({}),
    },

    // Analytics snapshot
    stats: {
      type: eventStatsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

// ✅ Initialise remainingSeats from capacity if missing
eventSchema.pre("save", function (next) {
  if (this.remainingSeats == null) {
    this.remainingSeats = this.capacity;
  }
  next();
});

// Optional: small helper methods
eventSchema.methods.decrementSeats = function (tickets = 1) {
  if (this.remainingSeats == null) this.remainingSeats = this.capacity;
  this.remainingSeats = Math.max(0, this.remainingSeats - tickets);
  this.ticketsSold += tickets;
};

eventSchema.methods.incrementSeats = function (tickets = 1) {
  if (this.remainingSeats == null) this.remainingSeats = this.capacity;
  this.remainingSeats = Math.min(
    this.capacity,
    this.remainingSeats + tickets
  );
  this.ticketsSold = Math.max(0, this.ticketsSold - tickets);
};

// 🔥 VERY IMPORTANT: default export must be the model function
const Event = model("Event", eventSchema);

export default Event;
