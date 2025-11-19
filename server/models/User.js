// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // 👤 Core identity
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },

    // 👑 Role & access control
    role: {
      type: String,
      enum: ["user", "host", "admin"],
      default: "user",
      index: true,
    },

    // 🧾 Profile & contact
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },

    // ✅ Trust & verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String, // e.g., 6-digit code or token
    },
    verificationCodeExpiresAt: {
      type: Date,
    },

    // 🔐 Security / auth extras
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiresAt: {
      type: Date,
    },

    // 🌍 Social / federated login (for future)
    googleId: {
      type: String,
      default: null,
      index: true,
    },

    // 📊 Activity tracking
    lastLoginAt: {
      type: Date,
    },

    // 🎯 Preferences (for future dashboard UX)
    preferences: {
      language: {
        type: String,
        default: "en",
      },
      currency: {
        type: String,
        default: "INR",
      },
      marketingEmails: {
        type: Boolean,
        default: true,
      },
      smsAlerts: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

// 🔒 Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ✅ Helper: mark login
userSchema.methods.markLogin = async function () {
  this.lastLoginAt = new Date();
  await this.save({ validateBeforeSave: false });
};

const User = mongoose.model("User", userSchema);
export default User;
