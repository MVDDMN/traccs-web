import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Barangay.css';

const Barangay = () => {
    const [requests, setRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get('http://localhost:3001/requests');
                setRequests(response.data);
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        };

        fetchRequests();
        const interval = setInterval(fetchRequests, 1000);

        return () => clearInterval(interval);
    }, []);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRequests = requests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(requests.length / itemsPerPage);

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
        <div className="barangay-content-box">
            <div className='request-button-box'>
                <button className='add-request-button'>Add Request</button>
            </div>

            <div className='barangay-table-container'>
                <div className='barangay-table-box'>
                    <h2>Barangay Requests</h2>
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
                            {currentRequests.map(requests => (
                                <tr key={requests._id}>
                                    <td>{requests._id}</td>
                                    <td>{requests.barangay}</td>
                                    <td>{requests.itemname}</td>
                                    <td>{requests.type}</td>
                                    <td>{requests.quantity}</td>
                                    <td>
                                        <div className='action-button-box'>
                                            <button className='view-requests-button'>View</button>
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

export default Barangay;
