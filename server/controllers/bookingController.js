import Booking from "../models/Booking.js";

export const createBooking = async (req, res) => {
  try {
    const { gymId } = req.body;

    if (!gymId) {
      return res.status(400).json({ message: "Gym ID is required" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      gym: gymId,
      date: new Date(),
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({ message: "Failed to create booking" });
  }
};
