import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Analytics.css'

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const Analytics = () => {
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

  useEffect(() => {
    // Check if userType is "Barangay" and redirect to "/admin"
    if (userType === "Barangay") {
      navigate('/admin');
    }
  }, [userType, navigate]);

  return (
    <div className='analytics-container'>

      <div className='analytics-navigation-container'>

        <div className='analytics-navigation-content'>
          <Link to="analyticsreports"><label className='analytics-navigation-button'>Reports Analysis</label></Link>
          <Link to="analyticsrequests"><label className='analytics-navigation-button'>Requests Analysis</label></Link>
        </div>

      </div>

      <div className='analytics-module-container'>
          <Outlet/>
      </div>

    </div>
  );
};

export default Analytics;
