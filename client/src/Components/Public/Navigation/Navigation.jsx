// Navigation.js
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';
import LoginModal from './Screens/LoginModal.jsx'; // Import the LoginModal

const Navigation = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false); // State for modal visibility

  const toggleDrawer = () => {
    setDrawerOpen(prevState => !prevState);
  };

  const closeDrawerOnScroll = () => {
    if (drawerOpen) {
      setDrawerOpen(false);
    }
  };

  const openLoginModal = () => {
    setLoginModalOpen(true); // Open the login modal
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false); // Close the login modal
  };

  useEffect(() => {
    window.addEventListener('scroll', closeDrawerOnScroll);
    return () => {
      window.removeEventListener('scroll', closeDrawerOnScroll);
    };
  }, [drawerOpen]);

  return (
    <div className="public-nav-cont">
      <div className="public-nav-list">
        <div className='public-title-cont'>
          <a>TRACCS</a>
        </div>
        <button className="menu-toggle" onClick={toggleDrawer}>
          ☰
        </button>
        <div className={`public-button-cont ${drawerOpen ? 'open' : ''}`}>
          <div className='public-button-sect1'>
            <NavLink to="/" end className={({ isActive }) => isActive ? "public-active-link" : "public-nav-text"}>Home</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? "public-active-link" : "public-nav-text"}>About Us</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "public-active-link" : "public-nav-text"}>Contact Us</NavLink>
            <NavLink to="/donate" className={({ isActive }) => isActive ? "public-active-link" : "public-nav-text"}>Donate</NavLink>
          </div>

          <div className='public-button-sect2'>
            <NavLink to="/download" className="public-download-btn">Download TRACCS</NavLink>
            <button className="public-login-btn" onClick={openLoginModal}>Login</button> {/* Trigger modal */}
          </div>
        </div>
      </div>

      <div className='public-title-app-cont'>
        <div className='public-title-app'>
          <a>T</a><b>aytay</b>
          <a>R</a><b>esource,</b>
          <a>A</a><b>ssistance and</b>
          <a>C</a><b>ommunity</b>
          <a>C</a><b>oordination</b>
          <a>S</a><b>ystem</b>
        </div>
      </div>

      {/* Render the LoginModal and pass the visibility state */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </div>
  );
};

export default Navigation;
