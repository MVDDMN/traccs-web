import React, { useState } from 'react';
import './AnalyticsReports.css';
import ReportFrequency from './Charts/ReportFrequency';
import ReportSummary from './Charts/ReportSummary';
import ResponseTime from './Charts/ResponseTime';
import ReportTime from './Charts/ReportTime';
import ReportStats from './Charts/ReportStats';
import DescriptiveStats from './Descriptive/reportStats';
import DescriptiveSummary from './Descriptive/reportSummary';
import DescriptiveTime from './Descriptive/reportTime';
import DescriptiveMonth from './Descriptive/reportMonth';
import DescriptiveResponse from './Descriptive/responseTime';

const AnalyticsReports = () => {
  const [selectedChart, setSelectedChart] = useState('ReportStats'); // State to track selected chart
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Handle the dropdown selection
  const handleChartChange = (event) => {
    setSelectedChart(event.target.value);
  };

  // Check if both dates are selected
  const isDateRangeSelected = dateFrom !== '' && dateTo !== '';

  return (
    <div className='analyticsreports-module-content'>
      <div className='analyticsreports-content-container'>

        <div className='analyticsreports-table-title-container'>
          <div className='analyticsreports-table-title-box'>
            <a className='analyticsreports-table-title-text'>Reports Analytics</a>
            <a className='analyticsreports-table-description'>
              ⓘ
              <span className='tooltip-text'>
                This page allows you to view all the historical report data recorded within the system
                displaying their analytical charts and descriptive summarized data.
              </span>
            </a>
          </div>
        </div>

        <div className='analyticsreports-input-container'>
          {/* Dropdown for chart selection */}
          <div className='analyticsreports-dropdown-container'>
            <label>Select a Chart:</label>
            <select value={selectedChart} onChange={handleChartChange} className='analyticsreports-dropdown'>
              <option value="ReportStats">Report Statistics</option>
              <option value="ReportSummary">Report Summary by Type</option>
              <option value="ReportTime">Report Frequency per Hour</option>
              <option value="ReportFrequency">Report Frequency per Month</option>
              <option value="ResponseTime">Average Response Time</option>
            </select>
          </div>

          {/* Date range pickers */}
          <div className='analyticsreports-date-picker-container'>
            <label>Date from:</label>
            <input
              type='date'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className='analyticsreports-date-input'
            />
            <label>Date to:</label>
            <input
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className='analyticsreports-date-input'
            />
          </div>
        </div>

        {/* Render selected chart and description only if both dateFrom and dateTo are selected */}
        {isDateRangeSelected ? (
          <div className='analyticsreports-charts-container'>
            {selectedChart === 'ReportStats' && <ReportStats dateFrom={dateFrom} dateTo={dateTo} />}
            {selectedChart === 'ReportSummary' && <ReportSummary dateFrom={dateFrom} dateTo={dateTo} />}
            {selectedChart === 'ReportTime' && <ReportTime dateFrom={dateFrom} dateTo={dateTo} />}
            {selectedChart === 'ResponseTime' && <ResponseTime dateFrom={dateFrom} dateTo={dateTo} />}
            {selectedChart === 'ReportFrequency' && <ReportFrequency dateFrom={dateFrom} dateTo={dateTo} />}
            {selectedChart === 'ReportStats' && <DescriptiveStats dateFrom={dateFrom} dateTo={dateTo} />}
            {selectedChart === 'ReportSummary' && <DescriptiveSummary dateFrom={dateFrom} dateTo={dateTo} />}
            {selectedChart === 'ReportTime' && <DescriptiveTime dateFrom={dateFrom} dateTo={dateTo} />}
            {selectedChart === 'ReportFrequency' && <DescriptiveMonth dateFrom={dateFrom} dateTo={dateTo} />}
            {selectedChart === 'ResponseTime' && <DescriptiveResponse dateFrom={dateFrom} dateTo={dateTo} />}
          </div>
        ) : (
          <div className='analyticsreports-prompt-cont'>
            <p className='analyticsreports-prompt animated-prompt'>Please select a date range to display the reports.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsReports;
