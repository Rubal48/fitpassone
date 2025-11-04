// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

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

// 🔐 Auth Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// 🧑‍💼 Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard"; // ✅ fixed filename casing

const App = () => {
  return (
    <>
      {/* Navbar shown on all pages */}
      <Navbar />

      <Routes>
        {/* 🌍 Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/about" element={<About />} />
        <Route path="/partner" element={<PartnerWithUs />} />

        {/* 🏋️ Gym & Booking */}
        <Route path="/gyms/:id" element={<GymDetails />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/booking-success/:id" element={<BookingSuccess />} />
        <Route path="/booking-checkout/:id" element={<BookingCheckout />} />
        <Route path="/my-bookings" element={<MyBookings />} />

        {/* 🔐 Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* 🧑‍💼 Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </>
  );
};

export default App;
