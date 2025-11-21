// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import MyDashboard from "./pages/MyDashboard";

// 🏠 Main Pages
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import About from "./pages/About";
import PartnerWithUs from "./pages/PartnerWithUs";

// 💪 Gym & Booking Pages
import GymDetails from "./pages/GymDetails";
import BookingPage from "./pages/BookingPage";
import BookingSuccess from "./pages/BookingSuccess";
import BookingCheckout from "./pages/BookingCheckout";
import MyBookings from "./pages/MyBookings";

// 🎟️ Event Pages
import EventsPage from "./pages/EventsPage";
import EventDetail from "./pages/EventDetail";
import BookEvent from "./pages/BookEvent";
import MyEventBookings from "./pages/MyEventBookings";
import HostEvent from "./pages/HostEvent"; // ⭐ added
import AdminEventDetails from "./pages/AdminEventDetails";

// 🔐 Auth Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// 🧑‍💼 Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGymDetails from "./pages/AdminGymDetails";

// 🤝 Partner Dashboard Pages
import PartnerDashboardLayout from "./pages/partner/PartnerDashboardLayout";
import PartnerOverview from "./pages/partner/PartnerOverview";
import PartnerPasses from "./pages/partner/PartnerPasses";
import PartnerBookings from "./pages/partner/PartnerBookings";
import PartnerEvents from "./pages/partner/PartnerEvents";
import PartnerRevenue from "./pages/partner/PartnerRevenue";
import PartnerReviews from "./pages/partner/PartnerReviews";
import PartnerProfile from "./pages/partner/PartnerProfile";

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        {/* 🌍 Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/about" element={<About />} />
        <Route path="/partner" element={<PartnerWithUs />} />

        {/* 🏋️ Gym Booking Flow */}
        <Route path="/gyms/:id" element={<GymDetails />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/booking-success/:id" element={<BookingSuccess />} />
        <Route path="/booking-checkout/:id" element={<BookingCheckout />} />
        <Route path="/my-bookings" element={<MyBookings />} />

        {/* 🎟️ Event Booking Flow */}
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/create-event" element={<HostEvent />} />
        <Route path="/book-event/:id" element={<BookEvent />} />
        <Route path="/my-event-bookings" element={<MyEventBookings />} />

        {/* 🔐 User Dashboard Route */}
        <Route path="/my-dashboard" element={<MyDashboard />} />

        {/* 🤝 Partner Dashboard (nested) */}
        <Route path="/partner/dashboard" element={<PartnerDashboardLayout />}>
          <Route index element={<PartnerOverview />} />
          <Route path="passes" element={<PartnerPasses />} />
          <Route path="bookings" element={<PartnerBookings />} />
          <Route path="events" element={<PartnerEvents />} />
          <Route path="revenue" element={<PartnerRevenue />} />
          <Route path="reviews" element={<PartnerReviews />} />
          <Route path="profile" element={<PartnerProfile />} />
        </Route>

        {/* 🔐 Authentication */}
        <Route path="/login" element={<LoginPage />} />

        {/* 👇 NEW: support both /register and /signup */}
        <Route path="/register" element={<SignupPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* 🧑‍💼 Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/gym/:id" element={<AdminGymDetails />} />
        <Route path="/admin/event/:id" element={<AdminEventDetails />} />
        

      </Routes>
    </>
  );
};

export default App;
