import React from "react";
import { Users, Target, Sparkles, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-orange-50 min-h-screen text-gray-800">
      {/* 🌅 Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-white text-center py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')]"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            About <span className="text-orange-300">Passiify</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 font-light">
            Redefining fitness for the new generation — flexible, accessible, and fun.
          </p>
        </div>
      </section>

      {/* 🌍 Our Story */}
      <section className="max-w-6xl mx-auto py-20 px-6 text-center md:text-left">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-extrabold text-blue-700 mb-6">
              Our <span className="text-orange-500">Story</span>
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Passiify was born out of a simple idea — to make fitness more flexible for everyone.
              We realized that not everyone wants long-term gym memberships, and many people just
              want to explore, try, and experience fitness on their own terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              So we created Passiify — India’s first platform where you can buy
              <span className="text-orange-500 font-semibold"> one-day fitness passes</span> to any gym,
              yoga, dance, or pilates studio near you. No contracts. No commitments. Just pure freedom to train
              wherever you want.
            </p>
          </div>

          <div className="flex justify-center md:justify-end">
            <img
              src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=700&q=80"
              alt="About Passiify"
              className="rounded-2xl shadow-lg w-full md:w-4/5 object-cover"
            />
          </div>
        </div>
      </section>

      {/* 🎯 Mission Section */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-white py-20 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <Target size={50} className="mx-auto mb-6 text-orange-300" />
          <h2 className="text-4xl font-extrabold mb-4">Our Mission</h2>
          <p className="text-lg text-blue-100 leading-relaxed">
            To make fitness simple, flexible, and accessible — for everyone.
            Whether you’re a traveler, student, or just exploring new workout styles,
            Passiify gives you the freedom to move without limits.
          </p>
        </div>
      </section>

      {/* 💪 Values Section */}
      <section className="max-w-6xl mx-auto py-20 px-6 text-center">
        <h2 className="text-4xl font-extrabold mb-12 text-blue-700">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: <Users className="w-10 h-10 text-orange-500 mx-auto mb-4" />,
              title: "Community First",
              desc: "We believe fitness is more fun when shared — connecting users, gyms, and local trainers.",
            },
            {
              icon: <Sparkles className="w-10 h-10 text-orange-500 mx-auto mb-4" />,
              title: "Innovation",
              desc: "Constantly improving our platform to make your fitness experience smoother and smarter.",
            },
            {
              icon: <Heart className="w-10 h-10 text-orange-500 mx-auto mb-4" />,
              title: "Passion for Health",
              desc: "We’re not just a tech company — we’re a team passionate about fitness and human potential.",
            },
          ].map((value, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              {value.icon}
              <h3 className="text-xl font-semibold text-blue-700 mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🌟 Join Us CTA */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-white py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">Join the Passiify Movement</h2>
        <p className="text-lg text-blue-100 mb-8">
          Be part of India’s first flexible fitness community — where your next workout is just one click away.
        </p>
        <a
          href="/register"
          className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          Get Started
        </a>
      </section>
    </div>
  );
}
