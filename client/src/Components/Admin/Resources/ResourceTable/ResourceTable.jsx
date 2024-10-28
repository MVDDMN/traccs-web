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
    const [sortOrder, setSortOrder] = useState("newest");
    const [filterStatus, setFilterStatus] = useState("Available");
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        itemname: '',
        barangay: '',
        type: '',
        quantity: 0,
        description: '',
        resource_status: 'Available',
        updates: ''
    });
    const [charCount, setCharCount] = useState(0);
    const [updatesCharCount, setUpdatesCharCount] = useState(0);
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
        const interval = setInterval(fetchResources, 5000);

        return () => clearInterval(interval);
    }, []);

    // Filter resources based on user barangay
    const filteredResources = resources
        .filter(resource => resource.resource_status === filterStatus)
        .sort((a, b) => {
            if (sortOrder === "newest") {
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            } else {
                return new Date(a.updatedAt) - new Date(b.updatedAt);
            }
        })
        .filter(resource => resource.barangay === userBarangay);

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
            description: resource.description,
            resource_status: resource.resource_status,
            updates: resource.updates
        });
        setCharCount(resource.description.length); // Set initial character count
        setUpdatesCharCount(resource.updates.length); // Set initial character count for updates
    };

    const openAddModal = () => {
        setIsModalAdd(true);
        setErrorMessages([]);
        setFormData({
            itemname: '',
            barangay: '',
            type: 'Food',
            quantity: 0,
            description: '',
            resource_status: 'Available'
        });
        setCharCount(0); // Reset character count for new entry
        setUpdatesCharCount(0); // Reset character count for updates
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
            description: '',
            resource_status: 'Available',
            updates: ''
        });
        setCharCount(0);
        setUpdatesCharCount(0);
        setErrorMessages([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Update character count for description
        if (name === "description") {
            setCharCount(value.length);
        }

        // Update character count for updates
        if (name === "updates") {
            setUpdatesCharCount(value.length);
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateFormData = () => {
        const errors = [];
        if (!formData.itemname.trim()) errors.push("\u2022 Item Name is required.");
        if (formData.type === '') errors.push("\u2022 Type is required.");
        if (formData.quantity <= 0) errors.push("\u2022 Quantity must be greater than 0.");
        if (!formData.description.trim()) errors.push("\u2022 Description is required.");
        // Require "updates" only when editing an existing resource
        if (selectedResource && !formData.updates) {
            errors.push("\u2022 Update description is required.");
        }
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
        const errors = validateFormData();
        if (errors.length > 0) {
            setErrorMessages(errors);
            return;
        }

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

    const handleSortChange = (event) => {
        setSortOrder(event.target.value);
    };

    const handleFilterChange = (event) => {
        setFilterStatus(event.target.value);
    };

    return (
        <div className="resourcetable-content-box">
            <div className='resource-button-box'>
                <button className='add-resource-button' onClick={openAddModal}>Add Resource</button>
            </div>

            <div className='resource-table-container'>
                <div className='resource-table-box'>

                    <div className='resource-table-title-container'>
                        <div className='resource-table-title-box'>
                            <a className='resource-table-title-text'>My Resources</a>
                            <a className='resource-table-description'>
                                ⓘ
                                <span className='tooltip-text'>This page allows you to create, edit and view all listed resources within the barangay on the table.</span>
                            </a>
                        </div>

                        <div className='resource-filter-container'>
                            <div className='resource-filter-box'>
                                <label htmlFor="resource-sort">Sort by: </label>
                                <select id="resource-sort" value={sortOrder} onChange={handleSortChange}>
                                    <option value="newest">Newest to Oldest</option>
                                    <option value="oldest">Oldest to Newest</option>
                                </select>
                            </div>

                            <div className='resource-filter-box'>
                                <label htmlFor="resource-status">Status: </label>
                                <select id="resource-status" value={filterStatus} onChange={handleFilterChange}>
                                    <option value="Available">Available</option>
                                    <option value="Used">Used</option>
                                </select>
                            </div>

                        </div>

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
                                    <th>Status</th>
                                    <th>Last Updated</th>
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
                                        <td>{resource.resource_status}</td>
                                        <td>{new Date(resource.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                        <td>
                                            <div className='action-button-box'>
                                                <button
                                                    className='view-resource-button'
                                                    onClick={() => openModal(resource)}
                                                >
                                                    {resource.resource_status === 'Used' ? 'View' : 'Update'}
                                                </button>
                                                {resource.resource_status === 'Available' && (
                                                    <button className='delete-resource-button' onClick={() => openDeleteModal(resource)}>Delete</button>
                                                )}
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
                                <a className='resource-title-box-text'>
                                    {selectedResource.resource_status === 'Used' ? 'View Resource Details' : 'Edit Resource Details'}
                                </a>

                                <div className='resource-tooltip'>
                                    <label className='resource-tooltip-icon'>ⓘ</label>
                                    <div className='resource-tooltip-box'>
                                        <label className='resource-tooltip-sub-text'>
                                            This section contains all information about the selected resource. {selectedResource.resource_status === 'Used' ? 'You can only view the resource details.' : 'You can choose to "Update Information" to update the resource.'}
                                        </label>
                                    </div>
                                </div>
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
                                                disabled={selectedResource.resource_status === 'Used'}
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
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                className="resource-input"
                                                disabled={selectedResource.resource_status === 'Used'}
                                            >
                                                <option value="Food">Food</option>
                                                <option value="Medical">Medical</option>
                                                <option value="Hygiene">Hygiene</option>
                                                <option value="Shelter">Shelter</option>
                                                <option value="Power">Power</option>
                                                <option value="Water">Water</option>
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
                                            disabled={selectedResource.resource_status === 'Used'}
                                        />
                                    </div>
                                    <div className='resource-text-box'>
                                        <label>Status:</label>
                                        <select
                                            name="resource_status"
                                            value={formData.resource_status}
                                            onChange={handleInputChange}
                                            className='resource-input'
                                            disabled={selectedResource.resource_status === 'Used'}
                                        >
                                            <option value="Used">Used</option>
                                            <option value="Available">Available</option>
                                        </select>
                                    </div>

                                    <div className='resource-description-container'>

                                        <div className='resource-description-box'>
                                            <label>Description:</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className='resource-description-area'
                                                maxLength={500}
                                                disabled={selectedResource.resource_status === 'Used'}
                                            />
                                            {selectedResource.resource_status !== 'Used' && <p className='resource-description-hint-text'>{500 - charCount} characters remaining</p>}
                                        </div>

                                        <div className='resource-updates-box'>
                                            <label>Updates:</label>
                                            <textarea
                                                name="updates"
                                                value={formData.updates}
                                                onChange={handleInputChange}
                                                className='resource-description-area'
                                                placeholder="Enter any updates here..."
                                                maxLength={500}
                                                disabled={selectedResource.resource_status === 'Used'}
                                            />
                                            {selectedResource.resource_status !== 'Used' && <p className='resource-description-hint-text'>{500 - updatesCharCount} characters remaining</p>}
                                        </div>

                                    </div>

                                    {errorMessages.length > 0 && (
                                        <div className="resource-error-messages">
                                            {errorMessages.map((msg, index) => (
                                                <p key={index} className="resource-error-message">{msg}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {selectedResource.resource_status !== 'Used' && (
                                <div className='update-modal-button-box'>
                                    <button onClick={handleUpdateResource} className='update-modal-button'>Update Information</button>
                                </div>
                            )}
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
                                <a className='resource-title-box-text'>
                                    Add Resource Details
                                </a>

                                <div className='resource-tooltip'>
                                    <label className='resource-tooltip-icon'>ⓘ</label>
                                    <div className='resource-tooltip-box'>
                                        <label className='resource-tooltip-sub-text'>
                                            This section contains all information about adding a resource.
                                            You can choose to "Add Resource" to include a new resource to the table.
                                            If you select "Add Resource" all the necessary details must be filled first.
                                            After adding a resource, the resource would then be visible in the table.
                                        </label>
                                    </div>
                                </div>
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
                                                <option value="Food">Food</option>
                                                <option value="Medical">Medical</option>
                                                <option value="Hygiene">Hygiene</option>
                                                <option value="Shelter">Shelter</option>
                                                <option value="Power">Power</option>
                                                <option value="Water">Water</option>
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
                                                placeholder="Enter any description here..."
                                                maxLength={500}
                                            />
                                            <p className='resource-description-hint-text'>{500 - charCount} characters remaining</p>
                                        </div>
                                    </div>
                                    {errorMessages.length > 0 && (
                                        <div className="resource-error-messages">
                                            {errorMessages.map((msg, index) => (
                                                <p key={index} className="resource-error-message">{msg}</p>
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
