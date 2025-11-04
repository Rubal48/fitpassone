import express from "express";
import { adminLogin, getAllGyms, approveGym } from "../controllers/adminController.js";
import verifyAdmin from "../middleware/adminAuth.js"; // ✅ default import
import { createAdmin } from "../controllers/adminController.js";
const router = express.Router();

router.post("/login", adminLogin);
router.get("/gyms", verifyAdmin, getAllGyms);
router.put("/gyms/:id/approve", verifyAdmin, approveGym);
router.post("/create", createAdmin);
export default router;
