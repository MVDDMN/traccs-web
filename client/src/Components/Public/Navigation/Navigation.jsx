import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(prevState => !prevState);
  };

  const closeDrawerOnScroll = () => {
    if (drawerOpen) {
      setDrawerOpen(false);
    }
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
            <NavLink to="/login" className="public-login-btn">Login</NavLink>
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
    </div>
  );
}

export default Navigation;
