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
      select: false, // 🚨 Prevent leaking hashed password in queries
    },

    // 🔥 Multiple roles
    role: {
      type: String,
      enum: ["superadmin", "moderator", "support"],
      default: "moderator",
    },

    // 🔒 Account control
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    // 📌 Security & Monitoring
    lastLogin: {
      type: Date,
    },

    loginIP: {
      type: String, // store last login IP for security review
    },

    // 📝 Activity logs (internal use)
    activityLog: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        ip: String,
      },
    ],

    // 🔐 If you add 2FA later
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

// 🔍 Method to compare passwords
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// 📝 Log admin actions easily
AdminSchema.methods.logAction = async function (action, ip = null) {
  this.activityLog.push({ action, ip });
  await this.save();
};

export default mongoose.model("Admin", AdminSchema);
