import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Archive.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const Archive = () => {
    const [archives, setArchives] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArchive, setSelectedArchive] = useState(null);
    const [userType, setUserType] = useState('');
    const [userUsername, setUserUsername] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedYears, setSelectedYears] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    // Filtering state
    const [selectedTypes, setSelectedTypes] = useState({
        Fire: true,
        Accident: true,
        Police: true,
        Medical: true,
        Hazard: true,
        Assistance: true
    });
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = sessionStorage.getItem('userId');
                if (!userId) {
                    // Handle the case when userId is not available
                    return;
                }
                const response = await axios.get(`${apiBaseUrl}/api/user/${userId}`, { withCredentials: true });
                setUserType(response.data.type);
                setUserUsername(response.data.username);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchArchives = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/archives`);
                setArchives(response.data);
                setIsLoading(false); // Data is loaded
            } catch (error) {
                console.error('Error fetching archives:', error);
                setIsLoading(false); // Data is still loaded
            }
        };

        fetchArchives();
        const interval = setInterval(fetchArchives, 10000);

        return () => clearInterval(interval);
    }, []);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const filteredArchives = archives.filter(archive => {
        const archiveDate = new Date(archive.report_date_time);
        const archiveMonth = archiveDate.toLocaleString('default', { month: 'long' });
        const archiveYear = archiveDate.getFullYear();

        return selectedTypes[archive.type] &&
            (selectedMonths.length === 0 || selectedMonths.includes(archiveMonth)) &&
            (selectedYears.length === 0 || selectedYears.includes(archiveYear));
    });
    const currentArchives = filteredArchives.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredArchives.length / itemsPerPage);

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

    const handleViewArchive = (archive) => {
        setSelectedArchive(archive);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedArchive(null);
    };

    const logAdminAction = async (action, adminData, description) => {
        const logEntry = {
            username: userUsername,
            action,
            adminData,
            type: 'Report Module',
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

    const deleteArchive = async () => {
        try {
            await axios.post(`${apiBaseUrl}/api/deleteArchive`, { archiveId: selectedArchive._id });
            setArchives(archives.filter(archive => archive._id !== selectedArchive._id));
            await logAdminAction('Archive', { archiveId: selectedArchive._id }, 'Deleted a report');
            closeModal();
        } catch (error) {
            console.error('Error deleting archive:', error);
        }
    };

    const addToHistoryMap = async () => {
        try {
            await axios.post(`${apiBaseUrl}/api/addToHistoryMap`, { archiveId: selectedArchive._id });
            await logAdminAction('Archive', { archiveId: selectedArchive._id }, 'Added a report to history map');
            setArchives(archives.filter(archive => archive._id !== selectedArchive._id));
            closeModal();
        } catch (error) {
            console.error('Error adding to history map:', error);
        }
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setSelectedTypes(prevState => ({
            ...prevState,
            [name]: checked
        }));
    };

    const handleMonthChange = (event) => {
        const { value, checked } = event.target;
        if (checked) {
            setSelectedMonths([...selectedMonths, value]);
        } else {
            setSelectedMonths(selectedMonths.filter(month => month !== value));
        }
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const toggleMonthDropdown = () => {
        setMonthDropdownOpen(!monthDropdownOpen);
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const renderImage = (image) => {
        if (image.startsWith('http://') || image.startsWith('https://')) {
            // URL image
            return <img src={image} alt="Report Image" />;
        } else if (image.startsWith('data:image') || /^[A-Za-z0-9+/]{4}/.test(image)) {
            // Base64 image
            const base64Image = image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`;
            return <img src={base64Image} alt="Report Image" />;
        } else {
            // Handle case where image is neither a URL nor base64
            return <p>Invalid image format</p>;
        }
    };

    const handleImageClick = (img) => {
        setSelectedImage(img);
        setShowImageModal(true);
    };

    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

    const years = Array.from(new Set(archives.map(archive => new Date(archive.report_date_time).getFullYear())));

    const toggleYearDropdown = () => {
        setYearDropdownOpen(!yearDropdownOpen);
    };

    const handleYearChange = (event) => {
        const { value, checked } = event.target;

        if (checked) {
            setSelectedYears([...selectedYears, parseInt(value)]);
        } else {
            setSelectedYears(selectedYears.filter(year => year !== parseInt(value)));
        }
    };


    return (
        <div className='archive-content-box'>

            <div className="filters-content-box">

                <div className='type-dropdown-box'>
                    <button onClick={toggleDropdown} className="type-dropdown-button">Sort by Type</button>
                    {dropdownOpen && (
                        <div className="type-dropdown-content">
                            {Object.keys(selectedTypes).map(type => (
                                <label key={type}>
                                    <input
                                        type="checkbox"
                                        name={type}
                                        checked={selectedTypes[type]}
                                        onChange={handleCheckboxChange}
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="month-dropdown-box">
                    <button onClick={toggleMonthDropdown} className="month-dropdown-button">Sort by Month</button>
                    {monthDropdownOpen && (
                        <div className="month-dropdown-content">
                            {months.map(month => (
                                <label key={month}>
                                    <input
                                        type="checkbox"
                                        value={month}
                                        checked={selectedMonths.includes(month)}
                                        onChange={handleMonthChange}
                                    />
                                    {month}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="year-dropdown-box">
                    <button onClick={toggleYearDropdown} className="year-dropdown-button">Sort by Year</button>
                    {yearDropdownOpen && (
                        <div className="year-dropdown-content">
                            {years.map(year => (
                                <label key={year}>
                                    <input
                                        type="checkbox"
                                        value={year}
                                        checked={selectedYears.includes(year)}
                                        onChange={handleYearChange}
                                    />
                                    {year}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <div className='archive-table-container'>
                <div className='archive-table-box'>
                    <div className='archive-table-title-box'>
                        <a className='archive-table-title-text'>History Reports</a>
                        <a className='archive-table-description'>
                            ⓘ
                            <span className='tooltip-text'>This page displays all user-submitted historical reports. You can add reports to the history map or delete denied reports.</span>
                        </a>
                    </div>

                    {isLoading ? (
                        <div className='loading-message'>Loading table, please wait...</div>
                    ) : (
                        <table className='archive-table'>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Date and Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentArchives.map(archive => (
                                    <tr key={archive._id}>
                                        <td>{archive._id}</td>
                                        <td>{archive.name}</td>
                                        <td>{archive.type}</td>
                                        <td>{new Date(archive.report_date_time).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true,
                                            timeZone: 'UTC'
                                        })}
                                        </td>
                                        <td>{archive.status}</td>
                                        <td>
                                            <button onClick={() => handleViewArchive(archive)} className='archive-table-view-button'>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className='pagination'>
                    <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                    <span className='archive-table-page-number'>Page {currentPage} of {totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>

            {showImageModal && (
                <div className="image-modal" onClick={() => setShowImageModal(false)}>
                    <div className="image-modal-content">
                        <img
                            src={selectedImage.startsWith('http') ? selectedImage : `data:image/jpeg;base64,${selectedImage}`}
                            alt="Enlarged View"
                        />
                    </div>
                </div>
            )}

            {isModalOpen && selectedArchive && (
                <div className="archive-reports-modal">
                    <div className="archive-reports-modal-content">
                        <div className='archive-reports-modal-content-box'>
                            <div className='archive-close-modal-button-box'>
                                <button onClick={closeModal} className='archive-close-modal-button'>X</button>
                            </div>

                            <div className='archive-reports-title-box'>
                                <a className='archive-reports-title-box-text'>
                                    Historical Report Details
                                </a>

                                <div className='archive-reports-tooltip'>
                                    <label className='archive-reports-tooltip-icon'>ⓘ</label>
                                    <div className='archive-reports-tooltip-box'>
                                        <label className='archive-reports-tooltip-sub-text'>
                                            This section contains all information about the incident and the reporter.
                                            You can choose to "Add to History Map" the report.
                                            If the report is denied you can "Delete" the report from the table.
                                        </label>
                                    </div>
                                </div>

                            </div>

                            <div className='archive-reports-details-container'>
                                <div className='archive-reports-details-modal-box'>

                                    <div className='archive-reports-details-section-box'>

                                        <div className='archive-reports-text-box'>
                                            <a className='archive-reports-title-text'>
                                                Status:
                                                <b className='archive-reports-content-text'>{selectedArchive.status}</b>
                                            </a>
                                            <a className='archive-reports-title-text'>
                                                Report Type:
                                                <b className='archive-reports-content-text'>{selectedArchive.type}</b>
                                            </a>
                                            <a className='archive-reports-title-text'>
                                                Responder:
                                                <b className='archive-reports-content-text'>{selectedArchive.responder}</b>
                                            </a>
                                        </div>
                                        <div className='archive-reports-text-box'>
                                            <a className='archive-reports-title-text'>
                                                Name:
                                                <b className='archive-reports-content-text'>{selectedArchive.name}</b>
                                            </a>
                                            {selectedArchive.phone && (
                                                <a className='archive-reports-title-text'>
                                                    Contact No.:
                                                    <b className='archive-reports-content-text'>{selectedArchive.phone}</b>
                                                </a>
                                            )}
                                            {selectedArchive.email && (
                                                <a className='archive-reports-title-text'>
                                                    Email:
                                                    <b className='archive-reports-content-text'>{selectedArchive.email}</b>
                                                </a>
                                            )}
                                        </div>
                                        <div className='archive-reports-text-box'>
                                            <a className='archive-reports-title-text'>
                                                Report Date & Time:
                                                <b className='archive-reports-content-text'>
                                                    {new Date(selectedArchive.report_date_time).toLocaleString
                                                        ('en-US',
                                                            {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                second: '2-digit',
                                                                hour12: true,
                                                                timeZone: 'UTC'
                                                            }
                                                        )
                                                    }
                                                </b>
                                            </a>
                                            <a className='archive-reports-title-text'>
                                                Respond Date & Time:
                                                <b className='archive-reports-content-text'>
                                                    {new Date(selectedArchive.respond_date_time).toLocaleString
                                                        ('en-US',
                                                            {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                second: '2-digit',
                                                                hour12: true,
                                                                timeZone: 'UTC'
                                                            }
                                                        )
                                                    }
                                                </b>
                                            </a>
                                            <a className='archive-reports-title-text'>
                                                Completion Date & Time:
                                                <b className='archive-reports-content-text'>
                                                    {new Date(selectedArchive.completion_date_time).toLocaleString
                                                        ('en-US',
                                                            {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                second: '2-digit',
                                                                hour12: true,
                                                                timeZone: 'UTC'
                                                            }
                                                        )
                                                    }
                                                </b>
                                            </a>
                                        </div>
                                        <div className='archive-reports-text-box'>
                                            {selectedArchive.address && (
                                                <a className='archive-reports-title-text'>
                                                    Address:
                                                    <b className='archive-reports-content-text'>{selectedArchive.address}</b>
                                                </a>
                                            )}
                                            {selectedArchive.location && (
                                                <a className='archive-reports-title-text'>
                                                    Location:
                                                    <b className='archive-reports-content-text'>{selectedArchive.location}</b>
                                                </a>
                                            )}
                                        </div>

                                    </div>

                                    <div className='archive-reports-details-container'>
                                        <div className='archive-reports-description-box'>
                                            <a className='archive-description-title-text'>Description</a>
                                            <div className='archive-reports-description-area'>
                                                {selectedArchive.description.fire_type && <p><b>Fire Type:</b> {selectedArchive.description.fire_type}</p>}
                                                {selectedArchive.description.severity && <p><b>Severity:</b> {selectedArchive.description.severity}</p>}
                                                {selectedArchive.description.visible_flames && <p><b>Visible Flames:</b> {selectedArchive.description.visible_flames}</p>}
                                                {selectedArchive.description.smoke && <p><b>Smoke:</b> {selectedArchive.description.smoke}</p>}
                                                {selectedArchive.description.crime_type && <p><b>Crime Type:</b> {selectedArchive.description.crime_type}</p>}
                                                {selectedArchive.description.in_progress && <p><b>In Progress:</b> {selectedArchive.description.in_progress}</p>}
                                                {selectedArchive.description.collision_type && <p><b>Collision Type:</b> {selectedArchive.description.collision_type}</p>}
                                                {selectedArchive.description.severity_of_accident && <p><b>Severity of Accident:</b> {selectedArchive.description.severity_of_accident}</p>}
                                                {selectedArchive.description.blocked_road && <p><b>Blocked Road:</b> {selectedArchive.description.blocked_road}</p>}
                                                {selectedArchive.description.number_of_people_involved && <p><b>Number of People Involved:</b> {selectedArchive.description.number_of_people_involved}</p>}
                                                {selectedArchive.description.medical_emergency_type && <p><b>Medical Emergency Type:</b> {selectedArchive.description.medical_emergency_type}</p>}
                                                {selectedArchive.description.consciousness && <p><b>Consciousness:</b> {selectedArchive.description.consciousness}</p>}
                                                {selectedArchive.description.hazard_type && <p><b>Hazard Type:</b> {selectedArchive.description.hazard_type}</p>}
                                                {selectedArchive.description.deny_description && <p><b>Deny Description:</b> {selectedArchive.description.deny_description}</p>}
                                                {selectedArchive.description.assistance_type && <p><b>Assistance Type:</b> {selectedArchive.description.assistance_type}</p>}
                                                <p><b>Additional Description:</b> {selectedArchive.description.additional_description}</p>
                                            </div>
                                        </div>
                                        <div className='archive-reports-description-box'>
                                            <a className='archive-description-title-text'>Images</a>
                                            <div className='archive-reports-image-box'>
                                                {selectedArchive && selectedArchive.images && selectedArchive.images.map((image, index) => (
                                                    <div key={index} onClick={() => handleImageClick(image)}>
                                                        {renderImage(image)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='archive-update-modal-button-box'>
                                {userType !== "Barangay" && selectedArchive.status !== "Archived" && (
                                    <button onClick={deleteArchive} className='archive-delete-modal-button'>Delete</button>
                                )}
                                {userType !== "Barangay" && selectedArchive.status !== "Denied" && (
                                    <button onClick={addToHistoryMap} className='archive-update-modal-button'>Add to History Map</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Archive;
