import React, { useEffect, useState, useCallback } from "react";
import io from 'socket.io-client';
import "./Menu.css";
import ChatArea from "./ChatArea";
import ProfileCard from "./ProfileCard";
import axios from "axios";
import config from "../config";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Profile from "./Profile";
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import '@fortawesome/fontawesome-free/css/all.min.css';
import LogoutIcon from '@mui/icons-material/Logout';
import UpdateUserData from "./UpdateUserData";
import ContactDetailsForm from "./ContactDetailsForm";

const socket = io(`${config.url}`); // Replace with your server URL

const Menu = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContacts, setShowContacts] = useState(true);
  const [theme, setTheme] = useState("light-theme");
  const [userData, setUserData] = useState({});
  const [showUpdate, setShowUpdate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredContact, setHoveredContact] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);

  const handleContactNameClick = () => {
    setShowDetailsForm(true);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.body.classList.toggle("dark", storedTheme === "dark-theme");
    }
  }, []);

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
      socket.emit('identify', parsedUserData.username);
      socket.emit('newUser', parsedUserData.username);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url;
      if (searchTerm) {
        url = `${config.url}/searchuser/${searchTerm}`;
      } else {
        url = `${config.url}/connections/${userData.username}`;
      }
      const response = await axios.get(url);
      if (response.data === "No User found") {
        setContacts([]);
        setError("No user found");
      } else {
        const fetchedContacts = response.data;
        setContacts(fetchedContacts);
        localStorage.setItem("contacts", JSON.stringify(fetchedContacts));
      }
    } catch (err) {
      setError("Error fetching contacts");
    }
    setLoading(false);
  }, [searchTerm, userData.username]);

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 60000);
    return () => clearInterval(interval);
  }, [fetchContacts]);

  useEffect(() => {
    if (selectedContact) {
      localStorage.setItem("selectedContact", JSON.stringify(selectedContact));
    }
  }, [selectedContact]);

  useEffect(() => {
    socket.on("activeUsers", (users) => {
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          users.includes(contact.username)
            ? { ...contact, online: true }
            : { ...contact, online: false }
        )
      );
    });

    return () => {
      socket.off("activeUsers");
    };
  }, []);

  useEffect(() => {
    const fetchUserStatuses = async () => {
      try {
        const response = await axios.get(`${config.url}/users/status`);
        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            response.data.includes(contact.username)
              ? { ...contact, online: true }
              : { ...contact, online: false }
          )
        );
      } catch (error) {
        console.error("Error fetching user statuses", error);
      }
    };

    fetchUserStatuses();
  }, []);

  const handleSelectContact = (contact) => {
    const filteredContact = {
      username: contact.username,
      profilename: contact.profilename,
      imagelink: contact.imagelink,
      online: contact.online,
      bio: contact.bio,
      email: contact.email,
      _id: contact._id,
    };
    setSelectedContact(filteredContact);
    setShowContacts(false);
    setShowProfile(false);
    setShowUpdate(false);
    setShowDetailsForm(false); // Ensure details form is hidden when selecting contact
  };

  const handleBackButtonClick = () => {
    setSelectedContact(null);
    setShowContacts(true);
    setShowProfile(false);
    setShowUpdate(false); // Ensure this is set to false to hide update form
  };

  const toggleTheme = () => {
    const newTheme = theme === "light-theme" ? "dark-theme" : "light-theme";
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.classList.toggle("dark", newTheme === "dark-theme");
  };

  const handleLogout = () => {
    localStorage.removeItem("isUserLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedContact");
    localStorage.removeItem("contacts");
    socket.disconnect();
    window.location.reload();
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setShowUpdate(false); // Reset showUpdate when showing the profile
    setSelectedContact(null); // Deselect any selected contact
  };

  const handleUpdateClick = () => {
    setShowUpdate(true);
    setShowProfile(false); // Reset showProfile when showing the update form
  };

  const isMobile = window.innerWidth <= 575.98;

  const sortedContacts = contacts.sort((a, b) => b.online - a.online);

  return (
    <div className={`menu-container ${theme}`}>
      <div
        className="menu-left"
        style={{ display: isMobile && !showContacts ? "none" : "flex" }}
      >
        <div className="menu-header-r">
          <div className="menu-avatar" onClick={handleProfileClick}>
            <img
              src={userData.imagelink || "https://via.placeholder.com/50"}
              alt="Avatar"
            />
          </div>
          <div className="menu-title">
            <h1>Let's Chat</h1>
          </div>
          <div>
            <input type="checkbox" className="checkbox" id="checkbox" checked={theme === "dark-theme"} onChange={toggleTheme} />
            <label htmlFor="checkbox" className="checkbox-label">
              <i className="fas fa-sun"></i>
              <i className="fas fa-moon"></i>
              <span className="ball"></span>
            </label>
          </div>
        </div>
        <input
          type="text"
          className="search-bar"
          placeholder="Search contacts"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setContacts([]);
          }}
        />
        {loading && <p>Loading...</p>}
        {!loading && error && <p>{error}</p>}
        {!loading && !error && contacts.length === 0 && <p>No users found</p>}
        {!loading && !error && sortedContacts.length > 0 && (
          <div className="contact-list">
            {sortedContacts.map((contact) => (
              <div key={contact._id} className="contact-item">
                <ProfileCard
                  contact={contact}
                  onSelect={handleSelectContact}
                  onMouseEnter={() => setHoveredContact(contact)}
                  onMouseLeave={() => setHoveredContact(null)}
                />
              </div>
            ))}
          </div>
        )}
        <div className="menu-footer">
          <div className="footer-section">
            <div className="icon-container" onClick={handleProfileClick}>
              <AccountCircleIcon className="account-icon" />
            </div>
          </div>
          <div className="footer-section">
            <div className="icon-container" onClick={handleUpdateClick}>
              <ModeEditIcon className="account-icon" />
            </div>
          </div>
          <div className="footer-section">
            <div className="logout-button" onClick={handleLogout}>
              <LogoutIcon className="account-icon" />
            </div>
          </div>
        </div>
      </div>
      <div
        className="menu-right"
        style={{ display: isMobile && showContacts ? "none" : "flex" }}
      >
        <div className="menu-header">
          <div className={`back-button ${theme}`} onClick={handleBackButtonClick}>
            <ArrowBackIcon />
          </div>
          {selectedContact && (
            <div className="chat-header" onClick={handleContactNameClick}>
              <img
                src={selectedContact.imagelink || "https://via.placeholder.com/50"}
                alt="Avatar"
              />
              <h2>{selectedContact.profilename}</h2>
            </div>
          )}
        </div>
        {showUpdate ? (
          <UpdateUserData />
        ) : showProfile ? (
          <Profile theme={theme} />
        ) : showDetailsForm ? (
          <ContactDetailsForm contact={selectedContact} onClose={() => setShowDetailsForm(false)} />
        ) : (
          <ChatArea selectedContact={selectedContact} />
        )}
      </div>
      {hoveredContact && (
        <div className="hovered-contact-info">
          <h3>{hoveredContact.username}</h3>
          <p>{hoveredContact.profilename}</p>
          <img
            src={hoveredContact.imagelink || "https://via.placeholder.com/50"}
            alt="Avatar"
          />
        </div>
      )}
    </div>
  );
};

export default Menu;
