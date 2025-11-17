import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { updateUserProfile } from "../controllers/userController.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();
// ✅ Update user profile (name/email)
router.put("/update-profile/:id", verifyToken, updateUserProfile);

// ✅ Token Generator
const generateToken = (id, expiresIn = "7d") =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });

/* ========================
   🟢 REGISTER ROUTE (Fixed)
   ======================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const emailLower = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ⚙️ DO NOT HASH HERE — User model pre('save') handles hashing
    const user = await User.create({
      name,
      email: emailLower,
      password: password.trim(), // plain text; will be hashed automatically
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

/* ========================
   🟣 LOGIN ROUTE (Cleaned)
   ======================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // use model's matchPassword method (simpler & safer)
    const isMatch = await user.matchPassword(password.trim());
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

/* ========================
   🔵 FORGOT PASSWORD
   ======================== */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token valid for 15 minutes
    const resetToken = generateToken(user._id, "15m");
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
      <h2 style="color:#1e3a8a;">Hey ${user.name || "Fitness Champ"},</h2>
      <p style="font-size:16px; color:#475569;">
        We received a request to reset your password for your Passiify account.<br/>
        Click below to set a new one.
      </p>
      <div style="text-align:center; margin:30px 0;">
        <a href="${resetURL}" 
           style="background:linear-gradient(90deg,#2563eb,#f97316);
           color:white;padding:12px 24px;border-radius:6px;
           text-decoration:none;font-weight:bold;font-size:16px;">
          🔐 Reset My Password
        </a>
      </div>
      <p style="font-size:14px; color:#64748b;">
        This link expires in <strong>15 minutes</strong>.
      </p>
    `;

    await sendEmail(user.email, "🔐 Reset your Passiify password", message);

    res.json({ message: "Reset link sent to your email address" });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    res.status(500).json({ message: "Server error while sending reset link" });
  }
});

/* ========================
   🟠 RESET PASSWORD
   ======================== */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "Invalid token" });

    // 🔒 Automatically re-hashed by model pre('save')
    user.password = password.trim();
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (err) {
    console.error("Reset Password Error:", err.message);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

export default router;
