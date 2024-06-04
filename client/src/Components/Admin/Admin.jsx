import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from './Navigation/Navigation';
import './Admin.css';
import '../Assets/global-styles.css';
import logout from '../Assets/logout.png';

function Admin({ routes }) {
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userBarangay, setUserBarangay] = useState('');
  const [userType, setUserType] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data using user ID stored in localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
          navigate("/"); // Redirect to login if user ID is not available
          return;
        }
        const response = await axios.get(`http://localhost:3001/user/${userId}`, { withCredentials: true });
        
        // Set user data
        setUserName(response.data.name);
        setUserBarangay(response.data.barangay);
        setUserType(response.data.type);
        setUserUsername(response.data.username);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/"); // Redirect to login on error
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3001/logout", {}, { withCredentials: true });
      localStorage.removeItem('userId'); // Remove user ID from localStorage on logout
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="app-cont">
      <Navigation />

      <div className='app-main-cont'>

        <div className='title-cont'>

          <div className='welcome-bar'>

            <div className='admin-info'>

              <a className='admin-title'>Welcome Admin! |</a>
              <a>Username: <b className='info-text'>{userUsername}</b></a>
              <a>Name: <b className='info-text'>{userName}</b></a>
              <a>Barangay: <b className='info-text'>{userBarangay}</b></a>
              <a>Account: <b className='info-text'>{userType}</b></a>

            </div>

            <div className='logout-admin-box'>

              <button className='logout-button' onClick={() => setShowModal(true)}>

                <img className="logout-img" src={logout} alt="logout" />

              </button>

            </div>

          </div>

        </div>

        <div className="module-cont">

          {routes}

        </div>

        {showModal && (

          <div className="admin-logout-modal">

            <div className="admin-logout-content">

              <div className='logout-message'>
                <p>Log Out of the System?</p>
                <a>
                  You won’t be able to see messages and updates 
                  from the community while you’re log out. 
                  Are you sure?
                </a>
              </div>

              <div className='logout-choice'>
                <button onClick={() => setShowModal(false)} className='logout-choice-button'>Cancel</button>
                <button onClick={handleLogout} className='logout-confirm-button'>Log Out</button>
              </div>

            </div>

          </div>

        )}
      </div>
    </div>
  );
}

export default Admin;
