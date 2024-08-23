import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import './HistoryMap.css';
import { useReactToPrint } from 'react-to-print';
import PrintComponent from './PrintComponent';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Map icons
import accidentmapicon from '../../../Assets/map/accident.png';
import firemapicon from '../../../Assets/map/fire.png';
import hazardmapicon from '../../../Assets/map/hazard.png';
import medicalmapicon from '../../../Assets/map/medical.png';
import policemapicon from '../../../Assets/map/police.png';

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
            return customIcon;
    }
};

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const FilterControl = ({ selectedTypes, setSelectedTypes, selectedMonths, setSelectedMonths }) => {
    const map = useMap();

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setSelectedTypes(prevTypes => ({
            ...prevTypes,
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

    useEffect(() => {
        const filterDiv = L.DomUtil.create('div', 'filter-control');

        filterDiv.innerHTML = `
        <div class="filter-content-box">
            <div class="type-dropdown-box">
                <button id="type-dropdown-button" class="type-dropdown-button" style="margin-right: 10px;">Sort by Type</button>
                <div id="type-dropdown-content" class="type-dropdown-content" style="display: none; width: 94%;">
                    ${Object.keys(selectedTypes).map(type => `
                        <label>
                            <input type="checkbox" name="${type}" ${selectedTypes[type] ? 'checked' : ''} onChange="handleCheckboxChange">
                            ${type}
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="month-dropdown-box">
                <button id="month-dropdown-button" class="month-dropdown-button">Sort by Month</button>
                <div id="month-dropdown-content" class="month-dropdown-content" style="display: none; width: 99%;">
                    ${months.map(month => `
                        <label>
                            <input type="checkbox" value="${month}" ${selectedMonths.includes(month) ? 'checked' : ''} onChange="handleMonthChange">
                            ${month}
                        </label>
                    `).join('')}
                </div>
            </div>
        </div>
        `;

        const toggleContent = (id) => {
            const content = filterDiv.querySelector(`#${id}`);
            if (content.style.display === 'none') {
                content.style.display = 'inline-flex';
            } else {
                content.style.display = 'none';
            }
        };

        L.DomEvent.on(filterDiv.querySelector('#type-dropdown-button'), 'click', () => toggleContent('type-dropdown-content'));
        L.DomEvent.on(filterDiv.querySelector('#month-dropdown-button'), 'click', () => toggleContent('month-dropdown-content'));

        const checkboxes = filterDiv.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.name) {
                L.DomEvent.on(checkbox, 'change', handleCheckboxChange);
            } else {
                L.DomEvent.on(checkbox, 'change', handleMonthChange);
            }
        });

        const control = L.control({ position: 'topright' });
        control.onAdd = () => filterDiv;
        control.addTo(map);

        return () => {
            map.removeControl(control);
        };
    }, [map, selectedTypes, setSelectedTypes, selectedMonths, setSelectedMonths]);

    return null;
};

const HistoryMap = () => {
    const [historyData, setHistoryData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [selectedTypes, setSelectedTypes] = useState({
        Fire: true,
        Accident: true,
        Police: true,
        Medical: true,
        Hazard: true
    });
    const [selectedMonths, setSelectedMonths] = useState(months);
    const componentRef = useRef();
    const [userType, setUserType] = useState('');
    const [userUsername, setUserUsername] = useState('');

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
        const fetchHistoryData = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/historymaps`);
                setHistoryData(response.data);
                setFilteredData(response.data);
            } catch (error) {
                console.error('Error fetching history data:', error);
            }
        };

        fetchHistoryData();
        const interval = setInterval(fetchHistoryData, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const filteredByType = historyData.filter(entry => selectedTypes[entry.type]);
        const filteredByMonth = selectedMonths.length === 0 ? filteredByType : filteredByType.filter(entry => {
            const entryDate = new Date(entry.report_date_time);
            const entryMonthName = months[entryDate.getMonth()];
            return selectedMonths.includes(entryMonthName);
        });
        setFilteredData(filteredByMonth);
    }, [selectedTypes, selectedMonths, historyData]);

    const handleViewReport = (history) => {
        setSelectedHistory(history);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedHistory(null);
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

    const addToArchive = async () => {
        try {
            await axios.post(`${apiBaseUrl}/api/addToArchive`, { historyId: selectedHistory._id });
            await logAdminAction('Archive', { historyId: selectedHistory._id }, 'Moved a report to history');
            closeModal();
        } catch (error) {
            console.error('Error moving to archive:', error);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (
        <div className='history-maps-box'>
            <div className='history-maps-content'>
                <MapContainer id="history-map" center={[14.5591613626185, 121.14011670582923]} zoom={15} scrollWheelZoom={false}>
                    <TileLayer attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FilterControl selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes} selectedMonths={selectedMonths} setSelectedMonths={setSelectedMonths} />
                    <MarkerClusterGroup>
                        {filteredData.map((entry, index) => (
                            <Marker
                                key={entry._id}
                                position={[parseFloat(entry.location.split(',')[0]), parseFloat(entry.location.split(',')[1])]}
                                icon={getMapIcon(entry.type)}
                            >
                                <Popup>
                                    <div>
                                        <h3>{entry.name}</h3>
                                        <p><b>Type:</b> {entry.type}</p>
                                        <p><b>Status:</b> {entry.status}</p>
                                        <p><b>Location:</b> {entry.location}</p>
                                        <p>
                                            <b>Date and Time: </b>
                                            {new Date(entry.report_date_time).toLocaleString('en-US', {
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
                                        <button onClick={() => handleViewReport(entry)} className="map-report-button">
                                            View Report
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>
                    <div className="leaflet-overlay-pane generate-pdf-overlay" style={{ position: 'absolute', bottom: '20px', right: '10px' }}>
                        <button className='generate-report-button' onClick={handlePrint}>Generate Report</button>
                    </div>
                    <div className="generate-report-print" style={{ display: 'none' }}>
                        <PrintComponent ref={componentRef} data={filteredData} />
                    </div>
                </MapContainer>
            </div>

            {isModalOpen && selectedHistory && (
                <div className="historymap-reports-modal">
                    <div className="historymap-reports-modal-content">
                        <div className='historymap-reports-modal-content-box'>
                            <div className='historymap-close-modal-button-box'>
                                <button onClick={closeModal} className='historymap-close-modal-button'>X</button>
                            </div>

                            <div className='historymap-reports-title-box'>
                                <a className='historymap-reports-title-box-text'>
                                    Archived Report Details
                                </a>
                            </div>

                            <div className='historymap-reports-details-container'>
                                <div className='historymap-reports-details-modal-box'>
                                    <div className='historymap-reports-text-box'>
                                        <a className='historymap-reports-title-text'>
                                            Report Type:
                                            <b className='historymap-reports-content-text'>{selectedHistory.type}</b>
                                        </a>
                                        <a className='historymap-reports-title-text'>
                                            Responder:
                                            <b className='historymap-reports-content-text'>{selectedHistory.responder}</b>
                                        </a>
                                    </div>
                                    <div className='historymap-reports-text-box'>
                                        <a className='historymap-reports-title-text'>
                                            ID:
                                            <b className='historymap-reports-content-text'>{selectedHistory._id}</b>
                                        </a>
                                        <a className='historymap-reports-title-text'>
                                            Name:
                                            <b className='historymap-reports-content-text'>{selectedHistory.name}</b>
                                        </a>
                                    </div>
                                    <div className='historymap-reports-text-box'>
                                        <a className='historymap-reports-title-text'>
                                            Date & Time:
                                            <b className='historymap-reports-content-text'>{new Date(selectedHistory.report_date_time).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timezone: 'Asia/Manila' })}</b>
                                        </a>
                                        <a className='historymap-reports-title-text'>
                                            Status:
                                            <b className='historymap-reports-content-text'>{selectedHistory.status}</b>
                                        </a>
                                    </div>
                                    <div className='historymap-reports-text-box'>
                                        {selectedHistory.address && (
                                            <a className='historymap-reports-title-text'>
                                                Address:
                                                <b className='historymap-reports-content-text'>{selectedHistory.address}</b>
                                            </a>
                                        )}
                                        {selectedHistory.location && (
                                            <a className='historymap-reports-title-text'>
                                                Location:
                                                <b className='historymap-reports-content-text'>{selectedHistory.location}</b>
                                            </a>
                                        )}
                                    </div>
                                    <div className='historymap-reports-description-box'>
                                        <a className='historymap-description-title-text'>Description</a>
                                        <div className='historymap-reports-description-area'>
                                            {selectedHistory.description.fire_type && <p><b>Fire Type:</b> {selectedHistory.description.fire_type}</p>}
                                            {selectedHistory.description.severity && <p><b>Severity:</b> {selectedHistory.description.severity}</p>}
                                            {selectedHistory.description.visible_flames && <p><b>Visible Flames:</b> {selectedHistory.description.visible_flames}</p>}
                                            {selectedHistory.description.smoke && <p><b>Smoke:</b> {selectedHistory.description.smoke}</p>}
                                            {selectedHistory.description.crime_type && <p><b>Crime Type:</b> {selectedHistory.description.crime_type}</p>}
                                            {selectedHistory.description.in_progress && <p><b>In Progress:</b> {selectedHistory.description.in_progress}</p>}
                                            {selectedHistory.description.collision_type && <p><b>Collision Type:</b> {selectedHistory.description.collision_type}</p>}
                                            {selectedHistory.description.severity_of_accident && <p><b>Severity of Accident:</b> {selectedHistory.description.severity_of_accident}</p>}
                                            {selectedHistory.description.blocked_road && <p><b>Blocked Road:</b> {selectedHistory.description.blocked_road}</p>}
                                            {selectedHistory.description.number_of_people_involved && <p><b>Number of People Involved:</b> {selectedHistory.description.number_of_people_involved}</p>}
                                            {selectedHistory.description.medical_emergency_type && <p><b>Medical Emergency Type:</b> {selectedHistory.description.medical_emergency_type}</p>}
                                            {selectedHistory.description.consciousness && <p><b>Consciousness:</b> {selectedHistory.description.consciousness}</p>}
                                            {selectedHistory.description.hazard_type && <p><b>Hazard Type:</b> {selectedHistory.description.hazard_type}</p>}
                                            <p><b>Additional Description:</b> {selectedHistory.description.additional_description}</p>
                                        </div>
                                    </div>
                                    <div className='historymap-reports-description-box'>
                                        <a className='historymap-description-title-text'>Images</a>
                                        <div className='historymap-reports-image-box'>
                                            {selectedHistory.images && selectedHistory.images.map((imageUrl, index) => (
                                                <img key={index} src={imageUrl} alt={`Archive Image ${index + 1}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='historymap-update-modal-button-box'>
                                {userType !== "Barangay" && (
                                    <button onClick={addToArchive} className="historymap-deny-modal-button">Remove</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryMap;

