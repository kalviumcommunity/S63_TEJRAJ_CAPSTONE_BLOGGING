// src/components/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const [bgColor, setBgColor] = useState('#a43b2a');

  const getRandomColor = () => {
    const colors = ['#a43b2a', '#8e2d2f', '#b34747', '#aa3939', '#992222'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setBgColor(getRandomColor());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing" style={{ backgroundColor: bgColor }}>
      <h1>Publish your passions, your way</h1>
      <p>Create a unique and beautiful blog easily.</p>
      <button onClick={() => navigate("/login")}>CREATE YOUR BLOG</button>
      <a className="signin" onClick={() => navigate("/login")}>SIGN IN</a>
    </div>
  );
};

export default LandingPage;

