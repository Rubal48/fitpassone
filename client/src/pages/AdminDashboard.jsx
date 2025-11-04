import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { ShieldCheck, Loader2, Check } from "lucide-react";

export default function AdminDashboard() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const { data } = await API.get("/gyms");
        setGyms(data);
      } catch (error) {
        console.error("Error fetching gyms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, []);

  const handleVerify = async (gymId) => {
    try {
      await API.put(`/admin/verify/${gymId}`);
      setGyms((prev) =>
        prev.map((g) => (g._id === gymId ? { ...g, verified: true } : g))
      );
      alert("✅ Gym verified successfully!");
    } catch (error) {
      console.error("Error verifying gym:", error);
      alert("❌ Verification failed.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading gyms...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-blue-700 mb-8 text-center">
        Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {gyms.map((gym) => (
          <div
            key={gym._id}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">
              {gym.name}
            </h2>
            <p className="text-gray-500 mb-3">{gym.city}</p>
            <p className="text-gray-600 mb-4">{gym.description}</p>

            {gym.verified ? (
              <p className="text-green-600 flex items-center gap-2 font-semibold">
                <ShieldCheck className="w-5 h-5" /> Verified
              </p>
            ) : (
              <button
                onClick={() => handleVerify(gym._id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Verify Gym
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
