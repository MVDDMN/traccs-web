import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Analytics.css'

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
        const response = await axios.get(`http://localhost:3001/api/user/${userId}`, { withCredentials: true });
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
          <Link to="analyticssummary"><label className='analytics-navigation-button'>Summary</label></Link>
          <Link to="analyticsreports"><label className='analytics-navigation-button'>Reports Charts</label></Link>
          <Link to="analyticsrequests"><label className='analytics-navigation-button'>Requests Charts</label></Link>
        </div>

      </div>

      <div className='analytics-module-container'>
          <Outlet/>
      </div>

    </div>
  );
};

export default Analytics;
