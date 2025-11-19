// controllers/bookingController.js
import Booking from "../models/Booking.js";
import Gym from "../models/Gym.js";
import User from "../models/User.js";
import QRCode from "qrcode";

/* ======================================================
   1️⃣ CREATE BOOKING
====================================================== */
export const createBooking = async (req, res) => {
  try {
    const { gymId, date, duration, price, paymentMethod, couponCode } = req.body;
    const userId = req.user._id;

    const gym = await Gym.findById(gymId);
    if (!gym || gym.status !== "approved") {
      return res.status(404).json({ message: "Gym not found or not approved." });
    }

    // Create booking
    const booking = new Booking({
      user: userId,
      gym: gymId,
      date,
      duration,
      price,
      paymentMethod,
      couponCode,
      paymentStatus: "paid",
      platformFee: Math.round(price * 0.1), // 10% platform cut
      gymPayout: Math.round(price * 0.9),
      source: "web",
    });

    // Generate QR code
    const qr = await QRCode.toDataURL(booking._id.toString());
    booking.qrCode = qr;

    await booking.save();

    return res.status(201).json({
      success: true,
      message: "Booking created successfully!",
      booking,
    });
  } catch (err) {
    console.error("❌ createBooking error:", err);
    return res.status(500).json({ message: "Booking creation failed." });
  }
};

/* ======================================================
   2️⃣ VERIFY BOOKING (QR SCAN)
====================================================== */
export const verifyBooking = async (req, res) => {
  try {
    const { bookingCode } = req.params;

    const booking = await Booking.findOne({ bookingCode })
      .populate("user", "name email")
      .populate("gym", "name city");

    if (!booking)
      return res.status(404).json({ message: "Booking not found." });

    if (booking.expiresAt && new Date() > new Date(booking.expiresAt))
      return res.status(400).json({ message: "Pass expired." });

    // Add to check-in history
    booking.checkInAt = new Date();
    if (!Array.isArray(booking.checkinHistory)) {
      booking.checkinHistory = [];
    }
    booking.checkinHistory.push({
      checkinAt: new Date(),
      verifiedBy: req.user._id,
    });
    booking.status = "checked-in";
    booking.verifiedAt = new Date();

    await booking.save();

    return res.json({
      success: true,
      message: "Check-in successful.",
      booking,
    });
  } catch (err) {
    console.error("❌ verifyBooking error:", err);
    return res.status(500).json({ message: "Verification failed." });
  }
};

/* ======================================================
   3️⃣ GET SINGLE BOOKING 
====================================================== */
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("gym", "name city images")
      .populate("user", "name email");

    if (!booking) return res.status(404).json({ message: "Not found" });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch booking." });
  }
};

/* ======================================================
   4️⃣ GET BOOKINGS FOR LOGGED-IN USER
====================================================== */
export const getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("gym", "name city images")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ message: "Failed to load bookings." });
  }
};

/* ======================================================
   4️⃣.b GET BOOKINGS BY USER ID (for dashboards / admin)
   GET /api/bookings/user/:userId
====================================================== */
export const getBookingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ user: userId })
      .populate("gym", "name city images")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    console.error("❌ getBookingsByUserId error:", err);
    res.status(500).json({ message: "Failed to load bookings." });
  }
};

/* ======================================================
   5️⃣ CANCEL BOOKING + REFUND
====================================================== */
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (booking.status !== "confirmed")
      return res.status(400).json({ message: "Cannot cancel this booking." });

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.refundStatus = "requested";
    booking.refundAmount = Math.round(booking.price * 0.8); // 80% refund

    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled. Refund requested.",
      booking,
    });
  } catch (err) {
    res.status(500).json({ message: "Cancel failed." });
  }
};

/* ======================================================
   6️⃣ REQUEST BOOKING MODIFICATION
====================================================== */
export const requestModification = async (req, res) => {
  try {
    const { requestedDate, requestedDuration, reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ message: "Booking not found." });

    booking.modificationRequests.push({
      requestedDate,
      requestedDuration,
      reason,
    });

    await booking.save();

    res.json({
      success: true,
      message: "Modification request submitted.",
      booking,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit modification request." });
  }
};

/* ======================================================
   7️⃣ ADMIN APPROVES/REJECTS MODIFICATION
====================================================== */
export const handleModification = async (req, res) => {
  try {
    const { requestId, action, adminNote } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ message: "Booking not found." });

    const modifyReq = booking.modificationRequests.id(requestId);

    if (!modifyReq)
      return res.status(404).json({ message: "Modification request not found." });

    modifyReq.status = action;
    modifyReq.adminNote = adminNote;

    // If approved → apply changes
    if (action === "approved") {
      if (modifyReq.requestedDate) booking.date = modifyReq.requestedDate;
      if (modifyReq.requestedDuration)
        booking.duration = modifyReq.requestedDuration;
    }

    await booking.save();

    res.json({ success: true, message: "Updated.", booking });
  } catch (err) {
    res.status(500).json({ message: "Action failed." });
  }
};

/* ======================================================
   8️⃣ GET ATTENDANCE LIST (Gym View)
====================================================== */
export const getAttendanceList = async (req, res) => {
  try {
    const { gymId } = req.params;

    const checkins = await Booking.find({
      gym: gymId,
      status: "checked-in",
    }).populate("user", "name email");

    res.json({ success: true, checkins });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance." });
  }
};

/* ======================================================
   9️⃣ ANALYTICS (Admin Dashboard)
====================================================== */
export const getAnalytics = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: "confirmed" });
    const cancelled = await Booking.countDocuments({ status: "cancelled" });

    const revenue = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    res.json({
      success: true,
      totalBookings,
      activeBookings,
      cancelled,
      revenue: revenue[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Analytics failed." });
  }
};
