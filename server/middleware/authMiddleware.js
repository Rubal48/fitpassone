// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyToken = async (req, res, next) => {
  let token;

  try {
    // ✅ Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // ✅ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Attach user (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found. Please log in again.",
        });
      }

      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please log in.",
      });
    }
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

export default verifyToken;
