import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { Loader2, CheckCircle, XCircle, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all gyms
  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const { data } = await API.get("/admin/gyms");
        setGyms(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this gym?")) return;
    try {
      await API.put(`/admin/gyms/${id}/approve`);
      setGyms((prev) =>
        prev.map((gym) =>
          gym._id === id ? { ...gym, status: "approved", verified: true } : gym
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this gym?")) return;
    try {
      await API.put(`/admin/gyms/${id}/reject`);
      setGyms((prev) =>
        prev.map((gym) =>
          gym._id === id ? { ...gym, status: "rejected", verified: false } : gym
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this gym permanently?")) return;
    try {
      await API.delete(`/admin/gyms/${id}`);
      setGyms((prev) => prev.filter((gym) => gym._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {gyms.length === 0 ? (
        <p className="text-gray-500">No gyms found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gyms.map((gym) => (
            <div
              key={gym._id}
              className="bg-white shadow rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition"
            >
              {/* ✅ Gym Image */}
              {gym.images && gym.images.length > 0 ? (
                <Link to={`/admin/gym/${gym._id}`}>
                  <img
                    src={gym.images[0]}
                    alt={gym.name}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                  />
                </Link>
              ) : (
                <div className="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-600">
                  No Image
                </div>
              )}

              <div className="p-4">
                {/* ✅ Gym Info */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-xl font-semibold">{gym.name}</h2>
                    <p className="text-sm text-gray-500">{gym.city}</p>
                  </div>

                  <Link
                    to={`/admin/gym/${gym._id}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                  >
                    <Eye size={16} className="mr-1" /> View
                  </Link>
                </div>

                <p className="text-gray-700 text-sm mt-2">
                  ₹{gym.price} / Day
                </p>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {gym.description || "No description available."}
                </p>

                {/* ✅ Amenities */}
                {gym.amenities && gym.amenities.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="font-semibold">Amenities:</span>{" "}
                    {gym.amenities.slice(0, 3).join(", ")}{" "}
                    {gym.amenities.length > 3 && "..."}
                  </div>
                )}

                {/* ✅ Status Badge */}
                <div className="mt-3">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      gym.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : gym.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {gym.status || "pending"}
                  </span>
                </div>

                {/* ✅ Action Buttons */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {gym.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(gym._id)}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                  )}
                  {gym.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(gym._id)}
                      className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(gym._id)}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
