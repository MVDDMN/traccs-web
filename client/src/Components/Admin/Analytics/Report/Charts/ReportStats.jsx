import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ReportStats.css';
import usericon from '../../../../Assets/user.png';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportStats = ({ dateFrom, dateTo }) => {
    const [stats, setStats] = useState({ totalReports: 0, reportsThisMonth: 0, reportsToday: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noData, setNoData] = useState(false);  // Track if no data is available

    // Fetch report stats when the date range changes
    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            setNoData(false); // Reset noData state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-stats`, {
                    params: { dateFrom, dateTo } // Send dateFrom and dateTo as query parameters
                });
                
                if (response.data && response.data.totalReports > 0) {
                    setStats(response.data);
                } else {
                    setNoData(true);  // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching report stats:', error);
                setError('Error fetching report statistics.');
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) { // Ensure both dates are selected
            fetchStats();
        }
    }, [dateFrom, dateTo]);

    return (
        <div className='report-stats-container'>
            <div className='report-stats-header'>
                <a className='report-stats-title'>Report Statistics</a>
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p>Loading...</p>
            ) : noData ? (
                <p>No data available for the selected date range.</p>
            ) : (
                <div className="report-stats">
                    <div className="stat-item">
                        <div className="stat-info">
                            <a className='report-stats-item-title'>Total Reports</a>
                            <p>{stats.totalReports}</p>
                        </div>
                        <img className='report-stat-icon' src={usericon} alt="Icon" />
                    </div>
                    <div className="stat-item">
                        <div className="stat-info">
                            <a className='report-stats-item-title'>Reports This Month</a>
                            <p>{stats.reportsThisMonth}</p>
                        </div>
                        <img className='report-stat-icon' src={usericon} alt="Icon" />
                    </div>
                    <div className="stat-item">
                        <div className="stat-info">
                            <a className='report-stats-item-title'>Reports Today</a>
                            <p>{stats.reportsToday}</p>
                        </div>
                        <img className='report-stat-icon' src={usericon} alt="Icon" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportStats;
