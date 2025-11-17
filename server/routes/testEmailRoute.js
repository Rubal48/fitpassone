import express from "express";
import { sendBookingConfirmationEmail } from "../utils/sendEmail.js";

const router = express.Router();

// ✅ Test Email Route
router.get("/send-test-email", async (req, res) => {
  try {
    console.log("📤 Starting email test...");

    const testEmail = "YOUR_EMAIL@gmail.com"; // 👈 put your own email here

    const fakeBooking = {
      gymName: "Test Gym Delhi",
      city: "New Delhi",
      date: new Date(),
      bookingCode: "PASSIIFY-TEST123",
      price: 299,
    };

    await sendBookingConfirmationEmail(testEmail, fakeBooking);

    res.status(200).json({ message: "✅ Test email triggered successfully." });
  } catch (error) {
    console.error("❌ Test email failed:", error);
    res.status(500).json({ message: "❌ Test email failed", error: error.message });
  }
});

export default router;
