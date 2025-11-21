import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Administrator",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    // 🔥 Updated roles (include admin for login)
    role: {
      type: String,
      enum: ["superadmin", "admin", "moderator", "support"], // ✅ ADDED admin
      default: "admin",
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    lastLogin: {
      type: Date,
    },

    loginIP: {
      type: String,
    },

    activityLog: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        ip: String,
      },
    ],

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// 🔑 Hash password before save
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔍 Compare password
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// 📝 Log actions
AdminSchema.methods.logAction = async function (action, ip = null) {
  this.activityLog.push({ action, ip });
  await this.save();
};

export default mongoose.model("Admin", AdminSchema);
