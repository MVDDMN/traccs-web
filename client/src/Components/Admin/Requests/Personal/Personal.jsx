import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Personal.css';

const Personal = () => {
    const [requests, setRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [userName, setUserName] = useState('');
    const [userBarangay, setUserBarangay] = useState('');
    const [userType, setUserType] = useState('');
    const [userUsername, setUserUsername] = useState('');
    const itemsPerPage = 7;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    console.error("Error fetching user data:", error);
                    return;
                }
                const response = await axios.get(`http://localhost:3001/user/${userId}`, { withCredentials: true });

                setUserName(response.data.name);
                setUserBarangay(response.data.barangay);
                setUserType(response.data.type);
                setUserUsername(response.data.username);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        const fetchRequests = async () => {
            try {
                const response = await axios.get('http://localhost:3001/requests');
                setRequests(response.data);
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        };

        fetchUserData();
        fetchRequests();
        const interval = setInterval(fetchRequests, 1000);

        return () => clearInterval(interval);
    }, []);

    // Filter requests based on userBarangay
    const filteredRequests = requests.filter(request => request.barangay === userBarangay);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

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
        <div className="personal-content-box">
            <div className='request-button-box'>
                <button className='add-request-button'>Add Request</button>
            </div>

            <div className='personal-table-container'>
                <div className='personal-table-box'>
                    <h2>My Requests</h2>
                    <table className='barangay-table'>
                        <thead>
                            <tr>
                                <th>Resource ID</th>
                                <th>Barangay</th>
                                <th>Item Name</th>
                                <th>Type</th>
                                <th>Quantity</th>
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
                                        <div className='action-button-box'>
                                            <button className='view-requests-button'>Edit</button>
                                            <button className='delete-requests-button'>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className='pagination'>
                    <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default Personal;
