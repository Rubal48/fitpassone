// routes/gymRoutes.js
import express from "express";
import asyncHandler from "express-async-handler";
import Gym from "../models/Gym.js";
import Booking from "../models/Booking.js"; // ✅ for partner bookings & stats
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================
   Helper – map passes for dashboard
============================ */

const mapPassesForDashboard = (gym) => {
  const raw = Array.isArray(gym.passes) ? gym.passes : [];

  return raw.map((p, idx) => {
    let basePrice = 0;
    if (typeof p.basePrice === "number") basePrice = p.basePrice;
    else if (typeof p.price === "number") basePrice = p.price;

    let salePrice = 0;
    if (typeof p.salePrice === "number") salePrice = p.salePrice;
    else if (typeof p.price === "number") salePrice = p.price;
    else salePrice = basePrice;

    let discountPercent =
      typeof p.discountPercent === "number" ? p.discountPercent : 0;

    if (basePrice && salePrice && salePrice < basePrice && !discountPercent) {
      discountPercent = Math.round(((basePrice - salePrice) / basePrice) * 100);
    } else if (!basePrice || salePrice >= basePrice) {
      discountPercent = 0;
    }

    return {
      id: idx.toString(), // used by PartnerPasses.jsx
      name: p.name || `${p.duration || 1}-Day Pass`,
      durationDays: p.duration,
      basePrice,
      salePrice,
      price: salePrice,
      discountPercent,
      offerLabel: p.offerLabel || "",
      maxCheckIns: p.maxCheckIns ?? 0,
      isActive: p.isActive ?? true,
      description: p.description || "",
    };
  });
};

/* ============================
   1) PARTNER-OWNED GYM
   (used by Partner Dashboard)
============================ */

// ✅ GET /api/gyms/me -> gym owned by logged-in user
router.get(
  "/me",
  verifyToken,
  asyncHandler(async (req, res) => {
    const gym = await Gym.findOne({ owner: req.user._id });

    if (!gym) {
      return res.status(404).json({
        message:
          "No gym found for this account. Submit your gym via Partner form.",
      });
    }

    res.json({ gym });
  })
);

// ✅ PUT /api/gyms/me -> update current partner's gym (profile edit)
router.put(
  "/me",
  verifyToken,
  asyncHandler(async (req, res) => {
    const gym = await Gym.findOne({ owner: req.user._id });

    if (!gym) {
      return res.status(404).json({ message: "Gym not found for this owner." });
    }

    const allowedFields = [
      "name",
      "city",
      "address",
      "description",
      "phone",
      "website",
      "instagram",
      "googleMapLink",
      "openingHours",
      "facilities",
      "images",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        gym[field] = req.body[field];
      }
    });

    await gym.save();

    res.json({
      message: "Gym profile updated successfully.",
      gym,
    });
  })
);

/* ----------------------------
   DEV HELPER — attach first gym to this user
---------------------------- */

router.post(
  "/dev/attach-first-gym",
  verifyToken,
  asyncHandler(async (req, res) => {
    const gym = await Gym.findOne().sort({ createdAt: 1 });

    if (!gym) {
      return res
        .status(404)
        .json({ message: "No gyms exist in the database yet." });
    }

    gym.owner = req.user._id;
    await gym.save();

    res.json({
      message:
        "Attached the first gym in DB to this account as owner (DEV helper).",
      gym,
    });
  })
);

/* ----------------------------
   Partner Passes (dashboard)
---------------------------- */

// ✅ GET /api/gyms/me/passes -> mapped passes for dashboard
router.get(
  "/me/passes",
  verifyToken,
  asyncHandler(async (req, res) => {
    const gym = await Gym.findOne({ owner: req.user._id });

    if (!gym) {
      return res.status(404).json({ message: "Gym not found for this owner." });
    }

    const passes = mapPassesForDashboard(gym);
    res.json({ passes });
  })
);

// ✅ POST /api/gyms/me/passes -> append a new pass into gym.passes
router.post(
  "/me/passes",
  verifyToken,
  asyncHandler(async (req, res) => {
    const gym = await Gym.findOne({ owner: req.user._id });

    if (!gym) {
      return res.status(404).json({ message: "Gym not found for this owner." });
    }

    const {
      name,
      durationDays,
      basePrice,
      salePrice,
      price,
      maxCheckIns,
      isActive,
      description,
      offerLabel,
    } = req.body;

    if (!durationDays) {
      return res.status(400).json({
        message: "durationDays is required for a pass.",
      });
    }

    const duration = Number(durationDays) || 1;

    let base = basePrice !== undefined && basePrice !== null
      ? Number(basePrice)
      : undefined;
    let sale = salePrice !== undefined && salePrice !== null
      ? Number(salePrice)
      : undefined;
    const flatPrice =
      price !== undefined && price !== null ? Number(price) : undefined;

    // If only flat price is provided, treat as both
    if (base === undefined && sale === undefined && flatPrice !== undefined) {
      base = flatPrice;
      sale = flatPrice;
    }

    if (base === undefined && sale !== undefined) base = sale;
    if (sale === undefined && base !== undefined) sale = base;

    const effectiveBase = base || sale || 0;
    const effectiveSale = sale || base || 0;

    if (!effectiveBase && !effectiveSale) {
      return res
        .status(400)
        .json({ message: "At least one price (base or sale) is required." });
    }

    let discountPercent = 0;
    if (effectiveBase && effectiveSale && effectiveSale < effectiveBase) {
      discountPercent = Math.round(
        ((effectiveBase - effectiveSale) / effectiveBase) * 100
      );
    }

    gym.passes.push({
      name: name || `${duration}-Day Pass`,
      description: description || "",
      duration,
      basePrice: effectiveBase,
      salePrice: effectiveSale,
      discountPercent,
      offerLabel: offerLabel || "",
      maxCheckIns: Number(maxCheckIns) || 0,
      isActive: typeof isActive === "boolean" ? isActive : true,
      price: effectiveSale,
    });

    await gym.save(); // pre-save will also recalc gym.price

    const passes = mapPassesForDashboard(gym);

    res.status(201).json({
      message: "Pass created successfully.",
      passes,
    });
  })
);

// ✅ DELETE /api/gyms/me/passes/:id -> remove a pass by index
router.delete(
  "/me/passes/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const gym = await Gym.findOne({ owner: req.user._id });

    if (!gym) {
      return res.status(404).json({ message: "Gym not found for this owner." });
    }

    const index = parseInt(req.params.id, 10);
    if (Number.isNaN(index) || index < 0 || index >= gym.passes.length) {
      return res.status(404).json({ message: "Pass not found." });
    }

    gym.passes.splice(index, 1);
    await gym.save();

    const passes = mapPassesForDashboard(gym);

    res.json({
      message: "Pass deleted successfully.",
      passes,
    });
  })
);

/* ----------------------------
   Partner Bookings & Stats
---------------------------- */

router.get(
  "/me/bookings",
  verifyToken,
  asyncHandler(async (req, res) => {
    const gym = await Gym.findOne({ owner: req.user._id });

    if (!gym) {
      return res.status(404).json({ message: "Gym not found for this owner." });
    }

    const bookings = await Booking.find({ gym: gym._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ bookings });
  })
);

router.get(
  "/me/stats",
  verifyToken,
  asyncHandler(async (req, res) => {
    const gym = await Gym.findOne({ owner: req.user._._id });

    if (!gym) {
      return res.status(404).json({ message: "Gym not found for this owner." });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const bookingsToday = await Booking.countDocuments({
      gym: gym._id,
      createdAt: { $gte: startOfDay },
    });

    const activePasses = Array.isArray(gym.passes) ? gym.passes.length : 0;

    const revenueAgg = await Booking.aggregate([
      {
        $match: {
          gym: gym._id,
          paymentStatus: "paid",
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
        },
      },
    ]);

    const revenueThisMonth = revenueAgg[0]?.total || 0;

    const growthRate = 0;
    const upcomingEvents = 0;

    res.json({
      bookingsToday,
      activePasses,
      revenueThisMonth,
      growthRate,
      rating: gym.rating || 0,
      upcomingEvents,
    });
  })
);

/* ============================
   2) PUBLIC LIST & DETAIL
============================ */

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = req.query.query || "";
    let filter = { status: "approved" };

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

/* ============================
   3) PUBLIC CREATE + ADMIN APPROVE
============================ */

router.post(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    let {
      name,
      city,
      address,
      price,
      description,
      images = [],
      tags = [],
      passes = [],
      customPrice = {},
    } = req.body;

    if (!name || !city) {
      res.status(400);
      throw new Error("Name and city are required");
    }

    if (!price) {
      if (Array.isArray(passes) && passes.length > 0 && passes[0].price) {
        price = passes[0].price;
      } else if (customPrice && Object.values(customPrice).length > 0) {
        price = Object.values(customPrice)[0];
      } else {
        res.status(400);
        throw new Error(
          "Price information missing (no price/passes/customPrice found)"
        );
      }
    }

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
      status: "pending",
      owner: req.user._id,
    });

    res.status(201).json({
      message: "Gym submitted successfully! Awaiting admin approval.",
      gym,
    });
  })
);

router.put(
  "/approve/:id",
  asyncHandler(async (req, res) => {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      res.status(404);
      throw new Error("Gym not found");
    }

    gym.status = "approved";
    await gym.save();

    res.json({ message: "✅ Gym approved successfully!", gym });
  })
);

export default router;
