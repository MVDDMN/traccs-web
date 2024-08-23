import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './SummaryReport.css';

const SummaryReport = () => {
    const [reportSummary, setReportSummary] = useState({
        totalReports: 0,
        pendingReports: 0,
        completedReports: 0,
        inProgressReports: 0
    });

    const [reportFrequency, setReportFrequency] = useState({
        peakHourLabels: [],
        maxFrequency: 0
    });

    const [reportTypeSummary, setReportTypeSummary] = useState([]);

    useEffect(() => {
        const fetchReportSummary = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/analytics/reports-summary-status');
                setReportSummary(response.data);
            } catch (error) {
                console.error('Error fetching report summary:', error);
            }
        };

        const fetchReportTypeSummary = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/analytics/report-summary');
                setReportTypeSummary(response.data);
            } catch (error) {
                console.error('Error fetching report type summary:', error);
            }
        };

        const fetchReportFrequency = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/analytics/report-frequency-by-peak');
                setReportFrequency(response.data);
            } catch (error) {
                console.error('Error fetching report frequency:', error);
            }
        };

        fetchReportSummary();
        fetchReportTypeSummary();
        fetchReportFrequency();
    }, []);

    const renderReportTypeSummary = () => {
        return reportTypeSummary
            .map(reportType => `${reportType._id}: ${reportType.totalReports} report${reportType.totalReports > 1 ? 's' : ''}`)
            .join(', ');
    };

    return (
        <div className='summaryreport-descriptive-box'>
            <a className='summaryreport-title'>Reports Summary</a>
            <a className='summaryreport-paragraph'>
                ⓘ As of now, a total of {reportSummary.totalReports} reports have been submitted. 
                Out of these, {reportSummary.pendingReports} reports 
                are currently pending, {reportSummary.inProgressReports} are 
                in progress, and {reportSummary.completedReports} have been successfully completed.
            </a>
            <a className='summaryreport-paragraph'>
                ⓘ As of now these are the reports and are categorized as follows: {renderReportTypeSummary()}
            </a>
            <a className='summaryreport-paragraph'>
                ⓘ The highest frequency of reports occurred at {reportFrequency.peakHourLabels.join(', ')}, 
                with a total of {reportFrequency.maxFrequency} reports submitted during these hours.
            </a>
            <div className='summaryreport-button-box'>
                <Link to="/admin/analytics/analyticsreports"><button className='summaryreport-button'>Report Charts</button></Link>
            </div>
        </div>
    );
};

export default SummaryReport;
