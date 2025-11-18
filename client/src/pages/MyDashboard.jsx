import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";
import {
  MapPin,
  CalendarDays,
  Ticket,
  Loader2,
  LogOut,
  Edit3,
  X,
  Save,
  ArrowRight,
  TrendingUp,
  Dumbbell,
  Sparkles,
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
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const navigate = useNavigate();

  // ------------------------------
  // Fetch user + bookings
  // ------------------------------
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      setLoading(false);
      return;
    }

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

  // ------------------------------
  // Derived stats
  // ------------------------------
  const today = new Date();

  const upcomingGymBookings = gymBookings.filter(
    (b) => b.date && new Date(b.date) >= today
  );
  const pastGymBookings = gymBookings.filter(
    (b) => b.date && new Date(b.date) < today
  );

  const upcomingEventBookings = eventBookings.filter(
    (b) => b.event?.date && new Date(b.event.date) >= today
  );
  const pastEventBookings = eventBookings.filter(
    (b) => b.event?.date && new Date(b.event.date) < today
  );

  const totalGymSpend = gymBookings.reduce(
    (sum, b) => sum + (Number(b.price) || 0),
    0
  );
  const totalEventSpend = eventBookings.reduce(
    (sum, b) => sum + (Number(b.totalPrice) || 0),
    0
  );
  const totalSpend = totalGymSpend + totalEventSpend;

  const totalPasses = gymBookings.length;
  const totalEvents = eventBookings.length;
  const totalUpcoming = upcomingGymBookings.length + upcomingEventBookings.length;

  // ------------------------------
  // Actions
  // ------------------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileUpdate = async () => {
    try {
      setUpdatingProfile(true);
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
        // keep storage flexible (works with both shapes)
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditing(false);
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-[70vh]"
        style={{
          backgroundColor: "#050308",
          backgroundImage:
            "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
        }}
      >
        <Loader2 className="animate-spin text-orange-300" size={42} />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-gray-100 px-4"
        style={{
          backgroundColor: "#050308",
          backgroundImage:
            "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
        }}
      >
        <h1 className="text-2xl font-semibold mb-2">You’re not logged in</h1>
        <p className="text-sm text-gray-400 mb-6 text-center max-w-sm">
          Log in to see your passes, events and personalized travel fitness
          history.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[#FF4B5C] to-[#FF9F68] text-gray-900 shadow-[0_18px_60px_rgba(0,0,0,0.95)] hover:opacity-95"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-gray-100 pb-16"
      style={{
        backgroundColor: "#050308",
        backgroundImage:
          "radial-gradient(circle at top, rgba(248,216,181,0.18), transparent 55%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16">
        {/* =========================
            HEADER
        ========================== */}
        <div className="bg-black/70 border border-white/15 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.95)] px-6 py-6 sm:px-8 sm:py-7 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF4B5C] to-[#FF9F68] flex items-center justify-center text-2xl font-bold text-gray-950 shadow-[0_18px_50px_rgba(0,0,0,0.85)]">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {user?.name || "Passiify Member"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                {user?.email}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Your travel + fitness hub — passes, events and progress in one place.
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => setEditing(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white/5 border border-white/20 hover:border-white/60 transition"
            >
              <Edit3 size={14} /> Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#FF4B5C] to-[#FF9F68] text-gray-950 shadow-[0_20px_60px_rgba(0,0,0,0.95)] hover:opacity-95"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* =========================
            TOP SUMMARY
        ========================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 text-xs sm:text-sm">
          <div className="rounded-2xl bg-black/70 border border-white/15 px-4 py-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[11px]">Total passes</span>
              <Dumbbell className="w-4 h-4 text-orange-300" />
            </div>
            <div className="mt-1 text-xl font-bold">{totalPasses}</div>
            <p className="text-[11px] text-gray-500 mt-1">Gym & studio day passes used.</p>
          </div>

          <div className="rounded-2xl bg-black/70 border border-white/15 px-4 py-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[11px]">Events joined</span>
              <Ticket className="w-4 h-4 text-orange-300" />
            </div>
            <div className="mt-1 text-xl font-bold">{totalEvents}</div>
            <p className="text-[11px] text-gray-500 mt-1">Marathons, yoga retreats & more.</p>
          </div>

          <div className="rounded-2xl bg-black/70 border border-white/15 px-4 py-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[11px]">Total spend</span>
              <TrendingUp className="w-4 h-4 text-orange-300" />
            </div>
            <div className="mt-1 text-xl font-bold">
              ₹{totalSpend.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Across gyms & events.</p>
          </div>

          <div className="rounded-2xl bg-black/70 border border-white/15 px-4 py-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[11px]">Upcoming</span>
              <Sparkles className="w-4 h-4 text-orange-300" />
            </div>
            <div className="mt-1 text-xl font-bold">{totalUpcoming}</div>
            <p className="text-[11px] text-gray-500 mt-1">Passes & events lined up.</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mb-10 text-[11px] sm:text-xs">
          <button
            onClick={() => navigate("/explore")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/20 hover:border-white/60 transition"
          >
            Discover new gyms <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate("/events")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/20 hover:border-white/60 transition"
          >
            Explore events <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* =========================
            TABS
        ========================== */}
        <div className="flex justify-center flex-wrap gap-3 mb-8 text-xs sm:text-sm">
          {[
            { id: "profile", label: "Overview" },
            { id: "gyms", label: "Gym Passes" },
            { id: "events", label: "Event Tickets" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#FF4B5C] to-[#FF9F68] text-gray-950 shadow-[0_18px_60px_rgba(0,0,0,0.9)]"
                  : "bg-black/60 text-gray-200 border border-white/15 hover:border-white/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* =========================
            TAB CONTENT CONTAINER
        ========================== */}
        <div className="bg-black/70 border border-white/15 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.95)] p-6 sm:p-8">
          {/* Profile / Overview Tab */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF4B5C] to-[#FF9F68] flex items-center justify-center text-3xl font-bold text-gray-950 shadow-[0_18px_60px_rgba(0,0,0,0.95)]">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold mt-4">
                  {user?.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400">
                  {user?.email}
                </p>
                <p className="text-[11px] text-gray-500 mt-2 max-w-md">
                  This is your travel fitness timeline — every city you train in,
                  every event you join, all connected to your Passiify profile.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="rounded-2xl bg-white/5 border border-white/15 px-4 py-3">
                  <p className="text-gray-400 text-[11px] mb-1">
                    Training style
                  </p>
                  <p className="font-semibold text-gray-100">
                    Explorer mode activated
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    You&apos;re using day passes & events to keep fitness flexible.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/15 px-4 py-3">
                  <p className="text-gray-400 text-[11px] mb-1">
                    Most active category
                  </p>
                  <p className="font-semibold text-gray-100">
                    {totalPasses >= totalEvents ? "Gyms & Studios" : "Events"}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Switch it up anytime — MMA, yoga, marathons, dance and more.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/15 px-4 py-3">
                  <p className="text-gray-400 text-[11px] mb-1">
                    Next step
                  </p>
                  <p className="font-semibold text-gray-100">
                    Find your next city session
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Book in advance so you land with a workout already locked.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gym Bookings Tab */}
          {activeTab === "gyms" && (
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-xl font-bold">Gym & Studio Passes</h2>
                <p className="text-[11px] text-gray-400">
                  Track your one-day and short-term passes across cities.
                </p>
              </div>

              {gymBookings.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-10">
                  <p>No gym bookings yet.</p>
                  <button
                    onClick={() => navigate("/explore")}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/20 hover:border-white/60 text-xs"
                  >
                    Discover your first gym <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  {/* Upcoming */}
                  {upcomingGymBookings.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-200 mb-3">
                        Upcoming passes
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingGymBookings.map((b) => (
                          <div
                            key={b._id}
                            className="bg-white/5 border border-white/15 rounded-2xl p-4 text-xs sm:text-sm hover:border-white/50 hover:-translate-y-[2px] transition"
                          >
                            <h3 className="text-sm font-semibold text-gray-100 mb-1">
                              {b.gym?.name}
                            </h3>
                            <p className="flex items-center gap-1 text-gray-400">
                              <MapPin className="w-3.5 h-3.5" /> {b.gym?.city}
                            </p>
                            <p className="flex items-center gap-1 text-gray-400 mt-1">
                              <CalendarDays className="w-3.5 h-3.5" />{" "}
                              {new Date(b.date).toLocaleDateString("en-IN")}
                            </p>
                            <p className="mt-2 text-gray-200">
                              ₹{b.price} · {b.duration} day
                              {b.duration > 1 ? "s" : ""}
                            </p>
                            <Link
                              to={`/booking-success/${b._id}`}
                              state={{ type: "gym" }}
                              className="inline-flex items-center gap-1 mt-3 text-[11px] px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF4B5C] to-[#FF9F68] text-gray-950"
                            >
                              View pass <Ticket className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past */}
                  {pastGymBookings.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-200 mb-3">
                        Past sessions
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pastGymBookings.map((b) => (
                          <div
                            key={b._id}
                            className="bg-white/3 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm"
                          >
                            <h3 className="text-sm font-semibold text-gray-100 mb-1">
                              {b.gym?.name}
                            </h3>
                            <p className="flex items-center gap-1 text-gray-500">
                              <MapPin className="w-3.5 h-3.5" /> {b.gym?.city}
                            </p>
                            <p className="flex items-center gap-1 text-gray-500 mt-1">
                              <CalendarDays className="w-3.5 h-3.5" />{" "}
                              {new Date(b.date).toLocaleDateString("en-IN")}
                            </p>
                            <p className="mt-2 text-gray-300">
                              ₹{b.price} · {b.duration} day
                              {b.duration > 1 ? "s" : ""}
                            </p>
                            <Link
                              to={`/booking-success/${b._id}`}
                              state={{ type: "gym" }}
                              className="inline-flex items-center gap-1 mt-3 text-[11px] px-3 py-1.5 rounded-full bg-white/5 border border-white/20 hover:border-white/60 text-gray-100"
                            >
                              View ticket
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* Event Bookings Tab */}
          {activeTab === "events" && (
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-xl font-bold">Event Tickets</h2>
                <p className="text-[11px] text-gray-400">
                  Track your marathons, retreats, festivals & fitness events.
                </p>
              </div>

              {eventBookings.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-10">
                  <p>No event bookings yet.</p>
                  <button
                    onClick={() => navigate("/events")}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/20 hover:border-white/60 text-xs"
                  >
                    Discover events <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  {/* Upcoming */}
                  {upcomingEventBookings.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-200 mb-3">
                        Upcoming events
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingEventBookings.map((b) => (
                          <div
                            key={b._id}
                            className="bg-white/5 border border-white/15 rounded-2xl p-4 text-xs sm:text-sm hover:border-white/50 hover:-translate-y-[2px] transition"
                          >
                            <h3 className="text-sm font-semibold text-gray-100 mb-1">
                              {b.event?.name}
                            </h3>
                            <p className="flex items-center gap-1 text-gray-400">
                              <MapPin className="w-3.5 h-3.5" />{" "}
                              {b.event?.location}
                            </p>
                            <p className="flex items-center gap-1 text-gray-400 mt-1">
                              <CalendarDays className="w-3.5 h-3.5" />{" "}
                              {b.event?.date
                                ? new Date(b.event.date).toLocaleDateString(
                                    "en-IN"
                                  )
                                : ""}
                            </p>
                            <p className="mt-2 text-gray-200">
                              🎟 {b.tickets} ticket
                              {b.tickets > 1 ? "s" : ""} · ₹
                              {b.totalPrice}
                            </p>
                            <Link
                              to={`/booking-success/${b._id}`}
                              state={{ type: "event" }}
                              className="inline-flex items-center gap-1 mt-3 text-[11px] px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF4B5C] to-[#FF9F68] text-gray-950"
                            >
                              View ticket <Ticket className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past */}
                  {pastEventBookings.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-200 mb-3">
                        Past events
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pastEventBookings.map((b) => (
                          <div
                            key={b._id}
                            className="bg-white/3 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm"
                          >
                            <h3 className="text-sm font-semibold text-gray-100 mb-1">
                              {b.event?.name}
                            </h3>
                            <p className="flex items-center gap-1 text-gray-500">
                              <MapPin className="w-3.5 h-3.5" />{" "}
                              {b.event?.location}
                            </p>
                            <p className="flex items-center gap-1 text-gray-500 mt-1">
                              <CalendarDays className="w-3.5 h-3.5" />{" "}
                              {b.event?.date
                                ? new Date(b.event.date).toLocaleDateString(
                                    "en-IN"
                                  )
                                : ""}
                            </p>
                            <p className="mt-2 text-gray-300">
                              🎟 {b.tickets} ticket
                              {b.tickets > 1 ? "s" : ""} · ₹
                              {b.totalPrice}
                            </p>
                            <Link
                              to={`/booking-success/${b._id}`}
                              state={{ type: "event" }}
                              className="inline-flex items-center gap-1 mt-3 text-[11px] px-3 py-1.5 rounded-full bg-white/5 border border-white/20 hover:border-white/60 text-gray-100"
                            >
                              View ticket
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      </div>

      {/* =========================
          EDIT PROFILE MODAL
      ========================== */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-black/90 border border-white/15 rounded-2xl p-6 sm:p-7 w-full max-w-md relative shadow-[0_22px_80px_rgba(0,0,0,1)]">
            <button
              onClick={() => setEditing(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-100"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-semibold text-gray-50 mb-4 flex items-center gap-2">
              <Edit3 size={16} className="text-orange-300" />
              Edit profile
            </h3>
            <div className="flex flex-col gap-3 text-xs sm:text-sm">
              <input
                type="text"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/60"
                placeholder="Enter name"
              />
              <input
                type="email"
                value={updatedEmail}
                onChange={(e) => setUpdatedEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/60"
                placeholder="Enter email"
              />
              <button
                onClick={handleProfileUpdate}
                disabled={updatingProfile}
                className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#FF4B5C] to-[#FF9F68] text-gray-950 shadow-[0_20px_70px_rgba(0,0,0,0.95)] hover:opacity-95 disabled:opacity-70"
              >
                {updatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDashboard;
