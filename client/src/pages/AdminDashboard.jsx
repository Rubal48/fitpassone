import React, { useEffect, useState } from "react";
import API from "../utils/api";

import { CheckCircle, Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const res = await API.get("/admin/gyms", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGyms(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, [token]);

  const handleApprove = async (id) => {
    try {
      await API.put(`/admin/gyms/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setGyms((prev) =>
        prev.map((gym) =>
          gym._id === id ? { ...gym, status: "approved", verified: true } : gym
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading gyms...
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4">
        {gyms.map((gym) => (
          <div key={gym._id} className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-xl">{gym.name}</h2>
                <p className="text-gray-500 text-sm">{gym.city}</p>
                <p
                  className={`text-sm mt-1 ${
                    gym.verified ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  Status: {gym.status}
                </p>
              </div>
              {!gym.verified ? (
                <button
                  onClick={() => handleApprove(gym._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Approve
                </button>
              ) : (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-5 h-5" /> Approved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
