import React, { useEffect, useState } from "react";
import API from "../utils/api";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  ShieldCheck,
  IndianRupee,
  Dumbbell,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  // ✅ Unified verification (Approve / Reject)
  const handleVerification = async (id, status) => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          status === "approved" ? "approve ✅" : "reject ❌"
        } this gym?`
      )
    )
      return;

    try {
      await API.put(`/admin/gyms/${id}/verify`, {
        status,
        verified: status === "approved",
      });

      setGyms((prev) =>
        prev.map((gym) =>
          gym._id === id
            ? { ...gym, status, verified: status === "approved" }
            : gym
        )
      );
    } catch (error) {
      console.error(error);
      alert("Error updating status");
    }
  };

  // ✅ Delete gym
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this gym permanently?")) return;
    try {
      await API.delete(`/admin/gyms/${id}`);
      setGyms((prev) => prev.filter((gym) => gym._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Filter gyms based on status
  const filteredGyms = gyms.filter((gym) =>
    filter === "all" ? true : gym.status === filter
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Admin Dashboard
        </h1>

        {/* Status Filters */}
        <div className="flex gap-3 flex-wrap">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                filter === status
                  ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Gym Cards */}
      {filteredGyms.length === 0 ? (
        <p className="text-gray-500">No gyms found for this filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGyms.map((gym) => (
            <div
              key={gym._id}
              className="bg-white shadow rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition"
            >
              {/* Gym Image */}
              {gym.images && gym.images.length > 0 ? (
                <Link to={`/admin/gym/${gym._id}`}>
                  <img
                    src={gym.images[0]}
                    alt={gym.name}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                  />
                </Link>
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}

              {/* Gym Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      {gym.name}
                      {gym.verified && (
                        <ShieldCheck
                          size={18}
                          className="text-green-500"
                          title="Verified by Passiify"
                        />
                      )}
                    </h2>
                    <p className="text-sm text-gray-500">{gym.city}</p>
                  </div>

                  <Link
                    to={`/admin/gym/${gym._id}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                  >
                    <Eye size={16} className="mr-1" /> View
                  </Link>
                </div>

                {/* ✅ Base Price */}
                <p className="flex items-center text-gray-700 text-sm mt-1">
                  <IndianRupee
                    className="w-4 h-4 text-green-600 mr-1"
                    size={16}
                  />
                  {gym.price ? `₹${gym.price} / day` : "—"}
                </p>

                {/* ✅ Custom Prices / Passes Preview */}
                {(gym.customPrice && Object.keys(gym.customPrice).length > 0) ||
                (gym.passes && gym.passes.length > 0) ? (
                  <div className="mt-3 bg-gray-50 p-2 rounded-lg border text-xs text-gray-700">
                    <span className="font-semibold text-blue-600 block mb-1">
                      Pricing:
                    </span>

                    {/* Custom Prices */}
                    {gym.customPrice &&
                      Object.entries(gym.customPrice).map(([days, price]) => (
                        <p key={days}>
                          {days} Days:{" "}
                          <span className="font-semibold text-green-700">
                            ₹{price}
                          </span>
                        </p>
                      ))}

                    {/* Passes */}
                    {gym.passes &&
                      gym.passes.map((p, i) => (
                        <p key={i}>
                          {p.duration} Days:{" "}
                          <span className="font-semibold text-orange-600">
                            ₹{p.price}
                          </span>
                        </p>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">
                    No custom prices added
                  </p>
                )}

                {/* Description */}
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {gym.description || "No description available."}
                </p>

                {/* Facilities */}
                {gym.facilities && gym.facilities.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="font-semibold">Facilities:</span>{" "}
                    {gym.facilities.slice(0, 3).join(", ")}{" "}
                    {gym.facilities.length > 3 && "..."}
                  </div>
                )}

                {/* Status Badge */}
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

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {gym.status !== "approved" && (
                    <button
                      onClick={() => handleVerification(gym._id, "approved")}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                  )}
                  {gym.status !== "rejected" && (
                    <button
                      onClick={() => handleVerification(gym._id, "rejected")}
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
