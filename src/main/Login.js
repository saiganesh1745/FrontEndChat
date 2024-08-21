import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Menu from './Menu';
import ParticlesComponent from './ParticlesComponent';

export default function Login({ onUserLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    profilename: '',
    imagelink: '',
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [showForms, setShowForms] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);
  const introText = 'Weelcome to the Chat Website!\nConnect with friends, share ideas, and have fun.\nOur Love Towards You is ';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(prev => prev + introText[index]);
      index++;
      if (index === introText.length) {
        clearInterval(interval);
        setTypingComplete(true);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e, setData) => {
    const { name, value } = e.target;
    setData(prevData => ({ ...prevData, [name]: value }));

    if (name === 'imagelink') {
      setImagePreview(value);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${config.url}/checkuserlogin`, formData);
      if (response.data != null) {
        onUserLogin();
        localStorage.setItem('user', JSON.stringify(response.data));
        setIsLoggedIn(true);
        setFormData({ email: '', password: '' });
      } else {
        setError('Invalid login credentials');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${config.url}/insertuser`, registerData);
      if (response.status === 200) {
        setRegisterData({
          profilename: '',
          imagelink: '',
          username: '',
          email: '',
          password: ''
        });
        setIsLoginForm(true);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred during registration. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const [imagePreview, setImagePreview] = useState(registerData.imagelink || '');

  if (isLoggedIn) {
    return <Menu />; // Replace with appropriate redirection or component
  }

  return (
    <div style={styles.body}>
      <ParticlesComponent />
      <div style={styles.overlay}>
        {!showForms ? (
          <div style={styles.mainScreen}>
            <div style={styles.introText}>{typedText}</div>
            {typingComplete && (
              <button style={styles.button} onClick={() => setShowForms(true)}>
                Continue
              </button>
            )}
          </div>
        ) : (
          <div style={styles.formContainer}>
            {isLoginForm ? (
              <>
                <h3 align="center">Login</h3>
                {error && <h4 style={styles.error}>{error}</h4>}
                <form style={styles.form} onSubmit={handleLoginSubmit}>
                  <label style={styles.label} htmlFor="email">Email</label>
                  <input
                    style={styles.input}
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleChange(e, setFormData)}
                    required
                    disabled={loading}
                  />
                  <label style={styles.label} htmlFor="password">Password</label>
                  <input
                    style={styles.input}
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleChange(e, setFormData)}
                    required
                    disabled={loading}
                  />
                  <button style={styles.button} type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                  <button style={styles.button} type="button" onClick={() => setIsLoginForm(false)}>
                    Don't have an account? Register here.
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3 align="center">Register</h3>
                {error && <h4 style={styles.error}>{error}</h4>}
                <form style={styles.form} onSubmit={handleRegisterSubmit}>
                  <label style={styles.label} htmlFor="profilename">Profilename</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="profilename"
                    placeholder="Profilename"
                    value={registerData.profilename}
                    onChange={(e) => handleChange(e, setRegisterData)}
                    required
                    disabled={loading}
                  />
                  <label style={styles.label} htmlFor="imagelink">Image(link)</label>
                  <img src={imagePreview} alt="Preview" style={styles.imgPreview} />
                  <input
                    style={styles.input}
                    type="text"
                    name="imagelink"
                    placeholder="Image link"
                    value={registerData.imagelink}
                    onChange={(e) => handleChange(e, setRegisterData)}
                    required
                    disabled={loading}
                  />
                  <label style={styles.label} htmlFor="username">Username</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={registerData.username}
                    onChange={(e) => handleChange(e, setRegisterData)}
                    required
                    disabled={loading}
                  />
                  <label style={styles.label} htmlFor="email">Email</label>
                  <input
                    style={styles.input}
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={registerData.email}
                    onChange={(e) => handleChange(e, setRegisterData)}
                    required
                    disabled={loading}
                  />
                  <label style={styles.label} htmlFor="password">Password</label>
                  <input
                    style={styles.input}
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={registerData.password}
                    onChange={(e) => handleChange(e, setRegisterData)}
                    required
                    disabled={loading}
                    pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
                    title="Password must be at least 8 characters long and include at least one letter and one number"
                  />
                  <button style={styles.button} type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                  </button>
                  <button style={styles.button} type="button" onClick={() => setIsLoginForm(true)}>
                    Login
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  body: {
    margin: 0,
    padding: 0,
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  overlay: {
    zIndex: 1,
    position: 'relative',
  },
  mainScreen: {
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(32, 30, 30, 0.1)',
    maxWidth: '400px',
    width: '100%',
    transition: 'box-shadow 0.3s ease',
    marginBottom: '20px',
    zIndex: 1,
  },
  formContainer: {
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(32, 30, 30, 0.1)',
    maxWidth: '400px',
    width: '100%',
    transition: 'box-shadow 0.3s ease',
  },
  introText: {
    marginBottom: '20px',
    fontSize: '24px',
    whiteSpace: 'pre-wrap',
  },
  button: {
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#008000',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    textAlign: 'left',
  },
  input: {
    marginBottom: '10px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  imgPreview: {
    marginBottom: '10px',
    maxWidth: '100px',
    maxHeight: '100px',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
};
