import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Users.css';

//To do's
//Viewing of Profile Picture and Image

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const Users = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState({});
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/users`);
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
        const interval = setInterval(fetchUsers, 1000);

        return () => clearInterval(interval);
    }, []);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);

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

    const handleDeleteUser = async () => {
        try {
            await axios.delete(`${apiBaseUrl}/api/users/${selectedUser._id}`);
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowViewModal(true); // Show the modal when "View" button is clicked
    };

    const handleToggleStatus = async () => {
        let newStatus;
        
        if (!selectedUser.status || selectedUser.status === '') {
            newStatus = 'Unverified';
        } else {
            newStatus = selectedUser.status === 'Verified' ? 'Unverified' : 'Verified';
        }

        try {
            const updatedUser = await axios.put(`${apiBaseUrl}/api/users/${selectedUser._id}/status`, { status: newStatus });
            setSelectedUser(updatedUser.data);
        } catch (error) {
            console.error("Error updating user status:", error);
        }
    };

    const handleImageClick = (img) => {
        setSelectedImage(img);
        setShowImageModal(true);
    };


    return (
        <div className="accounts-content-box">

            <div className='accounts-table-container'>
                <div className='accounts-table-box'>
                    <div className='accounts-table-title-box'>
                        <a className='accounts-table-title-text'>User Accounts</a>
                        <a className='accounts-table-description'>
                            ⓘ
                            <span className='tooltip-text'>This page contains the list which allows to verify/unverify all the user accounts.</span>
                        </a>
                    </div>
                    <table className='accounts-table'>
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>E-mail</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map(user => (
                                <tr key={user._id}>
                                    <td>{user._id}</td>
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.status}</td>
                                    <td>
                                        <div className='action-button-box'>
                                            <button className='view-accounts-button' onClick={() => handleViewUser(user)}>View</button>
                                            <button className='delete-accounts-button' onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}>Delete</button>
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

            {showViewModal && (
                <div className="users-modal">

                    <div className="users-modal-content">

                        <div className='users-modal-content-box'>

                            <div className='close-modal-button-box'>
                                <button onClick={() => setShowViewModal(false)} className='close-modal-button'>X</button>
                            </div>

                            <div className='users-title-box'>
                                <a className='users-title-text'>User Details</a>
                            </div>

                            <div className='users-text-box'>
                                <div className='users-image-container'>
                                    <label className='users-image-title'>Profile Picture</label>
                                </div>

                                <div className='users-image-container'>
                                    {selectedUser.IdImage && selectedUser.IdImage.length > 0 ? (
                                        selectedUser.IdImage.map((img, index) => (
                                            <img
                                                key={index}
                                                src={`data:image/jpeg;base64,${img}`}
                                                alt={`Valid ID ${index + 1}`}
                                                className='users-id-image'
                                                onClick={() => handleImageClick(img)}
                                            />
                                        ))
                                    ) : (
                                        <label className='users-image-missing-text'>No Valid ID Picture</label>
                                    )}
                                    <label className='users-image-title'>Valid ID Picture</label>
                                </div>

                            </div>

                            <div className='users-text-box'>
                                <div className='users-content-box'>
                                    <label className='users-text'>Full Name:</label>
                                    <p className='users-details-text'>{selectedUser.fullName}</p>
                                </div>

                                <div className='users-content-box'>
                                    <label className='users-text'>Address:</label>
                                    <p className='users-details-text'>{selectedUser.address}</p>
                                </div>
                            </div>

                            <div className='users-text-box'>

                                <div className='users-content-box'>
                                    <label className='users-text'>Phone:</label>
                                    <p className='users-details-text'>{selectedUser.phone}</p>
                                </div>

                                <div className='users-content-box'>
                                    <label className='users-text'>Email:</label>
                                    <p className='users-details-text'>{selectedUser.email}</p>
                                </div>

                            </div>

                            <div className='users-text-box'>

                                <div className='users-content-box'>
                                    <label className='users-text'>Status:</label>
                                    <p className='users-details-text'>{selectedUser.status}</p>
                                </div>

                            </div>

                            <div className='users-button-box'>
                                <button onClick={handleToggleStatus} className='users-button'>
                                    {selectedUser.status === 'Verified' ? 'Unverify' : 'Verify'}
                                </button>
                            </div>
                        </div>

                    </div>

                </div>
            )}

            {showImageModal && (
                <div className="image-modal" onClick={() => setShowImageModal(false)}>
                    <div className="image-modal-content">
                        <img src={`data:image/jpeg;base64,${selectedImage}`} alt="Enlarged ID" />
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="delete-modal">
                    <div className="delete-content">
                        <div className='delete-message'>
                            <p>Delete User?</p>
                            <a>You won’t be able to undo this action. Are you sure?</a>
                        </div>
                        <div className='delete-choice'>
                            <button className='delete-choice-button' onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className='delete-confirm-button' onClick={handleDeleteUser}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
