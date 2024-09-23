import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Live.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const Live = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [userBarangay, setUserBarangay] = useState('');
    const [userUsername, setUserUsername] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedYears, setSelectedYears] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
    const [denyDescription, setDenyDescription] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = sessionStorage.getItem('userId');
                if (!userId) {
                    console.error("User ID not found in session storage");
                    return;
                }
                const response = await axios.get(`${apiBaseUrl}/api/user/${userId}`, { withCredentials: true });
                setUserBarangay(response.data.barangay);
                setUserUsername(response.data.username);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/admin`);
                setReports(response.data);
                setIsLoading(false); // Data is loaded
            } catch (error) {
                console.error('Error fetching reports:', error);
                setIsLoading(false); // Data is still loaded
            }
        };

        fetchReports();
        const interval = setInterval(fetchReports, 5000);

        return () => clearInterval(interval);
    }, []);

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

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const filteredReports = reports.filter(report => {
        const reportDate = new Date(report.report_date_time);
        const reportMonth = reportDate.toLocaleString('default', { month: 'long' });
        const reportYear = reportDate.getFullYear();

        return selectedTypes[report.type] &&
            (selectedMonths.length === 0 || selectedMonths.includes(reportMonth)) &&
            (selectedYears.length === 0 || selectedYears.includes(reportYear));
    });

    const currentReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

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

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (!isSubmitting) {
            setIsModalOpen(false);
            setSelectedReport(null);
        }
    };

    const openDenyModal = () => {
        setIsDenyModalOpen(true);
    };

    const closeDenyModal = () => {
        setIsDenyModalOpen(false);
        setDenyDescription(''); // Clear deny description on close
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

    const respondToReport = async () => {
        setIsSubmitting(true); // Start loading state
        try {
            await axios.post(`${apiBaseUrl}/api/respondtoreport`, { reportId: selectedReport._id, responder: userBarangay });
            await logAdminAction('Respond', { reportId: selectedReport._id, responder: userBarangay }, 'Responded to a report');

            // Update the status of the selected report in the state
            setReports(prevReports => prevReports.map(report =>
                report._id === selectedReport._id ? { ...report, status: 'Responded', responder: userBarangay } : report
            ));

            closeModal(); // Close modal after successful response
        } catch (error) {
            console.error('Error responding to report:', error);
        } finally {
            setIsSubmitting(false); // End loading state
        }
    };

    const archiveReport = async () => {
        setIsSubmitting(true); // Start loading state
        try {
            const reportToArchive = {
                reportId: selectedReport._id,
                report_date_time: new Date(selectedReport.report_date_time).toISOString(),
                completion_date_time: new Date().toISOString(),
            };

            await axios.post(`${apiBaseUrl}/api/archivereport`, reportToArchive);
            await logAdminAction('Archive', { reportId: selectedReport._id }, 'Archived a report');

            // Update the status of the selected report in the state
            setReports(prevReports => prevReports.map(report =>
                report._id === selectedReport._id ? { ...report, status: 'Done' } : report
            ));

            closeModal(); // Close modal after successful response
        } catch (error) {
            console.error('Error archiving report:', error);
        } finally {
            setIsSubmitting(false); // End loading state
        }
    };

    const denyReport = async () => {
        setIsSubmitting(true); // Start loading state
        try {
            await axios.post(`${apiBaseUrl}/api/deny`, {
                reportId: selectedReport._id,
                responder: userBarangay,
                deny_description: denyDescription // Send deny description
            });

            await logAdminAction('Deny', { reportId: selectedReport._id, responder: userBarangay }, 'Denied a report');

            // Update the status in the state to reflect the changes
            setReports(prevReports => prevReports.map(report =>
                report._id === selectedReport._id ? { ...report, status: 'Denied', responder: userBarangay } : report
            ));

            closeDenyModal(); // Close deny modal after submission
            closeModal(); // Close main modal
        } catch (error) {
            console.error('Error denying report:', error);
        } finally {
            setIsSubmitting(false); // End loading state
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
        const monthFormatted = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); // Ensure proper case

        if (checked) {
            setSelectedMonths([...selectedMonths, monthFormatted]);
        } else {
            setSelectedMonths(selectedMonths.filter(month => month !== monthFormatted));
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

    const years = Array.from(new Set(reports.map(report => new Date(report.report_date_time).getFullYear())));

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
        <div className='report-content-box'>

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

            <div className='report-table-container'>
                <div className='report-table-box'>
                    <div className='report-table-title-box'>
                        <a className='report-table-title-text'>Live Reports</a>
                        <a className='report-table-description'>
                            ⓘ
                            <span className='tooltip-text'>This page displays all user-submitted reports. You can respond or deny each report as needed.</span>
                        </a>
                    </div>

                    {isLoading ? (
                        <div className='loading-message'>Loading table, please wait...</div>
                    ) : (
                        <table className='report-table'>
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
                                {currentReports.map(report => (
                                    <tr key={report._id}>
                                        <td>{report._id}</td>
                                        <td>{report.name}</td>
                                        <td>{report.type}</td>
                                        <td>
                                            {new Date(report.report_date_time).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                                timeZone: 'UTC'
                                            })}
                                        </td>
                                        <td>{report.status}</td>
                                        <td>
                                            <button onClick={() => handleViewReport(report)} className='live-table-view-button'>
                                                View Information
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
                    <span className='report-page-number'>Page {currentPage} of {totalPages}</span>
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

            {isDenyModalOpen && (
                <div className="live-deny-modal">
                    <div className="live-deny-modal-content">
                        <h3 className="live-deny-modal-title">Provide a reason for denying the report</h3>
                        <textarea
                            value={denyDescription}
                            onChange={(e) => setDenyDescription(e.target.value)}
                            placeholder="Enter deny description"
                            rows={5}
                            className="live-deny-modal-textarea"
                        />
                        <div className="live-deny-modal-buttons">
                            <button onClick={closeDenyModal} disabled={isSubmitting} className="live-deny-modal-cancel-button">
                                Cancel
                            </button>
                            <button onClick={denyReport} disabled={isSubmitting || !denyDescription} className="live-deny-modal-submit-button">
                                {isSubmitting ? 'Processing...' : 'Submit Deny Reason'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="live-reports-modal">
                    <div className="live-reports-modal-content">
                        <div className='live-reports-modal-content-box'>
                            <div className='live-close-modal-button-box'>
                                <button onClick={closeModal} className='live-close-modal-button' disabled={isSubmitting}>
                                    X
                                </button>
                            </div>

                            <div className='live-reports-title-box'>
                                <a className='live-reports-title-box-text'>
                                    Report Details
                                </a>
                            </div>

                            <div className='live-reports-details-container'>
                                <div className='live-reports-details-modal-box'>
                                    <div className='live-reports-text-box'>
                                        <a className='live-reports-title-text'>
                                            Report ID:
                                            <b className='live-reports-content-text'>{selectedReport._id}</b>
                                        </a>
                                        <a className='live-reports-title-text'>
                                            Report Type:
                                            <b className='live-reports-content-text'>{selectedReport.type}</b>
                                        </a>
                                        {selectedReport.responder && (
                                            <a className='live-reports-title-text'>
                                                Responder:
                                                <b className='live-reports-content-text'>{selectedReport.responder}</b>
                                            </a>
                                        )}
                                    </div>
                                    <div className='live-reports-text-box'>
                                        <a className='live-reports-title-text'>
                                            Name:
                                            <b className='live-reports-content-text'>{selectedReport.name}</b>
                                        </a>
                                        {selectedReport.phone && (
                                            <a className='live-reports-title-text'>
                                                Contact no.:
                                                <b className='live-reports-content-text'>{selectedReport.phone}</b>
                                            </a>
                                        )}
                                        {selectedReport.email && (
                                            <a className='live-reports-title-text'>
                                                Email:
                                                <b className='live-reports-content-text'>{selectedReport.email}</b>
                                            </a>
                                        )}
                                    </div>
                                    <div className='live-reports-text-box'>
                                        <a className='live-reports-title-text'>
                                            Report Date & Time:
                                            <b className='live-reports-content-text'>
                                                {new Date(selectedReport.report_date_time).toLocaleString
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
                                        {selectedReport.respond_date_time && (
                                            <a className='live-reports-title-text'>
                                                Respond Date & Time:
                                                <b className='live-reports-content-text'>
                                                    {new Date(selectedReport.respond_date_time).toLocaleString
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
                                        )}
                                    </div>
                                    <div className='live-reports-text-box'>
                                        <a className='live-reports-title-text'>
                                            Status:
                                            <b className='live-reports-content-text'>{selectedReport.status}</b>
                                        </a>
                                        {selectedReport.address && (
                                            <a className='live-reports-title-text'>
                                                Address:
                                                <b className='live-reports-content-text'>{selectedReport.address}</b>
                                            </a>
                                        )}
                                        {selectedReport.location && (
                                            <a className='live-reports-title-text'>
                                                Location:
                                                <b className='live-reports-content-text'>{selectedReport.location}</b>
                                            </a>
                                        )}
                                    </div>
                                    <div className='live-reports-details-container'>
                                        <div className='live-reports-description-box'>
                                            <a className='live-description-title-text'>Description</a>
                                            <div className='live-reports-description-area'>
                                                {selectedReport.description.fire_type && <p><b>Fire Type:</b> {selectedReport.description.fire_type}</p>}
                                                {selectedReport.description.severity && <p><b>Severity:</b> {selectedReport.description.severity}</p>}
                                                {selectedReport.description.visible_flames && <p><b>Visible Flames:</b> {selectedReport.description.visible_flames}</p>}
                                                {selectedReport.description.smoke && <p><b>Smoke:</b> {selectedReport.description.smoke}</p>}
                                                {selectedReport.description.crime_type && <p><b>Crime Type:</b> {selectedReport.description.crime_type}</p>}
                                                {selectedReport.description.in_progress && <p><b>In Progress:</b> {selectedReport.description.in_progress}</p>}
                                                {selectedReport.description.collision_type && <p><b>Collision Type:</b> {selectedReport.description.collision_type}</p>}
                                                {selectedReport.description.severity_of_accident && <p><b>Severity of Accident:</b> {selectedReport.description.severity_of_accident}</p>}
                                                {selectedReport.description.blocked_road && <p><b>Blocked Road:</b> {selectedReport.description.blocked_road}</p>}
                                                {selectedReport.description.number_of_people_involved && <p><b>Number of People Involved:</b> {selectedReport.description.number_of_people_involved}</p>}
                                                {selectedReport.description.medical_emergency_type && <p><b>Medical Emergency Type:</b> {selectedReport.description.medical_emergency_type}</p>}
                                                {selectedReport.description.consciousness && <p><b>Consciousness:</b> {selectedReport.description.consciousness}</p>}
                                                {selectedReport.description.hazard_type && <p><b>Hazard Type:</b> {selectedReport.description.hazard_type}</p>}
                                                <p><b>Additional Description:</b> {selectedReport.description.additional_description}</p>
                                            </div>
                                        </div>
                                        <div className='live-reports-description-box'>
                                            <a className='live-description-title-text'>Images</a>
                                            <div className='live-reports-image-box'>
                                                {selectedReport && selectedReport.images && selectedReport.images.map((image, index) => (
                                                    <div key={index} onClick={() => handleImageClick(image)}>
                                                        {renderImage(image)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='live-update-modal-button-box'>
                                {(!selectedReport.responder || selectedReport.responder === userBarangay) && (
                                    <>
                                        <button
                                            onClick={openDenyModal}
                                            className='live-deny-modal-button'
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Processing...' : 'Deny'}
                                        </button>

                                        <button
                                            onClick={selectedReport.status === 'Responded' ? archiveReport : respondToReport}
                                            className='live-update-modal-button'
                                            disabled={isSubmitting}  // Disable during submission
                                        >
                                            {isSubmitting ? 'Processing...' : selectedReport.status === 'Responded' ? 'Done' : 'Respond'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Live;
