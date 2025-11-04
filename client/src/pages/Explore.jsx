import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, MapPin, Star, Loader2 } from "lucide-react";
import API from "../utils/api";

export default function Explore() {
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();

  // 🧠 Fetch gyms from backend
  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const res = await API.get("/gyms");
        setGyms(res.data);
        setFilteredGyms(res.data);
        setError("");
      } catch (err) {
        console.error("❌ Error fetching gyms:", err);
        setError("Unable to load gyms. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, []);

  // 🔍 Handle URL search query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("query");
    if (searchQuery) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
    }
  }, [location.search, gyms]);

  // 🔎 Filter gyms based on query
  const handleSearch = (value) => {
    const q = value.toLowerCase();
    const results = gyms.filter(
      (gym) =>
        gym.name.toLowerCase().includes(q) ||
        gym.city.toLowerCase().includes(q) ||
        (gym.description && gym.description.toLowerCase().includes(q))
    );
    setFilteredGyms(results);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  // 🖼️ Smart Dynamic Image (Pexels + Unsplash + fallback)
  const getGymImage = (gym) => {
    if (gym.image && gym.image.startsWith("http")) return gym.image;
    if (gym.images && gym.images.length > 0 && gym.images[0].startsWith("http"))
      return gym.images[0];

    const keyword = encodeURIComponent(`${gym.name} ${gym.city} gym fitness`);
    const pexelsImages = [
      "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/7031707/pexels-photo-7031707.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/4754142/pexels-photo-4754142.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=800",
    ];
    const randomIndex = Math.floor(Math.random() * pexelsImages.length);

    return (
      pexelsImages[randomIndex] ||
      `https://source.unsplash.com/800x600/?${keyword}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 text-gray-800">
      {/* 🔍 Search Section */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 py-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4162443/pexels-photo-4162443.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg">
            Explore <span className="text-orange-300">Gyms</span> Near You
          </h1>
          <p className="text-blue-100 mb-10 text-lg">
            Discover fitness clubs, yoga studios, and training centers — anytime, anywhere.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex items-center justify-center max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-full shadow-xl overflow-hidden border border-orange-300"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gyms, studios or city (e.g. Delhi, Yoga)"
              className="flex-1 px-6 py-3 text-gray-700 text-lg focus:outline-none"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 flex items-center gap-2 font-semibold transition-all duration-300"
            >
              <Search size={20} /> Search
            </button>
          </form>
        </div>
      </section>

      {/* 🏋️ Gym Cards Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <p className="text-gray-600">Loading gyms...</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 text-lg">{error}</p>
        ) : filteredGyms.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No gyms found matching your search.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredGyms.map((gym) => (
              <div
                key={gym._id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 transform hover:-translate-y-1"
              >
                {/* 🖼️ Gym Image */}
                <div className="relative">
                  <img
                    src={getGymImage(gym)}
                    alt={gym.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800";
                    }}
                    className="w-full h-52 object-cover rounded-t-2xl group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white px-3 py-1 text-xs font-semibold rounded-full shadow-md">
                    ₹{gym.price || 499} / 1-Day Pass
                  </div>
                </div>

                {/* 📋 Gym Info */}
                <div className="p-5 text-left">
                  <h3 className="text-xl font-bold text-blue-700 mb-1 truncate">
                    {gym.name}
                  </h3>
                  <p className="text-gray-600 flex items-center gap-1 mb-2 text-sm">
                    <MapPin size={15} className="text-orange-500" /> {gym.city}
                  </p>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                    {gym.description ||
                      "A modern fitness space equipped with premium machines, trainers, and classes."}
                  </p>

                  {/* ⭐ Rating + Button */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center text-yellow-400 text-sm">
                      <Star size={15} className="fill-yellow-400" />{" "}
                      <span className="ml-1">{gym.rating || "4.8"}</span>
                    </div>
                    <Link
                      to={`/gyms/${gym._id}`}
                      className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all duration-300 shadow-md"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
