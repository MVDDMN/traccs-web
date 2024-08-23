import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ReportStats.css';
import usericon from '../../../../../Assets/user.png';

const ReportStats = () => {
    const [stats, setStats] = useState({ totalReports: 0, reportsThisMonth: 0, reportsToday: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/analytics/report-stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching report stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className='report-stats-container'>
            <a className='report-stats-title'>Report Leads</a>
            <div className="report-stats">
                
                <div className="stat-item">
                    <div className="stat-info">
                        <a className='report-stats-item-title'>Total Reports</a>
                        <p>{stats.totalReports}</p>
                    </div>
                    <img className='report-stat-icon' src={usericon} />
                </div>
                <div className="stat-item">
                    <div className="stat-info">
                        <a className='report-stats-item-title'>Reports This Month</a>
                        <p>{stats.reportsThisMonth}</p>
                    </div>
                    <img className='report-stat-icon' src={usericon} />
                </div>
                <div className="stat-item">
                    <div className="stat-info">
                        <a className='report-stats-item-title'>Reports Today</a>
                        <p>{stats.reportsToday}</p>
                    </div>
                    <img className='report-stat-icon' src={usericon} />
                </div>
            </div>
        </div>
    );
};

export default ReportStats;
