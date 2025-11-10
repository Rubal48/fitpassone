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
    let { name, city, address, price, description, images = [], tags = [], passes = [], customPrice = {} } = req.body;

    // ✅ Validate required fields (name + city)
    if (!name || !city) {
      res.status(400);
      throw new Error("Name and city are required");
    }

    // ✅ Derive price dynamically if not directly provided
    if (!price) {
      if (Array.isArray(passes) && passes.length > 0 && passes[0].price) {
        price = passes[0].price; // take first pass price
      } else if (customPrice && Object.values(customPrice).length > 0) {
        price = Object.values(customPrice)[0]; // take first available custom price
      } else {
        res.status(400);
        throw new Error("Price information missing (no price/passes/customPrice found)");
      }
    }

    // ✅ Create new pending gym
    const gym = await Gym.create({
      name,
      city,
      address,
      price,
      description,
      images,
      tags,
      passes,
      customPrice,
      status: "pending", // ✅ new gyms need admin approval
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
