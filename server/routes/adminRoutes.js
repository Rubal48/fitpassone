import express from "express";
import {
  adminLogin,
  createAdmin,
  getAllGyms,
  getGymById,
  deleteGym,
  verifyGym,
  approveGym,
  rejectGym,
} from "../controllers/adminController.js";

const router = express.Router();

/* =======================================================
 ✅ Admin Routes
======================================================= */

// 🔐 Admin login
router.post("/login", adminLogin);

// ⚙️ One-time admin creation (optional)
router.post("/create", createAdmin);

// 📋 Fetch all gyms for dashboard
router.get("/gyms", getAllGyms);

// 🔍 Get single gym detail
router.get("/gyms/:id", getGymById);

// 🟢 Unified verify/reject endpoint (used by AdminGymDetails.jsx)
router.put("/gyms/:id/verify", verifyGym);

// 🟩 Legacy approve route (still works)
router.put("/gyms/:id/approve", approveGym);

// 🟥 Legacy reject route (still works)
router.put("/gyms/:id/reject", rejectGym);

// ❌ Delete gym permanently
router.delete("/gyms/:id", deleteGym);

export default router;
