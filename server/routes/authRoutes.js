// routes/userRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import verifyToken from "../middleware/authMiddleware.js";
import { updateUserProfile } from "../controllers/userController.js";

dotenv.config(); // make sure .env is loaded

const router = express.Router();

/* ========================
   🔐 TOKEN GENERATOR
========================= */
const generateToken = (id, expiresIn = "7d") =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

/* ========================
   🔵 GOOGLE OAUTH CLIENT (helper)
========================= */
const createGoogleClient = () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
    process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    console.log("❌ Google OAuth env missing:", {
      hasId: !!GOOGLE_CLIENT_ID,
      hasSecret: !!GOOGLE_CLIENT_SECRET,
      redirect: GOOGLE_REDIRECT_URI,
    });
    return null;
  }

  return new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
};

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
   🟦 GOOGLE LOGIN / SIGNUP (REDIRECT FLOW)
========================= */

// 1) Start Google OAuth – redirect user to Google
router.get("/google", async (req, res) => {
  try {
    const googleClient = createGoogleClient();
    if (!googleClient) {
      return res
        .status(500)
        .send("Google OAuth is not configured on the server.");
    }

    const authUrl = googleClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
    });

    return res.redirect(authUrl);
  } catch (error) {
    console.error("Google OAuth init error:", error);
    return res
      .status(500)
      .send("Failed to start Google authentication. Please try again.");
  }
});

// 2) OAuth callback – Google redirects here with ?code=...
router.get("/google/callback", async (req, res) => {
  try {
    const googleClient = createGoogleClient();
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    if (!googleClient) {
      return res.redirect(
        `${clientUrl}/login?error=google_not_configured`
      );
    }

    const { code } = req.query;
    if (!code) {
      return res.redirect(
        `${clientUrl}/login?error=missing_google_code`
      );
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);

    if (!tokens) {
      return res.redirect(
        `${clientUrl}/login?error=no_tokens_from_google`
      );
    }

    let payload = null;

    // 🟢 Preferred: ID token
    if (tokens.id_token) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: tokens.id_token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (err) {
        console.error("verifyIdToken failed, will try userinfo:", err);
      }
    }

    // 🔵 Fallback: use access token to call userinfo endpoint
    if (!payload && tokens.access_token) {
      const userInfoResponse = await googleClient.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });
      payload = userInfoResponse.data;
    }

    if (!payload) {
      return res.redirect(
        `${clientUrl}/login?error=no_tokens_from_google`
      );
    }

    const googleId = payload.sub;
    const email = (payload.email || "").toLowerCase();
    const name =
      payload.name || (email ? email.split("@")[0] : "Passiify User");
    const avatar = payload.picture || "";

    if (!email) {
      return res.redirect(
        `${clientUrl}/login?error=no_email_from_google`
      );
    }

    // Find existing user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    // If no user, create a new one
    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");

      user = await User.create({
        name,
        email,
        password: randomPassword, // will be hashed by pre-save
        googleId,
        avatar,
        isVerified: true, // Google already verified email
        verificationCode: null,
        verificationCodeExpiresAt: null,
      });
    } else {
      // Link googleId if not yet linked, and trust email
      let needsSave = false;

      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpiresAt = null;
        needsSave = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        needsSave = true;
      }

      if (needsSave) {
        await user.save();
      }
    }

    // Track login
    await user.markLogin();

    // Issue JWT using your existing helper
    const token = generateToken(user._id);

    // Redirect to frontend with token in URL
    const cleanedClientUrl = clientUrl.replace(/\/+$/, "");
    const redirectUrl = `${cleanedClientUrl}/oauth/google?token=${token}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    return res.redirect(
      `${clientUrl}/login?error=google_auth_failed`
    );
  }
});

/* ========================
   👤 CURRENT USER (for Google OAuth callback)
========================= */
router.get("/me", verifyToken, async (req, res) => {
  try {
    // verifyToken already attached req.user (without password)
    return res.json(req.user);
  } catch (err) {
    console.error("Get current user error:", err);
    return res.status(500).json({ message: "Failed to fetch current user" });
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
