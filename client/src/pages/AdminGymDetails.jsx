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
  FileText,
  Video,
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

  const handleVerification = async (status) => {
    if (!window.confirm(`Are you sure you want to mark this gym as ${status}?`))
      return;

    try {
      await API.put(`/admin/gyms/${id}/verify`, {
        status,
        verified: status === "approved",
      });
      alert(`Gym ${status === "approved" ? "verified ✅" : "rejected ❌"} successfully!`);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error updating verification status.");
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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-orange-500" />
      </div>
    );

  if (!gym)
    return <p className="text-center mt-10 text-gray-600">Gym not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* ✅ Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{gym.name}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleVerification("approved")}
            className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-green-700"
          >
            <CheckCircle size={16} /> Verify
          </button>
          <button
            onClick={() => handleVerification("rejected")}
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

      {/* ✅ Image Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
        {gym.images && gym.images.length > 0 ? (
          gym.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Gym Image ${i + 1}`}
              className="w-full h-48 object-cover rounded-lg border border-gray-300 hover:scale-[1.02] transition-transform"
            />
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center bg-gray-200 p-10 text-gray-600 rounded-lg">
            <Image className="w-6 h-6 mr-2" /> No images uploaded
          </div>
        )}
      </div>

      {/* ✅ Info Card */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
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

        {/* ✅ Custom Prices */}
        {gym.customPrice && Object.keys(gym.customPrice).length > 0 && (
          <div className="mt-4 bg-blue-50 p-3 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">
              💰 Custom Prices
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(gym.customPrice).map(([days, price]) => (
                <p
                  key={days}
                  className="text-gray-800 bg-white rounded-md border border-gray-200 px-3 py-2 shadow-sm"
                >
                  <span className="font-semibold text-blue-600">
                    {days}-Day Pass:
                  </span>{" "}
                  ₹{price}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Passes */}
        {gym.passes && gym.passes.length > 0 && (
          <div className="mt-4 bg-orange-50 p-3 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-700 mb-2">
              🎟️ Passes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {gym.passes.map((p, i) => (
                <p
                  key={i}
                  className="text-gray-800 bg-white rounded-md border border-gray-200 px-3 py-2 shadow-sm"
                >
                  <span className="font-semibold text-orange-600">
                    {p.duration}-Day Pass:
                  </span>{" "}
                  ₹{p.price}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Description */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800">Description</h3>
          <p className="text-gray-700 mt-1 leading-relaxed">
            {gym.description || "No description provided."}
          </p>
        </div>

        {/* ✅ Facilities */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Facilities
          </h3>
          {gym.facilities && gym.facilities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {gym.facilities.map((a, i) => (
                <span
                  key={i}
                  className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200"
                >
                  <Dumbbell className="w-4 h-4 mr-1 text-orange-500" /> {a}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No facilities listed.</p>
          )}
        </div>

        {/* ✅ Contact Info */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Contact Info
          </h3>
          <p className="text-gray-700">📞 {gym.phone || "No phone provided"}</p>
          {gym.website && (
            <p className="text-blue-600 underline">
              🌐{" "}
              <a href={gym.website} target="_blank" rel="noreferrer">
                {gym.website}
              </a>
            </p>
          )}
          {gym.instagram && (
            <p className="text-pink-600 underline">
              📸{" "}
              <a href={gym.instagram} target="_blank" rel="noreferrer">
                {gym.instagram}
              </a>
            </p>
          )}
        </div>
      </div>

      {/* ✅ Verification Documents */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Verification Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border p-3 rounded-lg">
            <p className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" /> Business Proof
            </p>
            {gym.businessProof ? (
              <a
                href={gym.businessProof}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline text-sm"
              >
                View Document
              </a>
            ) : (
              <p className="text-gray-500 text-sm">Not uploaded</p>
            )}
          </div>

          <div className="border p-3 rounded-lg">
            <p className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" /> Owner ID Proof
            </p>
            {gym.ownerIdProof ? (
              <a
                href={gym.ownerIdProof}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline text-sm"
              >
                View Document
              </a>
            ) : (
              <p className="text-gray-500 text-sm">Not uploaded</p>
            )}
          </div>

          <div className="border p-3 rounded-lg">
            <p className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
              <Video className="w-4 h-4 text-orange-500" /> Intro Video
            </p>
            {gym.video ? (
              <video
                src={gym.video}
                controls
                className="w-full rounded-lg border border-gray-300"
              />
            ) : (
              <p className="text-gray-500 text-sm">Not uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGymDetails;
