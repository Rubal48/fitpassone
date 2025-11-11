import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    category: {
      type: String,
      enum: ["yoga", "strength", "cardio", "adventure", "mindfulness"],
      default: "adventure",
    },
    price: { type: Number, required: true },
    capacity: { type: Number, default: 50 },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800",
    },
    rating: { type: Number, default: 4.5 },
    organizer: { type: String, default: "Passiify Community" },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
