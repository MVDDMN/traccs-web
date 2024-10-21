import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Personal.css';
import { validateFormData, hasErrors } from './validation';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const Personal = () => {
    const [requests, setRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalAdd, setIsModalAdd] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [userBarangay, setUserBarangay] = useState('');
    const [userUsername, setUserUsername] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);
    const [descriptionLength, setDescriptionLength] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('newest');
    const [formData, setFormData] = useState({
        itemname: '',
        barangay: '',
        type: '',
        quantity: 0,
        description: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const itemsPerPage = 7;

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
                const formattedRequests = response.data.map(request => ({
                    ...request,
                    formatted_date: formatDate(new Date(request.date_time)), // Keep date_time for sorting
                }));
                setRequests(formattedRequests);
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

    const formatDate = (date) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };
        return new Date(date).toLocaleString('en-US', options);
    };

    const sortRequests = (requests, order) => {
        return requests.slice().sort((a, b) => {
            const dateA = new Date(a.date_time).getTime();
            const dateB = new Date(b.date_time).getTime();

            if (order === 'newest') {
                return dateB - dateA; // Newest first
            } else if (order === 'oldest') {
                return dateA - dateB; // Oldest first
            }
            return 0;
        });
    };

    const filteredRequests = requests.filter(request => request.barangay === userBarangay);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

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

    const openModal = (request) => {
        setSelectedRequest(request);
    
        // Populate formData with the selected request details, including the description
        setFormData({
            itemname: request.itemname,
            barangay: request.barangay,
            type: request.type,
            quantity: request.quantity,
            description: request.description // Ensure description is set
        });
    
        // Set the description length
        setDescriptionLength(request.description.length);
    
        // Open the modal
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setIsModalAdd(true);
        setFormData({
            itemname: '',
            barangay: userBarangay,
            type: '',
            quantity: 0,
            description: ''
        });
        setDescriptionLength(0); // Reset description length
        setFormErrors({});
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsModalAdd(false);
        setSelectedRequest(null);
        setFormData({
            itemname: '',
            barangay: '',
            type: '',
            quantity: 0,
            description: ''
        });
        setDescriptionLength(0); // Reset description length when closing modal
        setFormErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (name === "description") {
            setDescriptionLength(value.length);
        }

        if (selectedRequest) {
            setSelectedRequest({
                ...selectedRequest,
                [name]: value,
            });
        }
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

    const handleUpdateRequest = async () => {
        const errors = validateFormData(selectedRequest);
        if (hasErrors(errors)) {
            setFormErrors(errors);
            return;
        }

        try {
            await axios.put(`${apiBaseUrl}/api/requests/${selectedRequest._id}`, selectedRequest);
            await logAdminAction('Edit', { requestId: selectedRequest._id, barangay: userBarangay }, 'Updated a request');

            closeModal();
        } catch (error) {
            console.error("Error updating request:", error);
        }
    };

    const handleAddRequest = async () => {
        const errors = validateFormData(formData);
        if (hasErrors(errors)) {
            setFormErrors(errors);
            return;
        }

        try {
            const requestData = {
                ...formData,
                username: userUsername,
                barangay: userBarangay,
                date_time: new Date().toISOString() // Use ISO format for proper date sorting
            };
            await axios.post(`${apiBaseUrl}/api/requests`, requestData);
            await logAdminAction('Add', { username: userUsername, updatedData: formData }, 'Added a request');
            closeModal();
        } catch (error) {
            console.error("Error adding request:", error);
        }
    };

    const openDeleteModal = (request) => {
        setRequestToDelete(request);
        setShowDeleteModal(true);
    };

    const closeModalDelete = () => {
        setShowDeleteModal(false);
        setRequestToDelete(null);
    };

    const handleDeleteRequest = async () => {
        try {
            await axios.delete(`${apiBaseUrl}/api/requests/${requestToDelete._id}`);
            setRequests(requests.filter(request => request._id !== requestToDelete._id));
            await logAdminAction('Delete', { requestId: requestToDelete._id }, 'Deleted a request');
            closeModalDelete();
        } catch (error) {
            console.error("Error deleting request:", error);
        }
    };

    return (
        <div className="personal-content-box">
            <div className='request-button-box'>
                <button className='add-request-button' onClick={openAddModal}>Add Request</button>
            </div>

            <div className='personal-table-container'>
                <div className='personal-table-box'>
                    <div className='personal-table-title-box'>

                        <div className='personal-table-title-content'>
                            <a className='personal-table-title-text'>My Requests</a>
                        </div>

                        <div className='personal-filter-box'>
                            <label htmlFor="personal-filter">Sort by: </label>
                            <select id="personal-filter" value={sortOrder} onChange={handleSortChange}>
                                <option value="newest">Newest to Oldest</option>
                                <option value="oldest">Oldest to Newest</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className='loading-message'>Loading table, please wait...</div>
                    ) : (
                        <table className='personal-table'>
                            <thead>
                                <tr>
                                    <th>Requests ID</th>
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
                                        <td>{request.formatted_date}</td> {/* Display formatted date */}
                                        <td>
                                            <div className='action-button-box'>
                                                <button className='personal-view-requests-button' onClick={() => openModal(request)}>Update</button>
                                                <button className='personal-delete-requests-button' onClick={() => openDeleteModal(request)}>Delete</button>
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

            {isModalOpen && selectedRequest && (
                <div className="request-modal">
                    <div className="request-modal-content">
                        <div className='request-modal-content-box'>
                            <div className='close-modal-button-box'>
                                <button onClick={closeModal} className='close-modal-button'>X</button>
                            </div>

                            <div className='request-title-box'>
                                <a className='request-title-box-text'>
                                    Edit Request Details
                                </a>

                                <div className='requests-tooltip'>
                                    <label className='requests-tooltip-icon'>ⓘ</label>
                                    <div className='requests-tooltip-box'>
                                        <label className='requests-tooltip-sub-text'>
                                            This section contains all information about the requests.
                                            You can choose to either "Update Requests" after editing the requests.
                                            If you select "Update Requests" the requests will be updated with the new details.
                                        </label>
                                    </div>
                                </div>

                            </div>

                            <div className='request-details-container'>
                                <div className='request-details-modal-box'>
                                    <div className='request-content-cont'>
                                        <div className='request-text-box'>
                                            <a className='request-title-text'>
                                                Username:
                                                <b className='request-content-text'>{selectedRequest.username}</b>
                                            </a>
                                        </div>
                                        <div className='request-text-box'>
                                            <label className='request-label'>Item Name:</label>
                                            <input
                                                type="text"
                                                name="itemname"
                                                value={selectedRequest.itemname}
                                                onChange={handleInputChange}
                                                className="request-input"
                                            />
                                        </div>
                                    </div>
                                    <div className='request-content-cont'>
                                        <div className='request-text-box'>
                                            <a className='request-title-text'>
                                                Barangay:
                                                <b className='request-content-text'>{selectedRequest.barangay}</b>
                                            </a>
                                        </div>
                                        <div className='request-text-box'>
                                            <label className='request-label'>Resource Type:</label>
                                            <select
                                                name="type"
                                                value={selectedRequest.type}
                                                onChange={handleInputChange}
                                                className="request-input"
                                            >
                                                <option value="Food">Food</option>
                                                <option value="Non-Food">Non-Food</option>
                                                <option value="Beverage">Beverage</option>
                                                <option value="Essentials">Essentials</option>
                                                <option value="Medical">Medical</option>
                                                <option value="Hygiene">Hygiene</option>
                                                <option value="Shelter">Shelter</option>
                                                <option value="Power">Power</option>
                                                <option value="Assistance">Assistance</option>
                                                <option value="Others">Others</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className='request-content-cont'>
                                        <div className='request-text-box'>
                                            <label className='request-label'>Quantity:</label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={selectedRequest.quantity}
                                                onChange={handleInputChange}
                                                className="request-input"
                                            />
                                        </div>
                                        <div className='request-text-box'>
                                            <label className='request-label'>Date & Time:</label>
                                            <span className='request-content-text'>{selectedRequest.date_time}</span>
                                        </div>
                                    </div>
                                    <div className='request-content-cont'>
                                        <div className='request-text-box'>
                                            <label className='request-label'>Description:</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className="request-description-area"
                                                maxLength={150}
                                            ></textarea>
                                            <p className='request-description-hint-text'>{150 - descriptionLength} characters remaining</p>
                                        </div>
                                    </div>
                                    <div className='personal-error-text-box'>
                                        {formErrors.itemname && <span className="personal-error-text">{formErrors.itemname}</span>}
                                        {formErrors.type && <span className="personal-error-text">{formErrors.type}</span>}
                                        {formErrors.quantity && <span className="personal-error-text">{formErrors.quantity}</span>}
                                        {formErrors.description && <span className="personal-error-text">{formErrors.description}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className='update-modal-button-box'>
                                <button className='update-modal-button' onClick={handleUpdateRequest}>Update Request</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isModalAdd && (
                <div className="request-modal">
                    <div className="request-modal-content">
                        <div className='request-modal-content-box'>
                            <div className='close-modal-button-box'>
                                <button onClick={closeModal} className='close-modal-button'>X</button>
                            </div>

                            <div className='request-title-box'>
                                <a className='request-title-box-text'>
                                    New Request Details
                                </a>

                                <div className='requests-tooltip'>
                                    <label className='requests-tooltip-icon'>ⓘ</label>
                                    <div className='requests-tooltip-box'>
                                        <label className='requests-tooltip-sub-text'>
                                            This section contains contains about all the information needed for a requests.
                                            You can choose to either "Add Request" after filling all the needed information the requests.
                                            If you select "Add" the requests will be added to the table and be visible to others for response.
                                        </label>
                                    </div>
                                </div>

                            </div>

                            <div className='request-details-container'>
                                <div className='request-details-modal-box'>
                                    <div className='request-content-cont'>
                                        <div className='request-text-box'>
                                            <a className='request-title-text'>
                                                Username:
                                                <b className='request-content-text'>{userUsername}</b>
                                            </a>
                                        </div>
                                        <div className='request-text-box'>
                                            <label className='request-label'>Item Name:</label>
                                            <input
                                                type="text"
                                                name="itemname"
                                                value={formData.itemname}
                                                onChange={handleInputChange}
                                                className="request-input"
                                            />
                                        </div>
                                    </div>
                                    <div className='request-content-cont'>
                                        <div className='request-text-box'>
                                            <a className='request-title-text'>
                                                Barangay:
                                                <b className='request-content-text'>{userBarangay}</b>
                                            </a>
                                        </div>
                                        <div className='request-text-box'>
                                            <label className='request-label'>Resource Type:</label>
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                className="request-input"
                                            >
                                                <option value="">Select Type</option>
                                                <option value="Food">Food</option>
                                                <option value="Non-Food">Non-Food</option>
                                                <option value="Beverage">Beverage</option>
                                                <option value="Essentials">Essentials</option>
                                                <option value="Medical">Medical</option>
                                                <option value="Hygiene">Hygiene</option>
                                                <option value="Shelter">Shelter</option>
                                                <option value="Power">Power</option>
                                                <option value="Assistance">Assistance</option>
                                                <option value="Others">Others</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className='request-content-cont'>
                                        <div className='request-text-box'>
                                            <label className='request-label'>Quantity:</label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                className="request-input"
                                            />
                                        </div>
                                        <div className='request-text-box'>
                                            <label className='request-label'>Date & Time:</label>
                                            <span className='request-content-text'>{formatDate(new Date())}</span>
                                        </div>
                                    </div>
                                    <div className='request-content-cont'>
                                        <div className='request-text-box'>
                                            <label className='request-label'>Description:</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className="request-description-area"
                                                maxLength={150}
                                            ></textarea>
                                            <p className='request-description-hint-text'>{150 - descriptionLength} characters remaining</p>
                                        </div>
                                    </div>
                                    <div className='personal-error-text-box'>
                                        {formErrors.itemname && <span className="personal-error-text">{formErrors.itemname}</span>}
                                        {formErrors.type && <span className="personal-error-text">{formErrors.type}</span>}
                                        {formErrors.quantity && <span className="personal-error-text">{formErrors.quantity}</span>}
                                        {formErrors.description && <span className="personal-error-text">{formErrors.description}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className='update-modal-button-box'>
                                <button className='update-modal-button' onClick={handleAddRequest}>Add Request</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="delete-modal">
                    <div className="delete-content">
                        <div className='delete-message'>
                            <p>Delete Request?</p>
                            <a>You won’t be able to undo this action. Are you sure?</a>
                        </div>
                        <div className='delete-choice'>
                            <button className='delete-choice-button' onClick={closeModalDelete}>Cancel</button>
                            <button className='delete-confirm-button' onClick={handleDeleteRequest}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Personal;
