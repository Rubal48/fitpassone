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
      discountPercent = Math.round(
        ((basePrice - salePrice) / basePrice) * 100
      );
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
// NOTE: For images/coverImage, frontend should send full URLs (now Cloudinary)
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
      "businessType",
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
      "coverImage",
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

    let base =
      basePrice !== undefined && basePrice !== null
        ? Number(basePrice)
        : undefined;
    let sale =
      salePrice !== undefined && salePrice !== null
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

// ✅ SAFE /me/stats – works even if user has no gym (event-only host)
router.get(
  "/me/stats",
  verifyToken,
  asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const gym = await Gym.findOne({ owner: user._id });

    // If no gym (e.g. pure event host), return safe zeros so UI doesn't error
    if (!gym) {
      return res.json({
        success: true,
        bookingsToday: 0,
        activePasses: 0,
        revenueThisMonth: 0,
        growthRate: 0,
        rating: 4.8, // nice default rating for now
        upcomingEvents: 0,
      });
    }

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
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

    const growthRate = 0; // placeholder for later comparison logic
    const upcomingEvents = 0; // events will come from EventBooking later

    res.json({
      success: true,
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
      businessType,
      city,
      address,
      description,
      images = [],
      tags = [],
      passes = [],
      phone,
      website,
      instagram,
      googleMapLink,
      facilities = [],
      openingHours,
      coverImage,
      businessProof,
      ownerIdProof,
      video,
    } = req.body;

    if (!name || !city) {
      res.status(400);
      throw new Error("Name and city are required");
    }

    // Normalise arrays
    if (!Array.isArray(tags)) {
      if (typeof tags === "string") {
        tags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      } else {
        tags = [];
      }
    }

    if (!Array.isArray(facilities)) {
      facilities = [];
    }

    if (!Array.isArray(images)) {
      images = images ? [images] : [];
    }

    // Normalise passes — convert simple { duration, price, discountPercent }
    // into the richer { basePrice, salePrice, discountPercent, price } structure.
    const normalisePass = (raw) => {
      if (!raw) return null;

      const duration =
        typeof raw.duration === "number"
          ? raw.duration
          : Number(raw.duration) || 1;

      const toNum = (val) => {
        if (val === undefined || val === null || val === "") return undefined;
        const n = Number(val);
        return Number.isFinite(n) && n > 0 ? n : undefined;
      };

      let basePrice = toNum(raw.basePrice);
      let salePrice = toNum(raw.salePrice);
      let legacyPrice = toNum(raw.price);
      let inputDiscount = toNum(raw.discountPercent);

      // If no explicit base/sale, infer from legacy price + discount%
      if (basePrice == null && salePrice == null) {
        if (legacyPrice != null && inputDiscount != null && inputDiscount > 0) {
          salePrice = legacyPrice;
          const multiplier = 1 - inputDiscount / 100;
          basePrice =
            multiplier > 0 ? Math.round(legacyPrice / multiplier) : legacyPrice;
        } else if (legacyPrice != null) {
          basePrice = legacyPrice;
          salePrice = legacyPrice;
        }
      }

      if (basePrice != null && salePrice == null) salePrice = basePrice;
      if (salePrice != null && basePrice == null) basePrice = salePrice;

      let discountPercent = 0;
      if (
        basePrice != null &&
        salePrice != null &&
        salePrice < basePrice
      ) {
        discountPercent = Math.round(
          ((basePrice - salePrice) / basePrice) * 100
        );
      }

      const finalPrice = salePrice ?? basePrice ?? legacyPrice ?? 0;

      return {
        name: raw.name || `${duration}-Day Pass`,
        description: raw.description || "",
        duration,
        basePrice,
        salePrice,
        discountPercent,
        offerLabel: raw.offerLabel || "",
        maxCheckIns:
          raw.maxCheckIns !== undefined && raw.maxCheckIns !== null
            ? Number(raw.maxCheckIns) || 0
            : 0,
        isActive:
          typeof raw.isActive === "boolean" ? raw.isActive : true,
        price: finalPrice,
      };
    };

    const normalisedPasses = Array.isArray(passes)
      ? passes.map(normalisePass).filter(Boolean)
      : [];

    if (!normalisedPasses.length) {
      return res
        .status(400)
        .json({ message: "Add at least one pass with a valid price." });
    }

    // Hero + gallery images: now they are Cloudinary URLs or any absolute URLs
    const hero = coverImage || images[0] || null;
    const gallery = images || [];
    const finalImages = hero
      ? [hero, ...gallery.filter((img) => img !== hero)]
      : gallery;

    const gym = new Gym({
      name,
      businessType: businessType || "gym",
      city,
      address,
      description,
      phone,
      website,
      instagram,
      googleMapLink,
      facilities,
      openingHours: openingHours || null,
      passes: normalisedPasses,
      coverImage: hero,
      images: finalImages,
      businessProof,
      ownerIdProof,
      video,
      status: "pending",
      owner: req.user._id,
    });

    await gym.save(); // pre-save will set rating + cached price from passes

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
    gym.verified = true; // mark as verified when admin approves
    await gym.save();

    res.json({ message: "✅ Gym approved successfully!", gym });
  })
);

export default router;
