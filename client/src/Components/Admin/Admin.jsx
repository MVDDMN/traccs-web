import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from './Navigation/Navigation';
import './Admin.css';
import '../Assets/global-styles.css';
import logout from '../Assets/logout.png';
import notify from '../Assets/notification.png';

// Notification sound
import notificationSound from '../Assets/notification.mp3';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

function Admin({ routes }) {
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userBarangay, setUserBarangay] = useState('');
  const [userType, setUserType] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let previousReports = [];

    const fetchUserData = async () => {
      try {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
          navigate("/error");
          return;
        }
        const response = await axios.get(`${apiBaseUrl}/api/user/${userId}`, { withCredentials: true });
        setUserName(response.data.name);
        setUserBarangay(response.data.barangay);
        setUserType(response.data.type);
        setUserUsername(response.data.username);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/error");
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/reports`);
        const newReports = response.data;

        // Check if there's a new report
        if (previousReports.length > 0 && newReports.length > previousReports.length) {
          const latestReport = newReports[newReports.length - 1];

          // Construct the custom message for the report notification
          const newReportNotificationMessage = `New report received from ${latestReport.name} and is Type: ${latestReport.type}`;

          // Send the notification message to the backend
          await axios.post(`${apiBaseUrl}/api/notifications`, {
            message: newReportNotificationMessage,
          });

          // Fetch notifications to update the state
          const notificationsResponse = await axios.get(`${apiBaseUrl}/api/notifications`);
          setNotifications(notificationsResponse.data);

          // Play notification sound
          const audio = new Audio(notificationSound);
          audio.play();
        }

        previousReports = newReports;
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Fetch user data immediately
    fetchUserData();
    fetchNotifications();

    // Set up intervals
    const userDataInterval = setInterval(fetchUserData, 10000); // 10 seconds
    const notificationsInterval = setInterval(fetchNotifications, 1000); // 1 second

    // Cleanup intervals when the component unmounts
    return () => {
      clearInterval(userDataInterval);
      clearInterval(notificationsInterval);
    };
  }, [navigate]);

  const resetUserState = () => {
    setUserBarangay('');
    setUserUsername('');
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${apiBaseUrl}/api/logout`, {}, { withCredentials: true });
      sessionStorage.removeItem('userId');
      resetUserState();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await axios.delete(`${apiBaseUrl}/api/notifications`);
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  return (
    <div className="app-cont">
      <Navigation userType={userType} />

      <div className='app-main-cont'>
        <div className='title-cont'>
          <div className='welcome-bar'>
            <div className='admin-info'>
              <button className='notification-button' onClick={() => setShowNotifications(!showNotifications)}>
                <img className="notification-img" src={notify} alt="notify" />
                {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
                {showNotifications && (
                  <div className="notifications-dropdown">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">No notifications</div>
                    ) : (
                      notifications.map((notification, index) => (
                        <div key={index} className="notification-item">
                          {notification.message}
                        </div>
                      ))
                    )}
                    <button className="clear-notifications-button" onClick={handleClearNotifications}>Clear</button>
                  </div>
                )}
              </button>
              <a className='admin-title'>Welcome {userUsername}! |</a>
              <a>Account: <b className='info-text'>{userBarangay}</b></a>
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
                  from the community while you’re logged out.
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
