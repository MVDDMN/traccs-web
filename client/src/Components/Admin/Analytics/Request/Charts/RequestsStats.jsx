
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './RequestsStats.css';
import usericon from '../../../../Assets/user.png';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const RequestsStats = () => {
    const [stats, setStats] = useState({ totalRequests: 0, requestsThisMonth: 0, requestsToday: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/requests-stats`);
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching requests stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className='requests-stats-container'>
            <div className='requests-stats-title-box'>
                <a className='requests-stats-title'>Request Leads</a>
            </div>
            
            <div className="requests-stats">
                
                <div className="requests-stats-item">
                    <div className="requests-stats-info">
                        <a className='requests-stats-item-title'>Total Requests</a>
                        <p>{stats.totalRequests}</p>
                    </div>
                    <img className='requests-stat-icon' src={usericon} />
                </div>
                <div className="requests-stats-item">
                    <div className="requests-stats-info">
                        <a className='requests-stats-item-title'>Requests This Month</a>
                        <p>{stats.requestsThisMonth}</p>
                    </div>
                    <img className='requests-stat-icon' src={usericon} />
                </div>
                <div className="requests-stats-item">
                    <div className="requests-stats-info">
                        <a className='requests-stats-item-title'>Requests Today</a>
                        <p>{stats.requestsToday}</p>
                    </div>
                    <img className='requests-stat-icon' src={usericon} />
                </div>
            </div>
        </div>
    );
};

export default RequestsStats;
