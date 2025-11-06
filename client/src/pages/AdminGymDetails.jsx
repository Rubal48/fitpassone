import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import {
  Loader2,
  CheckCircle,
  XCircle,
  MapPin,
  IndianRupee,
  Dumbbell,
  Image,
  Trash2,
} from "lucide-react";

const AdminGymDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const { data } = await API.get(`/admin/gyms/${id}`);
        setGym(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGym();
  }, [id]);

  const handleApprove = async () => {
    if (!window.confirm("Approve this gym?")) return;
    try {
      await API.put(`/admin/gyms/${id}/approve`);
      alert("Gym approved successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Reject this gym?")) return;
    try {
      await API.put(`/admin/gyms/${id}/reject`);
      alert("Gym rejected successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this gym permanently?")) return;
    try {
      await API.delete(`/admin/gyms/${id}`);
      alert("Gym deleted successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-orange-500" />
      </div>
    );
  }

  if (!gym) {
    return <p className="text-center mt-10 text-gray-600">Gym not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* ✅ Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{gym.name}</h1>
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-green-700"
          >
            <CheckCircle size={16} /> Approve
          </button>
          <button
            onClick={handleReject}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-yellow-600"
          >
            <XCircle size={16} /> Reject
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-red-700"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* ✅ Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
        {gym.images && gym.images.length > 0 ? (
          gym.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Gym Image ${i + 1}`}
              className="w-full h-48 object-cover rounded-lg border border-gray-300"
            />
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center bg-gray-200 p-10 text-gray-600 rounded-lg">
            <Image className="w-6 h-6 mr-2" /> No images uploaded
          </div>
        )}
      </div>

      {/* ✅ Basic Info */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <p className="flex items-center text-gray-700">
              <MapPin className="w-5 h-5 mr-2 text-blue-500" />
              {gym.city || "Location not specified"}
            </p>
            <p className="flex items-center text-gray-700 mt-1">
              <IndianRupee className="w-5 h-5 mr-2 text-green-500" />
              {gym.price ? `₹${gym.price} / day` : "Price not available"}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

        {/* ✅ Description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Description</h3>
          <p className="text-gray-700 mt-1 leading-relaxed">
            {gym.description || "No description provided by the gym."}
          </p>
        </div>

        {/* ✅ Amenities */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Amenities</h3>
          {gym.amenities && gym.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {gym.amenities.map((a, i) => (
                <span
                  key={i}
                  className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200"
                >
                  <Dumbbell className="w-4 h-4 mr-1 text-orange-500" /> {a}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No amenities listed.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGymDetails;
