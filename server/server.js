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
const PORT = process.env.PORT || 5000;

// ---------- Core Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Static uploads ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded files (gyms / events) from /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------- API Routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/gyms", gymRoutes);
app.use("/api/bookings", bookingRoutes);

// ✅ Uploads router mounted on BOTH singular & plural paths
// so frontend can use /upload or /uploads safely
app.use("/api/upload", uploadRoutes);   // legacy (e.g. gym image uploads)
app.use("/api/uploads", uploadRoutes);  // new (e.g. /uploads/events)

app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/test", testEmailRoute);
app.use("/api/events", eventRoutes);
app.use("/api/event-bookings", eventBookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin/events", adminEventRoutes);

// ---------- Health Check ----------
app.get("/", (req, res) => res.send("🚀 Passiify Backend is Running"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ Passiify backend is running fine!",
    time: new Date().toISOString(),
  });
});

// ---------- Error Handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// ---------- DB Connection (after server starts) ----------
async function connectDB() {
  try {
    console.log("🔧 NODE_ENV:", process.env.NODE_ENV);
    console.log("🔧 Render PORT env:", process.env.PORT);
    console.log("🔧 Using PORT:", PORT);
    console.log("🔧 MONGO_URI present?", !!process.env.MONGO_URI);
    console.log("🔧 JWT_SECRET present?", !!process.env.JWT_SECRET);

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      // optional but helps timeouts
      serverSelectionTimeoutMS: 20000,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    // we don't exit here so Render still sees the port as open
  }
}

// ---------- Start Server FIRST ----------
app.listen(PORT, () => {
  console.log(`⚡ Server running on port ${PORT}`);
  connectDB();
});
