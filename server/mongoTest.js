// mongoTest.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connection successful!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  }
};

testConnection();
