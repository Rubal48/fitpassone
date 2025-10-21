import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Heart, Star, Play } from "lucide-react";

const gymsData = [
  {
    id: 1,
    name: "Gold's Gym Delhi",
    type: "Gym",
    city: "Delhi",
    price: 299,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1571019613914-85f342c55f85?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579758629934-095a20fce7bf?auto=format&fit=crop&w=800&q=80",
    ],
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: 2,
    name: "Zen Yoga Studio",
    type: "Yoga",
    city: "Mumbai",
    price: 249,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1554306274-f23873d9a26f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1d?auto=format&fit=crop&w=800&q=80",
    ],
    video: "https://www.w3schools.com/html/movie.mp4",
  },
  {
    id: 3,
    name: "Core Pilates Hub",
    type: "Pilates",
    city: "Bangalore",
    price: 299,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1616690710506-7b6d3a4a4cc8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80",
    ],
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
];

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [likedGyms, setLikedGyms] = useState([]);
  const [showVideo, setShowVideo] = useState(null);

  const toggleLike = (id) => {
    setLikedGyms((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredGyms = gymsData.filter((gym) => {
    const matchesSearch =
      gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gym.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      category === "All" ? true : gym.type === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Fitness Near You</h1>
        <p className="text-blue-100 max-w-xl mx-auto">
          See real gyms, yoga, and pilates studios through photos and videos — then book your 1-day pass.
        </p>
      </section>

      {/* Search + Filters */}
      <div className="max-w-6xl mx-auto px-6 mt-[-30px]">
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg w-full md:w-2/3">
            <Search className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search by city or gym name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-700"
            />
          </div>

          <div className="flex justify-center md:justify-end gap-2 w-full md:w-1/3">
            {["All", "Gym", "Yoga", "Pilates"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  category === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        {filteredGyms.length === 0 ? (
          <p className="text-center text-gray-600 mt-20">
            No gyms found. Try changing your filters.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGyms.map((gym) => (
              <div
                key={gym.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
              >
                {/* Image Gallery */}
                <div className="relative">
                  <div className="grid grid-cols-3 gap-1">
                    {gym.images.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={gym.name}
                        className="h-28 w-full object-cover hover:opacity-80 transition"
                      />
                    ))}
                  </div>

                  {/* Video Play Button */}
                  <button
                    onClick={() => setShowVideo(gym.video)}
                    className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-110 transition"
                  >
                    <Play size={18} className="text-blue-600" />
                  </button>

                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(gym.id)}
                    className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition"
                  >
                    <Heart
                      size={20}
                      className={
                        likedGyms.includes(gym.id)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-500"
                      }
                    />
                  </button>
                </div>

                {/* Gym Info */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{gym.name}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin size={14} className="mr-1" /> {gym.city} • {gym.type}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-800 font-semibold">₹{gym.price}/day</p>
                    <p className="text-yellow-500 text-sm flex items-center">
                      <Star size={14} className="mr-1" /> {gym.rating}
                    </p>
                  </div>
                  <Link
                    to={`/gym/${gym.id}`}
                    className="block text-center mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="relative bg-white rounded-xl shadow-lg w-[90%] max-w-2xl overflow-hidden">
            <video controls autoPlay className="w-full">
              <source src={showVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button
              onClick={() => setShowVideo(null)}
              className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
