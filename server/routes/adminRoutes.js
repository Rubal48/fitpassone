// routes/adminRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import Gym from "../models/Gym.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import EventBooking from "../models/EventBooking.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* ========================
   🔐 Admin Token Helper
========================= */

// ✅ Always sign admin tokens with ONE consistent secret
const ADMIN_SIGN_SECRET =
  process.env.JWT_SECRET || process.env.ADMIN_SECRET || "dev_admin_secret";

const generateAdminToken = (id, expiresIn = "7d") =>
  jwt.sign({ id }, ADMIN_SIGN_SECRET, { expiresIn });

/* =======================================================
   🔓 PUBLIC ADMIN ROUTES (NO TOKEN)
======================================================= */

/** 🔐 Admin Login */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = (email || "").trim().toLowerCase();

    console.log("🔑 [ADMIN LOGIN] attempt:", emailLower);
    console.log("🔑 [ADMIN LOGIN] secret configured?", !!ADMIN_SIGN_SECRET);

    const admin = await Admin.findOne({ email: emailLower }).select("+password");
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare((password || "").trim(), admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateAdminToken(admin._id);
    console.log("✅ [ADMIN LOGIN] success, token starts:", token.slice(0, 20));

    res.json({
      _id: admin._id,
      email: admin.email,
      role: admin.role || "admin",
      token, // 👈 frontend uses res.data.token
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error during admin login" });
  }
});

/** ⚙️ One-time admin creation */
router.post("/create", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const emailLower = (email || "").trim().toLowerCase();

    const existing = await Admin.findOne({ email: emailLower });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({
      email: emailLower,
      password: (password || "").trim(),
      role: role || "admin",
    });

    res.status(201).json({
      message: "Admin created successfully",
      adminId: admin._id,
    });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ message: "Server error creating admin" });
  }
});

/* =======================================================
   🛡️ PROTECTED ADMIN ROUTES (REQUIRE TOKEN)
======================================================= */

router.use(adminAuth);

/** 👤 Current admin profile */
router.get("/me", async (req, res) => {
  res.json({
    _id: req.admin._id,
    email: req.admin.email,
    role: req.admin.role || "admin",
    lastLogin: req.admin.lastLogin,
  });
});

/* ==========================
   🏋️ GYM MANAGEMENT
========================== */

router.get("/gyms", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const gyms = await Gym.find(filter).sort({ createdAt: -1 });
    res.json(gyms);
  } catch (err) {
    console.error("Error fetching gyms:", err);
    res.status(500).json({ message: "Failed to fetch gyms" });
  }
});

router.get("/gyms/:id", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });
    res.json(gym);
  } catch (err) {
    console.error("Error fetching gym:", err);
    res.status(500).json({ message: "Failed to fetch gym" });
  }
});

router.put("/gyms/:id/verify", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    gym.status = status;
    gym.verified = status === "approved";
    await gym.save();

    res.json({ message: `Gym marked as ${status}`, gym });
  } catch (err) {
    console.error("Error updating gym status:", err);
    res.status(500).json({ message: "Failed to update gym status" });
  }
});

router.delete("/gyms/:id", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    await gym.deleteOne();
    res.json({ message: "Gym deleted successfully" });
  } catch (err) {
    console.error("Error deleting gym:", err);
    res.status(500).json({ message: "Failed to delete gym" });
  }
});

/* ==========================
   🎟️ EVENT MANAGEMENT
========================== */

// List events
router.get("/events", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const events = await Event.find(filter).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// 📊 Event analytics (keep this BEFORE /events/:id)
router.get("/events/analytics/summary", async (_req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const approvedEvents = await Event.countDocuments({ status: "approved" });
    const pendingEvents = await Event.countDocuments({ status: "pending" });
    const rejectedEvents = await Event.countDocuments({ status: "rejected" });

    const categoryStats = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const revenueAgg = await Event.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const estimatedRevenue = revenueAgg[0]?.total || 0;

    res.json({
      totalEvents,
      approvedEvents,
      pendingEvents,
      rejectedEvents,
      categoryStats,
      estimatedRevenue,
    });
  } catch (err) {
    console.error("Error getting analytics:", err);
    res.status(500).json({ message: "Failed to load analytics" });
  }
});

// ✅ Single event for AdminEventDetails.jsx
router.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

router.put("/events/:id/verify", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.status = status;
    event.verified = status === "approved";
    await event.save();

    res.json({ message: `Event marked as ${status}`, event });
  } catch (err) {
    console.error("Error verifying event:", err);
    res.status(500).json({ message: "Failed to update event status" });
  }
});

router.delete("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

/* ==========================
   💸 SETTLEMENTS & PAYOUTS
========================== */

/**
 * GET /api/admin/settlements/overview
 *
 * For each gym and each event it calculates:
 * - grossAmount  (what users paid)
 * - platformFee  (your commission)
 * - razorpayFee  (gateway cost snapshot)
 * - netPayable   (what you owe them)
 *
 * Response:
 * {
 *   summary: { totalGross, totalPlatformFee, totalRazorpayFee, totalNetPayable },
 *   gyms: [...],
 *   events: [...]
 * }
 */
router.get("/settlements/overview", async (_req, res) => {
  try {
    /* ---------- 1) GYM SETTLEMENTS (passes/bookings) ---------- */

    const gymAgg = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          // include docs with payoutStatus = "pending" OR older docs where payoutStatus doesn't exist yet
          $or: [
            { payoutStatus: "pending" },
            { payoutStatus: { $exists: false } },
          ],
        },
      },
      {
        $group: {
          _id: "$gym",
          totalBookings: { $sum: 1 },
          grossAmount: { $sum: "$price" },
          platformFee: { $sum: "$platformFee" },
          razorpayFee: { $sum: "$razorpayFee" },
          gymPayout: { $sum: "$gymPayout" },
        },
      },
    ]);

    const gymIds = gymAgg.map((g) => g._id);
    const gyms = await Gym.find({ _id: { $in: gymIds } }).select(
      "name city owner"
    );
    const gymMap = new Map(gyms.map((g) => [g._id.toString(), g]));

    const gymSettlements = gymAgg.map((row) => {
      const gymDoc = gymMap.get(row._id.toString());
      const gross = row.grossAmount || 0;
      const platformFee = row.platformFee || 0;
      const razorpayFee = row.razorpayFee || 0;
      const snapshotPayout = row.gymPayout || 0;

      // Prefer stored snapshot if present, else compute
      const netPayable =
        snapshotPayout || Math.max(0, gross - platformFee - razorpayFee);

      return {
        gymId: row._id,
        gymName: gymDoc?.name || "Gym",
        city: gymDoc?.city || "",
        ownerId: gymDoc?.owner || null,
        totalBookings: row.totalBookings || 0,
        grossAmount: gross,
        platformFee,
        razorpayFee,
        netPayable,
        currency: "INR",
      };
    });

    /* ---------- 2) EVENT SETTLEMENTS (tickets) ---------- */

    const eventAgg = await EventBooking.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          $or: [
            { payoutStatus: "pending" },
            { payoutStatus: { $exists: false } },
          ],
        },
      },
      {
        $group: {
          _id: "$event",
          totalBookings: { $sum: 1 },
          ticketsSold: { $sum: "$tickets" },
          grossAmount: { $sum: "$totalPrice" },
          platformFee: { $sum: "$platformFee" },
          razorpayFee: { $sum: "$razorpayFee" },
          hostPayout: { $sum: "$hostPayout" },
        },
      },
    ]);

    const eventIds = eventAgg.map((e) => e._id);
    const events = await Event.find({ _id: { $in: eventIds } }).select(
      "name organizer host date location city"
    );
    const eventMap = new Map(events.map((e) => [e._id.toString(), e]));

    const eventSettlements = eventAgg.map((row) => {
      const ev = eventMap.get(row._id.toString());
      const gross = row.grossAmount || 0;
      const platformFee = row.platformFee || 0;
      const razorpayFee = row.razorpayFee || 0;
      const snapshotPayout = row.hostPayout || 0;

      const netPayable =
        snapshotPayout || Math.max(0, gross - platformFee - razorpayFee);

      return {
        eventId: row._id,
        eventName: ev?.name || "Event",
        organizer: ev?.organizer || "",
        hostId: ev?.host || null,
        location: ev?.location || ev?.city || "",
        eventDate: ev?.date || null,
        totalBookings: row.totalBookings || 0,
        ticketsSold: row.ticketsSold || 0,
        grossAmount: gross,
        platformFee,
        razorpayFee,
        netPayable,
        currency: "INR",
      };
    });

    /* ---------- 3) SUMMARY TOTALS ---------- */

    const totalGrossGyms = gymSettlements.reduce(
      (sum, g) => sum + (g.grossAmount || 0),
      0
    );
    const totalGrossEvents = eventSettlements.reduce(
      (sum, e) => sum + (e.grossAmount || 0),
      0
    );

    const totalPlatformGyms = gymSettlements.reduce(
      (sum, g) => sum + (g.platformFee || 0),
      0
    );
    const totalPlatformEvents = eventSettlements.reduce(
      (sum, e) => sum + (e.platformFee || 0),
      0
    );

    const totalRazorpayGyms = gymSettlements.reduce(
      (sum, g) => sum + (g.razorpayFee || 0),
      0
    );
    const totalRazorpayEvents = eventSettlements.reduce(
      (sum, e) => sum + (e.razorpayFee || 0),
      0
    );

    const totalNetGyms = gymSettlements.reduce(
      (sum, g) => sum + (g.netPayable || 0),
      0
    );
    const totalNetEvents = eventSettlements.reduce(
      (sum, e) => sum + (e.netPayable || 0),
      0
    );

    const summary = {
      totalGross: totalGrossGyms + totalGrossEvents,
      totalPlatformFee: totalPlatformGyms + totalPlatformEvents,
      totalRazorpayFee: totalRazorpayGyms + totalRazorpayEvents,
      totalNetPayable: totalNetGyms + totalNetEvents,
    };

    res.json({
      summary,
      gyms: gymSettlements,
      events: eventSettlements,
    });
  } catch (err) {
    console.error("Error building settlements overview:", err);
    res
      .status(500)
      .json({ message: "Failed to load settlements overview" });
  }
});

/**
 * POST /api/admin/settlements/mark-paid/gym/:gymId
 * Marks all pending payouts for a gym as PAID (one-click bulk).
 */
router.post("/settlements/mark-paid/gym/:gymId", async (req, res) => {
  try {
    const { gymId } = req.params;
    const { note, batchId } = req.body || {};
    const now = new Date();

    const result = await Booking.updateMany(
      {
        gym: gymId,
        paymentStatus: "paid",
        $or: [
          { payoutStatus: "pending" },
          { payoutStatus: { $exists: false } },
        ],
      },
      {
        $set: {
          payoutStatus: "paid",
          payoutAt: now,
          ...(note ? { payoutNote: note } : {}),
          ...(batchId ? { payoutBatchId: batchId } : {}),
        },
      }
    );

    res.json({
      message: "Gym payout(s) marked as paid",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error marking gym payouts as paid:", err);
    res.status(500).json({ message: "Failed to mark gym payouts as paid" });
  }
});

/**
 * POST /api/admin/settlements/mark-paid/event/:eventId
 * Marks all pending payouts for an event host as PAID.
 */
router.post("/settlements/mark-paid/event/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { note, batchId } = req.body || {};
    const now = new Date();

    const result = await EventBooking.updateMany(
      {
        event: eventId,
        paymentStatus: "paid",
        $or: [
          { payoutStatus: "pending" },
          { payoutStatus: { $exists: false } },
        ],
      },
      {
        $set: {
          payoutStatus: "paid",
          payoutAt: now,
          ...(note ? { payoutNote: note } : {}),
          ...(batchId ? { payoutBatchId: batchId } : {}),
        },
      }
    );

    res.json({
      message: "Event payout(s) marked as paid",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error marking event payouts as paid:", err);
    res.status(500).json({ message: "Failed to mark event payouts as paid" });
  }
});

export default router;
