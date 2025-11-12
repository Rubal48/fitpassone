import Booking from "../models/Booking.js";
import Gym from "../models/Gym.js";
import User from "../models/User.js";
import { sendBookingConfirmationEmail } from "../utils/sendEmail.js";

// ✅ Create booking after successful payment
export const createBooking = async (req, res) => {
  try {
    const { gymId, date, duration, price, passDuration, userId: bodyUserId } = req.body;

    console.log("🟦 Incoming booking request:", {
      gymId,
      date,
      duration,
      price,
      passDuration,
      tokenUser: req.user?._id,
      bodyUserId,
    });

    if (!gymId || !date) {
      return res.status(400).json({ message: "Gym ID and date are required" });
    }

    const userId = req.user?._id || bodyUserId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const [gym, user] = await Promise.all([
      Gym.findById(gymId),
      User.findById(userId),
    ]);

    if (!gym || gym.status !== "approved") {
      return res.status(404).json({ message: "Gym not found or not approved" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let selectedPass = null;

    if (Array.isArray(gym.passes) && gym.passes.length > 0) {
      selectedPass = gym.passes.find((p) => p.duration === (passDuration || duration));
    }

    if (!selectedPass && gym.customPrice) {
      const d = passDuration || duration;
      selectedPass = {
        duration: Number(d),
        price: Number(gym.customPrice[d]) || Number(price) || 0,
      };
    }

    if (!selectedPass || !selectedPass.price) {
      return res.status(400).json({ message: "Invalid pass duration or price" });
    }

    const booking = new Booking({
      user: userId,
      gym: gymId,
      date,
      duration: selectedPass.duration,
      price: selectedPass.price,
      status: "confirmed",
      paymentStatus: "paid",
    });

    await booking.save();
    console.log("✅ Booking saved successfully:", booking.bookingCode);

    if (user?.email) {
      try {
        await sendBookingConfirmationEmail(user.email, {
          gymName: gym.name,
          city: gym.city,
          date,
          bookingCode: booking.bookingCode,
          price: selectedPass.price,
        });
        console.log("✅ Confirmation email sent to:", user.email);
      } catch (emailErr) {
        console.error("❌ Failed to send email:", emailErr.message);
      }
    }

    res.status(201).json({
      _id: booking._id,
      message: "Booking created successfully ✅",
      booking: {
        _id: booking._id,
        bookingCode: booking.bookingCode,
        price: booking.price,
        duration: booking.duration,
        date: booking.date,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        gym: {
          _id: gym._id,
          name: gym.name,
          city: gym.city,
        },
        user: {
          _id: user._id,
          name: user.name,
          email: user.email || "N/A",
        },
      },
    });
  } catch (error) {
    console.error("❌ Booking creation failed:", error);
    res.status(500).json({
      message: error.message || "Failed to create booking",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// ✅ Verify booking (QR scan)
export const verifyBooking = async (req, res) => {
  try {
    const { bookingCode } = req.params;

    const booking = await Booking.findOne({ bookingCode })
      .populate("gym", "name city")
      .populate("user", "name email");

    if (!booking)
      return res.status(404).json({ valid: false, message: "Booking not found" });

    if (booking.status !== "confirmed")
      return res
        .status(400)
        .json({ valid: false, message: "Pass already used or expired" });

    booking.status = "checked-in";
    booking.verifiedAt = new Date();
    await booking.save();

    res.json({
      valid: true,
      message: "Valid booking. Access granted ✅",
      booking: {
        bookingCode: booking.bookingCode,
        user: booking.user.name,
        gym: booking.gym.name,
        city: booking.gym.city,
        date: booking.date,
      },
    });
  } catch (error) {
    console.error("❌ Verification failed:", error);
    res.status(500).json({ valid: false, message: "Verification failed." });
  }
};

// ✅ Fetch single booking by ID (for BookingSuccess.jsx)
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("gym", "name city images")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("❌ Error fetching booking by ID:", error);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
};
// ✅ Fetch all bookings by user ID (for dashboard)
export const getBookingsByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = await Booking.find({ user: id })
      .populate("gym", "name city images")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("❌ Error fetching bookings by user ID:", error);
    res.status(500).json({ message: "Failed to fetch user bookings" });
  }
};
