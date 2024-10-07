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
import assistancemapicon from '../../../Assets/map/assistance.png';
import defaultmapicon from '../../../Assets/location.png';

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

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const FilterControl = ({ selectedTypes, setSelectedTypes, selectedMonths, setSelectedMonths, selectedYears, setSelectedYears, years }) => {
    const map = useMap();

    useEffect(() => {
        const filterDiv = L.DomUtil.create('div', 'filter-control');

        filterDiv.innerHTML = `
        <div class="filter-content-box">
            <div class="type-dropdown-box">
                <button id="type-dropdown-button" class="type-dropdown-button" aria-controls="type-dropdown-content" aria-expanded="false" aria-label="Filter by report type" style="margin-right: 10px;">Sort by Type</button>
                <div id="type-dropdown-content" class="type-dropdown-content" style="display: none; width: 94%;"></div>
            </div>
            <div class="month-dropdown-box">
                <button id="month-dropdown-button" class="month-dropdown-button" aria-controls="type-dropdown-content" aria-expanded="false" aria-label="Filter by report month" style="margin-right: 10px;">Sort by Month</button>
                <div id="month-dropdown-content" class="month-dropdown-content" style="display: none; width: 93%;"></div>
            </div>
            <div class="year-dropdown-box">
                <button id="year-dropdown-button" class="year-dropdown-button" aria-controls="type-dropdown-content" aria-expanded="false" aria-label="Filter by report year" >Sort by Year</button>
                <div id="year-dropdown-content" class="year-dropdown-content" style="display: none; width: 99%;"></div>
            </div>
        </div>
        `;

        // Populate the dropdown content dynamically
        const typeDropdownContent = filterDiv.querySelector('#type-dropdown-content');
        Object.keys(selectedTypes).forEach(type => {
            const label = L.DomUtil.create('label', '', typeDropdownContent);
            const checkbox = L.DomUtil.create('input', '', label);
            checkbox.type = 'checkbox';
            checkbox.name = type;
            checkbox.checked = selectedTypes[type];
            checkbox.addEventListener('change', (event) => {
                const { name, checked } = event.target;
                setSelectedTypes(prevTypes => ({
                    ...prevTypes,
                    [name]: checked
                }));
            });
            label.appendChild(document.createTextNode(type));
        });

        const monthDropdownContent = filterDiv.querySelector('#month-dropdown-content');
        months.forEach(month => {
            const label = L.DomUtil.create('label', '', monthDropdownContent);
            const checkbox = L.DomUtil.create('input', '', label);
            checkbox.type = 'checkbox';
            checkbox.value = month;
            checkbox.checked = selectedMonths.includes(month);
            checkbox.addEventListener('change', (event) => {
                const { value, checked } = event.target;
                if (checked) {
                    setSelectedMonths([...selectedMonths, value]);
                } else {
                    setSelectedMonths(selectedMonths.filter(m => m !== value));
                }
            });
            label.appendChild(document.createTextNode(month));
        });

        const yearDropdownContent = filterDiv.querySelector('#year-dropdown-content');
        years.forEach(year => {
            const label = L.DomUtil.create('label', '', yearDropdownContent);
            const checkbox = L.DomUtil.create('input', '', label);
            checkbox.type = 'checkbox';
            checkbox.value = year;
            checkbox.checked = selectedYears.includes(year);
            checkbox.addEventListener('change', (event) => {
                const { value, checked } = event.target;
                if (checked) {
                    setSelectedYears([...selectedYears, parseInt(value)]);
                } else {
                    setSelectedYears(selectedYears.filter(y => y !== parseInt(value)));
                }
            });
            label.appendChild(document.createTextNode(year));
        });

        const toggleContent = (id) => {
            const content = filterDiv.querySelector(`#${id}`);
            const isExpanded = content.style.display === 'inline-flex';
            content.style.display = isExpanded ? 'none' : 'inline-flex';
            filterDiv.querySelector(`#${id}-dropdown-button`).setAttribute('aria-expanded', !isExpanded);
        };

        L.DomEvent.on(filterDiv.querySelector('#type-dropdown-button'), 'click', () => toggleContent('type-dropdown-content'));
        L.DomEvent.on(filterDiv.querySelector('#month-dropdown-button'), 'click', () => toggleContent('month-dropdown-content'));
        L.DomEvent.on(filterDiv.querySelector('#year-dropdown-button'), 'click', () => toggleContent('year-dropdown-content'));

        const control = L.control({ position: 'topright' });
        control.onAdd = () => filterDiv;
        control.addTo(map);

        return () => {
            map.removeControl(control);
        };
    }, [map, selectedTypes, setSelectedTypes, selectedMonths, setSelectedMonths, selectedYears, setSelectedYears, years]);

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
        Hazard: true,
        Assistance: true
    });
    const [selectedMonths, setSelectedMonths] = useState(months);
    const [selectedYears, setSelectedYears] = useState([]);
    const componentRef = useRef();
    const [userType, setUserType] = useState('');
    const [userUsername, setUserUsername] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const years = Array.from(new Set(historyData.map(entry => new Date(entry.report_date_time).getFullYear())));

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
        const interval = setInterval(fetchHistoryData, 10000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const filteredByType = historyData.filter(entry => selectedTypes[entry.type]);
        const filteredByMonth = selectedMonths.length === 0 ? filteredByType : filteredByType.filter(entry => {
            const entryDate = new Date(entry.report_date_time);
            const entryMonthName = months[entryDate.getMonth()];
            return selectedMonths.includes(entryMonthName);
        });
        const filteredByYear = selectedYears.length === 0 ? filteredByMonth : filteredByMonth.filter(entry => {
            const entryYear = new Date(entry.report_date_time).getFullYear();
            return selectedYears.includes(entryYear);
        });
        setFilteredData(filteredByYear);
    }, [selectedTypes, selectedMonths, selectedYears, historyData]);



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

    return (
        <div className='history-maps-box'>
            <div className='history-maps-content'>
                <MapContainer
                    id="history-map"
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
                    <TileLayer attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    <FilterControl selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes} selectedMonths={selectedMonths} setSelectedMonths={setSelectedMonths} selectedYears={selectedYears} setSelectedYears={setSelectedYears} years={years} />
                    <MarkerClusterGroup
                        chunkedLoading
                    >
                        {filteredData.map((entry, index) => (
                            <Marker
                                key={entry._id}
                                position={[parseFloat(entry.location.split(',')[0]), parseFloat(entry.location.split(',')[1])]}
                                icon={getMapIcon(entry.type)}
                                aria-label={`Marker for ${entry.type} report`}
                                tabIndex="0"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleViewReport(entry); // Open the report details on Enter key press
                                    }
                                }}
                            >
                                <Popup role="dialog" aria-labelledby="marker-popup">
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
                                                hour12: true,
                                                timeZone: 'UTC'
                                            })}
                                        </p>
                                        <button
                                            onClick={() => handleViewReport(entry)}
                                            className="map-report-button"
                                            aria-label={`View details for ${entry.name} report`}
                                        >
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

            {isModalOpen && selectedHistory && (
                <div className="historymap-reports-modal" role="dialog" aria-modal="true" aria-labelledby="history-map-reports" tabIndex="-1">
                    <div className="historymap-reports-modal-content">
                        <div className='historymap-reports-modal-content-box'>
                            <div className='historymap-close-modal-button-box'>
                                <button onClick={closeModal} className='historymap-close-modal-button'>X</button>
                            </div>

                            <div className='historymap-reports-title-box'>
                                <a className='historymap-reports-title-box-text'>
                                    History Map Report Details
                                </a>
                                <div className='historymap-reports-tooltip'>
                                    <label className='historymap-reports-tooltip-icon'>ⓘ</label>
                                    <div className='historymap-reports-tooltip-box'>
                                        <label className='historymap-reports-tooltip-sub-text'>
                                            This section contains all information about the incident and the reporter.
                                            You can choose to "Remove" the report from the history map.
                                            After removing, the report would be kept in the history tab for future reference.
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className='historymap-reports-details-container'>
                                <div className='historymap-reports-details-modal-box'>
                                    <div className='historymap-reports-text-box'>
                                        <a className='historymap-reports-title-text'>
                                            ID:
                                            <b className='historymap-reports-content-text'>{selectedHistory._id}</b>
                                        </a>
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
                                            Name:
                                            <b className='historymap-reports-content-text'>{selectedHistory.name}</b>
                                        </a>
                                        {selectedHistory.phone && (
                                            <a className='historymap-reports-title-text'>
                                                Contact no.:
                                                <b className='historymap-reports-content-text'>{selectedHistory.phone}</b>
                                            </a>
                                        )}
                                        {selectedHistory.email && (
                                            <a className='historymap-reports-title-text'>
                                                Email:
                                                <b className='historymap-reports-content-text'>{selectedHistory.email}</b>
                                            </a>
                                        )}
                                    </div>
                                    <div className='historymap-reports-text-box'>
                                        <a className='historymap-reports-title-text'>
                                            Report Date & Time:
                                            <b className='historymap-reports-content-text'>{new Date(selectedHistory.report_date_time).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'UTC' })}</b>
                                        </a>
                                        <a className='historymap-reports-title-text'>
                                            Respond Date & Time:
                                            <b className='historymap-reports-content-text'>{new Date(selectedHistory.respond_date_time).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'UTC' })}</b>
                                        </a>
                                        <a className='historymap-reports-title-text'>
                                            Completion Date & Time:
                                            <b className='historymap-reports-content-text'>{new Date(selectedHistory.completion_date_time).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'UTC' })}</b>
                                        </a>

                                    </div>

                                    <div className='historymap-reports-text-box'>
                                        <a className='historymap-reports-title-text'>
                                            Status:
                                            <b className='historymap-reports-content-text'>{selectedHistory.status}</b>
                                        </a>
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

                                    <div className='historymap-reports-details-container'>
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
                                                {selectedHistory && selectedHistory.images && selectedHistory.images.map((image, index) => (
                                                    <div key={index} onClick={() => handleImageClick(image)}>
                                                        {renderImage(image)}
                                                    </div>
                                                ))}
                                            </div>
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
