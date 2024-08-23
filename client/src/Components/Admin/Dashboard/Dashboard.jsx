import React, { useState, useEffect } from 'react';
import axios from 'axios';
import L from 'leaflet';
import './Dashboard.css';
import fireicon from '../../Assets/fire.png';
import accidenticon from '../../Assets/accident.png';
import policeicon from '../../Assets/police.png';
import medicalicon from '../../Assets/medical.png';
import hazardicon from '../../Assets/hazard.png';
import usericon from '../../Assets/user.png';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Map icons
import accidentmapicon from '../../Assets/map/accident.png';
import firemapicon from '../../Assets/map/fire.png';
import hazardmapicon from '../../Assets/map/hazard.png';
import medicalmapicon from '../../Assets/map/medical.png';
import policemapicon from '../../Assets/map/police.png';
import defaultmapicon from '../../Assets/location.png';

import 'leaflet/dist/leaflet.css';

// Determine the base URL based on the environment
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

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = sessionStorage.getItem('userId');
                if (!userId) {
                    console.error("User ID not found in session storage");
                    return;
                }
                const response = await axios.get(`${apiBaseUrl}/user/${userId}`, { withCredentials: true });
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
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        };

        fetchReports();
        const interval = setInterval(fetchReports, 10000);

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
    };

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setIsResponded(report.status === 'Responded');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedReport(null);
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
            await axios.post("http://localhost:3001/api/logs", logEntry);
        } catch (error) {
            console.error("Error logging admin action:", error);
        }
    };

    const respondToReport = async () => {
        try {
            await axios.post(`${apiBaseUrl}/api/respondtoreport`, { reportId: selectedReport._id, responder: userBarangay });
            setIsResponded(true);
            await logAdminAction('Respond', { reportId: selectedReport._id, responder: userBarangay }, 'Responded to a report');
            closeModal();
        } catch (error) {
            console.error('Error responding to report:', error);
        }
    };

    const archiveReport = async () => {
        try {
            await axios.post(`${apiBaseUrl}/api/archivereport`, { reportId: selectedReport._id });
            await logAdminAction('Archive', { reportId: selectedReport._id }, 'Archived a report');
            closeModal();
        } catch (error) {
            console.error('Error archiving report:', error);
        }
    };

    const denyReport = async () => {
        try {
            await axios.post(`${apiBaseUrl}/api/deny`, { reportId: selectedReport._id, responder: userBarangay });
            await logAdminAction('Deny', { reportId: selectedReport._id, responder: userBarangay }, 'Denied a report');
            closeModal();
        } catch (error) {
            console.error('Error denying report:', error);
        }
    };

    const filteredReports = filter === 'All' ? reports : reports.filter(report => report.type === filter);

    return (
        <div className="dashboard-container">
            <div className='dashboard-content'>
                <div className='dashboard-reports-box'>
                    <div className='dashboard-reports-content'>
                        <div
                            className={`accident-frame ${filter === 'All' ? 'selected-frame' : ''}`}
                            onClick={() => handleFilterChange('All')}
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
                        >
                            <img className='accident-icon' src={medicalicon} />
                            <div className='accident-content'>
                                <a className='accident-title'>Medical</a>
                                <b className='accident-total'>{reportCounts['Medical'] || 0}</b>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className='dashboard-maps-box'>
                <div className='dashboard-maps-content'>
                    <MapContainer id="map" center={[14.5591613626185, 121.14011670582923]} zoom={15} scrollWheelZoom={false}>
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MarkerClusterGroup>
                            {filteredReports.map(report => (
                                <Marker
                                    key={report._id}
                                    position={[parseFloat(report.location.split(',')[0]), parseFloat(report.location.split(',')[1])]}
                                    icon={getMapIcon(report.type)}
                                >
                                    <Popup>
                                        <div>
                                            <h3>{report.name}</h3>
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
                                                    timeZone: 'Asia/Manila'
                                                })}
                                            </p>
                                            <button onClick={() => handleViewReport(report)} className="map-report-button">
                                                View Report
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MarkerClusterGroup>
                    </MapContainer>
                </div>
            </div>

            {isModalOpen && (
                <div className="dashboard-reports-modal">
                    <div className="dashboard-reports-modal-content">
                        <div className='dashboard-reports-modal-content-box'>
                            <div className='dashboard-close-modal-button-box'>
                                <button onClick={closeModal} className='dashboard-close-modal-button'>X</button>
                            </div>

                            <div className='dashboard-reports-title-box'>
                                <a className='dashboard-reports-title-box-text'>
                                    Report Details
                                </a>
                            </div>

                            <div className='dashboard-reports-details-container'>
                                <div className='dashboard-reports-details-modal-box'>
                                    <div className='dashboard-reports-text-box'>
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
                                            ID:
                                            <b className='dashboard-reports-content-text'>{selectedReport._id}</b>
                                        </a>
                                        <a className='dashboard-reports-title-text'>
                                            Name:
                                            <b className='dashboard-reports-content-text'>{selectedReport.name}</b>
                                        </a>
                                    </div>
                                    <div className='dashboard-reports-text-box'>
                                        <a className='dashboard-reports-title-text'>
                                            Date & Time:
                                            <b className='dashboard-reports-content-text'>{new Date(selectedReport.report_date_time).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</b>
                                        </a>
                                        <a className='dashboard-reports-title-text'>
                                            Status:
                                            <b className='dashboard-reports-content-text'>{selectedReport.status}</b>
                                        </a>
                                    </div>
                                    <div className='dashboard-reports-text-box'>
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
                                    <div className='dashboard-reports-description-box'>
                                        <a className='dashboard-description-title-text'>Description</a>
                                        <div className='dashboard-reports-description-area'>
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
                                    <div className='dashboard-reports-description-box'>
                                        <a className='dashboard-description-title-text'>Images</a>
                                        <div className='dashboard-reports-image-box'>
                                            {selectedReport && selectedReport.images && selectedReport.images.map((imageUrl, index) => (
                                                <img key={index} src={imageUrl} alt={`Report Image ${index + 1}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='dashboard-update-modal-button-box'>
                                <button onClick={denyReport} className='dashboard-deny-modal-button'>Deny</button>
                                <button onClick={isResponded ? archiveReport : respondToReport} className='dashboard-update-modal-button'>
                                    {isResponded ? 'Done' : 'Respond'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
