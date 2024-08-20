import React, { useState } from "react";
import "./ProfileCard.css";

const ProfileCard = ({ contact, onSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (e) => {
    e.stopPropagation(); // Prevent propagation to parent div
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const getTimeDifference = (lastSeen) => {
    // Check if lastSeen is valid
    if (!lastSeen) return "Unknown"; // Fallback if lastSeen is undefined

    // Split the lastSeen timestamp into date and time
    const [datePart, timePart] = lastSeen.split("T");

    // Validate timePart
    if (!timePart) return "Unknown";

    const now = new Date();
    const lastSeenDate = new Date(`${datePart}T${timePart.split(".")[0]}Z`);

    // Calculate the difference in seconds
    const diffInSeconds = Math.floor((now - lastSeenDate) / 1000);

    if (isNaN(diffInSeconds)) return "Invalid date";

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <div>
      <div className="profile-card" onClick={() => onSelect(contact)}>
        <div
          className="profile-photo-container"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={contact.imagelink || "https://via.placeholder.com/50"}
            alt="Profile"
            onClick={openModal}
          />
          <div
            className={`status-indicator ${
              contact.online ? "online" : "offline"
            }`}
          ></div>
        </div>
        <div className="profile-info">
          <p>{contact.profilename}</p>
          {contact.online ? (
            <span className="online-status">Online</span>
          ) : (
            <span className="offline-status last-seen">
              Last seen: {getTimeDifference(contact.lastSeen)}
            </span>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="profile-photo-modal" onClick={closeModal}>
          <div
            className="profile-photo-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={contact.imagelink || "https://via.placeholder.com/150"}
              alt="Profile"
              className="modal-image"
            />
            <button className="modal-close-button" onClick={closeModal}>
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
