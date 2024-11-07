import React, { useEffect, useState } from 'react';
import searchIcon from '../../../Assets/search.png';
import axios from 'axios';
import './Users.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const Users = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState({});
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isEmailSending, setIsEmailSending] = useState(false);

    const [sortOrder, setSortOrder] = useState('newest');
    const [filterStatus, setFilterStatus] = useState('Verified');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/users`);
                setUsers(response.data);
                setIsLoading(false); // Data is loaded
            } catch (error) {
                console.error("Error fetching users:", error);
                setIsLoading(false); // Even if there's an error, stop the loading state
            }
        };

        fetchUsers();
        const interval = setInterval(fetchUsers, 5000);

        return () => clearInterval(interval);
    }, []);

    // Handle sorting
    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    // Handle filtering by status
    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
    };

    // Apply sorting and filtering
    const filteredAndSortedUsers = users
        .filter(user =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(user => user.status === filterStatus)
        .sort((a, b) => {
            if (sortOrder === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
        });

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredAndSortedUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

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
        const newStatus = selectedUser.status === 'Verified' ? 'Unverified' : 'Verified';
        setIsEmailSending(true); // Set loading state

        try {
            // Prepare email content based on the new status
            const emailMessage = newStatus === 'Verified'
                ? `Hello ${selectedUser.fullName},\n\nYour account has been verified. Thank you!`
                : `Hello ${selectedUser.fullName},\n\nYour account has been unverified. If you have any questions, please contact support.`;

            // Send verification email first
            await axios.post(`${apiBaseUrl}/api/users/${selectedUser._id}/send-verification-email`, { message: emailMessage });

            // Now update the user status after email is sent
            const updatedUser = await axios.put(`${apiBaseUrl}/api/users/${selectedUser._id}/status`, { status: newStatus });
            setSelectedUser(updatedUser.data);
        } catch (error) {
            console.error("Error updating user status or sending email:", error);
        } finally {
            setIsEmailSending(false); // Reset loading state
        }
    };

    const handleImageClick = (img) => {
        setSelectedImage(img);
        setShowImageModal(true);
    };

    return (
        <div className="accounts-content-box">

            <div className='search-container'>
                <div className='search-box'>
                    <img
                        src={searchIcon}
                        alt='Search Icon'
                        className='search-icon'
                    />
                    <input
                        type='text'
                        placeholder='Search users...'
                        className='search-input'
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className='accounts-table-container'>
                <div className='accounts-table-box'>

                    <div className='accounts-table-title-container'>
                        <div className='accounts-table-title-box'>
                            <a className='accounts-table-title-text'>User Accounts</a>
                            <a className='accounts-table-description'>
                                ⓘ
                                <span className='tooltip-text'>
                                    This page displays all mobile user accounts, allowing you to verify or unverify an account.
                                </span>
                            </a>
                        </div>

                        <div className='accounts-filter-container'>
                            <div className='accounts-filter-box'>
                                <label htmlFor="accounts-filter">Sort by: </label>
                                <select id="accounts-filter" value={sortOrder} onChange={handleSortChange}>
                                    <option value="newest">Newest to Oldest</option>
                                    <option value="oldest">Oldest to Newest</option>
                                </select>
                            </div>
                            <div className='accounts-filter-box'>
                                <label htmlFor="status-filter">Filter by Status: </label>
                                <select id="status-filter" value={filterStatus} onChange={handleFilterChange}>
                                    <option value="Verified">Verified</option>
                                    <option value="Unverified">Unverified</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className='loading-message'>Loading table, please wait...</div>
                    ) : (
                        <table className='accounts-table'>
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Contact</th>
                                    <th>E-mail</th>
                                    <th>Created At</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map(user => (
                                    <tr key={user._id}>
                                        <td>{user._id}</td>
                                        <td>{user.phone}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            {new Date
                                                (user.createdAt).toLocaleDateString
                                                ('en-US',
                                                    {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    }
                                                )
                                            }
                                        </td>
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
                    )}

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
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className='close-modal-button'
                                    disabled={isEmailSending} // Disable when email is sending
                                >
                                    X
                                </button>
                            </div>

                            <div className='users-title-box'>
                                <a className='users-title-text'>User Details</a>

                                <div className='accounts-tooltip'>
                                    <label className='accounts-tooltip-icon'>ⓘ</label>
                                    <div className='accounts-tooltip-box'>
                                        <label className='accounts-tooltip-sub-text'>
                                            This section contains all information about mobile user account.
                                            You can choose to "Unverify" or "Verify" the user account.
                                            If you select "Unverify" or "Verify" it will send an email response to notify the user account that it has updated its status.
                                        </label>
                                    </div>
                                </div>

                            </div>

                            <div className='users-text-box'>
                                <div className='users-image-container'>
                                    {selectedUser.profileImage && selectedUser.profileImage.length > 0 ? (
                                        selectedUser.profileImage.map((img, index) => (
                                            <img
                                                key={index}
                                                src={`data:image/jpeg;base64,${img}`}
                                                alt={`Profile Picture ${index + 1}`}
                                                className='users-profile-image'
                                                onClick={() => handleImageClick(img)}
                                            />
                                        ))
                                    ) : (
                                        <label className='users-image-missing-text'>No Profile Picture</label>
                                    )}
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
                                <button
                                    onClick={handleToggleStatus}
                                    className='users-button'
                                    disabled={isEmailSending}
                                >
                                    {isEmailSending ? 'Sending...' : selectedUser.status === 'Verified' ? 'Unverify' : 'Verify'}
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
                            <p>Invalid User Account?</p>
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
