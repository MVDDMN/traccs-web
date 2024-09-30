import React, { useState } from 'react';
import './AnalyticsRequests.css';

/* Requests Charts */
import BarangaySummary from './Charts/BarangaySummary';
import PieSummary from './Charts/PieSummary';
import TypeSummary from './Charts/TypeSummary';
import RequestsStats from './Charts/RequestsStats';

/* Descriptive Components */
import DescriptiveRequestStats from './Descriptive/requestStats';
import DescriptiveTypeSummary from './Descriptive/typeSummary';
import DescriptiveBarangaySummary from './Descriptive/barangaySummary';
import DescriptivePieSummary from './Descriptive/pieSummary';

const AnalyticsRequests = () => {
    const [selectedChart, setSelectedChart] = useState('RequestsStats'); // State to track selected chart
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Handle the dropdown selection
    const handleChartChange = (event) => {
        setSelectedChart(event.target.value);
    };

    // Check if both dates are selected
    const isDateRangeSelected = dateFrom !== '' && dateTo !== '';

    return (
        <div className='analyticsrequests-module-content'>
            <div className='analyticsrequests-content-container'>

                <div className='analyticsrequests-table-title-box'>
                    <a className='analyticsrequests-table-title-text'>Requests Analytics</a>
                    <a className='analyticsrequests-table-description'>
                        ⓘ
                        <span className='tooltip-text'>
                            This page contains all the request analytics recorded within the system displaying their charts and descriptive summarized data.
                        </span>
                    </a>
                </div>

                <div className='analyticsrequests-input-container'>
                    {/* Dropdown for chart selection */}
                    <div className='analyticsrequests-dropdown-container'>
                        <label>Select a Chart:</label>
                        <select value={selectedChart} onChange={handleChartChange} className='analyticsrequests-dropdown'>
                            <option value="RequestsStats">Request Statistics</option>
                            <option value="TypeSummary">Request Type Summary</option>
                            <option value="BarangaySummary">Request Barangay Summary</option>
                            <option value="PieSummary">Request Pie Chart Summary</option>
                        </select>
                    </div>

                    {/* Date range pickers */}
                    <div className='analyticsrequests-date-picker-container'>
                        <label>Date from:</label>
                        <input
                            type='date'
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className='analyticsrequests-date-input'
                        />
                        <label>Date to:</label>
                        <input
                            type='date'
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className='analyticsrequests-date-input'
                        />
                    </div>
                </div>

                {/* Render selected chart and description only if both dateFrom and dateTo are selected */}
                {isDateRangeSelected ? (
                    <div className='analyticsrequests-charts-container'>
                        {selectedChart === 'RequestsStats' && <RequestsStats dateFrom={dateFrom} dateTo={dateTo} />}
                        {selectedChart === 'TypeSummary' && <TypeSummary dateFrom={dateFrom} dateTo={dateTo} />}
                        {selectedChart === 'BarangaySummary' && <BarangaySummary dateFrom={dateFrom} dateTo={dateTo} />}
                        {selectedChart === 'PieSummary' && <PieSummary dateFrom={dateFrom} dateTo={dateTo} />}
                        
                        {/* Descriptive summaries */}
                        {selectedChart === 'RequestsStats' && <DescriptiveRequestStats dateFrom={dateFrom} dateTo={dateTo} />}
                        {selectedChart === 'TypeSummary' && <DescriptiveTypeSummary dateFrom={dateFrom} dateTo={dateTo} />}
                        {selectedChart === 'BarangaySummary' && <DescriptiveBarangaySummary dateFrom={dateFrom} dateTo={dateTo} />}
                        {selectedChart === 'PieSummary' && <DescriptivePieSummary dateFrom={dateFrom} dateTo={dateTo} />}
                    </div>
                ) : (
                    <div className='analyticsrequests-prompt-cont'>
                        <p className='analyticsrequests-prompt animated-prompt'>Please select a date range to display the requests.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsRequests;
