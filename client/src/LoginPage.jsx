// src/pages/LoginPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../src/style/LoginPage.css'; // import your new css

const LoginPage = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      console.log("User Info:");
      navigate('/app');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Login to Start Blogging</h2>
        <button className="google-btn" onClick={handleGoogleLogin}>
          <img src="https://img.icons8.com/color/48/google-logo.png" alt="Google" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
