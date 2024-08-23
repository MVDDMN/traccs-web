import React from 'react';
import './AnalyticsReports.css'

/*Report Charts*/
import ReportFrequency from './Charts/ReportFrequency';
import ReportSummary from './Charts/ReportSummary';
import ResponseTime from './Charts/ResponseTime';
import ReportTime from './Charts/ReportTime';

const AnalyticsReports = () => {

  return (
    <div className='analyticsreports-module-content'>
      
        <div className='analyticsreports-charts-container'>
            <ReportSummary/>
            <ReportTime/>
        </div>

        <div className='analyticsreports-charts-container'>
            <ResponseTime/>
            <ReportFrequency/>            
        </div>

    </div>
  );
};

export default AnalyticsReports;
