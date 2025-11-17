import React, { useState } from "react";
import Modal from "react-modal";

const cardsData = [
  {
    title: "Gold's Gym",
    description: "Top gym with all modern equipment.",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    location: "Delhi, India",
    rating: 4.5,
  },
  {
    title: "Zen Yoga Studio",
    description: "Relax and stretch with professional yoga sessions.",
    img: "https://images.unsplash.com/photo-1554366754-720d108f25b9",
    location: "Mumbai, India",
    rating: 4.7,
  },
  {
    title: "Core Pilates",
    description: "Strengthen your core with pilates workouts.",
    img: "https://images.unsplash.com/photo-1594737625785-81fa21f0d5ed",
    location: "Bangalore, India",
    rating: 4.3,
  },
];

Modal.setAppElement("#root"); // required for accessibility

const Cards = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const openModal = (card) => {
    setSelectedCard(card);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedCard(null);
    setFormData({ name: "", email: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Booking submitted for:", selectedCard.title, formData);
    alert(`Booking request sent for ${selectedCard.title}!`);
    closeModal();
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        {cardsData.map((card, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-xl overflow-hidden hover:scale-105 transform transition-all duration-300"
          >
            <img
              src={card.img}
              alt={card.title}
              className="h-48 w-full object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-bold mb-1">{card.title}</h2>
              <p className="text-gray-500 text-sm mb-2">{card.location}</p>
              <div className="flex items-center mb-2">
                <span className="text-yellow-400 mr-2">
                  {"★".repeat(Math.floor(card.rating))}
                </span>
                <span className="text-gray-600 text-sm">{card.rating}</span>
              </div>
              <p className="text-gray-600 mb-4">{card.description}</p>
              <button
                onClick={() => openModal(card)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                Book Pass
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedCard && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Booking Form"
          className="bg-white rounded-xl max-w-md mx-auto mt-20 p-6 outline-none shadow-lg"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
        >
          <h2 className="text-2xl font-bold mb-4">Book Pass: {selectedCard.title}</h2>
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
                onClick={closeModal}
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
      )}
    </>
  );
};

export default Cards;
