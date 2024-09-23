import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './RequestArchive.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const RequestArchive = () => {
    const [requestarchives, setRequestArchives] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 9;

    useEffect(() => {
        const fetchRequestArchives = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/requestarchives`);
                const archivesWithDataTime = response.data.map(item => ({
                    ...item,
                    date_time: item.date_time // Assuming your API response includes date_time
                }));
                setRequestArchives(archivesWithDataTime);
                setIsLoading(false); // Data is loaded
            } catch (error) {
                console.error("Error fetching request archives:", error);
                setIsLoading(false); // Data is still loaded
            }
        };

        fetchRequestArchives();
        const interval = setInterval(fetchRequestArchives, 5000);

        return () => clearInterval(interval);
    }, []);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRequestArchives = requestarchives.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(requestarchives.length / itemsPerPage);

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

    const openModal = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedRequest(null);
        setIsModalOpen(false);
    };

    return (
        <div className="requestarchives-content-box">

            <div className='requestarchives-table-container'>
                <div className='requestarchives-table-box'>
                    <div className='requestarchives-table-title-box'>
                        <a className='requestarchives-table-title-text'>Requests History</a>
                        <a className='requestarchives-table-description'>
                            ⓘ
                            <span className='tooltip-text'>This page displays the history of barangay requests along with their details.</span>
                        </a>
                    </div>

                    {isLoading ? (
                        <div className='loading-message'>Loading table, please wait...</div>
                    ) : (
                        <table className='requestarchives-table'>
                            <thead>
                                <tr>
                                    <th>Requests ID</th>
                                    <th>Requestor</th>
                                    <th>Barangay</th>
                                    <th>Item Name</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Responder</th>
                                    <th>Date & Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRequestArchives.map(requestarchive => (
                                    <tr key={requestarchive._id}>
                                        <td>{requestarchive._id}</td>
                                        <td>{requestarchive.username}</td>
                                        <td>{requestarchive.barangay}</td>
                                        <td>{requestarchive.itemname}</td>
                                        <td>{requestarchive.type}</td>
                                        <td>{requestarchive.quantity}</td>
                                        <td>{requestarchive.responder}</td>
                                        <td>{requestarchive.date_time ? new Date(requestarchive.date_time).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}</td>
                                        <td>
                                            <div className='action-button-box'>
                                                <button className='requestarchives-view-requests-button' onClick={() => openModal(requestarchive)}>View</button>
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

            {isModalOpen && selectedRequest && (
                <div className="requestarchive-modal">
                    <div className="requestarchive-modal-content">
                        <div className='requestarchive-modal-content-box'>
                            <div className='close-modal-button-box'>
                                <button onClick={closeModal} className='close-modal-button'>X</button>
                            </div>

                            <div className='requestarchive-title-box'>
                                <h2>Request Details</h2>
                            </div>

                            <div className='requestarchive-details-container'>
                                <div className='requestarchive-details-modal-box'>
                                    <div className='requestarchive-text-box'>
                                        <a className='requestarchive-title-text'>
                                            Request ID:
                                            <b className='requestarchive-content-text'>{selectedRequest._id}</b>
                                        </a>
                                    </div>
                                    <div className='requestarchive-text-box'>
                                        <a className='requestarchive-title-text'>
                                            Requestor:
                                            <b className='requestarchive-content-text'>{selectedRequest.username}</b>
                                        </a>
                                        <a className='requestarchive-title-text'>
                                            Responder:
                                            <b className='requestarchive-content-text'>{selectedRequest.responder}</b>
                                        </a>
                                    </div>
                                    <div className='requestarchive-text-box'>
                                        <a className='requestarchive-title-text'>
                                            Barangay:
                                            <b className='requestarchive-content-text'>{selectedRequest.barangay}</b>
                                        </a>
                                    </div>
                                    <div className='requestarchive-text-box'>
                                        <a className='requestarchive-title-text'>
                                            Item Name:
                                            <b className='requestarchive-content-text'>{selectedRequest.itemname}</b>
                                        </a>
                                        <a className='requestarchive-title-text'>
                                            Type:
                                            <b className='requestarchive-content-text'>{selectedRequest.type}</b>
                                        </a>
                                    </div>
                                    <div className='requestarchive-text-box'>
                                        <a className='requestarchive-title-text'>
                                            Quantity:
                                            <b className='requestarchive-content-text'>{selectedRequest.quantity}</b>
                                        </a>
                                    </div>
                                    <div className='requestarchive-text-box'>
                                        <a className='requestarchive-title-text'>
                                            Date & Time:
                                            <b className='requestarchive-content-text'>{selectedRequest.date_time ? new Date(selectedRequest.date_time).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}</b>
                                        </a>
                                    </div>
                                    <div className='requestarchive-description-box'>
                                        <a className='description-title-text'>Description</a>
                                        <textarea className='requestarchive-description-area' value={selectedRequest.description} readOnly />
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

export default RequestArchive;
