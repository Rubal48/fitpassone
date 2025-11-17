import EventBooking from "../models/EventBooking.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { sendEventBookingEmail } from "../utils/sendEmail.js";

// ✅ Create Event Booking after successful payment
export const createEventBooking = async (req, res) => {
  try {
    const { eventId, userId: bodyUserId, price, date } = req.body;

    const userId = req.user?._id || bodyUserId;
    if (!userId || !eventId) {
      return res.status(400).json({ message: "User ID and Event ID are required" });
    }

    const [event, user] = await Promise.all([
      Event.findById(eventId),
      User.findById(userId),
    ]);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    const eventBooking = new EventBooking({
      user: userId,
      event: eventId,
      price: price || event.price || 0,
      date: date || event.date,
      status: "confirmed",
      paymentStatus: "paid",
    });

    await eventBooking.save();

    // Optional: send confirmation email
    if (user?.email) {
      try {
        await sendEventBookingEmail(user.email, {
          eventName: event.name,
          location: event.location,
          date: event.date,
          price: price || event.price,
        });
        console.log("✅ Event booking email sent to:", user.email);
      } catch (emailErr) {
        console.error("❌ Failed to send event booking email:", emailErr.message);
      }
    }

    res.status(201).json({
      message: "Event booked successfully ✅",
      booking: {
        _id: eventBooking._id,
        event: {
          _id: event._id,
          name: event.name,
          location: event.location,
          date: event.date,
        },
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        status: eventBooking.status,
        paymentStatus: eventBooking.paymentStatus,
        price: eventBooking.price,
      },
    });
  } catch (error) {
    console.error("❌ Event booking creation failed:", error);
    res.status(500).json({ message: "Failed to create event booking" });
  }
};

// ✅ Get all event bookings by user
export const getEventBookingsByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = await EventBooking.find({ user: id })
      .populate("event", "name location date")
      .populate("user", "name email");

    res.json({ bookings });
  } catch (error) {
    console.error("❌ Error fetching event bookings:", error);
    res.status(500).json({ message: "Failed to fetch event bookings" });
  }
};

// ✅ Get single event booking by ID (for booking success page)
export const getEventBookingById = async (req, res) => {
  try {
    const booking = await EventBooking.findById(req.params.id)
      .populate("event", "name location date images")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Event booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("❌ Error fetching event booking by ID:", error);
    res.status(500).json({ message: "Failed to fetch event booking" });
  }
};
