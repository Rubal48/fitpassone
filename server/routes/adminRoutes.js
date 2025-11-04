import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import Gym from "../models/Gym.js";
import verifyAdmin from "../middleware/adminAuth.js";

dotenv.config();
const router = express.Router();

// ✅ Utility: Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ✅ Quick Test
router.get("/test", (req, res) => {
  res.json({ message: "✅ Admin route working fine" });
});

/* ======================================================
   🧑‍💼 ADMIN REGISTER — USE ONCE, THEN DELETE
====================================================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log("✅ New Admin Created:", admin.email);

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    console.error("❌ Admin Register Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   🔑 ADMIN LOGIN
====================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    console.log("Entered password:", password);
    console.log("Stored hash in MongoDB:", admin.password);

    const isMatch = await bcrypt.compare(password.trim(), admin.password);
    console.log("✅ Password Match Result:", isMatch);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    console.error("❌ Admin Login Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   🔁 ADMIN RESET PASSWORD (USE IN DEBUG MODE)
====================================================== */
router.put("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and newPassword required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    admin.password = hashed;
    await admin.save();

    console.log("✅ Password reset for:", email);
    console.log("💾 New hash:", hashed);

    res.json({ message: `✅ Password reset successful for ${email}` });
  } catch (error) {
    console.error("❌ Error resetting password:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   🏋️‍♂️ ADMIN GYM CONTROLS (Protected)
====================================================== */
router.get("/gyms", verifyAdmin, async (req, res) => {
  try {
    const gyms = await Gym.find().sort({ createdAt: -1 });
    res.json(gyms);
  } catch (error) {
    console.error("❌ Error fetching gyms:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/verify/:gymId", verifyAdmin, async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.gymId);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    gym.status = "approved";
    await gym.save();

    res.json({ message: `${gym.name} verified ✅`, gym });
  } catch (error) {
    console.error("❌ Error verifying gym:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
