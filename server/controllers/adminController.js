import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Gym from "../models/Gym.js";
import Admin from "../models/Admin.js";

// ✅ Admin Login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
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
// ✅ Get all gyms
export const getAllGyms = async (req, res) => {
  try {
    const gyms = await Gym.find().sort({ createdAt: -1 });
    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Approve or reject gym
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
