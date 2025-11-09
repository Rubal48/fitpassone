import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Gym from "../models/Gym.js";
import Admin from "../models/Admin.js";

/* =======================================================
 ✅ Admin Login
======================================================= */
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================================================
 ✅ Create Admin (One-time setup)
======================================================= */
export const createAdmin = async (req, res) => {
  try {
    const existing = await Admin.findOne({ email: "rubals7777@gmail.com" });
    if (existing) {
      return res.json({ message: "Admin already exists" });
    }

    const admin = new Admin({
      email: "rubals7777@gmail.com",
      password: "Rubal19581972", // plain text — will be hashed automatically
    });

    await admin.save();
    res.json({ message: "Admin created successfully", admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================================================
 ✅ Get All Gyms (Admin Dashboard)
======================================================= */
export const getAllGyms = async (req, res) => {
  try {
    const gyms = await Gym.find()
      .sort({ createdAt: -1 })
      .select(
        "name city images facilities price description verified status createdAt"
      );

    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================================================
 ✅ Get Single Gym Details
======================================================= */
export const getGymById = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }
    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================================================
 ✅ Unified Verify / Reject Gym
   (Used by AdminGymDetails.jsx)
======================================================= */
export const verifyGym = async (req, res) => {
  try {
    const { status, verified } = req.body; // e.g. { status: "approved", verified: true }

    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    gym.status = status;
    gym.verified = verified;
    gym.verifiedBy = req.admin?.email || "Admin";
    gym.verifiedAt = new Date();

    await gym.save();

    res.json({
      message: `Gym ${
        status === "approved" ? "verified ✅" : "rejected ❌"
      } successfully`,
      gym,
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =======================================================
 ✅ Approve Gym (Legacy Support)
======================================================= */
export const approveGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    gym.status = "approved";
    gym.verified = true;
    await gym.save();

    res.json({ message: "Gym approved successfully", gym });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================================================
 ✅ Reject Gym (Legacy Support)
======================================================= */
export const rejectGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    gym.status = "rejected";
    gym.verified = false;
    await gym.save();

    res.json({ message: "Gym rejected successfully", gym });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================================================
 ✅ Delete Gym
======================================================= */
export const deleteGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    await gym.deleteOne();
    res.json({ message: "Gym deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
