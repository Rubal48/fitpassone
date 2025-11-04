import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Dumbbell, Clock, Star } from "lucide-react";
import API from "../utils/api";

export default function Home() {
  const [query, setQuery] = useState("");
  const [gyms, setGyms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const res = await API.get("/gyms");
        setGyms(res.data);
      } catch (err) {
        console.error("Error fetching gyms:", err);
      }
    };
    fetchGyms();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/explore?query=${query}`);
  };

  // 🖼️ Dynamic Gym Image (Pexels + fallback)
  const getGymImage = (gym) => {
    if (gym.image && gym.image.startsWith("http")) return gym.image;
    const pexels = [
      "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/7031707/pexels-photo-7031707.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/4754142/pexels-photo-4754142.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ];
    return pexels[Math.floor(Math.random() * pexels.length)];
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-orange-50 text-gray-800 min-h-screen overflow-hidden">
      {/* 🌅 Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-white py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-15"></div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-2xl">
            Your Fitness, <span className="text-orange-300">Your Freedom</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 text-blue-100 font-light">
            Book a <span className="font-semibold text-orange-200">one-day pass</span> at gyms, yoga, or pilates studios near you.
            <br /> No commitments. No memberships. Just freedom to train.
          </p>

          {/* 🔍 Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white/90 backdrop-blur-md rounded-full shadow-2xl max-w-2xl mx-auto overflow-hidden border border-orange-300 hover:shadow-orange-300/40 transition-all duration-300"
          >
            <input
              type="text"
              placeholder="Search gyms, studios or city (e.g. Delhi, Yoga)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-6 py-4 text-gray-700 text-lg focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white px-6 py-4 font-semibold flex items-center gap-2 transition-all duration-300"
            >
              <Search size={20} />
              Search
            </button>
          </form>

          <div className="mt-10 flex justify-center gap-3 flex-wrap text-sm text-blue-100">
            {["#Gym", "#Yoga", "#Pilates", "#Zumba"].map((tag, i) => (
              <span
                key={i}
                className="px-4 py-1 border border-orange-300 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer transition-all duration-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-32">
            <path
              fill="#fff"
              d="M0,224L48,197.3C96,171,192,117,288,117.3C384,117,480,171,576,176C672,181,768,139,864,144C960,149,1056,203,1152,224C1248,245,1344,235,1392,229.3L1440,224L1440,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* 💪 Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-extrabold mb-12 text-blue-700">
          Why Choose <span className="text-orange-500">Passiify</span>?
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: <Dumbbell className="w-10 h-10 text-orange-500 mx-auto mb-3" />,
              title: "Train Without Limits",
              desc: "Access any gym, studio, or class near you with a one-day pass.",
            },
            {
              icon: <MapPin className="w-10 h-10 text-orange-500 mx-auto mb-3" />,
              title: "Discover Trusted Places",
              desc: "Verified gyms and trainers with real reviews and transparent pricing.",
            },
            {
              icon: <Clock className="w-10 h-10 text-orange-500 mx-auto mb-3" />,
              title: "Book in Seconds",
              desc: "Instant booking. No waiting. Just tap and train.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
              {card.icon}
              <h3 className="text-xl font-semibold mb-2 text-blue-700">{card.title}</h3>
              <p className="text-gray-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🏋️ Featured Gyms Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-extrabold mb-12 text-blue-700">Explore Gyms Near You</h2>
        {gyms.length === 0 ? (
          <p className="text-gray-500">Loading gyms...</p>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-10">
            {gyms.slice(0, 4).map((gym) => (
              <div
                key={gym._id}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-gray-100"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getGymImage(gym)}
                    alt={gym.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 text-white">
                    <h3 className="font-bold text-lg">{gym.name}</h3>
                    <p className="text-sm flex items-center">
                      <MapPin size={14} className="text-orange-400 mr-1" />
                      {gym.city}
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-600 text-sm mb-3">
                    {gym.description || "Premium training & certified coaches."}
                  </p>
                  <p className="text-orange-600 font-bold mb-2">₹{gym.price} / 1-Day Pass</p>
                  <Link
                    to={`/gyms/${gym._id}`}
                    className="block w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-2.5 rounded-full font-semibold hover:opacity-90 transition-all duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🔄 Steps */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-extrabold mb-12 text-blue-700">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-10">
          {[
            { step: "1️⃣", title: "Search", desc: "Find gyms nearby." },
            { step: "2️⃣", title: "Choose", desc: "Select your fitness spot." },
            { step: "3️⃣", title: "Book", desc: "Confirm your pass instantly." },
            { step: "4️⃣", title: "Train", desc: "Show your pass & go!" },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-3xl mb-3 animate-bounce">{s.step}</div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">{s.title}</h4>
              <p className="text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🌟 CTA */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-white py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">Start Your Fitness Journey with Passiify</h2>
        <p className="text-lg text-blue-100 mb-8">
          Discover, book, and train at the best gyms near you — all in one click.
        </p>
        <Link
          to="/explore"
          className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          Explore Gyms Now
        </Link>
      </section>

      {/* 🦶 Footer */}
      <footer className="bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-white py-12 mt-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center md:text-left">
          <div>
            <h3 className="text-3xl font-extrabold mb-3">
              Pass<span className="text-orange-300">iify</span>
            </h3>
            <p className="text-blue-100">
              One-day fitness passes. Zero membership stress.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white">Quick Links</h4>
            <ul className="space-y-2 text-blue-100">
              <li><Link to="/explore" className="hover:text-orange-300">Explore Gyms</Link></li>
              <li><Link to="/partner" className="hover:text-orange-300">Add Your Gym</Link></li>
              <li><Link to="/about" className="hover:text-orange-300">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white">Connect</h4>
            <p className="text-blue-100">📧 support@passiify.com</p>
            <p className="text-blue-100">📍 India</p>
          </div>
        </div>
        <p className="text-center text-blue-100 mt-10 text-sm">
          © {new Date().getFullYear()} Passiify. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
