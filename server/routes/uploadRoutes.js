// routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/gyms")); // Store inside uploads/gyms/
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname); // Get .jpg, .jpeg, .png etc
    const baseName = path.basename(file.originalname, ext)
      .replace(/\s+/g, "_") // Replace spaces
      .replace(/[^\w.-]/g, ""); // Remove any weird symbols
    const uniqueName = `${Date.now()}-${baseName}${ext}`; // Keep extension clean
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ Upload route (max 5 images)
router.post("/", upload.array("images", 5), (req, res) => {
  try {
    const imagePaths = req.files.map(
      (file) => `/uploads/gyms/${file.filename}` // public path
    );

    res.status(200).json({
      success: true,
      message: "✅ Images uploaded successfully",
      images: imagePaths,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ success: false, message: "Image upload failed" });
  }
});

export default router;
