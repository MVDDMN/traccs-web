import React, { useState } from 'react';
import './AnalyticsReports.css';

/* Report Charts */
import ReportFrequency from './Charts/ReportFrequency';
import ReportSummary from './Charts/ReportSummary';
import ResponseTime from './Charts/ResponseTime';
import ReportTime from './Charts/ReportTime';
import ReportStats from './Charts/ReportStats';

const AnalyticsReports = () => {
  const [selectedChart, setSelectedChart] = useState('ReportStats'); // State to track selected chart

  // Handle the dropdown selection
  const handleChartChange = (event) => {
    setSelectedChart(event.target.value);
  };

  return (
    <div className='analyticsreports-module-content'>

      <div className='analyticsreports-content-container'>

        <div className='analyticsreports-table-title-box'>
          <a className='analyticsreports-table-title-text'>Reports Analytics</a>
          <a className='analyticsreports-table-description'>
            ⓘ
            <span className='tooltip-text'>
              This page contains all the historical report data recorded within the system 
              displaying their descriptive summarized data.
            </span>
          </a>
        </div>

        <div className='analyticsreports-dropdown-container'>
          <select value={selectedChart} onChange={handleChartChange} className='analyticsreports-dropdown'>
            <option value="ReportStats">Report Performance Statistics</option>
            <option value="ReportSummary">Report Summary by Type</option>
            <option value="ReportTime">Report Frequency per Hour</option>
            <option value="ReportFrequency">Report Frequency per Month</option>
            <option value="ResponseTime">Response Response Average Time</option>
          </select>
        </div>


        <div className='analyticsreports-charts-container'>
          {selectedChart === 'ReportSummary' && <ReportSummary />}
          {selectedChart === 'ReportTime' && <ReportTime />}
          {selectedChart === 'ReportStats' && <ReportStats />}
          {selectedChart === 'ResponseTime' && <ResponseTime />}
          {selectedChart === 'ReportFrequency' && <ReportFrequency />}
        </div>

      </div>

    </div>
  );
};

export default AnalyticsReports;
