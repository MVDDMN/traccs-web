import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import './Dashboard.css';
import fireicon from '../../Assets/fire.png';
import accidenticon from '../../Assets/accident.png';
import policeicon from '../../Assets/police.png';
import medicalicon from '../../Assets/medical.png';
import hazardicon from '../../Assets/hazard.png';
import assistanceicon from '../../Assets/assistance.png';
import usericon from '../../Assets/user.png';
import maplegends from '../../Assets/Legends.png';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Map icons
import accidentmapicon from '../../Assets/map/accident.png';
import firemapicon from '../../Assets/map/fire.png';
import hazardmapicon from '../../Assets/map/hazard.png';
import medicalmapicon from '../../Assets/map/medical.png';
import policemapicon from '../../Assets/map/police.png';
import assistancemapicon from '../../Assets/map/assistance.png';
import defaultmapicon from '../../Assets/location.png';

import 'leaflet/dist/leaflet.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const fireMapIcon = new L.Icon({
    iconUrl: firemapicon,
    iconSize: [25, 25],
});

const accidentMapIcon = new L.Icon({
    iconUrl: accidentmapicon,
    iconSize: [25, 25],
});

const policeMapIcon = new L.Icon({
    iconUrl: policemapicon,
    iconSize: [25, 25],
});

const medicalMapIcon = new L.Icon({
    iconUrl: medicalmapicon,
    iconSize: [25, 25],
});

const hazardMapIcon = new L.Icon({
    iconUrl: hazardmapicon,
    iconSize: [25, 25],
});

const assistanceMapIcon = new L.Icon({
    iconUrl: assistancemapicon,
    iconSize: [35, 35],
});

const defaultMapIcon = new L.Icon({
    iconUrl: defaultmapicon,
    iconSize: [25, 25],
});

const getMapIcon = (type) => {
    switch (type) {
        case 'Fire':
            return fireMapIcon;
        case 'Accident':
            return accidentMapIcon;
        case 'Police':
            return policeMapIcon;
        case 'Medical':
            return medicalMapIcon;
        case 'Hazard':
            return hazardMapIcon;
        case 'Assistance':
            return assistanceMapIcon;
        default:
            return defaultMapIcon;
    }
};

const Dashboard = () => {
    const [reports, setReports] = useState([]);
    const [reportCounts, setReportCounts] = useState({});
    const [filter, setFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isResponded, setIsResponded] = useState(false);
    const [userBarangay, setUserBarangay] = useState('');
    const [userUsername, setUserUsername] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [locationReportCounts, setLocationReportCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [autoTrack, setAutoTrack] = useState(false);
    const [showCircles, setShowCircles] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
    const [denyDescription, setDenyDescription] = useState('');
    const mapRef = useRef();


    const fetchReports = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/api/admin`);
            setReports(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reports:', error);
            setLoading(false);
        }
    };

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
        fetchReports();
        const interval = setInterval(fetchReports, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const counts = reports.reduce((acc, report) => {
            acc[report.type] = (acc[report.type] || 0) + 1;
            return acc;
        }, {});
        setReportCounts(counts);
    }, [reports]);

    const handleFilterChange = (type) => {
        setFilter(type);
        console.log("Current filter:", type);
    };

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setIsResponded(report.status === 'Responded');
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
        setDenyDescription('');
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
        setIsSubmitting(true);
        try {
            await axios.post(`${apiBaseUrl}/api/respondtoreport`, { reportId: selectedReport._id, responder: userBarangay });

            setIsResponded(true);

            // Update the local state to reflect the changes immediately
            setReports(prevReports => prevReports.map(report =>
                report._id === selectedReport._id ? { ...report, status: 'Responded', responder: userBarangay } : report
            ));

            await logAdminAction('Respond', { reportId: selectedReport._id, responder: userBarangay }, 'Responded to a report');

            closeModal();
        } catch (error) {
            console.error('Error responding to report:', error);
        } finally {
            fetchReports();
            setIsSubmitting(false);
        }
    };

    const denyReport = async () => {
        setIsSubmitting(true);
        try {
            await axios.post(`${apiBaseUrl}/api/deny`, {
                reportId: selectedReport._id,
                responder: userBarangay,
                deny_description: denyDescription // Send deny description to backend
            });

            // Update the local state to reflect the changes immediately
            setReports(prevReports => prevReports.map(report =>
                report._id === selectedReport._id ? { ...report, status: 'Denied', responder: userBarangay } : report
            ));

            await logAdminAction('Deny', { reportId: selectedReport._id, responder: userBarangay }, 'Denied a report');

            closeDenyModal(); // Close the deny description modal
            closeModal(); // Close the main modal
        } catch (error) {
            console.error('Error denying report:', error);
        } finally {
            fetchReports();
            setIsSubmitting(false);
        }
    };

    const archiveReport = async () => {
        setIsSubmitting(true);
        try {
            await axios.post(`${apiBaseUrl}/api/archivereport`, { reportId: selectedReport._id });

            // Update the local state to reflect the changes immediately
            setReports(prevReports => prevReports.map(report =>
                report._id === selectedReport._id ? { ...report, status: 'Archived' } : report
            ));

            await logAdminAction('Archive', { reportId: selectedReport._id }, 'Archived a report');

            closeModal();
        } catch (error) {
            console.error('Error archiving report:', error);
        } finally {
            fetchReports();
            setIsSubmitting(false);
        }
    };

    const filteredReports = filter === 'All' ? reports : reports.filter(report => report.type === filter);

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

    useEffect(() => {
        const counts = reports.reduce((acc, report) => {
            const loc = report.location;
            if (!acc[loc]) {
                acc[loc] = {
                    count: 0,
                    reports: []
                };
            }
            acc[loc].count += 1;
            acc[loc].reports.push(report);
            return acc;
        }, {});
        setLocationReportCounts(counts);
    }, [reports]);

    const renderCircles = () => {
        const combinedLocations = {};

        const combineLocations = (lat, lng, radius) => {
            for (const [key, value] of Object.entries(combinedLocations)) {
                const [combinedLat, combinedLng] = key.split(',').map(Number);
                const distance = Math.sqrt(Math.pow(lat - combinedLat, 2) + Math.pow(lng - combinedLng, 2));

                if (distance <= radius) {
                    return key; // Return existing location key if within radius
                }
            }

            return null; // No nearby location found
        };

        Object.entries(locationReportCounts).forEach(([location, data]) => {
            const [lat, lng] = location.split(',').map(Number);
            const radius = 0.001; // Adjust this to define your radius for combining locations

            const existingKey = combineLocations(lat, lng, radius);

            if (existingKey) {
                combinedLocations[existingKey].count += data.count;
            } else {
                combinedLocations[location] = { lat, lng, count: data.count };
            }
        });

        return Object.entries(combinedLocations).map(([location, data], index) => {
            const [lat, lng] = location.split(',').map(Number);
            const intensity = Math.min(1, data.count / 10); // Adjust as needed

            // Set a maximum circle radius to prevent excessively large circles
            const baseRadius = 50;
            const maxRadius = 150; // Maximum radius you want for the circles
            const radius = Math.min(baseRadius * data.count, maxRadius);

            return (
                <Circle
                    key={index}
                    center={[lat, lng]}
                    radius={radius}
                    pathOptions={{
                        color: 'transparent',
                        fillColor: 'red',
                        fillOpacity: intensity,
                    }}
                />
            );
        });
    };

    // Custom hook to move the map
    const FlyToLatestReport = ({ reports }) => {
        const map = useMap();

        useEffect(() => {
            if (reports.length > 0) {
                const latestReport = reports[reports.length - 1];
                const [lat, lng] = latestReport.location.split(',').map(Number);
                map.flyTo([lat, lng], 18); // Adjust zoom level as needed
            }
        }, [reports, map]);

        return null;
    };

    // Function to toggle auto-tracking
    const toggleAutoTrack = () => {
        setAutoTrack(prevState => !prevState);
    };

    const createClusterCustomIcon = (cluster) => {
        const count = cluster.getChildCount();
        let c = ' marker-cluster-';

        if (count < 5) {
            c += 'small';
        } else if (count < 10) {
            c += 'medium';
        } else {
            c += 'large';
        }

        return new L.DivIcon({
            html: `<div><span>${count}</span></div>`,
            className: 'marker-cluster' + c,
            iconSize: new L.Point(40, 40),
        });
    };


    return (
        <div className="dashboard-container">
            <div className='dashboard-content'>
                <div className='dashboard-reports-box'>
                    <div className='dashboard-reports-content'>

                        <div className='dashboard-tooltip'>
                            <label className='dashboard-tooltip-icon'>ⓘ</label>
                            <div className='dashboard-tooltip-box'>
                                <label className='dashboard-tooltip-text'>
                                    Map Marker Filtering
                                </label>
                                <label className='dashboard-tooltip-sub-text'>
                                    This allows the user to filter amongst the available report types.
                                </label>
                            </div>
                        </div>

                        <div
                            className={`accident-frame ${filter === 'All' ? 'selected-frame' : ''}`}
                            onClick={() => handleFilterChange('All')}
                            title="Filter Report to View All Report Map Markers"
                        >
                            <img className='accident-icon' src={usericon} />
                            <div className='accident-content'>
                                <a className='accident-title'>All Reports</a>
                                <b className='accident-total'>{reports.length}</b>
                            </div>
                        </div>
                        <div
                            className={`accident-frame ${filter === 'Fire' ? 'selected-frame' : ''}`}
                            onClick={() => handleFilterChange('Fire')}
                            title="Filter Report to View Fire Report Map Markers"
                        >
                            <img className='accident-icon' src={fireicon} />
                            <div className='accident-content'>
                                <a className='accident-title'>Fire</a>
                                <b className='accident-total'>{reportCounts['Fire'] || 0}</b>
                            </div>
                        </div>
                        <div
                            className={`accident-frame ${filter === 'Police' ? 'selected-frame' : ''}`}
                            onClick={() => handleFilterChange('Police')}
                            title="Filter Report to View Police Report Map Markers"
                        >
                            <img className='accident-icon' src={policeicon} />
                            <div className='accident-content'>
                                <a className='accident-title'>Police</a>
                                <b className='accident-total'>{reportCounts['Police'] || 0}</b>
                            </div>
                        </div>
                        <div
                            className={`accident-frame ${filter === 'Accident' ? 'selected-frame' : ''}`}
                            onClick={() => handleFilterChange('Accident')}
                            title="Filter Report to View Accident Report Map Markers"
                        >
                            <img className='accident-icon' src={accidenticon} />
                            <div className='accident-content'>
                                <a className='accident-title'>Accidents</a>
                                <b className='accident-total'>{reportCounts['Accident'] || 0}</b>
                            </div>
                        </div>
                        <div
                            className={`accident-frame ${filter === 'Hazard' ? 'selected-frame' : ''}`}
                            onClick={() => handleFilterChange('Hazard')}
                            title="Filter Report to View Hazard Map Markers"
                        >
                            <img className='accident-icon' src={hazardicon} />
                            <div className='accident-content'>
                                <a className='accident-title'>Hazard</a>
                                <b className='accident-total'>{reportCounts['Hazard'] || 0}</b>
                            </div>
                        </div>
                        <div
                            className={`accident-frame ${filter === 'Medical' ? 'selected-frame' : ''}`}
                            onClick={() => handleFilterChange('Medical')}
                            title="Filter Report to View Medical Map Markers"
                        >
                            <img className='accident-icon' src={medicalicon} />
                            <div className='accident-content'>
                                <a className='accident-title'>Medical</a>
                                <b className='accident-total'>{reportCounts['Medical'] || 0}</b>
                            </div>
                        </div>
                        <div
                            className={`accident-frame ${filter === 'Assistance' ? 'selected-frame' : ''}`}
                            onClick={() => handleFilterChange('Assistance')}
                            title="Filter Report to View Assistance Map Markers"
                        >
                            <img className='accident-icon' src={assistanceicon} />
                            <div className='accident-content'>
                                <a className='accident-title'>Assistance</a>
                                <b className='accident-total'>{reportCounts['Assistance'] || 0}</b>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className='dashboard-maps-box'>
                <div className='dashboard-maps-content'>
                    {loading && (
                        <div className="loading-overlay">
                            <div className="loading-message">Loading Map Data...</div>
                        </div>
                    )}
                    <div className="dashboard-controls">

                        <div className='dashboard-map-tooltip'>
                            <label className='dashboard-map-tooltip-icon'>ⓘ</label>
                            <div className='dashboard-map-tooltip-box'>

                                <div className='dashboard-map-tooltip-text-box'>
                                    <label className='dashboard-map-tooltip-text'>
                                        Auto Tracking
                                    </label>
                                    <label className='dashboard-map-tooltip-sub-text'>
                                        Interacting with the button allows the user to toggle the tracking of a recent report marker location.
                                    </label>
                                </div>

                                <div className='dashboard-map-tooltip-text-box'>
                                    <label className='dashboard-map-tooltip-text'>
                                        Heatmap
                                    </label>
                                    <label className='dashboard-map-tooltip-sub-text'>
                                        Interacting with the button allows the user to see visible heatmap density based on reports.
                                    </label>
                                </div>

                            </div>
                        </div>
                        <button
                            onClick={toggleAutoTrack}
                            title="Toggle Auto-Tracking Button"
                            aria-label={autoTrack ? 'Disable Auto-Tracking' : 'Enable Auto-Tracking'}
                            className="toggle-button"
                        >
                            {autoTrack ? 'Disable' : 'Enable'} Auto-Tracking
                        </button>

                        <button
                            onClick={() => setShowCircles(prev => !prev)}
                            title="Toggle Heatmap Button"
                            aria-label={showCircles ? 'Hide Heatmap' : 'Show Heatmap'}
                            className="toggle-button"
                        >
                            {showCircles ? 'Hide' : 'Show'} Heatmap
                        </button>
                    </div>
                    <div className="map-legends">
                        <div className='map-legends-box'>
                            <div className='map-legends-title-box'>
                                <label className='map-legends-title'>Legends</label>
                            </div>

                            <img src={maplegends} alt="Map Legends" />
                        </div>
                    </div>
                    <MapContainer
                        id="map"
                        center={[14.5591613626185, 121.14011670582923]} // Initial center of the map
                        zoom={15} // Initial zoom level
                        scrollWheelZoom={false}
                        minZoom={6} // Set the minimum zoom level to prevent zooming out too far
                        maxBounds={[[5.0, 116.0], [21.0, 127.0]]} // Set the maximum bounds for the map
                        maxBoundsViscosity={1.0} // Set viscosity to 1 to prevent panning outside the bounds
                        whenCreated={(map) => {
                            // Define the bounds for the Philippines
                            const bounds = L.latLngBounds(
                                L.latLng(5.0, 116.0),  // Southwest corner of the Philippines
                                L.latLng(21.0, 127.0)  // Northeast corner of the Philippines
                            );

                            map.setMaxBounds(bounds); // Set maximum bounds for the map

                            // Optional: Enforce keeping the view strictly within the bounds if at the minimum zoom level
                            map.on('drag', () => {
                                if (map.getZoom() <= 6) {
                                    // Only prevent dragging when the zoom level is at or below the minimum zoom level
                                    map.panInsideBounds(bounds, { animate: false });
                                }
                            });
                        }}
                        aria-hidden="true"
                        aria-label="Interactive map showing various reports"
                    >
                        {/* Invisible for visual users, only read by screen readers */}
                        <div className="sr-only" aria-live="polite">
                            Interactive map showing report locations. Use arrow keys to navigate.
                        </div>
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        />
                        {autoTrack && <FlyToLatestReport reports={reports} />}
                        <MarkerClusterGroup
                            iconCreateFunction={createClusterCustomIcon}
                            chunkedLoading
                        >

                            {filteredReports.map(report => (
                                <Marker
                                    key={report._id}
                                    position={[parseFloat(report.location.split(',')[0]), parseFloat(report.location.split(',')[1])]}
                                    icon={getMapIcon(report.type)}
                                    tabIndex="0"
                                    aria-label={`Marker for ${report.type} report`}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleViewReport(entry); // Open the report details on Enter key press
                                        }
                                    }}
                                >
                                    <Tooltip direction="bottom" offset={[0, 10]}>
                                        Click to View {report.type} Report Details
                                    </Tooltip> {/* Removed 'permanent' */}
                                    <Popup role="dialog" aria-labelledby={`report-details-${report._id}`}>
                                        <div>
                                            <h3><b>Name:</b> {report.name}</h3>
                                            <p><b>Type:</b> {report.type}</p>
                                            <p><b>Status:</b> {report.status}</p>
                                            <p><b>Location:</b> {report.location}</p>
                                            <p>
                                                <b>Date and Time: </b>
                                                {new Date(report.report_date_time).toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                    hour12: true,
                                                    timeZone: 'UTC'
                                                })}
                                            </p>
                                            <button onClick={() => handleViewReport(report)} className="map-report-button">
                                                View Report Details
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MarkerClusterGroup>
                        {showCircles && renderCircles()}
                    </MapContainer>
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
                <div className="dashboard-deny-modal">
                    <div className="dashboard-deny-modal-content">
                        <h3 className="dashboard-deny-modal-title">Provide a reason for denying the report</h3>
                        <textarea
                            value={denyDescription}
                            onChange={(e) => setDenyDescription(e.target.value)}
                            placeholder="Enter deny description"
                            rows={5}
                            className="dashboard-deny-modal-textarea"
                        />
                        <div className="dashboard-deny-modal-buttons">
                            <button onClick={closeDenyModal} disabled={isSubmitting} className="dashboard-deny-modal-cancel-button">
                                Cancel
                            </button>
                            <button onClick={denyReport} disabled={isSubmitting || !denyDescription} className="dashboard-deny-modal-submit-button">
                                {isSubmitting ? 'Processing...' : 'Submit Deny Reason'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="dashboard-reports-modal">
                    <div className="dashboard-reports-modal-content">
                        <div className='dashboard-reports-modal-content-box'>

                            <div className='dashboard-close-modal-button-box'>
                                <button
                                    onClick={closeModal}
                                    className='dashboard-close-modal-button'
                                    disabled={isSubmitting}
                                >
                                    X
                                </button>
                            </div>

                            <div className='dashboard-reports-title-box'>
                                <a className='dashboard-reports-title-box-text'>
                                    Report Details
                                </a>

                                <div className='dashboard-reports-tooltip'>
                                    <label className='dashboard-reports-tooltip-icon'>ⓘ</label>
                                    <div className='dashboard-reports-tooltip-box'>
                                        <label className='dashboard-reports-tooltip-text'>

                                        </label>
                                        <label className='dashboard-reports-tooltip-sub-text'>
                                            This section contains all information about the incident and the reporter.
                                            You can choose to either respond to or deny the report.
                                            If you select "Deny" a modal will appear asking for the reason for denial.
                                            After responding, you must click "Done" to confirm your action and store
                                            the report in the history tab for future reference.
                                        </label>
                                    </div>
                                </div>

                            </div>

                            <div className='dashboard-reports-details-container'>
                                <div className='dashboard-reports-details-modal-box'>

                                    <div className='dashboard-reports-text-box'>
                                        <a className='dashboard-reports-title-text'>
                                            Report ID:
                                            <b className='dashboard-reports-content-text'>{selectedReport._id}</b>
                                        </a>
                                        <a className='dashboard-reports-title-text'>
                                            Report Type:
                                            <b className='dashboard-reports-content-text'>{selectedReport.type}</b>
                                        </a>
                                        {selectedReport.responder && (
                                            <a className='dashboard-reports-title-text'>
                                                Responder:
                                                <b className='dashboard-reports-content-text'>{selectedReport.responder}</b>
                                            </a>
                                        )}
                                    </div>

                                    <div className='dashboard-reports-text-box'>
                                        <a className='dashboard-reports-title-text'>
                                            Name:
                                            <b className='dashboard-reports-content-text'>{selectedReport.name}</b>
                                        </a>
                                        {selectedReport.phone && (
                                            <a className='dashboard-reports-title-text'>
                                                Contact no.:
                                                <b className='dashboard-reports-content-text'>{selectedReport.phone}</b>
                                            </a>
                                        )}
                                        {selectedReport.email && (
                                            <a className='dashboard-reports-title-text'>
                                                Email:
                                                <b className='dashboard-reports-content-text'>{selectedReport.email}</b>
                                            </a>
                                        )}

                                    </div>

                                    <div className='dashboard-reports-text-box'>
                                        <a className='dashboard-reports-title-text'>
                                            Report Date & Time:
                                            <b className='dashboard-reports-content-text'>{new Date(selectedReport.report_date_time).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' })}</b>
                                        </a>
                                        {selectedReport.respond_date_time && (
                                            <a className='dashboard-reports-title-text'>
                                                Respond Date & Time:
                                                <b className='dashboard-reports-content-text'>{new Date(selectedReport.respond_date_time).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' })}</b>
                                            </a>
                                        )}
                                    </div>

                                    <div className='dashboard-reports-text-box'>
                                        <a className='dashboard-reports-title-text'>
                                            Status:
                                            <b className='dashboard-reports-content-text'>{selectedReport.status}</b>
                                        </a>
                                        {selectedReport.address && (
                                            <a className='dashboard-reports-title-text'>
                                                Address:
                                                <b className='dashboard-reports-content-text'>{selectedReport.address}</b>
                                            </a>
                                        )}
                                        {selectedReport.location && (
                                            <a className='dashboard-reports-title-text'>
                                                Location:
                                                <b className='dashboard-reports-content-text'>{selectedReport.location}</b>
                                            </a>
                                        )}
                                    </div>

                                    <div className='dashboard-reports-details-container'>

                                        <div className='dashboard-reports-description-box'>
                                            <a className='dashboard-description-title-text'>Description</a>
                                            <div className='dashboard-reports-description-area'>
                                                {selectedReport.description && selectedReport.description.fire_type && <p><b>Fire Type:</b> {selectedReport.description.fire_type}</p>}
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

                                        <div className='dashboard-reports-description-box'>
                                            <a className='dashboard-description-title-text'>Images</a>
                                            <div className='dashboard-reports-image-box'>
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

                            <div className='dashboard-update-modal-button-box'>
                                {(!selectedReport.responder || selectedReport.responder === userBarangay) && (
                                    <>
                                        <button
                                            onClick={openDenyModal}
                                            className='dashboard-deny-modal-button'
                                            disabled={isSubmitting}
                                            title='Deny Button'
                                        >
                                            {isSubmitting ? 'Processing...' : 'Deny'}
                                        </button>
                                        <button
                                            onClick={isResponded ? archiveReport : respondToReport}
                                            className='dashboard-update-modal-button'
                                            disabled={isSubmitting}
                                            title={isResponded ? 'Done Button' : 'Respond Button'}
                                        >
                                            {isSubmitting ? 'Processing...' : isResponded ? 'Done' : 'Respond'}
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

export default Dashboard;
