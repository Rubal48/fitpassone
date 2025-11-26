// utils/razorpayClient.js
import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn(
    "⚠️ Razorpay keys missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env"
  );
}

let razorpay = null;

try {
  if (keyId && keySecret) {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log("✅ Razorpay client initialised");
  }
} catch (err) {
  console.error("❌ Failed to init Razorpay client:", err.message);
}

export default razorpay;
