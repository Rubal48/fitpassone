// routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🗂️ Storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/gyms")); // folder where images will be saved
  },
  filename(req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 🧠 Upload API
router.post("/", upload.array("images", 5), (req, res) => {
  try {
    const imagePaths = req.files.map(
      (file) => `/uploads/gyms/${file.filename}`
    );
    res.status(200).json({
      message: "Images uploaded successfully",
      images: imagePaths,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
});

export default router;
