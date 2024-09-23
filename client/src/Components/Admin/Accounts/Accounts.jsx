import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Accounts.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const Accounts = () => {
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
          navigate("/error");
          return;
        }
        const response = await axios.get(`${apiBaseUrl}/api/user/${userId}`, { withCredentials: true });
        setUserType(response.data.type);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/error");
      }
    };

    fetchUserData();
  }, [navigate]);

  // Check userType after fetching user data
  useEffect(() => {
    // Check if userType is "Barangay" and redirect to "/admin"
    if (userType === "Barangay") {
      navigate('/admin');
    }
  }, [userType, navigate]);

  return (
    <div className="accounts-container">
      <div className='accounts-content'>
        <div className='accounts-navigation-container'>
          <div className='accounts-navigation-content'>
            <Link to="users"><label className='accounts-button' title="View Mobile Users Table">Users</label></Link>
            <Link to="admins"><label className='accounts-button' title="View Administrators Table">Admins</label></Link>
          </div>
        </div>
        <div className='accounts-module-contents'>
          <Outlet/>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
  