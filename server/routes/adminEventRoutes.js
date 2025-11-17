// routes/adminEventRoutes.js
import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

/**
 * @route   GET /admin/events
 * @desc    Admin get all events
 */
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("❌ Error fetching admin events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

/**
 * @route   PUT /admin/events/:id/verify
 * @desc    Approve / Reject event
 */
router.put("/:id/verify", async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status,
        verified: status === "approved",
      },
      { new: true }
    );

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({
      message: `Event ${status === "approved" ? "approved" : "rejected"}`,
      event,
    });
  } catch (error) {
    console.error("❌ Error updating event status:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

/**
 * @route   DELETE /admin/events/:id
 * @desc    Delete event
 */
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

/**
 * @route   GET /admin/events/analytics
 * @desc    Event analytics for admin
 */
router.get("/analytics/summary", async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const approvedEvents = await Event.countDocuments({ status: "approved" });
    const pendingEvents = await Event.countDocuments({ status: "pending" });
    const rejectedEvents = await Event.countDocuments({ status: "rejected" });

    const categoryStats = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const revenueEstimate = await Event.aggregate([
      { $group: { _id: null, sum: { $sum: "$price" } } },
    ]);

    res.json({
      totalEvents,
      approvedEvents,
      pendingEvents,
      rejectedEvents,
      categoryStats,
      estimatedRevenue: revenueEstimate[0]?.sum || 0,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Analytics failed" });
  }
});

export default router;
