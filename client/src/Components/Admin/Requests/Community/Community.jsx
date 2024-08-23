import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Community.css';

const Community = () => {
    const [communities, setCommunities] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const itemsPerPage = 9;

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/communities');
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

    const openModal = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedRequest(null);
        setIsModalOpen(false);
    };

    return (
        <div className="communities-content-box">
            <div className='communities-table-container'>
                <div className='communities-table-box'>
                    <div className='communities-table-title-box'>
                        <a className='communities-table-title-text'>Community Requests</a>
                        <a className='communities-table-description'>
                            ⓘ
                            <span className='tooltip-text'>This page contains all the list of requests made by the community.</span>
                        </a>
                    </div>
                    <table className='communities-table'>
                        <thead>
                            <tr>
                                <th>Requests ID</th>
                                <th>Name</th>
                                <th>Barangay</th>
                                <th>Item Name</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCommunities.map(community => (
                                <tr key={community._id}>
                                    <td>{community._id}</td>
                                    <td>{community.name}</td>
                                    <td>{community.barangay}</td>
                                    <td>{community.itemname}</td>
                                    <td>{community.type}</td>
                                    <td>{community.quantity}</td>
                                    <td>
                                        <div className='action-button-box'>
                                            <button className='communities-view-requests-button' onClick={() => openModal(community)}>View</button>
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

            {isModalOpen && selectedRequest && (
                <div className="community-modal">
                    <div className="community-modal-content">
                        <div className='community-modal-content-box'>
                            <div className='close-modal-button-box'>
                                <button onClick={closeModal} className='close-modal-button'>X</button>
                            </div>

                            <div className='community-title-box'>
                                <h2>Request Details</h2>
                            </div>

                            <div className='community-details-container'>
                                <div className='community-details-modal-box'>
                                    <div className='community-text-box'>
                                        <a className='community-title-text'>
                                            Request ID:
                                            <b className='community-content-text'>{selectedRequest._id}</b>
                                        </a>
                                    </div>
                                    <div className='community-text-box'>
                                        <a className='community-title-text'>
                                            Name:
                                            <b className='community-content-text'>{selectedRequest.name}</b>
                                        </a>
                                        <a className='community-title-text'>
                                            Barangay:
                                            <b className='community-content-text'>{selectedRequest.barangay}</b>
                                        </a>
                                    </div>
                                    <div className='community-text-box'>
                                        <a className='community-title-text'>
                                            Item Name:
                                            <b className='community-content-text'>{selectedRequest.itemname}</b>
                                        </a>
                                        <a className='community-title-text'>
                                            Type:
                                            <b className='community-content-text'>{selectedRequest.type}</b>
                                        </a>
                                    </div>
                                    <div className='community-text-box'>
                                        <a className='community-title-text'>
                                            Quantity:
                                            <b className='community-content-text'>{selectedRequest.quantity}</b>
                                        </a>
                                    </div>
                                    <div className='community-description-box'>
                                        <a className='description-title-text'>Description</a>
                                        <textarea className='community-description-area' value={selectedRequest.description} readOnly />
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

export default Community;
