// routes/gymRoutes.js
import express from "express";
import asyncHandler from "express-async-handler";
import Gym from "../models/Gym.js";

const router = express.Router();

// ✅ GET /api/gyms -> Only approved gyms
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = req.query.query || "";
    let filter = { status: "approved" }; // ✅ only approved

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ name: regex }, { city: regex }, { tags: regex }];
    }

    const gyms = await Gym.find(filter)
      .sort({ rating: -1, createdAt: -1 })
      .limit(100);
    res.json(gyms);
  })
);

// ✅ GET /api/gyms/:id -> allow access even if pending
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      res.status(404);
      throw new Error("Gym not found");
    }
    res.json(gym);
  })
);

// ✅ POST /api/gyms -> new gyms marked as pending
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, city, address, price, description, images = [], tags = [] } = req.body;
    if (!name || !city || !price) {
      res.status(400);
      throw new Error("Name, city, and price are required");
    }

    const gym = await Gym.create({
      name,
      city,
      address,
      price,
      description,
      images,
      tags,
      status: "pending", // ✅ new gyms need manual approval
    });

    res.status(201).json({
      message: "Gym submitted successfully! Awaiting admin approval.",
      gym,
    });
  })
);
// ✅ PUT /api/gyms/approve/:id -> Approve gym manually
router.put(
  "/approve/:id",
  asyncHandler(async (req, res) => {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      res.status(404);
      throw new Error("Gym not found");
    }

    gym.status = "approved"; // mark as verified
    await gym.save();

    res.json({ message: "✅ Gym approved successfully!", gym });
  })
);

export default router;
