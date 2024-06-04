import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Archive.css';

const Archive = () => {
    const [archives, setArchives] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArchive, setSelectedArchive] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Filtering state
    const [selectedTypes, setSelectedTypes] = useState({
        Fire: true,
        Accident: true,
        Police: true,
        Medical: true,
        Hazard: true
    });
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchArchives = async () => {
            try {
                const response = await axios.get('http://localhost:3001/archives');
                setArchives(response.data);
            } catch (error) {
                console.error('Error fetching archives:', error);
            }
        };

        fetchArchives();
        const interval = setInterval(fetchArchives, 1000);

        return () => clearInterval(interval);
    }, []);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const filteredArchives = archives.filter(archive => {
        const archiveMonth = new Date(archive.date).toLocaleString('default', { month: 'long' });
        return selectedTypes[archive.type] && (selectedMonths.length === 0 || selectedMonths.includes(archiveMonth));
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

    const deleteArchive = async () => {
        try {
            await axios.post('http://localhost:3001/deleteArchive', { archiveId: selectedArchive._id });
            setArchives(archives.filter(archive => archive._id !== selectedArchive._id));
            closeModal();
        } catch (error) {
            console.error('Error deleting archive:', error);
        }
    };

    const addToHistoryMap = async () => {
        try {
            await axios.post('http://localhost:3001/addToHistoryMap', { archiveId: selectedArchive._id });
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
            </div>

            <div className='archive-table-container'>
                <div className='archive-table-box'>
                    <table className='archive-table'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentArchives.map(archive => (
                                <tr key={archive._id}>
                                    <td>{archive._id}</td>
                                    <td>{archive.name}</td>
                                    <td>{archive.type}</td>
                                    <td>{archive.date}</td>
                                    <td>{archive.time}</td>
                                    <td>
                                        <button onClick={() => handleViewArchive(archive)} className='table-view-button'>
                                            View Information
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className='pagination'>
                    <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>

            {isModalOpen && selectedArchive && (
                <div className="reports-modal">
                    <div className="reports-modal-content">
                        <div className='reports-modal-content-box'>
                            <div className='close-modal-button-box'>
                                <button onClick={closeModal} className='close-modal-button'>X</button>
                            </div>

                            <div className='reports-title-box'>
                                <h2>Archive Details</h2>
                            </div>

                            <div className='reports-details-container'>
                                <div className='reports-details-modal-box'>
                                    <div className='reports-text-box'>
                                        <a className='reports-title-text'>
                                            Report Type:
                                            <b className='reports-content-text'>{selectedArchive.type}</b>
                                        </a>
                                    </div>
                                    <div className='reports-text-box'>
                                        <a className='reports-title-text'>
                                            ID:
                                            <b className='reports-content-text'>{selectedArchive._id}</b>
                                        </a>
                                        <a className='reports-title-text'>
                                            Name:
                                            <b className='reports-content-text'>{selectedArchive.name}</b>
                                        </a>
                                    </div>
                                    <div className='reports-text-box'>
                                        <a className='reports-title-text'>
                                            Date:
                                            <b className='reports-content-text'>{selectedArchive.date}</b>
                                        </a>
                                        <a className='reports-title-text'>
                                            Time:
                                            <b className='reports-content-text'>{selectedArchive.time}</b>
                                        </a>
                                    </div>
                                    <div className='reports-text-box'>
                                        <a className='reports-title-text'>
                                            Address:
                                            <b className='reports-content-text'>{selectedArchive.address}</b>
                                        </a>
                                        <a className='reports-title-text'>
                                            Location:
                                            <b className='reports-content-text'>{selectedArchive.location}</b>
                                        </a>
                                    </div>
                                    <div className='reports-description-box'>
                                        <a className='description-title-text'>Description</a>
                                        <textarea className='reports-description-area' value={selectedArchive.description} readOnly />
                                    </div>
                                    <div className='reports-description-box'>
                                        <a className='description-title-text'>Images</a>
                                        <div className='reports-image-box'>
                                            {selectedArchive && selectedArchive.image && selectedArchive.image.map((imageUrl, index) => (
                                                <img key={index} src={imageUrl} alt={`Archive Image ${index + 1}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='update-modal-button-box'>
                                <button onClick={deleteArchive} className='delete-modal-button'>Delete</button>
                                <button onClick={addToHistoryMap} className='update-modal-button'>Add to History Map</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Archive;
