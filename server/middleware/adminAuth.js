import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Find admin from token
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(403).json({ message: "Invalid admin token" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin auth error:", error.message);
    res.status(401).json({ message: "Not authorized as admin" });
  }
};

export default verifyAdmin;
