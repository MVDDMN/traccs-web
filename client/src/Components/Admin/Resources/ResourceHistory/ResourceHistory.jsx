import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ResourceHistory.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ResourceHistory = () => {
    const [history, setHistory] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/resourcehistory`);
                setHistory(response.data);
                setIsLoading(false); // Data is loaded
            } catch (error) {
                console.error("Error fetching resource history:", error);
                setIsLoading(false); // Data is still loaded even if there's an error
            }
        };

        fetchHistory();
        const interval = setInterval(fetchHistory, 5000); // Refresh data every 15 seconds

        return () => clearInterval(interval);
    }, []);

    const handleViewRecord = (record) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRecord(null);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHistory = history.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(history.length / itemsPerPage);

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

    return (
        <div className="history-content-box">
            <div className='history-table-container'>
                <div className='history-table-box'>
                    <div className='history-table-title-box'>
                        <a className='history-table-title-text'>Revoked Donations</a>
                        <a className='donations-table-description'>
                            ⓘ
                            <span className='tooltip-text'>This page contains all the donations revoked by the administrator saved as history while not keeping some private details.</span>
                        </a>
                    </div>
                    {isLoading ? (
                        <div className='loading-message'>Loading history, please wait...</div>
                    ) : (
                        <table className='history-table'>
                            <thead>
                                <tr>
                                    <th>Donations ID</th>
                                    <th>Contact No.</th>
                                    <th>Email</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentHistory.map(record => (
                                    <tr key={record._id}>
                                        <td>{record._id}</td>
                                        <td>{record.contactNumber}</td>
                                        <td>{record.email}</td>
                                        <td>
                                            {new Date(record.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            <button
                                                className='view-history-button'
                                                onClick={() => handleViewRecord(record)}
                                            >
                                                View
                                            </button>
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

            {isModalOpen && selectedRecord && (
                <div className="history-modal">
                    <div className="history-modal-content">
                        <div className='history-modal-content-box'>
                            <div className='close-modal-button-box'>
                                <button onClick={closeModal} className='close-modal-button'>X</button>
                            </div>

                            <div className='history-title-box'>
                                <a className='history-title-box-text'>
                                    Revoked Donation Details
                                </a>

                                <div className='resource-tooltip'>
                                    <label className='resource-tooltip-icon'>ⓘ</label>
                                    <div className='resource-tooltip-box'>
                                        <label className='resource-tooltip-sub-text'>
                                            This section contains all information about the selected donation.
                                            All donations that have been revoked are recorded within the system for reference.
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className='history-details-container'>
                                <div className='history-details-modal-box'>
                                    <div className='history-division-container'>

                                        <div className='history-divider-box'>
                                            <div className='history-text-box'>
                                                <p className='history-title-text'>
                                                    Donations ID:
                                                    <strong className='history-content-text'>{selectedRecord._id}</strong>
                                                </p>
                                            </div>

                                            <div className='history-text-box'>
                                                <p className='history-title-text'>
                                                    Removed By:
                                                    <strong className='history-content-text'>{selectedRecord.admin}</strong>
                                                </p>
                                            </div>

                                            {(selectedRecord.firstName || selectedRecord.lastName) && (
                                                <div className='history-text-box'>
                                                    <p className='history-title-text'>
                                                        Name:
                                                        <strong className='history-content-text'>
                                                            {selectedRecord.firstName} {selectedRecord.lastName}
                                                        </strong>
                                                    </p>
                                                </div>
                                            )}

                                            {selectedRecord.email && (
                                                <div className='history-text-box'>
                                                    <p className='history-title-text'>
                                                        Email:
                                                        <strong className='history-content-text'>{selectedRecord.email}</strong>
                                                    </p>
                                                </div>
                                            )}

                                            {selectedRecord.contactNumber && (
                                                <div className='history-text-box'>
                                                    <p className='history-title-text'>
                                                        Contact Number:
                                                        <strong className='history-content-text'>{selectedRecord.contactNumber}</strong>
                                                    </p>
                                                </div>
                                            )}
                                            {selectedRecord.resourceType && (
                                                <div className='history-text-box'>
                                                    <p className='history-title-text'>
                                                        Resource Type:
                                                        <strong className='history-content-text'>{selectedRecord.resourceType}</strong>
                                                    </p>
                                                </div>
                                            )}

                                            {selectedRecord.amount && (
                                                <div className='history-text-box'>
                                                    <p className='history-title-text'>
                                                        Amount:
                                                        <strong className='history-content-text'>{selectedRecord.amount}</strong>
                                                    </p>
                                                </div>
                                            )}

                                            <div className='history-description-box'>
                                                <p className='history-description-title-text'>Description</p>
                                                <textarea
                                                    className='history-description-area'
                                                    value={selectedRecord.description}
                                                    readOnly
                                                />
                                            </div>

                                        </div>

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

export default ResourceHistory;
