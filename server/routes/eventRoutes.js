import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

/**
 * @route   GET /api/events
 * @desc    Get all events
 */
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
});

/**
 * @route   GET /api/events/seed
 * @desc    Seed demo events (for testing)
 * ⚠️ Must come BEFORE /:id route
 */
router.get("/seed", async (req, res) => {
  try {
    await Event.deleteMany(); // Clear old events

    const demoEvents = [
      {
        name: "Morning Yoga by the Ganges",
        description:
          "Start your day with peace and energy by the banks of the Ganga River in Rishikesh.",
        location: "Rishikesh, Uttarakhand",
        date: new Date("2025-12-02"),
        category: "yoga",
        price: 299,
        capacity: 30,
        image:
          "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800",
        rating: 4.9,
        organizer: "Rishikesh Yoga Tribe",
      },
      {
        name: "Goa Beach Volleyball Bash",
        description:
          "Join local communities for an evening of fun, fitness, and sunshine!",
        location: "Baga Beach, Goa",
        date: new Date("2025-12-10"),
        category: "adventure",
        price: 499,
        capacity: 50,
        image:
          "https://images.unsplash.com/photo-1600734425032-6e7a1b7444dd?w=800",
        rating: 4.8,
        organizer: "Goa Active Club",
      },
      {
        name: "Delhi Outdoor Bootcamp",
        description:
          "High-intensity outdoor workout session with trainers and community groups.",
        location: "Lodhi Garden, Delhi",
        date: new Date("2025-12-08"),
        category: "strength",
        price: 399,
        capacity: 40,
        image:
          "https://images.unsplash.com/photo-1594737625785-c4bffbe6a92e?w=800",
        rating: 4.7,
        organizer: "Passiify Fitness Community",
      },
      {
        name: "Manali Mindfulness Retreat",
        description:
          "Experience guided meditation, journaling, and mindful living in the Himalayas.",
        location: "Old Manali, Himachal Pradesh",
        date: new Date("2025-12-20"),
        category: "mindfulness",
        price: 999,
        capacity: 20,
        image:
          "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800",
        rating: 5.0,
        organizer: "Mountain Soul",
      },
    ];

    await Event.insertMany(demoEvents);

    res.status(201).json({
      success: true,
      message: "🌟 Demo events added successfully!",
      count: demoEvents.length,
    });
  } catch (error) {
    console.error("❌ Error seeding events:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to seed demo events" });
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get single event
 */
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   POST /api/events
 * @desc    Create new event
 */
router.post("/", async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    console.error("❌ Error creating event:", error);
    res.status(500).json({ success: false, message: "Failed to create event" });
  }
});

export default router;
