import React, { useState } from "react";
import { Dumbbell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`${isSignup ? "Account Created" : "Login Successful"} ✅`);
    navigate("/explore");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side (Banner) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-400 text-white flex-col justify-center items-center p-10">
        <Dumbbell className="w-16 h-16 mb-6 text-orange-300" />
        <h1 className="text-4xl font-bold mb-3">Welcome to Passiify</h1>
        <p className="text-lg text-blue-100 max-w-sm text-center">
          Train anywhere, anytime. Explore 1000+ gyms, yoga, and pilates studios
          with one-day access.
        </p>
      </div>

      {/* Right Side (Form) */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-[90%] max-w-md">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Password</label>
              <input
                type="password"
                required
                placeholder="Enter password"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {isSignup && (
              <div>
                <label className="text-sm font-medium text-gray-600">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm password"
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-all"
            >
              {isSignup ? "Sign Up" : "Login"}
            </button>

            <div className="text-center text-gray-500 my-3">or</div>

            {/* Google Mock Button */}
            <button
              type="button"
              onClick={() => alert("Google Sign-In coming soon!")}
              className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition flex items-center justify-center"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              Continue with Google
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            {isSignup ? "Already have an account?" : "New to Passiify?"}{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 font-medium hover:underline"
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>

          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-blue-600 transition"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
