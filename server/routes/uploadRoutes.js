// routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================================================
   Ensure local temp folders exist (for multer)
========================================================= */
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const gymsUploadDir = path.join(__dirname, "../uploads/gyms");
const eventsUploadDir = path.join(__dirname, "../uploads/events");

ensureDir(gymsUploadDir);
ensureDir(eventsUploadDir);

/* =========================================================
   MULTER STORAGE (TEMPORARY ONLY – we delete after Cloudinary)
========================================================= */

const gymStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, gymsUploadDir); // temp storage
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname); // .jpg, .jpeg, .png, .pdf, .mp4 etc
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "");

    const uniqueName = `${Date.now()}-${baseName}${ext}`;
    cb(null, uniqueName);
  },
});

const eventStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, eventsUploadDir); // temp storage
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

const uploadGyms = multer({ storage: gymStorage });
const uploadEvents = multer({ storage: eventStorage });

/* Small helper to safely delete temp files */
const safeDelete = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.warn("Could not delete temp file:", filePath, err.message);
    }
  });
};

/* =========================================================
   GYM / GENERAL UPLOADS  (/api/uploads)
   - field: images[] (max 5)
   - Used by:
     • Partner hero image
     • Partner gallery images
     • Business proof (image/pdf)
     • Owner ID (image/pdf)
     • Intro video
   - Uploads to Cloudinary → returns secure URLs
   - resource_type: "auto" so image/pdf/video all work
========================================================= */

router.post("/", uploadGyms.array("images", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const uploadResults = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: "passiify/gyms",
          resource_type: "auto", // 🔥 handles image + pdf + video
        })
      )
    );

    // Cleanup temp files
    req.files.forEach((file) => safeDelete(file.path));

    const imageUrls = uploadResults.map((result) => result.secure_url);

    return res.status(200).json({
      success: true,
      message: "✅ Files uploaded successfully",
      images: imageUrls, // array of Cloudinary URLs
    });
  } catch (error) {
    console.error("❌ Gym/general upload error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Image upload failed on server.",
      error: error?.message || "Unknown error",
    });
  }
});

/* =========================================================
   EVENT UPLOADS  (/api/uploads/events)
   - field: image (single)
   - Only image expected, but we keep resource_type auto
========================================================= */

// Frontend: formData.append("image", file)
// POST /api/uploads/events
router.post("/events", uploadEvents.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "passiify/events",
      resource_type: "auto",
    });

    // Cleanup temp file
    safeDelete(req.file.path);

    const imageUrl = result.secure_url;

    return res.status(200).json({
      success: true,
      message: "✅ Event image uploaded successfully",
      image: imageUrl,
    });
  } catch (error) {
    console.error("❌ Event upload error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Event image upload failed",
      error: error?.message || "Unknown error",
    });
  }
});

export default router;
