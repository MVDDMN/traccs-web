import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Barangay.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const Barangay = () => {
    const [userUsername, setUserUsername] = useState('');
    const [userBarangay, setUserBarangay] = useState('');
    const [requests, setRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedBarangay, setSelectedBarangay] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('newest'); // New sorting state
    const itemsPerPage = 9;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = sessionStorage.getItem('userId');
                if (!userId) {
                    console.error("User ID not found in session storage");
                    return;
                }
                const response = await axios.get(`${apiBaseUrl}/api/user/${userId}`, { withCredentials: true });
                setUserUsername(response.data.username);
                setUserBarangay(response.data.barangay);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        const fetchRequests = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/requests`);
                setRequests(response.data);
                setIsLoading(false); // Data is loaded
            } catch (error) {
                console.error("Error fetching requests:", error);
                setIsLoading(false); // Data is still loaded
            }
        };

        fetchUserData();
        fetchRequests();
        const interval = setInterval(fetchRequests, 5000);

        return () => clearInterval(interval);
    }, []);

    // Sorting function
    const sortRequests = (requests, order) => {
        return requests.slice().sort((a, b) => {
            const dateA = new Date(a.date_time);
            const dateB = new Date(b.date_time);

            if (order === 'newest') {
                return dateB - dateA; // Newest first
            } else if (order === 'oldest') {
                return dateA - dateB; // Oldest first
            }
            return 0;
        });
    };

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const filteredRequests = selectedBarangay === 'All'
        ? requests
        : requests.filter(request => request.barangay === selectedBarangay);

    const sortedRequests = sortRequests(filteredRequests, sortOrder); // Apply sorting
    const currentRequests = sortedRequests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);

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

    const openModal = (requestId) => {
        const selectedRequest = requests.find(request => request._id === requestId);
        setSelectedRequest(selectedRequest);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const barangayOptions = ['All', 'MDRRMO', 'Dolores', 'Muzon', 'San Juan', 'San Isidro', 'Santa Ana'];

    const handleBarangayChange = (event) => {
        setSelectedBarangay(event.target.value);
    };

    const handleSortChange = (event) => {
        setSortOrder(event.target.value);
    };

    const logAdminAction = async (action, adminData, description) => {
        const logEntry = {
            username: userUsername,
            action,
            adminData,
            type: 'Requests Module',
            description,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        };

        try {
            await axios.post(`${apiBaseUrl}/api/logs`, logEntry);
        } catch (error) {
            console.error("Error logging admin action:", error);
        }
    };

    const handleRespond = async () => {
        try {
            if (!selectedRequest) {
                console.error("No request selected");
                return;
            }

            const response = await axios.post(`${apiBaseUrl}/api/respond`, {
                requestId: selectedRequest._id,
                responder: userBarangay
            });

            // Sending notification to the admin
            await axios.post(`${apiBaseUrl}/api/notifications`, {
                message: `${userBarangay} has responded to request of ${selectedRequest.barangay} for ${selectedRequest.type}`
            });

            console.log(response.data);

            await logAdminAction('Respond', { requestId: selectedRequest._id, responder: userBarangay }, 'Responded to request');
            closeModal();
        } catch (error) {
            console.error("Error responding to request:", error);
        }
    };

    return (
        <div className="barangay-content-box">
            <div className='barangay-table-container'>
                <div className='barangay-table-box'>
                    <div className='barangay-table-title-container'>
                        <div className='barangay-table-title-box'>
                            <a className='barangay-table-title-text'>Barangay Requests</a>
                            <a className='barangay-table-description'>
                                ⓘ
                                <span className='tooltip-text'>This page displays barangay requests. You can view details and respond to each request.</span>
                            </a>
                        </div>

                        <div className='barangay-filter-container'>
                            <div className='barangay-filter-box'>
                                <label htmlFor="barangay-filter">Filter by Barangay: </label>
                                <select id="barangay-filter" value={selectedBarangay} onChange={handleBarangayChange}>
                                    {barangayOptions.map(barangay => (
                                        <option key={barangay} value={barangay}>{barangay}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='barangay-filter-box'>
                                <label htmlFor="barangay-filter">Sort by: </label>
                                <select id="barangay-filter" value={sortOrder} onChange={handleSortChange}>
                                    <option value="newest">Newest to Oldest</option>
                                    <option value="oldest">Oldest to Newest</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className='loading-message'>Loading table, please wait...</div>
                    ) : (
                        <table className='barangay-table'>
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Barangay</th>
                                    <th>Item Name</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Date & Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRequests.map(request => (
                                    <tr key={request._id}>
                                        <td>{request._id}</td>
                                        <td>{request.barangay}</td>
                                        <td>{request.itemname}</td>
                                        <td>{request.type}</td>
                                        <td>{request.quantity}</td>
                                        <td>
                                            {new Date(request.date_time).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                                timeZone: 'UTC'
                                            })}
                                        </td>
                                        <td>
                                            {userBarangay !== request.barangay && (
                                                <div className='action-button-box'>
                                                    <button className='barangay-view-requests-button' onClick={() => openModal(request._id)}>View</button>
                                                </div>
                                            )}
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
                <div className="requests-modal">
                    <div className="requests-modal-content">
                        <div className='requests-modal-content-box'>
                            <div className='close-modal-button-box'>
                                <button onClick={closeModal} className='close-modal-button'>X</button>
                            </div>

                            <div className='requests-title-box'>
                                <a className='requests-title-box-text'>
                                    Requests Details
                                </a>

                                <div className='requests-tooltip'>
                                    <label className='requests-tooltip-icon'>ⓘ</label>
                                    <div className='requests-tooltip-box'>
                                        <label className='requests-tooltip-sub-text'>
                                            This section contains all information about the requests and the requestor.
                                            You can choose to "Respond" to a requests made by the barangay.
                                            If you select "Respond" the requests will be responded and put in history for reference.
                                            After responding, the requests would then notify the system about the transaction.
                                        </label>
                                    </div>
                                </div>

                            </div>

                            <div className='requests-details-container'>
                                <div className='requests-details-modal-box'>
                                    <div className='requests-details-section-box'>
                                        <div className='requests-text-box'>
                                            <a className='requests-title-text'>
                                                Request ID:
                                                <b className='requests-content-text'>{selectedRequest._id}</b>
                                            </a>
                                        </div>
                                        <div className='requests-text-box'>
                                            <a className='requests-title-text'>
                                                Name of Requestor:
                                                <b className='requests-content-text'>{selectedRequest.username}</b>
                                            </a>
                                            <a className='requests-title-text'>
                                                Responder:
                                                <b className='requests-content-text'>{selectedRequest.responder}</b>
                                            </a>
                                        </div>
                                        <div className='requests-text-box'>
                                            <a className='requests-title-text'>
                                                Barangay in Need:
                                                <b className='requests-content-text'>{selectedRequest.barangay}</b>
                                            </a>
                                            <a className='requests-title-text'>
                                                Item Name:
                                                <b className='requests-content-text'>{selectedRequest.itemname}</b>
                                            </a>
                                        </div>
                                        <div className='requests-text-box'>
                                            <a className='requests-title-text'>
                                                Type:
                                                <b className='requests-content-text'>{selectedRequest.type}</b>
                                            </a>
                                            <a className='requests-title-text'>
                                                Quantity:
                                                <b className='requests-content-text'>{selectedRequest.quantity}</b>
                                            </a>
                                        </div>
                                        <div className='requests-text-box'>
                                            <a className='requests-title-text'>
                                                Date & Time:
                                                <b className='requests-content-text'>{new Date(selectedRequest.date_time).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</b>
                                            </a>
                                        </div>
                                    </div>
                                    <div className='requests-description-box'>
                                        <a className='description-title-text'>Description</a>
                                        <textarea className='requests-description-area' value={selectedRequest.description} readOnly />
                                    </div>
                                </div>
                            </div>
                            <div className='requests-update-modal-button-box'>
                                <button className='requests-update-modal-button' onClick={handleRespond}>Respond</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Barangay;
