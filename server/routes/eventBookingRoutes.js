import express from "express";
import EventBooking from "../models/EventBooking.js";
import Event from "../models/Event.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route POST /api/event-bookings
 * @desc  Create a new booking for an event
 */
router.post("/", async (req, res) => {
  try {
    const { userId, eventId, tickets } = req.body;

    const event = await Event.findById(eventId);
    const user = await User.findById(userId);

    if (!event || !user) {
      return res
        .status(404)
        .json({ success: false, message: "Event or User not found" });
    }

    const totalPrice = event.price * tickets;

    const booking = new EventBooking({
      user: userId,
      event: eventId,
      tickets,
      totalPrice,
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: "🎟️ Event booked successfully!",
      booking,
    });
  } catch (error) {
    console.error("❌ Error creating event booking:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create event booking" });
  }
});

/**
 * @route GET /api/event-bookings/user/:userId
 * @desc  Get all event bookings for a specific user
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const bookings = await EventBooking.find({ user: req.params.userId })
      .populate("event")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("❌ Error fetching user event bookings:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch bookings" });
  }
});

/**
 * @route GET /api/event-bookings/:id
 * @desc  Get a single event booking by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const booking = await EventBooking.findById(req.params.id)
      .populate("event", "name image location date price organizer");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("❌ Error fetching event booking:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch booking" });
  }
});

export default router;
