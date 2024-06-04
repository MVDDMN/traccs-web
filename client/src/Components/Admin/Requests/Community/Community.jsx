import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Community.css';

const Community = () => {
    const [communities, setCommunities] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await axios.get('http://localhost:3001/communities');
                setCommunities(response.data);
            } catch (error) {
                console.error("Error fetching communities:", error);
            }
        };

        fetchCommunities();
        const interval = setInterval(fetchCommunities, 1000);

        return () => clearInterval(interval);
    }, []);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCommunities = communities.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(communities.length / itemsPerPage);

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
        <div className="communities-content-box">

            <div className='communities-table-container'>
                <div className='communities-table-box'>
                    <h2>Community</h2>
                    <table className='communities-table'>
                        <thead>
                            <tr>
                                <th>Resource ID</th>
                                <th>Name</th>
                                <th>Barangay</th>
                                <th>Item Name</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCommunities.map(communities => (
                                <tr key={communities._id}>
                                    <td>{communities._id}</td>
                                    <td>{communities.name}</td>
                                    <td>{communities.barangay}</td>
                                    <td>{communities.itemname}</td>
                                    <td>{communities.type}</td>
                                    <td>{communities.quantity}</td>
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

export default Community;
