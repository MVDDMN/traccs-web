import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <div className="public-nav-cont">

      <div className="public-nav-list">

        <div className='public-title-cont'>
          <a>TRACCS</a>
        </div>

        <div className='public-button-cont'>

          <div className='public-button-sect1'>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/donate">Donate</Link>
          </div>

          <div className='public-button-sect2'>
            <Link to="/download" className='public-download-btn'>Download TRACCS</Link>
            <Link to="/login" className='public-login-btn'>Login</Link>
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
