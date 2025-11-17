import React from "react";

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center h-[80vh] bg-gray-50 px-6">
      <h2 className="text-5xl font-bold text-gray-800 mb-4">
        Your All-in-One Day Pass for Fitness 🏋️‍♂️
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mb-6">
        Explore gyms, yoga, and pilates studios near you — pay only for the day you go!
      </p>
      <button className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
        Find Your Fit Now
      </button>
    </section>
  );
};

export default Hero;
