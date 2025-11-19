// routes/adminRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import Gym from "../models/Gym.js";
import Event from "../models/Event.js";
import adminAuth from "../middleware/adminAuth.js";


const router = express.Router();

/* ========================
   🔐 Admin Token Helper
========================= */
const generateAdminToken = (id, expiresIn = "7d") =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });

/* =======================================================
   🔓 PUBLIC ADMIN ROUTES (NO TOKEN)
======================================================= */

/** 🔐 Admin Login */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.trim().toLowerCase();

    const admin = await Admin.findOne({ email: emailLower });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password.trim(), admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Optional: track last login
    admin.lastLoginAt = new Date();
    await admin.save();

    res.json({
      _id: admin._id,
      email: admin.email,
      role: admin.role || "admin",
      token: generateAdminToken(admin._id),
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error during admin login" });
  }
});

/** ⚙️ One-time admin creation (use carefully) */
router.post("/create", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const emailLower = email.trim().toLowerCase();

    const existing = await Admin.findOne({ email: emailLower });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({
      email: emailLower,
      password: password.trim(),
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

// Everything below this line requires a valid admin JWT
router.use(adminAuth);

/** 👤 Get current admin profile (for dashboard header) */
router.get("/me", async (req, res) => {
  res.json({
    _id: req.admin._id,
    email: req.admin.email,
    role: req.admin.role || "admin",
    lastLoginAt: req.admin.lastLoginAt,
  });
});

/* ==========================
   🏋️ GYM MANAGEMENT
========================== */

/** 📋 Fetch all gyms (with optional status filter) */
router.get("/gyms", async (req, res) => {
  try {
    const { status } = req.query; // ?status=pending / approved / rejected
    const filter = status ? { status } : {};
    const gyms = await Gym.find(filter).sort({ createdAt: -1 });

    res.json(gyms);
  } catch (err) {
    console.error("Error fetching gyms:", err);
    res.status(500).json({ message: "Failed to fetch gyms" });
  }
});

/** 🔍 Get single gym detail */
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

/** 🟢 Unified verify / approve / reject */
router.put("/gyms/:id/verify", async (req, res) => {
  try {
    const { status } = req.body; // "approved" | "rejected" | "pending"

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    gym.status = status;
    gym.verified = status === "approved";

    await gym.save();

    res.json({
      message: `Gym marked as ${status}`,
      gym,
    });
  } catch (err) {
    console.error("Error updating gym status:", err);
    res.status(500).json({ message: "Failed to update gym status" });
  }
});

/** 🟩 Legacy approve route (backward compatible) */
router.put("/gyms/:id/approve", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    gym.status = "approved";
    gym.verified = true;

    await gym.save();

    res.json({ message: "Gym approved", gym });
  } catch (err) {
    console.error("Error approving gym:", err);
    res.status(500).json({ message: "Failed to approve gym" });
  }
});

/** 🟥 Legacy reject route (backward compatible) */
router.put("/gyms/:id/reject", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    gym.status = "rejected";
    gym.verified = false;

    await gym.save();

    res.json({ message: "Gym rejected", gym });
  } catch (err) {
    console.error("Error rejecting gym:", err);
    res.status(500).json({ message: "Failed to reject gym" });
  }
});

/** ❌ Delete gym permanently */
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
   (used by your AdminDashboard.jsx)
========================== */

/** 📋 Fetch all events */
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

/** 🟢 Approve / Reject event */
router.put("/events/:id/verify", async (req, res) => {
  try {
    const { status } = req.body; // "approved" | "rejected" | "pending"

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

/** ❌ Delete event */
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

/** 📊 Event Analytics Summary (for AdminDashboard) */
router.get("/events/analytics/summary", async (_req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const approvedEvents = await Event.countDocuments({ status: "approved" });
    const pendingEvents = await Event.countDocuments({ status: "pending" });
    const rejectedEvents = await Event.countDocuments({ status: "rejected" });

    // Category stats
    const categoryStats = await Event.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Simple estimated revenue = sum of event.price
    const revenueAgg = await Event.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
        },
      },
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

export default router;
