import React from 'react';
import './AnalyticsRequests.css';

/*Requests Charts*/
import BarangaySummary from './Charts/BarangaySummary';
import PieSummary from './Charts/PieSummary';
import TypeSummary from './Charts/TypeSummary';

const AnalyticsRequests = () => {
    
  return (
    <div className='analyticsrequests-module-content'>
      
      <div className='analyticsrequests-charts-container'>
        <TypeSummary/>
      </div>
      <div className='analyticsrequests-charts-container'>
        <BarangaySummary/>
        <PieSummary/>
      </div>

    </div>
  );
};

export default AnalyticsRequests;
