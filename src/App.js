import { BrowserRouter as Router } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Login from './main/Login';
import Menu from './main/Menu';

export default function App() {

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const userLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';

    setIsUserLoggedIn(userLoggedIn);
  }, []);

  const onUserLogin = () => {
    localStorage.setItem('isUserLoggedIn', 'true');
    setIsUserLoggedIn(true);
  };
  // localStorage.removeItem("selectedContact");

  return (
    <div>
      <Router>
        {isUserLoggedIn ? (
          <Menu/>
        ):(
          <Login 
          onUserLogin={onUserLogin}
          />
        )}
      </Router>
    </div>
  );
}
