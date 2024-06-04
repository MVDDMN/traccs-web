import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ResourceDonate.css';

const ResourceDonate = () => {
    const [donations, setDonations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await axios.get('http://localhost:3001/donations');
                setDonations(response.data);
            } catch (error) {
                console.error("Error fetching donations:", error);
            }
        };

        fetchDonations();
        const interval = setInterval(fetchDonations, 1000);

        return () => clearInterval(interval);
    }, []);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDonations = donations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(donations.length / itemsPerPage);

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
        <div className="resourcedonate-content-box">

            <div className='donations-table-container'>
                <div className='donations-table-box'>
                    <h2>Donations</h2>
                    <table className='donations-table'>
                        <thead>
                            <tr>
                                <th>Donation ID</th>
                                <th>Item Name</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentDonations.map(donations => (
                                <tr key={donations._id}>
                                    <td>{donations._id}</td>
                                    <td>{donations.itemname}</td>
                                    <td>{donations.type}</td>
                                    <td>{donations.quantity}</td>
                                    <td>
                                        <div className='action-button-box'>
                                            <button className='view-resource-button'>View</button>
                                            <button className='delete-resource-button'>Delete</button>
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

export default ResourceDonate;
