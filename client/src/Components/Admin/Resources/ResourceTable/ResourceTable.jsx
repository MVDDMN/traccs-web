import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ResourceTable.css';

const ResourceTable = () => {
    const [resources, setResources] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await axios.get('http://localhost:3001/resources');
                setResources(response.data);
            } catch (error) {
                console.error("Error fetching resources:", error);
            }
        };

        fetchResources();
        const interval = setInterval(fetchResources, 1000);

        return () => clearInterval(interval);
    }, []);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentResources = resources.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(resources.length / itemsPerPage);

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
        <div className="resourcetable-content-box">
            <div className='resource-button-box'>
                <button className='add-resource-button'>Add Resource</button>
            </div>

            <div className='resource-table-container'>
                <div className='resource-table-box'>
                    <h2>Resources</h2>
                    <table className='resource-table'>
                        <thead>
                            <tr>
                                <th>Resource ID</th>
                                <th>Item Name</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentResources.map(resource => (
                                <tr key={resource._id}>
                                    <td>{resource._id}</td>
                                    <td>{resource.itemname}</td>
                                    <td>{resource.type}</td>
                                    <td>{resource.quantity}</td>
                                    <td>
                                        <div className='action-button-box'>
                                            <button className='view-resource-button'>View</button>
                                            <button className='view-resource-button'>Edit</button>
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

export default ResourceTable;
