import React, { useEffect, useState } from 'react';
import './Profile.css';

const Profile = ({ theme }) => {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  return (
    <div className={`p-container ${theme}`}>
      <div className="p-card">
        <img
          src={userData.imagelink || 'https://via.placeholder.com/150'}
          alt="Profile"
          className="p-image"
        />
        <div className="p-details">
          <div className="p-row">
            <span className="p-label">Profile Name:</span>
            <span className="p-value">{userData.profilename || 'No Profile Name'}</span>
          </div>
          <div className="p-row">
            <span className="p-label">Username:</span>
            <span className="p-value">{userData.username || 'No Username'}</span>
          </div>
          <div className="p-row">
            <span className="p-label">Email:</span>
            <span className="p-value">{userData.email || 'No Email'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
