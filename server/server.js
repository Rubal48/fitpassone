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
import adminEventRoutes from "./routes/adminEventRoutes.js"; // Event admin routes
import paymentRoutes from "./routes/paymentRoutes.js";       // Razorpay payments

const app = express();

// 🔑 Render gives a random PORT in process.env.PORT.
// Locally this falls back to 5000.
const PORT = process.env.PORT || 5000;

// =========================
//      CORE MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());

// =========================
//   STATIC UPLOADS SETUP
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// =========================
//        API ROUTES
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
app.use("/api/payments", paymentRoutes);
app.use("/api/admin/events", adminEventRoutes);

// =========================
//     HEALTH CHECK
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
 //     ERROR HANDLER
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
  console.log("🔧 Starting Passiify backend...");
  console.log("   ➜ process.env.PORT:", process.env.PORT);
  console.log("   ➜ Effective PORT:", PORT);
  console.log("   ➜ NODE_ENV:", process.env.NODE_ENV);
  console.log("   ➜ MONGO_URI present?", !!process.env.MONGO_URI);
  console.log("   ➜ JWT_SECRET present?", !!process.env.JWT_SECRET);

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // fail fast if DB not reachable
    });
    console.log("✅ MongoDB Connected Successfully");

    app.listen(PORT, () => {
      console.log(`⚡ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    // On Render this will stop the process so the deploy clearly fails
    process.exit(1);
  }
}

startServer();

export default app;
