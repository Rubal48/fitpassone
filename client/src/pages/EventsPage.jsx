import React, { useEffect, useState } from "react";
import {
  MapPin,
  CalendarDays,
  Star,
  Loader2,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/events"); // ✅ backend aligned
        setEvents(res.data.events || []);
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // ✅ Filter logic with category + search
  const filteredEvents = events.filter((e) => {
    const categoryMatch =
      selectedCategory === "all" ||
      e.category?.toLowerCase() === selectedCategory.toLowerCase();

    const searchMatch =
      e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={42} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f9fafc] text-gray-800">
      {/* 🌟 Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-white text-center py-24 px-6 shadow-lg">
        <h1 className="text-5xl font-extrabold mb-4 leading-tight">
          Discover <span className="text-orange-300">Epic Experiences</span> Near You
        </h1>
        <p className="text-lg text-blue-100 mb-4 max-w-2xl mx-auto italic">
          “Adventure isn’t found, it’s created — one event at a time.”
        </p>
        <p className="text-md text-blue-100 mb-8 max-w-2xl mx-auto">
          From yoga retreats to adventure treks, Passiify connects communities through experiences that inspire connection and growth.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate("/events")}
            className="bg-white text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-orange-100 transition-all"
          >
            Explore Events
          </button>
          <button
            onClick={() => navigate("/create-event")}
            className="border border-white/70 px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
          >
            Host an Event <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* 🧭 Filters + Search */}
      <div className="max-w-6xl mx-auto mt-10 bg-white shadow-md rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3 text-blue-700 font-semibold text-lg">
          <Filter size={20} />
          <span>Filter Events</span>
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {["all", "yoga", "strength", "cardio", "adventure", "mindfulness"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium capitalize transition-all ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white"
                    : "bg-blue-50 hover:bg-blue-100 text-gray-700"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            )
          )}
        </div>

        {/* 🔍 Search Bar */}
        <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full shadow-inner w-full md:w-auto md:min-w-[260px]">
          <Search size={18} className="text-blue-600 mr-2" />
          <input
            type="text"
            placeholder="Search events or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-500"
          />
        </div>
      </div>

      {/* 🎯 Events Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Featured This Week
        </h2>

        {filteredEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-20">
            No events match your search or category.
          </p>
        ) : (
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={event.image || "/images/default-event.jpg"}
                    alt={event.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    ₹{event.price || 0}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold mb-1 text-gray-800 group-hover:text-blue-700">
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {event.description ||
                      "Join an unforgettable experience near you!"}
                  </p>

                  <div className="flex justify-between text-gray-600 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin size={15} /> {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays size={15} />{" "}
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          fill={i < (event.rating || 4) ? "gold" : "none"}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => navigate(`/events/${event._id}`)}
                      className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow hover:shadow-md transition-all hover:scale-105"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔥 CTA Section */}
      <div className="bg-gradient-to-r from-orange-500 to-blue-600 text-white text-center py-16">
        <h2 className="text-3xl font-semibold mb-3">
          Be Part of The Experience.
        </h2>
        <p className="text-blue-100 mb-6">
          Join thousands discovering community events through Passiify.
        </p>
        <button
          onClick={() => navigate("/events")}
          className="bg-white text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-orange-100 transition-all"
        >
          Explore Events
        </button>
      </div>

      {/* ⚡ Footer */}
      <footer className="bg-blue-900 text-white py-10 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-extrabold mb-2">
              <span className="text-blue-400">Pass</span>
              <span className="text-orange-400">iify</span>
            </h3>
            <p className="text-blue-200 text-sm">
              © 2025 Passiify. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 text-blue-200 text-sm">
            <Link to="/">Home</Link>
            <Link to="/events">Events</Link>
            <Link to="/explore">Explore</Link>
            <Link to="/partner">Partner</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EventsPage;
