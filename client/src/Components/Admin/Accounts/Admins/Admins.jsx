import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Admins.css';
import {
    validateName,
    validateEmail,
    validateUsername,
    validatePassword,
    validateBarangay,
    validateType,
    validateContact
} from './inputValidation';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const Admins = () => {
    const [admins, setAdmins] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        barangay: '',
        type: '',
        contact: '+63' // Initialize contact with a valid default value
    });
    const [selectedAdminId, setSelectedAdminId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const itemsPerPage = 9;
    const [errors, setErrors] = useState({});
    const [userUsername, setUserUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);

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
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/administrators`);
                const sortedAdmins = response.data.sort((a, b) => {
                    // Move 'root' admin to the top
                    if (a.username === 'root') return -1;
                    if (b.username === 'root') return 1;
                    return 0;
                });
                setAdmins(sortedAdmins);
                setIsLoading(false); // Data is loaded
            } catch (error) {
                console.error("Error fetching admins:", error);
                setIsLoading(false);
            }
        };

        fetchAdmins();
        const interval = setInterval(fetchAdmins, 5000);

        return () => clearInterval(interval);
    }, []);


    const validateForm = () => {
        const errors = {};
        errors.name = validateName(formData.name);
        errors.email = validateEmail(formData.email);
        errors.username = validateUsername(formData.username);
        errors.password = validatePassword(formData.password);
        errors.barangay = validateBarangay(formData.barangay);
        errors.type = validateType(formData.type);
        errors.contact = validateContact(formData.contact);

        setErrors(errors);
        return Object.values(errors).every((error) => error === "");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const logAdminAction = async (action, adminData, description) => {
        const logEntry = {
            username: userUsername,
            action,
            adminData,
            type: 'Account Module',
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

    const handleAddEditAdmin = async () => {
        if (validateForm()) {
            try {
                let duplicateCheckPassed = true;

                if (!isEditMode) {
                    const duplicateCheckResponse = await axios.post(`${apiBaseUrl}/api/check-duplicate`, {
                        username: formData.username,
                        email: formData.email,
                        contact: formData.contact
                    });

                    if (duplicateCheckResponse.status !== 200) {
                        duplicateCheckPassed = false;
                        setErrors({ ...errors, username: '• Username or email already exists' });
                    }
                }

                if (duplicateCheckPassed) {
                    if (isEditMode) {
                        await axios.put(`${apiBaseUrl}/api/administrators/${selectedAdminId}`, formData);
                        await logAdminAction('Edit', { adminId: selectedAdminId, updatedData: formData }, 'Edited admin details');
                    } else {
                        await axios.post(`${apiBaseUrl}/api/administrators`, formData);
                        await logAdminAction('Add', formData, 'Added new admin');
                    }

                    setIsModalOpen(false);
                    setFormData({ name: '', email: '', username: '', password: '', barangay: '', type: '', contact: '+63' }); // Reset contact to '+63'
                }
            } catch (error) {
                if (error.response && error.response.status === 400 && !isEditMode) {
                    setErrors({ ...errors, username: '• Username or email already exists' });
                } else {
                    console.error("Error adding/editing admin:", error);
                }
            }
        }
    };

    const handleDeleteAdmin = async () => {
        try {
            await axios.delete(`${apiBaseUrl}/api/administrators/${selectedAdminId}`);
            await logAdminAction('Delete', { adminId: selectedAdminId, updatedData: formData }, 'Deleted an Admin');
        } catch (error) {
            console.error("Error deleting admin:", error);
        }
        setShowDeleteModal(false);
        setSelectedAdminId(null);
    };

    const handleEditClick = (admin) => {
        setSelectedAdminId(admin._id);
        setFormData({ name: admin.name, email: admin.email, username: admin.username, password: '', barangay: admin.barangay, type: admin.type, contact: admin.contact }); // Set contact for editing
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const openDeleteModal = (adminId) => {
        setSelectedAdminId(adminId);
        setShowDeleteModal(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setShowDeleteModal(false);
        setFormData({ name: '', email: '', username: '', password: '', barangay: '', type: '', contact: '+63' }); // Reset contact to '+63'
        setSelectedAdminId(null);
        setErrors({});
    };

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAdmins = admins.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(admins.length / itemsPerPage);

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
        <div className="admins-content-box">
            <div className='admins-button-box'>
                <button className='add-admins-button' onClick={handleAddClick}>Add Admins</button>
            </div>

            <div className='admins-table-container'>
                <div className='admins-table-box'>
                    <div className='admins-table-title-box'>
                        <a className='admins-table-title-text'>Admin Accounts</a>
                        <a className='admins-table-description'>
                            ⓘ
                            <span className='tooltip-text'>This page allows to view, create, edit and delete all listed administrator account but some information can not be tampered with on this page.</span>
                        </a>
                    </div>

                    {isLoading ? (
                        <div className='loading-message'>Loading table, please wait...</div>
                    ) : (
                        <table className='admins-table'>
                            <thead>
                                <tr>
                                    <th>Admin ID</th>
                                    <th>Name</th>
                                    <th>E-mail</th>
                                    <th>Type</th>
                                    <th>Barangay</th>
                                    <th>Contact</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentAdmins
                                    .filter(admin => admin.username !== 'root')
                                    .map(admin => (
                                        <tr key={admin._id}>
                                            <td>{admin._id}</td>
                                            <td>{admin.name}</td>
                                            <td>{admin.email}</td>
                                            <td>{admin.type}</td>
                                            <td>{admin.barangay}</td>
                                            <td>{admin.contact}</td>
                                            <td>
                                                {new Date(admin.createdAt).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td>
                                                <div className='action-button-box'>
                                                    <button className='view-admins-button' onClick={() => handleEditClick(admin)}>Edit</button>
                                                    {userUsername !== admin.username && (
                                                        <button className='delete-admins-button' onClick={() => openDeleteModal(admin._id)}>Delete</button>
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
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>

            {isModalOpen && (
                <div className="admin-modal">
                    <div className="admin-modal-content">
                        <div className='admin-modal-content-box'>
                            <div className='close-modal-button-box'>
                                <button onClick={closeModal} className='close-modal-button'>X</button>
                            </div>

                            <div className='admin-title-box'>
                                <a className='admin-title-box-text'>
                                    <a>{isEditMode ? "Edit Admin" : "Add Admin"}</a>
                                </a>

                                <div className='accounts-tooltip'>
                                    <label className='accounts-tooltip-icon'>ⓘ</label>
                                    <div className='accounts-tooltip-box'>
                                        <label className='accounts-tooltip-sub-text'>
                                            This section contains all information about the administrator account.
                                            You can choose to "Add" or "Update" the administrator details with the required details to be filled.
                                            If you select "Add" or "Update" it will update and reflect the administrator details on the table.
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className='admin-details-container'>
                                <div className='admin-details-modal-box'>
                                    <div className='admin-content-cont'>
                                        <div className='admin-text-box'>
                                            <label className='admin-label'>Name:</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="admin-input"
                                                disabled={formData.username === 'root'}
                                                onBlur={() => setErrors({ ...errors, name: validateName(formData.name) })}
                                            />
                                        </div>
                                        <div className='admin-text-box'>
                                            <label className='admin-label'>Email:</label>
                                            <input
                                                type="text"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="admin-input"
                                                disabled={formData.username === 'root'}
                                                onBlur={() => setErrors({ ...errors, email: validateEmail(formData.email) })}
                                            />
                                        </div>
                                        <div className='admin-text-box'>
                                            <label className='admin-label'>Contact Number:</label>
                                            <div className="contact-input-group">
                                                <span className="contact-prefix">+63</span>
                                                <input
                                                    type="tel"
                                                    name="contact"
                                                    className="admin-input"
                                                    value={formData.contact ? formData.contact.replace(/^\+63/, '') : ''}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value.replace(/^0+/, '');
                                                        setFormData({ ...formData, contact: `+63${newValue}` });
                                                    }}
                                                    maxLength={10} // Limit to 10 digits
                                                    placeholder="9xxxxxxxxx"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                    <div className='admin-content-cont'>
                                        <div className='admin-text-box'>
                                            <label className='admin-label'>Username:</label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                className="admin-input"
                                                disabled={formData.username === 'root'}
                                                onBlur={() => setErrors({ ...errors, username: validateUsername(formData.username) })}
                                            />
                                        </div>
                                        <div className='admin-text-box'>
                                            <label className='admin-label'>Password:</label>
                                            <input
                                                type="text"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="admin-input"
                                                onBlur={() => setErrors({ ...errors, password: validatePassword(formData.password) })}
                                            />
                                        </div>
                                    </div>

                                    <div className='admin-content-cont'>
                                        <div className='admin-text-box'>
                                            <label className='admin-label'>Barangay:</label>
                                            <select
                                                name="barangay"
                                                value={formData.barangay}
                                                onChange={handleInputChange}
                                                className="admin-input"
                                                disabled={formData.username === 'root'}
                                                onBlur={() => setErrors({ ...errors, barangay: validateBarangay(formData.barangay) })}
                                            >
                                                <option value="">Select Barangay</option>
                                                <option value="MDRRMO">MDRRMO</option>
                                                <option value="Dolores">Dolores</option>
                                                <option value="Muzon">Muzon</option>
                                                <option value="San Isidro">San Isidro</option>
                                                <option value="San Juan">San Juan</option>
                                                <option value="Santa Ana">Santa Ana</option>
                                            </select>
                                        </div>
                                        <div className='admin-text-box'>
                                            <label className='admin-label'>Type:</label>
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                className="admin-input"
                                                disabled={formData.username === 'root'}
                                                onBlur={() => setErrors({ ...errors, type: validateType(formData.type) })}
                                            >
                                                <option value="">Select Type</option>
                                                <option value="MDRRMO">MDRRMO</option>
                                                <option value="Barangay">Barangay</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className='admin-text-box'>

                                        <div className='error-box'>
                                            {errors.name && <div className="error">{errors.name}</div>}
                                            {errors.username && <div className="error">{errors.username}</div>}
                                            {errors.email && <div className="error">{errors.email}</div>}
                                            {errors.contact && <div className="error">{errors.contact}</div>}
                                            {errors.password && <div className="error">{errors.password}</div>}
                                            {errors.barangay && <div className="error">{errors.barangay}</div>}
                                            {errors.type && <div className="error">{errors.type}</div>}
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className='update-admin-modal-button-box'>
                                <button className='update-admin-modal-button' onClick={handleAddEditAdmin}>{isEditMode ? "Update Admin" : "Add Admin"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="delete-modal">
                    <div className="delete-content">
                        <div className='delete-message'>
                            <p>Delete Admin?</p>
                            <a>You won’t be able to undo this action. Are you sure?</a>
                        </div>
                        <div className='delete-choice'>
                            <button className='delete-choice-button' onClick={closeModal}>Cancel</button>
                            <button className='delete-confirm-button' onClick={handleDeleteAdmin}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admins;
