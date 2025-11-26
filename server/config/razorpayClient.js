// config/razorpayClient.js
import Razorpay from "razorpay";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

let razorpay = null;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn(
    "⚠️ Razorpay keys missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env"
  );
} else {
  try {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log("✅ Razorpay client initialised");
  } catch (err) {
    console.error("❌ Failed to initialise Razorpay client:", err);
  }
}

export { razorpay, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET };
