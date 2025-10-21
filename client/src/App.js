import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import GymDetails from "./pages/GymDetails";
import Auth from "./pages/Auth";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";



const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/gym/:id" element={<GymDetails />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />


      </Routes>
    </>
  );
};

export default App;
