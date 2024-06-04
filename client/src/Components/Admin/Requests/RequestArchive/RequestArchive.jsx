import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './RequestArchive.css';

const RequestArchive = () => {
    const [requestarchives, setRequestArchives] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchRequestArchives = async () => {
            try {
                const response = await axios.get('http://localhost:3001/requestarchives');
                setRequestArchives(response.data);
            } catch (error) {
                console.error("Error fetching request archives:", error);
            }
        };

        fetchRequestArchives();
        const interval = setInterval(fetchRequestArchives, 1000);

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

    return (
        <div className="requestarchives-content-box">

            <div className='requestarchives-table-container'>
                <div className='requestarchives-table-box'>
                    <h2>Archive</h2>
                    <table className='requestarchives-table'>
                        <thead>
                            <tr>
                                <th>Resource ID</th>
                                <th>Requestor</th>
                                <th>Responder</th>
                                <th>Barangay</th>
                                <th>Item Name</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRequestArchives.map(requestarchives => (
                                <tr key={requestarchives._id}>
                                    <td>{requestarchives._id}</td>
                                    <td>{requestarchives.username}</td>
                                    <td>{requestarchives.responder}</td>
                                    <td>{requestarchives.barangay}</td>
                                    <td>{requestarchives.itemname}</td>
                                    <td>{requestarchives.type}</td>
                                    <td>{requestarchives.quantity}</td>
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

export default RequestArchive;
