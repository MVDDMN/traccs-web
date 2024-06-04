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
import locationIcon from '../../Assets/location.png';
import 'leaflet/dist/leaflet.css';

const customIcon = new L.Icon({
    iconUrl: locationIcon,
    iconSize: [25, 25],
});

const Dashboard = () => {
    const [reports, setReports] = useState([]);
    const [reportCounts, setReportCounts] = useState({});
    const [filter, setFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get('http://localhost:3001/admin');
                setReports(response.data);
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        };

        fetchReports();
        const interval = setInterval(fetchReports, 1000);

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
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedReport(null);
    };

    const respondToReport = async () => {
        try {
            await axios.post('http://localhost:3001/respond', { reportId: selectedReport._id });
            closeModal();
        } catch (error) {
            console.error('Error responding to report:', error);
        }
    };

    const denyReport = async () => {
        try {
            await axios.post('http://localhost:3001/deny', { reportId: selectedReport._id });
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
                        <div className='accident-frame' onClick={() => handleFilterChange('Fire')}>
                            <img className='accident-icon' src={fireicon} />
                            <div className='accident-content'>
                                <a className='accident-title'>Fire</a>
                                <b className='accident-total'>{reportCounts['Fire'] || 0}</b>
                            </div>
                        </div>
                        <div className='accident-frame' onClick={() => handleFilterChange('Police')}>
                            <img className='accident-icon' src={policeicon} />
                            <div className='accident-content'>
                                <a className='accident-title'>Police</a>
                                <b className='accident-total'>{reportCounts['Police'] || 0}</b>
                            </div>
                        </div>
                        <div className='accident-frame' onClick={() => handleFilterChange('Accident')}>
                            <img className='accident-icon' src={accidenticon} />
                            <div className='accident-content'>
                                <a className='accident-title'>Accidents</a>
                                <b className='accident-total'>{reportCounts['Accident'] || 0}</b>
                            </div>
                        </div>
                        <div className='accident-frame' onClick={() => handleFilterChange('Hazard')}>
                            <img className='accident-icon' src={hazardicon} />
                            <div className='accident-content'>
                                <a className='accident-title'>Hazard</a>
                                <b className='accident-total'>{reportCounts['Hazard'] || 0}</b>
                            </div>
                        </div>
                        <div className='accident-frame' onClick={() => handleFilterChange('Medical')}>
                            <img className='accident-icon' src={medicalicon} />
                            <div className='accident-content'>
                                <a className='accident-title'>Medical</a>
                                <b className='accident-total'>{reportCounts['Medical'] || 0}</b>
                            </div>
                        </div>
                        <div className='accident-frame' onClick={() => handleFilterChange('All')}>
                            <img className='accident-icon' src={usericon} />
                            <div className='accident-content'>
                                <a className='accident-title'>All Reports</a>
                                <b className='accident-total'>{reports.length}</b>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='dashboard-maps-box'>
                <div className='dashboard-maps-content'>
                    <MapContainer id="map" center={[14.5591613626185, 121.14011670582923]} zoom={14} scrollWheelZoom={false}>
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {filteredReports.map(report => (
                            <Marker
                                key={report._id}
                                position={[parseFloat(report.location.split(',')[0]), parseFloat(report.location.split(',')[1])]}
                                icon={customIcon}
                            >
                                <Popup>
                                    <div>
                                        <h3>{report.name}</h3>
                                        <p className='marker-report-description'>{report.description}</p>
                                        <button onClick={() => handleViewReport(report)} className="map-report-button">
                                            View Report
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            {isModalOpen && (
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
                                            {selectedReport && selectedReport.image && selectedReport.image.map((imageUrl, index) => (
                                                <img key={index} src={imageUrl} alt={`Report Image ${index + 1}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='update-modal-button-box'>
                                <button onClick={denyReport} className='deny-modal-button'>Deny</button>
                                <button onClick={respondToReport} className='update-modal-button'>Respond</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
