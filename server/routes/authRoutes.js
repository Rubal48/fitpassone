// routes/userRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import verifyToken from "../middleware/authMiddleware.js";
import { updateUserProfile } from "../controllers/userController.js";

const router = express.Router();

/* ========================
   🔐 TOKEN GENERATOR
========================= */
const generateToken = (id, expiresIn = "7d") =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

/* ========================
   🟢 REGISTER USER + SEND EMAIL OTP
========================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const emailLower = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const verificationCode = generateCode();
    const user = await User.create({
      name,
      email: emailLower,
      password: password.trim(),
      verificationCode,
      verificationCodeExpiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
    });

    // Send OTP email
    await sendEmail(
      user.email,
      "Verify your Passiify account",
      `<p>Your verification code is <b>${verificationCode}</b></p>`
    );

    res.status(201).json({
      message: "User registered. Verification code sent to email.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

/* ========================
   🔵 VERIFY EMAIL (OTP)
========================= */
router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.json({ message: "User already verified" });

    if (user.verificationCode !== code)
      return res.status(400).json({ message: "Invalid verification code" });

    if (user.verificationCodeExpiresAt < Date.now())
      return res.status(400).json({ message: "Verification code expired" });

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiresAt = null;

    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error("Email Verify Error:", err);
    res.status(500).json({ message: "Server error verifying email" });
  }
});

/* ========================
   🔄 RESEND VERIFICATION CODE
========================= */
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res
        .status(400)
        .json({ message: "Account already verified" });

    const newCode = generateCode();
    user.verificationCode = newCode;
    user.verificationCodeExpiresAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendEmail(
      user.email,
      "Your new Passiify verification code",
      `<p>Your new code is <b>${newCode}</b></p>`
    );

    res.json({ message: "Verification code resent to email" });
  } catch (error) {
    console.error("Resend Code Error:", error);
    res.status(500).json({ message: "Server error sending code" });
  }
});

/* ========================
   🟣 LOGIN (NOW TRACKS LAST LOGIN)
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailLower });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // Check password
    const isMatch = await user.matchPassword(password.trim());
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Optional: Block login if email not verified ❗
    // if (!user.isVerified)
    //   return res.status(401).json({ message: "Verify your email first" });

    await user.markLogin(); // Track last login

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

/* ========================
   🔵 FORGOT PASSWORD
========================= */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailLower });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Reset your Passiify password",
      `<p>Click to reset: <a href="${resetURL}">${resetURL}</a></p>`
    );

    res.json({ message: "Reset link sent to email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error sending reset link" });
  }
});

/* ========================
   🟠 RESET PASSWORD
========================= */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password.trim();
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;

    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error resetting password" });
  }
});

/* ========================
   🟣 UPDATE PROFILE
========================= */
router.put("/update-profile/:id", verifyToken, updateUserProfile);

export default router;
