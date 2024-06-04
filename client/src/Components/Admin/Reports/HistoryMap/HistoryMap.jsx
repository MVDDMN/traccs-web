import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import locationIcon from '../../../Assets/location.png';
import './HistoryMap.css';
import { useReactToPrint } from 'react-to-print';
import PrintComponent from './PrintComponent';

const customIcon = new L.Icon({
    iconUrl: locationIcon,
    iconSize: [25, 25],
});

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const FilterControl = ({ selectedTypes, setSelectedTypes, selectedMonths, setSelectedMonths }) => {
    const map = useMap();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const toggleMonthDropdown = () => {
        setMonthDropdownOpen(!monthDropdownOpen);
    };

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
            <div class="month-dropdown-box">
                <button id="month-dropdown-button" class="month-dropdown-button" style="margin-right: 10px;">Sort by Month</button>
                <div id="month-dropdown-content" class="month-dropdown-content" style="display: none; width: 93%;">
                    ${months.map(month => `
                        <label>
                            <input type="checkbox" value="${month}" ${selectedMonths.includes(month) ? 'checked' : ''} onChange="handleMonthChange">
                            ${month}
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="type-dropdown-box">
                <button id="type-dropdown-button" class="type-dropdown-button">Sort by Type</button>
                <div id="type-dropdown-content" class="type-dropdown-content" style="display: none;">
                    ${Object.keys(selectedTypes).map(type => `
                        <label>
                            <input type="checkbox" name="${type}" ${selectedTypes[type] ? 'checked' : ''} onChange="handleCheckboxChange">
                            ${type}
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
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedTypes, setSelectedTypes] = useState({
        Fire: true,
        Accident: true,
        Police: true,
        Medical: true,
        Hazard: true
    });
    const [selectedMonths, setSelectedMonths] = useState([]);
    const componentRef = useRef();

    useEffect(() => {
        const fetchHistoryData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/historymaps');
                setHistoryData(response.data);
                setFilteredData(response.data); // Initialize with all data
            } catch (error) {
                console.error('Error fetching history data:', error);
            }
        };

        fetchHistoryData();
        const interval = setInterval(fetchHistoryData, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const filteredByType = historyData.filter(entry => selectedTypes[entry.type]);
        const filteredByMonth = selectedMonths.length === 0 ? filteredByType : filteredByType.filter(entry => selectedMonths.includes(entry.date.split('-')[1]));
        setFilteredData(filteredByMonth);
    }, [selectedTypes, selectedMonths, historyData]);

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedReport(null);
    };

    const addToArchive = async () => {
        try {
            await axios.post('http://localhost:3001/addToArchive', { historyId: selectedReport._id });
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
                <MapContainer id="history-map" center={[14.5591613626185, 121.14011670582923]} zoom={14} scrollWheelZoom={false}>
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FilterControl selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes} selectedMonths={selectedMonths} setSelectedMonths={setSelectedMonths} />
                    {filteredData.map((entry, index) => (
                        <Marker
                            key={index}
                            position={entry.location.split(',').map(coord => parseFloat(coord))}
                            icon={customIcon}
                        >
                            <Popup>
                                <div>
                                    <h3>{entry.name}</h3>
                                    <p className='marker-report-description'>{entry.description}</p>
                                    <button onClick={() => handleViewReport(entry)} className="map-report-button">
                                        View Report
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    <div className="leaflet-overlay-pane generate-pdf-overlay" style={{ position: 'absolute', bottom: '20px', right: '10px' }}>
                        <button className='generate-report-button' onClick={handlePrint}>Generate Report</button>
                    </div>
                    <div className="generate-report-print" style={{ display: 'none' }}>
                        <PrintComponent ref={componentRef} data={filteredData} />
                    </div>
                </MapContainer>
            </div>

            {isModalOpen && selectedReport && (
                <div className="reports-modal">
                    <div className="reports-modal-content">
                        <div className='reports-modal-content-box'>
                            <div className='close-modal-button-box'>
                                <button onClick={closeModal} className='close-modal-button'>X</button>
                            </div>

                            <div className='reports-title-box'>
                                <h2>Report Details</h2>
                            </div>

                            <div className='reports-details-container'>
                                <div className='reports-details-modal-box'>
                                    <div className='reports-text-box'>
                                        <a className='reports-title-text'>
                                            Report Type:
                                            <b className='reports-content-text'>{selectedReport.type}</b>
                                        </a>
                                    </div>
                                    <div className='reports-text-box'>
                                        <a className='reports-title-text'>
                                            ID:
                                            <b className='reports-content-text'>{selectedReport._id}</b>
                                        </a>
                                        <a className='reports-title-text'>
                                            Name:
                                            <b className='reports-content-text'>{selectedReport.name}</b>
                                        </a>
                                    </div>
                                    <div className='reports-text-box'>
                                        <a className='reports-title-text'>
                                            Date:
                                            <b className='reports-content-text'>{selectedReport.date}</b>
                                        </a>
                                        <a className='reports-title-text'>
                                            Time:
                                            <b className='reports-content-text'>{selectedReport.time}</b>
                                        </a>
                                    </div>
                                    <div className='reports-text-box'>
                                        <a className='reports-title-text'>
                                            Address:
                                            <b className='reports-content-text'>{selectedReport.address}</b>
                                        </a>
                                        <a className='reports-title-text'>
                                            Location:
                                            <b className='reports-content-text'>{selectedReport.location}</b>
                                        </a>
                                    </div>
                                    <div className='reports-description-box'>
                                        <a className='description-title-text'>Description</a>
                                        <textarea className='reports-description-area' value={selectedReport.description} readOnly />
                                    </div>
                                    <div className='reports-description-box'>
                                        <a className='description-title-text'>Images</a>
                                        <div className='reports-image-box'>
                                            {selectedReport.image && selectedReport.image.map((imageUrl, index) => (
                                                <img key={index} src={imageUrl} alt={`Report Image ${index + 1}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='update-modal-button-box'>
                                <button onClick={addToArchive} className="deny-modal-button">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryMap;

