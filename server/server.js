// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Import routes
import authRoutes from "./routes/authRoutes.js";
import gymRoutes from "./routes/gymRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import testEmailRoute from "./routes/testEmailRoute.js";
import eventRoutes from "./routes/eventRoutes.js";
import eventBookingRoutes from "./routes/eventBookingRoutes.js";
import adminEventRoutes from "./routes/adminEventRoutes.js"; // ⭐ Event admin routes
import paymentRoutes from "./routes/paymentRoutes.js";       // ⭐ Razorpay payments

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
//       CORE MIDDLEWARE
// =========================
app.use(cors()); // (you can later restrict origins)
app.use(express.json());

// ✅ Path setup (for static uploads)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// =========================
//       API ROUTES
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/gyms", gymRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/test", testEmailRoute);
app.use("/api/events", eventRoutes);
app.use("/api/event-bookings", eventBookingRoutes);

// ⭐ Razorpay payments (NEW)
app.use("/api/payments", paymentRoutes);

// ⭐ Admin event routes
app.use("/api/admin/events", adminEventRoutes);

// =========================
//   HEALTH CHECK ROUTES
// =========================
app.get("/", (req, res) => res.send("🚀 Passiify Backend is Running"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ Passiify backend is running fine!",
    time: new Date().toISOString(),
  });
});

// =========================
//       ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// =========================
//   DATABASE + SERVER
// =========================
async function startServer() {
  console.log("🔧 Starting Passiify backend…");
  console.log("🔧 NODE_ENV:", process.env.NODE_ENV);
  console.log("🔧 PORT env:", process.env.PORT);
  console.log("🔧 MONGO_URI present?", !!process.env.MONGO_URI);
  console.log("🔧 JWT_SECRET present?", !!process.env.JWT_SECRET);

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Helps Render fail fast if DB is unreachable
      serverSelectionTimeoutMS: 20000,
    });
    console.log("✅ MongoDB Connected Successfully");

    app.listen(PORT, () => {
      console.log(`⚡ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    // On Render, exit if we can't start properly
    process.exit(1);
  }
}

startServer();

export default app;
