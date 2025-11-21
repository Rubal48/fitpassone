// middleware/adminAuth.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// ✅ Prefer JWT_SECRET, fall back to ADMIN_SECRET, then a dev fallback
const primarySecret =
  process.env.JWT_SECRET ||
  process.env.ADMIN_SECRET ||
  "dev_admin_secret";

// ✅ Try both secrets when verifying (handles old + new tokens)
const candidateSecrets = [];
if (process.env.JWT_SECRET) candidateSecrets.push(process.env.JWT_SECRET);
if (
  process.env.ADMIN_SECRET &&
  process.env.ADMIN_SECRET !== process.env.JWT_SECRET
) {
  candidateSecrets.push(process.env.ADMIN_SECRET);
}
if (candidateSecrets.length === 0) {
  candidateSecrets.push("dev_admin_secret");
}

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("🔐 [ADMIN AUTH] header:", authHeader);
    console.log(
      "🔐 [ADMIN AUTH] using secrets count:",
      candidateSecrets.length
    );

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("🔐 [ADMIN AUTH] -> no bearer token");
      return res
        .status(401)
        .json({ message: "Not authorized as admin (no token)" });
    }

    const token = authHeader.split(" ")[1].trim();

    let decoded = null;
    let lastError = null;

    // 🔁 Try verifying with all candidate secrets
    for (const secret of candidateSecrets) {
      try {
        decoded = jwt.verify(token, secret);
        console.log("✅ [ADMIN AUTH] token verified with one of the secrets");
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!decoded) {
      console.error(
        "❌ [ADMIN AUTH] all secrets failed to verify token:",
        lastError?.message
      );
      return res
        .status(401)
        .json({ message: "Invalid or expired admin token" });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      console.error("❌ [ADMIN AUTH] admin not found for id:", decoded.id);
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error("🔥 [ADMIN AUTH] middleware error:", err);
    return res.status(500).json({ message: "Server error in admin auth" });
  }
};

export default adminAuth;
