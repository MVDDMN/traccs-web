import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ResourceTable.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ResourceTable = () => {
    const [resources, setResources] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalAdd, setIsModalAdd] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [userBarangay, setUserBarangay] = useState("");
    const [userUsername, setUserUsername] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        itemname: '',
        barangay: '',
        type: '',
        quantity: 0,
        description: ''
    });
    const [errorMessages, setErrorMessages] = useState([]);
    const itemsPerPage = 7;

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/resources`);
                setResources(response.data);
                setIsLoading(false); // Data is loaded
            } catch (error) {
                console.error("Error fetching resources:", error);
                setIsLoading(false); // Data is still loaded
            }
        };

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

        fetchResources();
        fetchUserData();
        const interval = setInterval(fetchResources, 10000);

        return () => clearInterval(interval);
    }, []);

    // Filter resources based on user barangay
    const filteredResources = resources.filter(resource => resource.barangay === userBarangay);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentResources = filteredResources.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);
    const totalPages = Math.ceil(filteredResources.length / itemsPerPage);

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

    const openModal = (resource) => {
        setSelectedResource(resource);
        setIsModalOpen(true);
        // Populate form data with selected resource's values
        setFormData({
            itemname: resource.itemname,
            barangay: resource.barangay,
            type: resource.type,
            quantity: resource.quantity,
            description: resource.description
        });
    };

    const openAddModal = () => {
        setIsModalAdd(true);
        setErrorMessages([]);
        setFormData({
            itemname: '',
            barangay: '',
            type: '',
            quantity: 0,
            description: ''
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsModalAdd(false);
        setSelectedResource(null);
        setFormData({
            itemname: '',
            barangay: '',
            type: '',
            quantity: 0,
            description: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateFormData = () => {
        const errors = [];
        if (!formData.itemname.trim()) errors.push("• Item Name is required.");
        if (!formData.type) errors.push("• Type is required.");
        if (formData.quantity <= 0) errors.push("• Quantity must be greater than 0.");
        if (!formData.description.trim()) errors.push("• Description is required.");
        return errors;
    };

    const logAdminAction = async (action, adminData, description) => {
        const logEntry = {
            username: userUsername,
            action,
            adminData,
            type: 'Resources Module',
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

    const handleUpdateResource = async () => {
        try {
            await axios.put(`${apiBaseUrl}/api/resources/${selectedResource._id}`, formData);
            await logAdminAction('Edit', { updatedData: formData }, 'Edited resource details');
            closeModal();
        } catch (error) {
            console.error("Error updating resource:", error);
        }
    };

    const handleAddResource = async () => {
        const errors = validateFormData();
        if (errors.length > 0) {
            setErrorMessages(errors);
            return;
        }

        try {
            const resourceData = {
                ...formData,
                username: userUsername,
                barangay: userBarangay
            };
            await axios.post(`${apiBaseUrl}/api/resources`, resourceData);
            await logAdminAction('Add', { username: userUsername, barangay: userBarangay }, 'Added a resource');
            closeModal();
        } catch (error) {
            console.error("Error adding resource:", error);
        }
    };

    const openDeleteModal = (resource) => {
        setResourceToDelete(resource);
        setShowDeleteModal(true);
    };

    const closeModalDelete = () => {
        setShowDeleteModal(false);
        setResourceToDelete(null);
    };

    const handleDeleteRequest = async () => {
        try {
            const deletedResourceData = resourceToDelete;

            await axios.delete(`${apiBaseUrl}/api/resources/${resourceToDelete._id}`);
            setResources(resources.filter(resource => resource._id !== resourceToDelete._id));
            await logAdminAction('Delete', { resourceId: deletedResourceData._id, resourceName: deletedResourceData.name }, 'Deleted a resource');

            closeModalDelete();
        } catch (error) {
            console.error("Error deleting resource:", error);
        }
    };

    return (
        <div className="resourcetable-content-box">
            <div className='resource-button-box'>
                <button className='add-resource-button' onClick={openAddModal}>Add Resource</button>
            </div>

            <div className='resource-table-container'>
                <div className='resource-table-box'>
                    <div className='resource-table-title-box'>
                        <a className='resource-table-title-text'>My Resources</a>
                        <a className='resource-table-description'>
                            ⓘ
                            <span className='tooltip-text'>This page allows to create and list all resources of the barangay.</span>
                        </a>
                    </div>

                    {isLoading ? (
                        <div className='loading-message'>Loading table, please wait...</div>
                    ) : (
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
                                                <button className='view-resource-button' onClick={() => openModal(resource)}>Edit</button>
                                                <button className='delete-resource-button' onClick={() => openDeleteModal(resource)}>Delete</button>
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
                    <span className='resource-page-number'>Page {currentPage} of {totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>

            {isModalOpen && selectedResource && (
                <div className="resource-modal">
                    <div className="resource-modal-content">
                        <div className='resource-modal-content-box'>
                            <div className='close-modal-button-box'>
                                <button onClick={closeModal} className='close-modal-button'>X</button>
                            </div>

                            <div className='resource-title-box'>
                                <h2>Resource Details</h2>
                            </div>

                            <div className='resource-details-container'>
                                <div className='resource-details-modal-box'>
                                    <div className='resource-content-cont'>
                                        <div className='resource-text-box'>
                                            <a className='resource-title-text'>
                                                Username:
                                                <b className='resource-content-text'>{selectedResource.username}</b>
                                            </a>
                                        </div>
                                        <div className='resource-text-box'>
                                            <label className='resource-label'>Item Name:</label>
                                            <input
                                                type="text"
                                                name="itemname"
                                                value={formData.itemname}
                                                onChange={handleInputChange}
                                                className="resource-input"
                                            />
                                        </div>
                                    </div>
                                    <div className='resource-content-cont'>
                                        <div className='resource-text-box'>
                                            <a className='resource-title-text'>
                                                Barangay:
                                                <b className='resource-content-text'>{selectedResource.barangay}</b>
                                            </a>
                                        </div>
                                        <div className='resource-text-box'>
                                            <label className='resource-label'>Resource Type:</label>
                                            <select
                                                name="type"
                                                value={formData.type} // Set selected option to formData.type
                                                onChange={handleInputChange}
                                                className="resource-input"
                                            >
                                                <option value="Food">Food</option>
                                                <option value="Non-Food">Non-Food</option>
                                                <option value="Beverage">Beverage</option>
                                                <option value="Essentials">Essentials</option>
                                                <option value="Medical">Medical</option>
                                                <option value="Hygiene">Hygiene</option>
                                                <option value="Shelter">Shelter</option>
                                                <option value="Power">Power</option>
                                                <option value="Others">Others</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className='resource-text-box'>
                                        <label>Quantity:</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            className="resource-input"
                                        />
                                    </div>
                                    <div className='resource-text-box'>
                                        <div className='resource-description-box'>
                                            <label>Description:</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className='resource-description-area'
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className='update-modal-button-box'>
                                <button onClick={handleUpdateResource} className='update-modal-button'>Update Information</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isModalAdd && (
                <div className="resource-modal">
                    <div className="resource-modal-content">
                        <div className='resource-modal-content-box'>
                            <div className='close-modal-button-box'>
                                <button onClick={closeModal} className='close-modal-button'>X</button>
                            </div>

                            <div className='resource-title-box'>
                                <h2>Add Resource</h2>
                            </div>

                            <div className='resource-details-container'>
                                <div className='resource-details-modal-box'>
                                    <div className='resource-content-cont'>
                                        <div className='resource-text-box'>
                                            <label className='resource-label'>Item Name:</label>
                                            <input
                                                type="text"
                                                name="itemname"
                                                value={formData.itemname}
                                                onChange={handleInputChange}
                                                className="resource-input"
                                            />
                                        </div>
                                    </div>
                                    <div className='resource-content-cont'>
                                        <div className='resource-text-box'>
                                            <label className='resource-label'>Resource Type:</label>
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                className="resource-input"
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
                                                <option value="Others">Others</option>
                                            </select>
                                        </div>
                                        <div className='resource-text-box'>
                                            <label className='resource-label'>Quantity:</label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                className="resource-input"
                                            />
                                        </div>
                                    </div>
                                    <div className='resource-text-box'>
                                        <div className='resource-description-box'>
                                            <label className='resource-label'>Description:</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className='resource-description-area'
                                            />
                                        </div>
                                    </div>
                                    {errorMessages.length > 0 && (
                                        <div className="error-messages">
                                            {errorMessages.map((msg, index) => (
                                                <p key={index} className="error-message">{msg}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className='update-modal-button-box'>
                                <button onClick={handleAddResource} className='update-modal-button'>Add Resource</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="delete-modal">
                    <div className="delete-content">
                        <div className='delete-message'>
                            <p>Delete Resource?</p>
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

export default ResourceTable;
