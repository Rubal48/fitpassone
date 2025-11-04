import mongoose from "mongoose";
import dotenv from "dotenv";
import Gym from "./models/Gym.js";

dotenv.config();

const gyms = [
  {
    name: "Gold's Gym",
    city: "Delhi",
    price: 499,
    description: "Premium fitness center with certified trainers and high-end equipment.",
    image: "https://source.unsplash.com/400x300/?gym,fitness",
    tags: ["strength", "cardio", "training"],
  },
  {
    name: "Cult Fit",
    city: "Bangalore",
    price: 399,
    description: "Modern studio for functional training, yoga, and fitness classes.",
    image: "https://source.unsplash.com/400x300/?yoga,training",
    tags: ["yoga", "functional", "training"],
  },
  {
    name: "Anytime Fitness",
    city: "Mumbai",
    price: 599,
    description: "24/7 gym access with advanced equipment and personal training.",
    image: "https://source.unsplash.com/400x300/?gym,weights",
    tags: ["24/7", "personal trainer", "machines"],
  },
  {
    name: "Powerhouse Gym",
    city: "Pune",
    price: 449,
    description: "One of the most trusted gyms with strongman-style equipment.",
    image: "https://source.unsplash.com/400x300/?bodybuilding,gym",
    tags: ["strength", "machines", "training"],
  },
  {
    name: "Fit7 by MS Dhoni",
    city: "Hyderabad",
    price: 699,
    description: "Premium gym experience with celebrity trainers and smart tracking.",
    image: "https://source.unsplash.com/400x300/?smart-gym,fitness",
    tags: ["celebrity", "trainer", "modern"],
  },
  {
    name: "Snap Fitness",
    city: "Chennai",
    price: 499,
    description: "Global gym chain with compact design and complete workout options.",
    image: "https://source.unsplash.com/400x300/?gym,chennai",
    tags: ["compact", "cardio", "global"],
  },
  {
    name: "The Tribe Fitness Club",
    city: "Ahmedabad",
    price: 449,
    description: "Community-based fitness center with dance, HIIT, and Zumba classes.",
    image: "https://source.unsplash.com/400x300/?zumba,hiit",
    tags: ["community", "zumba", "hiit"],
  },
  {
    name: "Reform Pilates Studio",
    city: "Delhi",
    price: 599,
    description: "Luxury Pilates and stretching classes with personalized guidance.",
    image: "https://source.unsplash.com/400x300/?pilates,stretching",
    tags: ["pilates", "core", "mobility"],
  },
  {
    name: "CrossFit BlackBox",
    city: "Bangalore",
    price: 699,
    description: "Intense CrossFit workouts with certified coaches and group classes.",
    image: "https://source.unsplash.com/400x300/?crossfit,training",
    tags: ["crossfit", "group", "endurance"],
  },
  {
    name: "Yoga House India",
    city: "Rishikesh",
    price: 299,
    description: "Authentic yoga experience in the land of spirituality and peace.",
    image: "https://source.unsplash.com/400x300/?yoga,india",
    tags: ["yoga", "spiritual", "peace"],
  },
];

const seedGyms = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Gym.deleteMany();
    await Gym.insertMany(gyms);
    console.log("✅ Successfully seeded 10 gyms into MongoDB");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedGyms();
