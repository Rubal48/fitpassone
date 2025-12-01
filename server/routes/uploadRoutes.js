// routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================================================
   GYM UPLOADS  (/api/uploads)
   - field: images[]
   - folder: /uploads/gyms
========================================================= */

const gymStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/gyms")); // Store inside uploads/gyms/
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname); // .jpg, .jpeg, .png etc
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_") // Replace spaces
      .replace(/[^\w.-]/g, ""); // Remove weird symbols

    const uniqueName = `${Date.now()}-${baseName}${ext}`;
    cb(null, uniqueName);
  },
});

const uploadGyms = multer({ storage: gymStorage });

// ✅ Existing route for gym images (max 5 images)
router.post("/", uploadGyms.array("images", 5), (req, res) => {
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

/* =========================================================
   EVENT UPLOADS  (/api/uploads/events)
   - field: image
   - folder: /uploads/events
========================================================= */

const eventStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/events")); // Store inside uploads/events/
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "");
    const uniqueName = `${Date.now()}-${baseName}${ext}`;
    cb(null, uniqueName);
  },
});

const uploadEvents = multer({ storage: eventStorage });

// ✅ New route: single event poster/banner
// Frontend: formData.append("image", file)
// POST /api/uploads/events
router.post("/events", uploadEvents.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const imagePath = `/uploads/events/${req.file.filename}`; // public path for event image

    res.status(200).json({
      success: true,
      message: "✅ Event image uploaded successfully",
      image: imagePath,
    });
  } catch (error) {
    console.error("❌ Event upload error:", error);
    res
      .status(500)
      .json({ success: false, message: "Event image upload failed" });
  }
});

export default router;
