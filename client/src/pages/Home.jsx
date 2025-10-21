import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Dumbbell, Clock } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/explore?query=${query}`);
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white text-gray-800 min-h-screen overflow-hidden">
      {/* 🌅 Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 text-white py-24 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')]"></div>

        {/* Floating Circles Animation */}
        <div className="absolute top-10 left-20 w-24 h-24 bg-orange-400/30 rounded-full animate-pulse blur-xl"></div>
        <div className="absolute bottom-10 right-32 w-32 h-32 bg-blue-300/30 rounded-full animate-pulse blur-xl"></div>

        <div className="max-w-5xl mx-auto px-6 relative z-10 animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            Your Fitness, <span className="text-orange-400">Your Way</span> — Anytime, Anywhere.
          </h1>
          <p className="text-lg md:text-xl mb-10 text-blue-100 font-light">
            Book a <span className="font-semibold text-orange-300">one-day pass</span> at gyms, yoga, or pilates studios near you.
            <br /> No commitments. No memberships. Just freedom to train.
          </p>

          {/* 🔍 Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white/90 backdrop-blur-md rounded-full shadow-2xl max-w-2xl mx-auto overflow-hidden border border-orange-300 focus-within:ring-2 focus-within:ring-orange-400 transition-all duration-300"
          >
            <input
              type="text"
              placeholder="Search gyms, studios or city (e.g. Delhi, Yoga)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-6 py-3 text-gray-700 text-lg focus:outline-none"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105"
            >
              <Search size={20} />
              Search
            </button>
          </form>

          <div className="mt-10 flex justify-center gap-3 flex-wrap text-sm text-blue-200 animate-fadeInSlow">
            {["#Gym", "#Yoga", "#Pilates", "#Zumba"].map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 border border-blue-300 rounded-full bg-blue-500/20 hover:bg-blue-500/30 cursor-pointer transition-all duration-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="w-full h-32"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,224L48,197.3C96,171,192,117,288,117.3C384,117,480,171,576,176C672,181,768,139,864,144C960,149,1056,203,1152,224C1248,245,1344,235,1392,229.3L1440,224L1440,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* 💪 Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-extrabold mb-12 text-blue-700">
          Why Choose <span className="text-orange-500">Passiify</span>?
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: <Dumbbell className="w-10 h-10 text-orange-500 mx-auto mb-3" />,
              title: "Train Without Limits",
              desc: "Access any gym, studio, or class near you with just a one-day pass.",
            },
            {
              icon: <MapPin className="w-10 h-10 text-orange-500 mx-auto mb-3" />,
              title: "Discover Trusted Places",
              desc: "Verified gyms and trainers with real reviews and transparent pricing.",
            },
            {
              icon: <Clock className="w-10 h-10 text-orange-500 mx-auto mb-3" />,
              title: "Book in Seconds",
              desc: "Instant booking. No paperwork. No waiting. Just tap and train.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-blue-700">{card.title}</h3>
              <p className="text-gray-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🌆 Cities */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 text-center">
        <h2 className="text-4xl font-extrabold mb-10 text-blue-700">
          Top Cities to Train
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-6">
          {["Delhi", "Mumbai", "Bangalore", "Pune", "Chennai", "Hyderabad", "Jaipur", "Kolkata"].map(
            (city, index) => (
              <div
                key={index}
                className="relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all overflow-hidden group cursor-pointer"
              >
                <img
                  src={`https://source.unsplash.com/400x300/?${city},city`}
                  alt={city}
                  className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center opacity-90">
                  <h3 className="text-white text-2xl font-semibold mb-4 group-hover:text-orange-300 transition-all">
                    {city}
                  </h3>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* 🔄 Steps */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-extrabold mb-12 text-blue-700">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-10">
          {[
            { step: "1️⃣", title: "Search", desc: "Find gyms or studios nearby." },
            { step: "2️⃣", title: "Choose", desc: "Select your fitness spot." },
            { step: "3️⃣", title: "Book", desc: "Pick your date & confirm." },
            { step: "4️⃣", title: "Train", desc: "Show your digital pass & train." },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-3xl mb-3 animate-bounce">{s.step}</div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">{s.title}</h4>
              <p className="text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🌟 CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">Start Your Fitness Journey with Passiify</h2>
        <p className="text-lg text-orange-100 mb-8">
          Discover, book, and train at the best gyms near you — all in one click.
        </p>
        <Link
          to="/explore"
          className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          Explore Gyms Now
        </Link>
      </section>

      {/* 🦶 Footer */}
      <footer className="bg-blue-700 text-white py-12 mt-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center md:text-left">
          <div>
            <h3 className="text-3xl font-extrabold mb-3">
              Pass<span className="text-orange-400">iify</span>
            </h3>
            <p className="text-blue-100">
              One-day fitness passes. Zero membership stress.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-blue-100">
              <li><Link to="/explore" className="hover:text-orange-300">Explore Gyms</Link></li>
              <li><Link to="/partner" className="hover:text-orange-300">Add Your Gym</Link></li>
              <li><Link to="/about" className="hover:text-orange-300">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <p className="text-blue-100">📧 support@passiify.com</p>
            <p className="text-blue-100">📍 India</p>
          </div>
        </div>
        <p className="text-center text-blue-200 mt-10 text-sm">
          © {new Date().getFullYear()} Passiify. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
