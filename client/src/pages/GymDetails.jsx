import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  ThumbsUp,
  Dumbbell,
  CheckCircle,
  PlayCircle,
  Award,
  Shield,
  CreditCard,
  Users,
} from "lucide-react";

const gymsData = [
  {
    id: 1,
    name: "Gold’s Gym",
    city: "Delhi",
    price: 499,
    rating: 4.8,
    totalReviews: 312,
    description:
      "India’s #1 premium gym chain — trusted by over 2 million fitness lovers. Train with certified experts using world-class equipment, clean spaces, and personalized routines.",
    highlights: [
      "Top-rated trainers with international certification",
      "World-class equipment & 24/7 cleanliness",
      "Free first-day consultation worth ₹999",
      "Flexible timing: Morning to Late Night",
    ],
    images: [
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1",
      "https://images.unsplash.com/photo-1571019613914-85f342c55f9e",
      "https://images.unsplash.com/photo-1554284126-aa88f22d8b74",
    ],
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    amenities: [
      "AC Facility",
      "Locker Rooms",
      "Personal Trainer",
      "Parking Area",
      "Free WiFi",
      "Shower Rooms",
    ],
    offer: "Limited Offer: Save ₹100 on today’s booking!",
  },
];

const GymDetails = () => {
  const { id } = useParams();
  const gym = gymsData.find((g) => g.id === parseInt(id));
  const [selectedImage, setSelectedImage] = useState(gym.images[0]);
  const [showLogin, setShowLogin] = useState(false);

  if (!gym)
    return <p className="text-center mt-20 text-gray-500">Gym not found 🏋️‍♂️</p>;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[75vh]">
        <img
          src={selectedImage}
          alt={gym.name}
          className="w-full h-full object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* Gym Name and Rating */}
        <div className="absolute bottom-10 left-6 md:left-16 text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">{gym.name}</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="text-yellow-400 w-5 h-5" />
              <span className="font-medium">{gym.rating}</span>
              <span className="text-gray-300 text-sm">
                ({gym.totalReviews} Reviews)
              </span>
            </div>
          </div>
          <p className="flex items-center gap-2 text-gray-300 mt-2">
            <MapPin className="w-4 h-4" /> {gym.city}
          </p>
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-6xl mx-auto mt-10 px-6 grid md:grid-cols-3 gap-10">
        {/* Left: Images + Video */}
        <div className="md:col-span-2">
          {/* Image Thumbnails */}
          <div className="flex gap-3 mb-6 overflow-x-auto">
            {gym.images.map((img, index) => (
              <img
                key={index}
                src={img}
                onClick={() => setSelectedImage(img)}
                className={`w-32 h-24 object-cover rounded-xl cursor-pointer border-2 ${
                  selectedImage === img ? "border-blue-600" : "border-transparent"
                }`}
              />
            ))}
          </div>

          {/* About Section */}
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            Why Choose {gym.name}?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-5">
            {gym.description}
          </p>

          {/* Highlights */}
          <ul className="space-y-3 mb-6">
            {gym.highlights.map((point, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-800">
                <CheckCircle className="text-green-500 w-5 h-5" />
                {point}
              </li>
            ))}
          </ul>

          {/* Amenities */}
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Amenities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {gym.amenities.map((item, i) => (
              <div
                key={i}
                className="bg-white shadow-md border rounded-lg px-4 py-3 flex items-center gap-2 text-gray-700 hover:shadow-lg transition"
              >
                <Dumbbell className="text-blue-600 w-5 h-5" /> {item}
              </div>
            ))}
          </div>

          {/* Video Section */}
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Explore the Gym
          </h3>
          <div className="relative">
            <video
              src={gym.video}
              controls
              className="w-full rounded-2xl shadow-lg"
            ></video>
            <PlayCircle className="absolute top-1/2 left-1/2 w-16 h-16 text-white/80 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
            {/* 🗣️ Reviews & Testimonials Section */}
<div className="mt-12">
  <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
    What Our Members Say 💬
  </h3>
  <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
    Real reviews from people who actually trained at <span className="font-medium text-blue-600">{gym.name}</span>.  
    Authentic, verified, and confidence-building.
  </p>

  {/* Reviews Grid */}
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[
      {
        name: "Rahul Verma",
        review:
          "One of the cleanest gyms I’ve been to. Trainers actually correct your form and motivate you!",
        rating: 5,
        image:
          "https://randomuser.me/api/portraits/men/45.jpg",
      },
      {
        name: "Sneha Kapoor",
        review:
          "Loved the energy here! Great crowd, great music, and very professional staff.",
        rating: 4,
        image:
          "https://randomuser.me/api/portraits/women/44.jpg",
      },
      {
        name: "Arjun Mehta",
        review:
          "Booked a 1-day pass just to try, and now I’ve got a 3-month membership. Worth every rupee!",
        rating: 5,
        image:
          "https://randomuser.me/api/portraits/men/22.jpg",
      },
    ].map((rev, i) => (
      <div
        key={i}
        className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-xl transition"
      >
        <div className="flex items-center gap-4 mb-3">
          <img
            src={rev.image}
            alt={rev.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-800">{rev.name}</h4>
            <div className="flex">
              {Array(rev.rating)
                .fill()
                .map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
            </div>
          </div>
        </div>
        <p className="text-gray-700 italic">“{rev.review}”</p>
      </div>
    ))}
  </div>

  {/* Write a Review Form */}
  <div className="mt-10 bg-gray-100 p-6 rounded-2xl max-w-3xl mx-auto">
    <h4 className="text-lg font-semibold mb-3 text-gray-800 text-center">
      Share Your Experience
    </h4>
    <div className="flex flex-col md:flex-row gap-3 justify-center">
      <input
        type="text"
        placeholder="Your name"
        className="border rounded-lg px-4 py-2 w-full md:w-1/3"
      />
      <textarea
        placeholder="Write your review..."
        className="border rounded-lg px-4 py-2 w-full md:w-2/3"
      ></textarea>
    </div>
    <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition mx-auto block">
      Submit Review
    </button>
  </div>
</div>
{/* 🗣️ Reviews & Testimonials Section */}
<div className="mt-12">
  <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
    What Our Members Say 💬
  </h3>
  <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
    Real reviews from people who actually trained at <span className="font-medium text-blue-600">{gym.name}</span>.  
    Authentic, verified, and confidence-building.
  </p>

  {/* Reviews Grid */}
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[
      {
        name: "Rahul Verma",
        review:
          "One of the cleanest gyms I’ve been to. Trainers actually correct your form and motivate you!",
        rating: 5,
        image:
          "https://randomuser.me/api/portraits/men/45.jpg",
      },
      {
        name: "Sneha Kapoor",
        review:
          "Loved the energy here! Great crowd, great music, and very professional staff.",
        rating: 4,
        image:
          "https://randomuser.me/api/portraits/women/44.jpg",
      },
      {
        name: "Arjun Mehta",
        review:
          "Booked a 1-day pass just to try, and now I’ve got a 3-month membership. Worth every rupee!",
        rating: 5,
        image:
          "https://randomuser.me/api/portraits/men/22.jpg",
      },
    ].map((rev, i) => (
      <div
        key={i}
        className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-xl transition"
      >
        <div className="flex items-center gap-4 mb-3">
          <img
            src={rev.image}
            alt={rev.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-800">{rev.name}</h4>
            <div className="flex">
              {Array(rev.rating)
                .fill()
                .map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
            </div>
          </div>
        </div>
        <p className="text-gray-700 italic">“{rev.review}”</p>
      </div>
    ))}
  </div>

  {/* Write a Review Form */}
  <div className="mt-10 bg-gray-100 p-6 rounded-2xl max-w-3xl mx-auto">
    <h4 className="text-lg font-semibold mb-3 text-gray-800 text-center">
      Share Your Experience
    </h4>
    <div className="flex flex-col md:flex-row gap-3 justify-center">
      <input
        type="text"
        placeholder="Your name"
        className="border rounded-lg px-4 py-2 w-full md:w-1/3"
      />
      <textarea
        placeholder="Write your review..."
        className="border rounded-lg px-4 py-2 w-full md:w-2/3"
      ></textarea>
    </div>
    <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition mx-auto block">
      Submit Review
    </button>
  </div>
</div>

          {/* Review Section */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              What Members Say
            </h3>
            <div className="bg-white p-6 rounded-xl shadow-md border">
              <p className="italic text-gray-600">
                “One of the cleanest and most professional gyms I’ve visited.
                Trainers actually care about your form and progress. Worth every
                rupee!”
              </p>
              <p className="mt-3 font-semibold text-gray-800">— Rahul Verma</p>
            </div>
          </div>
        </div>

        {/* Right: Booking Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-24 h-fit border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-3xl font-bold text-gray-900">₹{gym.price}</p>
            <span className="text-green-600 text-sm font-semibold bg-green-100 px-2 py-1 rounded">
              {gym.offer}
            </span>
          </div>
          <p className="text-gray-600 mb-4">1-Day All Access Pass</p>

          <ul className="space-y-2 text-sm text-gray-700 mb-5">
            <li className="flex items-center gap-2">
              <ShieldCheck className="text-blue-600 w-4 h-4" /> Verified Gym
            </li>
            <li className="flex items-center gap-2">
              <ThumbsUp className="text-blue-600 w-4 h-4" /> Trusted by 2M+
              users
            </li>
            <li className="flex items-center gap-2">
              <Clock className="text-blue-600 w-4 h-4" /> Instant Pass
              Activation
            </li>
          </ul>

         <Link
  to={`/booking/${gym.id}`}
  className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
>
  Book 1-Day Pass
</Link>

          <p className="text-xs text-gray-500 mt-3">
            * No extra charges. Cancel anytime before activation.
          </p>
        </div>
      </div>

      {/* ✅ Trust Footer */}
      <div className="mt-16 bg-white py-10 border-t">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6 text-center px-4">
          <div>
            <Shield className="mx-auto w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-semibold text-gray-800">100% Verified Gyms</h4>
            <p className="text-gray-600 text-sm">
              We partner only with certified fitness centers.
            </p>
          </div>
          <div>
            <CreditCard className="mx-auto w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-semibold text-gray-800">Secure Payments</h4>
            <p className="text-gray-600 text-sm">
              Pay safely using UPI, Cards or Wallets.
            </p>
          </div>
          <div>
            <Award className="mx-auto w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-semibold text-gray-800">Top Rated Gyms</h4>
            <p className="text-gray-600 text-sm">
              All gyms rated 4.5★ and above by verified users.
            </p>
          </div>
          <div>
            <Users className="mx-auto w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-semibold text-gray-800">2 Million+ Users</h4>
            <p className="text-gray-600 text-sm">
              Join India’s biggest fitness community.
            </p>
          </div>
        </div>
      </div>

   
    </div>
  );
};

export default GymDetails;
