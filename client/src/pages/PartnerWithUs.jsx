import React, { useState } from "react";
import {
  Loader2,
  CheckCircle,
  Upload,
  MapPin,
  Dumbbell,
  DollarSign,
} from "lucide-react";
import API from "../utils/api";

export default function Partner() {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    price: "",
    description: "",
    tags: "",
  });

  const [images, setImages] = useState([]); // ✅ store uploaded images
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Handle text inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 Handle image file upload
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const formDataUpload = new FormData();
    files.forEach((file) => formDataUpload.append("images", file));

    try {
      setUploading(true);
      const res = await API.post("/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages(res.data.images);
      setError("");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Submit gym data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.name || !formData.city || !formData.price) {
      setError("Please fill all required fields.");
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one gym image.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        city: formData.city,
        address: formData.address,
        price: Number(formData.price),
        description: formData.description,
        images, // ✅ array of uploaded image URLs from backend
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        status: "pending", // mark as pending review
      };

      const res = await API.post("/gyms", payload);

      if (res.status === 201 || res.status === 200) {
        setSuccess(true);
        setFormData({
          name: "",
          city: "",
          address: "",
          price: "",
          description: "",
          tags: "",
        });
        setImages([]);
      }
    } catch (err) {
      console.error("❌ Error adding gym:", err);
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 text-gray-800">
      {/* 🧭 Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 py-24 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-15"></div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h1 className="text-6xl font-extrabold mb-6">
            Partner With <span className="text-orange-300">Passiify</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8">
            Join India’s growing fitness network. List your gym and reach
            thousands of fitness lovers instantly.
          </p>
        </div>
      </section>

      {/* 🧾 Form Section */}
      <section className="max-w-3xl mx-auto my-16 p-8 bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100">
        {success ? (
          <div className="text-center text-green-600 flex flex-col items-center">
            <CheckCircle className="w-16 h-16 mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2">Gym Submitted for Review ✅</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Thank you for partnering with{" "}
              <span className="text-orange-500 font-semibold">Passiify</span>! <br />
              Our team will review your details and approve your gym shortly. Once
              verified, your gym will appear on the Explore page.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-2 rounded-full hover:opacity-90 transition"
            >
              Add Another Gym
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
              Add Your Gym Details
            </h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Gym Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gym Name *
                </label>
                <div className="flex items-center gap-2">
                  <Dumbbell className="text-orange-500 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter gym name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="text-orange-500 w-5 h-5" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <div className="flex items-center gap-2">
                  <DollarSign className="text-orange-500 w-5 h-5" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter 1-day pass price"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your gym, trainers, or facilities"
                  rows="3"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags / Amenities
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="E.g. WiFi, Parking, Showers, Trainers"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple amenities with commas.
                </p>
              </div>

              {/* 📸 Upload Gym Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Gym Images (Main + Interior)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                />
                {uploading && (
                  <p className="text-blue-500 text-sm mt-1 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading images...
                  </p>
                )}
                {images.length > 0 && (
                  <p className="text-green-600 text-sm mt-1">
                    {images.length} image(s) uploaded successfully ✅
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-3 rounded-full font-semibold flex items-center justify-center hover:opacity-90 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...
                  </>
                ) : (
                  "Submit Gym Details"
                )}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
