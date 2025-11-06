import express from "express";
import verifyAdmin from "../middleware/adminAuth.js";
import {
  adminLogin,
  createAdmin,
  getAllGyms,
  getGymById,
  approveGym,
  rejectGym,
  deleteGym,
} from "../controllers/adminController.js";

const router = express.Router();

// 🔐 Admin Authentication
router.post("/login", adminLogin);
router.post("/create", createAdmin);

// 🏋️ Admin Gym Management
router.get("/gyms", verifyAdmin, getAllGyms);
router.get("/gyms/:id", verifyAdmin, getGymById);
router.put("/gyms/:id/approve", verifyAdmin, approveGym);
router.put("/gyms/:id/reject", verifyAdmin, rejectGym);
router.delete("/gyms/:id", verifyAdmin, deleteGym);

export default router;
