import React from "react";
import "./ContactDetailsForm.css";

const ContactDetailsForm = ({ contact, onClose }) => {
  if (!contact) return null;

  const isDarkTheme = document.body.classList.contains('dark-theme');

  return (
    <div className={`contact-details-form ${isDarkTheme ? 'dark-theme' : ''}`}>
      <div className="contact-details-overlay" onClick={onClose}></div>
      <div className={`contact-details-content ${isDarkTheme ? 'dark-theme' : ''}`}>
        <button className="close-button" onClick={onClose}>X</button>
        <img
          src={contact.imagelink || "https://via.placeholder.com/150"}
          alt="Avatar"
          className="contact-image"
        />
        <h2 className="contact-name">{contact.profilename}</h2>
        <p className="contact-bio">Bio : {contact.bio}</p>
        <p className="contact-username">Username: {contact.username}</p>
        <p className="contact-email">Email: {contact.email}</p>
        <p className="contact-id">User ID: {contact._id}</p>
      </div>
    </div>
  );
};

export default ContactDetailsForm;
