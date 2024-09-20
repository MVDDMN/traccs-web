import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ReportStats.css';
import usericon from '../../../../Assets/user.png';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportStats = () => {
    const [stats, setStats] = useState({ totalReports: 0, reportsThisMonth: 0, reportsToday: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('');
    const [availableYears, setAvailableYears] = useState([]); // Track available years
    const [error, setError] = useState(null);

    // Fetch available years and set default year on component mount
    useEffect(() => {
        const fetchAvailableYears = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-stats`);
                const years = response.data.availableYears || []; // Handle case where availableYears might be undefined

                if (years.length > 0) {
                    setAvailableYears(years);
                    setSelectedYear(years[0]); // Default to the first year
                }
            } catch (error) {
                setError('Error fetching available years');
                console.error('Error fetching available years:', error);
            }
        };

        fetchAvailableYears();
    }, []);

    // Fetch report stats when the selected year changes
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-stats`, {
                    params: { year: selectedYear } // Send selected year as a query param
                });
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching report stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (selectedYear) { // Ensure selectedYear is defined before fetching data
            fetchStats();
        }
    }, [selectedYear]);

    // Handle year dropdown change
    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    return (
        <div className='report-stats-container'>
            <div className='report-stats-header'>
                <a className='report-stats-title'>Report Statistics ({selectedYear})</a>

                {/* Year Dropdown */}
                {availableYears.length > 0 && (
                    <select value={selectedYear} onChange={handleYearChange} className='report-stats-year-dropdown'>
                        {availableYears.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="report-stats">
                <div className="stat-item">
                    <div className="stat-info">
                        <a className='report-stats-item-title'>Total Reports</a>
                        <p>{loading ? 'Loading...' : stats.totalReports}</p>
                    </div>
                    <img className='report-stat-icon' src={usericon} alt="Icon" />
                </div>
                <div className="stat-item">
                    <div className="stat-info">
                        <a className='report-stats-item-title'>Reports This Month</a>
                        <p>{loading ? 'Loading...' : stats.reportsThisMonth}</p>
                    </div>
                    <img className='report-stat-icon' src={usericon} alt="Icon" />
                </div>
                <div className="stat-item">
                    <div className="stat-info">
                        <a className='report-stats-item-title'>Reports Today</a>
                        <p>{loading ? 'Loading...' : stats.reportsToday}</p>
                    </div>
                    <img className='report-stat-icon' src={usericon} alt="Icon" />
                </div>
            </div>
        </div>
    );
};

export default ReportStats;
