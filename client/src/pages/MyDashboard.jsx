import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import {
  MapPin,
  CalendarDays,
  Dumbbell,
  Ticket,
  Loader2,
  User,
  LogOut,
  Edit3,
  X,
  Save,
} from "lucide-react";

const MyDashboard = () => {
  const [user, setUser] = useState(null);
  const [gymBookings, setGymBookings] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;
    const userData = storedUser.user || storedUser;
    setUser(userData);
    setUpdatedName(userData.name);
    setUpdatedEmail(userData.email);

    const fetchData = async () => {
      try {
        const userId = userData._id;
        const [gymsRes, eventsRes] = await Promise.all([
          API.get(`/bookings/user/${userId}`),
          API.get(`/event-bookings/user/${userId}`),
        ]);
        setGymBookings(gymsRes.data.bookings || []);
        setEventBookings(eventsRes.data.bookings || eventsRes.data || []);
      } catch (err) {
        console.error("❌ Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleProfileUpdate = async () => {
    try {
      const res = await API.put(
        `/auth/update-profile/${user._id}`,
        { name: updatedName, email: updatedEmail },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.status === 200) {
        const updatedUser = res.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditing(false);
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <Loader2 className="animate-spin text-blue-600" size={42} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-16 px-4 sm:px-6 text-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/40 p-8 flex flex-col sm:flex-row items-center justify-between mb-12 transition-all hover:shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-orange-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-md">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                {user?.name}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-1">Welcome back to Passiify</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-6 sm:mt-0 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:opacity-90 transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center flex-wrap gap-3 mb-10">
          {[
            { id: "profile", label: "Profile" },
            { id: "gyms", label: "My Gyms" },
            { id: "events", label: "My Events" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-md"
                  : "bg-white/80 text-gray-700 border border-gray-200 hover:bg-blue-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/40 p-8 transition-all">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-orange-500 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <h2 className="text-2xl font-semibold mt-4">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>

              <button
                onClick={() => setEditing(true)}
                className="mt-5 flex mx-auto items-center gap-2 text-blue-600 hover:text-orange-500 font-medium transition-all"
              >
                <Edit3 size={16} /> Edit Profile
              </button>

              {/* Edit Modal */}
              {editing && (
                <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
                  <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full relative">
                    <button
                      onClick={() => setEditing(false)}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                    <h3 className="text-lg font-semibold text-blue-700 mb-4">
                      Edit Profile
                    </h3>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={updatedName}
                        onChange={(e) => setUpdatedName(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter name"
                      />
                      <input
                        type="email"
                        value={updatedEmail}
                        onChange={(e) => setUpdatedEmail(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter email"
                      />
                      <button
                        onClick={handleProfileUpdate}
                        className="mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-medium px-5 py-2 rounded-lg hover:opacity-90 transition-all"
                      >
                        <Save size={16} /> Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gym Bookings */}
          {activeTab === "gyms" && (
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Gym Bookings
              </h2>
              {gymBookings.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gymBookings.map((b) => (
                    <div
                      key={b._id}
                      className="bg-white/90 border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {b.gym?.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={14} /> {b.gym?.city}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <CalendarDays size={14} />{" "}
                        {new Date(b.date).toLocaleDateString("en-IN")}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        💰 ₹{b.price} | {b.duration} days
                      </p>
                      <Link
                        to={`/booking-success/${b._id}`}
                        state={{ type: "gym" }}
                        className="inline-block mt-4 text-sm bg-gradient-to-r from-blue-600 to-orange-500 text-white px-4 py-2 rounded-full hover:opacity-90"
                      >
                        View Ticket
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No gym bookings yet.
                </p>
              )}
            </section>
          )}

          {/* Event Bookings */}
          {activeTab === "events" && (
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Event Bookings
              </h2>
              {eventBookings.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventBookings.map((b) => (
                    <div
                      key={b._id}
                      className="bg-white/90 border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {b.event?.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={14} /> {b.event?.location}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <CalendarDays size={14} />{" "}
                        {new Date(b.event?.date).toLocaleDateString("en-IN")}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        🎟️ {b.tickets} Tickets | 💰 ₹{b.totalPrice}
                      </p>
                      <Link
                        to={`/booking-success/${b._id}`}
                        state={{ type: "event" }}
                        className="inline-block mt-4 text-sm bg-gradient-to-r from-blue-600 to-orange-500 text-white px-4 py-2 rounded-full hover:opacity-90"
                      >
                        View Ticket
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No event bookings yet.
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDashboard;
