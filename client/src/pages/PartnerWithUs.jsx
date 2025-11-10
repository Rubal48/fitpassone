import React, { useState } from "react";
import {
  Loader2,
  CheckCircle,
  DollarSign,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import API from "../utils/api";

export default function Partner() {
  const [formData, setFormData] = useState({
    name: "",
    businessType: "gym",
    city: "",
    address: "",
    phone: "",
    description: "",
    tags: "",
    website: "",
    instagram: "",
    googleMapLink: "",
  });

  const [passes, setPasses] = useState([{ duration: 1, price: "" }]); // ✅ new
  const [images, setImages] = useState([]);
  const [businessProof, setBusinessProof] = useState(null);
  const [ownerIdProof, setOwnerIdProof] = useState(null);
  const [video, setVideo] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const amenitiesList = [
    "WiFi",
    "Parking",
    "Showers",
    "Lockers",
    "Steam Room",
    "AC",
    "Cafeteria",
    "Women-Only Section",
  ];

  // input handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Pass management
  const handlePassChange = (index, field, value) => {
    const updated = [...passes];
    updated[index][field] = value;
    setPasses(updated);
  };

  const addPass = () => setPasses([...passes, { duration: "", price: "" }]);
  const removePass = (index) =>
    setPasses(passes.filter((_, i) => i !== index));

  // facilities checkboxes
  const handleFacilityChange = (e) => {
    const { value, checked } = e.target;
    setFacilities((prev) =>
      checked ? [...prev, value] : prev.filter((f) => f !== value)
    );
  };

  // file uploads
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
    } catch {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleProofUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await API.post("/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (type === "business") setBusinessProof(res.data.images[0]);
      if (type === "owner") setOwnerIdProof(res.data.images[0]);
      if (type === "video") setVideo(res.data.images[0]);
    } catch {
      setError("Document upload failed.");
    }
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.name || !formData.city || !formData.phone) {
      setError("Please fill all required fields.");
      return;
    }

    if (passes.some((p) => !p.duration || !p.price)) {
      setError("Please fill duration and price for all passes.");
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        passes: passes.map((p) => ({
          duration: Number(p.duration),
          price: Number(p.price),
        })),
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : [],
        facilities,
        images,
        businessProof,
        ownerIdProof,
        video,
        status: "pending",
      };

      const res = await API.post("/gyms", payload);
      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setFormData({
          name: "",
          businessType: "gym",
          city: "",
          address: "",
          phone: "",
          description: "",
          tags: "",
          website: "",
          instagram: "",
          googleMapLink: "",
        });
        setFacilities([]);
        setImages([]);
        setBusinessProof(null);
        setOwnerIdProof(null);
        setVideo(null);
        setPasses([{ duration: 1, price: "" }]);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 py-24 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-15"></div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h1 className="text-6xl font-extrabold mb-6">
            Partner With <span className="text-orange-300">Passiify</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8">
            Join India’s growing fitness & wellness network. List your{" "}
            <span className="text-orange-200 font-semibold">
              Gym, Yoga, MMA
            </span>{" "}
            or Wellness Centre and reach thousands of short-term users
            instantly.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="max-w-3xl mx-auto my-16 p-8 bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100">
        {success ? (
          <div className="text-center text-green-600 flex flex-col items-center">
            <CheckCircle className="w-16 h-16 mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2">
              Centre Submitted for Review ✅
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Thank you for partnering with{" "}
              <span className="text-orange-500 font-semibold">Passiify</span>!{" "}
              <br />
              Our team will review and verify your details soon.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-2 rounded-full hover:opacity-90 transition"
            >
              Add Another Centre
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
              Add Your Gym / Centre Details
            </h2>
            {error && (
              <p className="text-red-500 text-center mb-4 font-medium">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Type */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Select Business Type *
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                >
                  <option value="gym">Gym / Fitness Centre</option>
                  <option value="mma">MMA / Combat Academy</option>
                  <option value="yoga">Yoga / Meditation Studio</option>
                  <option value="event">Event / Workshop Organizer</option>
                </select>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Centre Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Business Phone *
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="text-orange-500 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter business phone"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* City & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Full address"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>
              </div>

              {/* ✅ Custom Pass Section */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Add Custom Passes (Duration & Price) *
                </label>
                {passes.map((pass, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 mb-2 border border-gray-200 rounded-lg p-3"
                  >
                    <input
                      type="number"
                      placeholder="Duration (days)"
                      value={pass.duration}
                      onChange={(e) =>
                        handlePassChange(index, "duration", e.target.value)
                      }
                      className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Price ₹"
                      value={pass.price}
                      onChange={(e) =>
                        handlePassChange(index, "price", e.target.value)
                      }
                      className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                    {passes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePass(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPass}
                  className="mt-2 flex items-center text-blue-600 text-sm font-semibold hover:text-blue-800"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Another Pass
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your facilities, timings, or vibe"
                  rows="3"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none resize-none"
                />
              </div>

              {/* Facilities */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Available Facilities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {amenitiesList.map((item) => (
                    <label key={item} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        value={item}
                        onChange={handleFacilityChange}
                        checked={facilities.includes(item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Verification Proofs */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Upload Verification Documents
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Business Proof (GST / Reg.)
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleProofUpload(e, "business")}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Owner ID (Aadhar / PAN)
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleProofUpload(e, "owner")}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Intro Video (optional)
                    </p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleProofUpload(e, "video")}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Upload Centre Images (Main + Interior)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2"
                />
                {uploading && (
                  <p className="text-blue-500 text-sm mt-1 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading
                    images...
                  </p>
                )}
                {images.length > 0 && (
                  <p className="text-green-600 text-sm mt-1">
                    {images.length} image(s) uploaded successfully ✅
                  </p>
                )}
              </div>

              {/* Submit */}
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
                  "Submit Partner Details"
                )}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
