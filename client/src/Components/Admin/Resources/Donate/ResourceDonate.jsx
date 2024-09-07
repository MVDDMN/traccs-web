import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ResourceDonate.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ResourceDonate = () => {
    const [donations, setDonations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [userUsername, setUserUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [formValues, setFormValues] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        donationType: '',
        type: '',
        donationAmount: '',
        description: '',
        selectedBarangay: '',
        image: '',
    });
    const itemsPerPage = 9;

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
        const fetchDonations = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/donations`);
                setDonations(response.data);
                setIsLoading(false); // Data is loaded
            } catch (error) {
                console.error("Error fetching donations:", error);
                setIsLoading(false); // Data is still loaded
            }
        };

        fetchDonations();
        const interval = setInterval(fetchDonations, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleViewDonation = (donation) => {
        setSelectedDonation(donation);
        setIsModalOpen(true);
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

    const handleEditDonation = (donation) => {
        setSelectedDonation(donation);
        setFormValues({
            firstName: donation.firstName,
            lastName: donation.lastName,
            email: donation.email,
            contactNumber: donation.contactNumber,
            donationType: donation.donationType,
            type: donation.type,
            donationAmount: donation.donationAmount,
            description: donation.description,
            selectedBarangay: donation.selectedBarangay,
            image: donation.image,
        });
        setIsEditModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDonation(null);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedDonation(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Define the maximum allowed image size in bytes (e.g., 10MB)
        const maxImageSize = 10 * 1024 * 1024; // 10MB

        // Check if the image size exceeds the maximum allowed size
        if (formValues.image) {
            const base64Length = formValues.image.length;
            const padding = (formValues.image.charAt(base64Length - 2) === "=") ? 2 : ((formValues.image.charAt(base64Length - 1) === "=") ? 1 : 0);
            const imageSize = (base64Length * 3 / 4) - padding;

            if (imageSize > maxImageSize) {
                alert("The image size is too large. Please upload an image smaller than 10MB.");
                return;
            }
        }

        try {
            await axios.put(`${apiBaseUrl}/api/donations/${selectedDonation._id}`, formValues);
            await logAdminAction('Edit', { donationId: selectedDonation._id, updatedData: formValues }, 'Updated donation details');
            const updatedDonations = donations.map(donation =>
                donation._id === selectedDonation._id ? { ...donation, ...formValues } : donation
            );
            setDonations(updatedDonations);
            closeEditModal();
        } catch (error) {
            console.error("Error updating donation:", error);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxSize = 600;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Get the resized image as base64, but without the data URL prefix
                    const resizedBase64 = canvas.toDataURL(file.type);
                    const base64Data = resizedBase64.replace(/^data:image\/[a-z]+;base64,/, '');
                    console.log('Resized Base64 string size (bytes):', base64Data.length);

                    // Set the image data without the prefix
                    setFormValues({ ...formValues, image: base64Data });
                };
                img.src = reader.result;
            };

            reader.readAsDataURL(file);
        }
    };

    const handleImageClick = () => {
        document.getElementById('image-upload').click();
    };

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
        <div className="donations-content-box">
            <div className='donations-table-container'>
                <div className='donations-table-box'>
                    <div className='donations-table-title-box'>
                        <a className='donations-table-title-text'>Donations</a>
                        <a className='donations-table-description'>
                            ⓘ
                            <span className='tooltip-text'>This page contains all the donations made by the users.</span>
                        </a>
                    </div>
                    {isLoading ? (
                        <div className='loading-message'>Loading table, please wait...</div>
                    ) : (
                        <table className='donations-table'>

                            <thead>
                                <tr>
                                    <th>Donation ID</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Email</th>
                                    <th>Donation Type</th>
                                    <th>Type</th>
                                    <th>Donation Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentDonations.map(donation => (
                                    <tr key={donation._id}>
                                        <td>{donation._id}</td>
                                        <td>{donation.firstName}</td>
                                        <td>{donation.lastName}</td>
                                        <td>{donation.email}</td>
                                        <td>{donation.donationType}</td>
                                        <td>{donation.type}</td>
                                        <td>{donation.donationAmount}</td>
                                        <td>
                                            <div className='action-button-box'>
                                                <button className='view-donations-button' onClick={() => handleEditDonation(donation)}>Update</button>
                                                <button className='view-donations-button' onClick={() => handleViewDonation(donation)}>View</button>
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

            {isModalOpen && selectedDonation && (
                <div className="donations-modal">
                    <div className="donations-modal-content">
                        <div className='donations-modal-content-box'>
                            <div className='close-modal-button-box'>
                                <button onClick={closeModal} className='close-modal-button'>X</button>
                            </div>

                            <div className='donations-title-box'>
                                <h2>Donation Details</h2>
                            </div>

                            <div className='donations-details-container'>
                                <div className='donations-details-modal-box'>

                                    <div className='donations-division-container'>

                                        <div className='donations-divider-box'>

                                            <div className='donations-text-box'>
                                                <a className='donations-title-text'>
                                                    Donation ID:
                                                    <b className='donations-content-text'>{selectedDonation._id}</b>
                                                </a>
                                            </div>
                                            <div className='donations-text-box'>
                                                <a className='donations-title-text'>
                                                    First Name:
                                                    <b className='donations-content-text'>{selectedDonation.firstName}</b>
                                                </a>
                                            </div>
                                            <div className='donations-text-box'>
                                                <a className='donations-title-text'>
                                                    Last Name:
                                                    <b className='donations-content-text'>{selectedDonation.lastName}</b>
                                                </a>
                                            </div>
                                            <div className='donations-text-box'>
                                                <a className='donations-title-text'>
                                                    Email:
                                                    <b className='donations-content-text'>{selectedDonation.email}</b>
                                                </a>
                                            </div>
                                            <div className='donations-text-box'>
                                                <a className='donations-title-text'>
                                                    Contact Number:
                                                    <b className='donations-content-text'>{selectedDonation.contactNumber}</b>
                                                </a>
                                            </div>

                                        </div>

                                        <div className='donations-divider-box'>

                                            <div className='donations-text-box'>
                                                <a className='donations-title-text'>
                                                    Donation Type:
                                                    <b className='donations-content-text'>{selectedDonation.donationType}</b>
                                                </a>
                                            </div>
                                            <div className='donations-text-box'>
                                                <a className='donations-title-text'>
                                                    Type:
                                                    <b className='donations-content-text'>{selectedDonation.type}</b>
                                                </a>
                                            </div>
                                            <div className='donations-text-box'>
                                                <a className='donations-title-text'>
                                                    Donation Amount:
                                                    <b className='donations-content-text'>{selectedDonation.donationAmount}</b>
                                                </a>
                                            </div>
                                            <div className='donations-text-box'>
                                                <a className='donations-title-text'>
                                                    Selected Barangay:
                                                    <b className='donations-content-text'>{selectedDonation.selectedBarangay}</b>
                                                </a>
                                            </div>
                                            <div className='donations-description-box'>
                                                <a className='description-title-text'>Description</a>
                                                <textarea className='donations-description-area' value={selectedDonation.description} readOnly />
                                            </div>

                                        </div>

                                        <div className='donations-divider-box-image'>
                                            {selectedDonation.image && (
                                                <img
                                                    src={`data:image/jpeg;base64,${selectedDonation.image}`}
                                                    alt="Donation"
                                                    className='donations-preview-img'
                                                    onClick={() => setIsImageModalOpen(true)}
                                                />
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isImageModalOpen && selectedDonation.image && (
                <div className="image-modal">
                    <span className="close-image-modal" onClick={() => setIsImageModalOpen(false)}>&times;</span>
                    <div className="image-modal-content">
                        <img
                            src={`data:image/jpeg;base64,${selectedDonation.image}`}
                            alt="Full Donation"
                            className='full-image'
                        />
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="donations-modal">
                    <div className="donations-modal-content">
                        <div className='donations-modal-content-box'>
                            <div className='close-modal-button-box'>
                                <button onClick={closeEditModal} className='close-modal-button'>X</button>
                            </div>

                            <div className='donations-title-box'>
                                <h2>Edit Donation</h2>
                            </div>

                            <div className='donations-details-container'>

                                <div className='donations-details-modal-box'>
                                    <form className='donations-form-box' onSubmit={handleFormSubmit}>

                                        <div className='donations-division-container'>

                                            <div className='donations-divider-box'>

                                                <div className='donations-text-box'>
                                                    <a className='donations-title-text'>
                                                        Donation ID:
                                                        <b className='donations-content-text'>{selectedDonation._id}</b>
                                                    </a>
                                                </div>

                                                <div className='donations-text-box'>
                                                    <a className='donations-title-text'>
                                                        First Name:
                                                        <b className='donations-content-text'>{selectedDonation.firstName}</b>
                                                    </a>
                                                </div>

                                                <div className='donations-text-box'>
                                                    <a className='donations-title-text'>
                                                        Last Name:
                                                        <b className='donations-content-text'>{selectedDonation.lastName}</b>
                                                    </a>
                                                </div>

                                                <div className='donations-text-box'>
                                                    <a className='donations-title-text'>
                                                        Email:
                                                        <b className='donations-content-text'>{selectedDonation.email}</b>
                                                    </a>
                                                </div>

                                                <div className='donations-text-box'>
                                                    <a className='donations-title-text'>
                                                        Contact Number:
                                                        <b className='donations-content-text'>{selectedDonation.contactNumber}</b>
                                                    </a>
                                                </div>

                                            </div>

                                            <div className='donations-divider-box'>

                                                <div className='donations-text-box'>
                                                    <a className='donations-title-text'>
                                                        Donation Type:
                                                        <b className='donations-content-text'>{selectedDonation.donationType}</b>
                                                    </a>
                                                </div>

                                                <div className='donations-text-box'>
                                                    <a className='donations-title-text'>
                                                        Type:
                                                        <b className='donations-content-text'>{selectedDonation.type}</b>
                                                    </a>
                                                </div>

                                                <div className='donations-text-box'>
                                                    <a className='donations-title-text'>
                                                        Donation Amount:
                                                        <b className='donations-content-text'>{selectedDonation.donationAmount}</b>
                                                    </a>
                                                </div>

                                                <div className='donations-text-box'>
                                                    <a className='donations-title-text'>
                                                        Selected Barangay:
                                                        <b className='donations-content-text'>{selectedDonation.selectedBarangay}</b>
                                                    </a>
                                                </div>

                                                <div className='donations-description-box'>
                                                    <a className='description-title-text'>Description</a>
                                                    <textarea className='donations-description-area' value={selectedDonation.description} readOnly />
                                                </div>

                                            </div>

                                            <div className='donations-divider-box-image'>
                                                <div className='donations-image-upload-box'>
                                                    <input
                                                        type="file"
                                                        name="image"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className='donations-image-input'
                                                        id="image-upload"
                                                    />
                                                    {!formValues.image && (
                                                        <label htmlFor="image-upload" className='donations-image-label'>
                                                            +
                                                        </label>
                                                    )}
                                                </div>

                                                {formValues.image && (
                                                    <div className="donations-image-preview">
                                                        <img
                                                            src={`data:image/jpeg;base64,${formValues.image}`}
                                                            alt="Uploaded"
                                                            className="donations-preview-img"
                                                            onClick={handleImageClick}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                        </div>

                                        <div className='update-donation-button-box'>
                                            <button type="submit" className='update-donation-button'>Update Donation</button>
                                        </div>

                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ResourceDonate;




