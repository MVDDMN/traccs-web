import React, { useState } from 'react';
import './AnalyticsRequests.css';

/* Requests Charts */
import BarangaySummary from './Charts/BarangaySummary';
import PieSummary from './Charts/PieSummary';
import TypeSummary from './Charts/TypeSummary';
import RequestsStats from './Charts/RequestsStats';

const AnalyticsRequests = () => {
    const [selectedChart, setSelectedChart] = useState('RequestsStats'); // State to track selected chart

    // Handle the dropdown selection
    const handleChartChange = (event) => {
        setSelectedChart(event.target.value);
    };

    return (
        <div className='analyticsrequests-module-content'>
            
            <div className='analyticsrequests-content-container'>

                <div className='analyticsrequests-table-title-box'>
                    <a className='analyticsrequests-table-title-text'>Requests Analytics</a>
                    <a className='analyticsrequests-table-description'>
                        ⓘ
                        <span className='tooltip-text'>
                            This page contains all the request analytics recorded within the system
                            displaying their descriptive summarized data.
                        </span>
                    </a>
                </div>

                <div className='analyticsrequests-dropdown-container'>
                    <select value={selectedChart} onChange={handleChartChange} className='analyticsrequests-dropdown'>
                        <option value="RequestsStats">Request Stats</option>
                        <option value="TypeSummary">Type Summary</option>
                        <option value="BarangaySummary">Barangay Summary</option>
                        <option value="PieSummary">Pie Summary</option>
                    </select>
                </div>

                <div className='analyticsrequests-charts-container'>
                    {selectedChart === 'TypeSummary' && <TypeSummary />}
                    {selectedChart === 'RequestsStats' && <RequestsStats />}
                    {selectedChart === 'BarangaySummary' && <BarangaySummary />}
                    {selectedChart === 'PieSummary' && <PieSummary />}
                </div>

            </div>

        </div>
    );
};

export default AnalyticsRequests;
