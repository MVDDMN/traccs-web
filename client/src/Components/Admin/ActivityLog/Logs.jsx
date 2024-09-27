import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Logs.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_PROD_API_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [userType, setUserType] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // State for sorting order
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 11;
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
    if (userType === "Barangay") {
      navigate('/admin');
    }
  }, [userType, navigate]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/logs`);
        setLogs(response.data);
        setIsLoading(false); // Data is loaded
      } catch (error) {
        console.error("Error fetching logs:", error);
        setIsLoading(false); // Data is still loaded
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);

    return () => clearInterval(interval);
  }, []);

  // Sorting the logs based on sortOrder state
  const sortedLogs = [...logs].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);

    if (sortOrder === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = sortedLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const openModal = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };

  return (
    <div className='logs-container'>
      <div className='logs-content'>
        <div className="logs-content-box">
          <div className='logs-table-container'>
            <div className='logs-table-box'>

              <div className='logs-top-bar'>

                <div className='logs-table-title-box'>
                  <a className='logs-table-title-text'>Activity Logs</a>
                  <a className='logs-table-description'>
                    ⓘ
                    <span className='tooltip-text'>This page contains all the administrator activity recorded and listed within the system based on their usage and activity.</span>
                  </a>
                </div>
                <div className='sort-filter'>
                  <label>Sort by: </label>
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="newest">Newest to Oldest</option>
                    <option value="oldest">Oldest to Newest</option>
                  </select>
                </div>


              </div>

              {isLoading ? (
                <div className='loading-message'>Loading table, please wait...</div>
              ) : (
                <table className='logs-table'>
                  <thead>
                    <tr>
                      <th>Activity Log ID</th>
                      <th>Username</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLogs.map(log => (
                      <tr key={log._id}>
                        <td>{log._id}</td>
                        <td>{log.username}</td>
                        <td>{log.type}</td>
                        <td>{log.date}</td>
                        <td>{log.time}</td>
                        <td>
                          <div className='action-button-box'>
                            <button className='view-logs-button' onClick={() => openModal(log)}>View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
            <div className='pagination'>
              <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && selectedLog && (
        <div className="logs-modal">
          <div className="logs-modal-content">
            <div className='logs-modal-content-box'>
              <div className='close-modal-button-box'>
                <button onClick={closeModal} className='close-modal-button'>X</button>
              </div>

              <div className='logs-modal-title-box'>
                <a className='logs-modal-title-text'>Log Details</a>

                <div className='logs-modal-tooltip'>
                  <label className='logs-modal-tooltip-icon'>ⓘ</label>
                  <div className='logs-modal-tooltip-box'>
                    <label className='logs-modal-tooltip-sub-text'>
                      This section contains all information about administrator system activity log.
                      You are able to view the necessary information in detail about the action done by the admin in the web systems.
                    </label>
                  </div>
                </div>

              </div>

              <div className='logs-details-container'>
                <div className='logs-details-modal-box'>
                  <div className='logs-text-box'>
                    <a className='logs-title-text'>
                      Log ID:
                      <b className='logs-content-text'>{selectedLog._id}</b>
                    </a>
                  </div>
                  <div className='logs-text-box'>
                    <a className='logs-title-text'>
                      Username:
                      <b className='logs-content-text'>{selectedLog.username}</b>
                    </a>
                  </div>
                  <div className='logs-text-box'>
                    <a className='logs-title-text'>
                      Type:
                      <b className='logs-content-text'>{selectedLog.type}</b>
                    </a>
                    <a className='logs-title-text'>
                      Date:
                      <b className='logs-content-text'>{selectedLog.date}</b>
                    </a>
                    <a className='logs-title-text'>
                      Time:
                      <b className='logs-content-text'>{selectedLog.time}</b>
                    </a>
                  </div>
                  <div className='logs-description-box'>
                    <a className='description-title-text'>Description</a>
                    <textarea className='logs-description-area' value={selectedLog.description} readOnly />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
