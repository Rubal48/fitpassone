import React, { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Accessibility requirement

const BookingModal = ({ isOpen, onRequestClose, gymName }) => {
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Booking request sent for ${gymName}!\nName: ${formData.name}\nEmail: ${formData.email}`);
    setFormData({ name: "", email: "" });
    onRequestClose(); // Close modal
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="bg-white rounded-xl max-w-md mx-auto mt-24 p-6 outline-none shadow-xl"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Book Pass: {gymName}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="border px-4 py-2 rounded-lg"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          className="border px-4 py-2 rounded-lg"
          required
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onRequestClose}
            className="px-4 py-2 rounded-lg border border-gray-400 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BookingModal;
