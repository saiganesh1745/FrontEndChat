import axios from "axios";
import React, { useState, useEffect } from "react";
import config from "./../config";
import './UpdateUserData.css';

export default function UpdateUserData({ theme }) {
  const [error, setError] = useState("");
  const [initialUserData, setInitialUserData] = useState({});
  const [userData, setUserData] = useState({
    userid: "",
    profilename: "",
    imagelink: "",
    bio: "",
  });

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
      setInitialUserData(parsedUserData);
    }
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = { userid: userData.userid };
      for (const key in userData) {
        if (userData[key] !== initialUserData[key]) {
          updatedData[key] = userData[key];
        }
      }
      if (Object.keys(updatedData).length > 1) {
        const response = await axios.put(
          `${config.url}/updateuserdata`,
          updatedData
        );
        if (response.status === 200) {
          localStorage.setItem("user", JSON.stringify({ ...initialUserData, ...updatedData }));
          alert("User data updated successfully");
        }
      }
    } catch (error) {
      setError(error.response?.data || "An error occurred");
    }
  };

  return (
    <div className={`p-container ${theme}`}>
      <div className="p-card">
        <form onSubmit={handleSubmit}>
          <div>
            <img
              src={userData.imagelink || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="p-image"
            />
            <label>Profile Name:</label>
            <input
              type="text"
              name="profilename"
              value={userData.profilename}
              onChange={handleChange}
              placeholder="Enter Profile Name"
              required
            />
          </div>

          <div>
            <label>Image Link:</label>
            <input
              type="text"
              name="imagelink"
              value={userData.imagelink}
              onChange={handleChange}
              placeholder="Enter Image Link"
              required
            />
          </div>

          <div>
            <label>Bio:</label>
            <textarea
              name="bio"
              value={userData.bio}
              onChange={handleChange}
              placeholder="Enter Bio"
              required
            />
          </div>

          <button type="submit">Submit</button>

          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}
