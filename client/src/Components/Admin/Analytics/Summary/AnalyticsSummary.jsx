import React from 'react';
import './AnalyticsSummary.css';

/*Screens*/
import SummaryReport from './Reports/SummaryReport';
import SummaryRequests from './Requests/SummaryRequest';

/*Charts*/
import ReportStats from './Reports/Charts/ReportStats';
import RequestStats from './Requests/Charts/RequestsStats';

const AnalyticsSummary = () => {
    return (
        <div className='analyticssummary-module-content'>

            <div className='analyticssummary-charts-container'>
                <div className='analyticssummary-charts-box'>
                    <ReportStats />
                    <SummaryReport />
                </div>
                <div className='analyticssummary-charts-box'>
                    <RequestStats />
                    <SummaryRequests />
                </div>
            </div>

        </div>  
    );
};

export default AnalyticsSummary;
