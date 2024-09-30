import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './reportMonth.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportMonth = ({ dateFrom, dateTo }) => {
    const [reportData, setReportData] = useState([]);
    const [reportSummary, setReportSummary] = useState(""); // Single state for unified trends
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false); // Track if no data is available

    useEffect(() => {
        const fetchReportFrequency = async () => {
            setLoading(true);
            setNoData(false); // Reset no data state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-frequency`, {
                    params: { dateFrom, dateTo }
                });
                const data = response.data;

                if (data && data.length > 0 && data.some(item => item.count > 0)) {
                    setReportData(data);
                    generateReportDescription(data);
                } else {
                    setNoData(true); // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching report frequency data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchReportFrequency(); // Fetch data when both dates are set
        }
    }, [dateFrom, dateTo]);

    // Function to generate descriptive trends based on the data
    const generateReportDescription = (data) => {
        let reportSummary = "";

        const totalReports = data.reduce((sum, report) => sum + report.count, 0);
        const reportByMonth = data.reduce((acc, curr) => {
            const monthIndex = curr.month - 1; // Convert to 0-based index for arrays
            acc[monthIndex] = (acc[monthIndex] || 0) + curr.count;
            return acc;
        }, Array(12).fill(0)); // Array to store monthly counts

        const monthWithMostReports = reportByMonth.indexOf(Math.max(...reportByMonth));
        const monthWithMostReportsCount = Math.max(...reportByMonth);
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const previousMonthIndex = monthWithMostReports === 0 ? 11 : monthWithMostReports - 1;
        const previousMonthCount = reportByMonth[previousMonthIndex];

        if (monthWithMostReports >= 0) {
            reportSummary += `The month with the most received reports is ${monthNames[monthWithMostReports]} with a total of ${monthWithMostReportsCount} reports. `;
        }

        // Only show the comparison if there is data for the previous month
        if (previousMonthCount > 0) {
            const percentageChange = ((monthWithMostReportsCount - previousMonthCount) / previousMonthCount) * 100;
            if (percentageChange > 0) {
                reportSummary += `This shows an increase of ${percentageChange.toFixed(2)}% in the total number of reports compared to ${monthNames[previousMonthIndex]}. `;
            } else {
                reportSummary += `This shows a decrease of ${Math.abs(percentageChange).toFixed(2)}% in the total number of reports compared to ${monthNames[previousMonthIndex]}. `;
            }
        }

        // Find the most prevalent report type in that month
        const reportByType = data.reduce((acc, curr) => {
            if (!acc[curr.type]) {
                acc[curr.type] = 0;
            }
            acc[curr.type] += curr.count;
            return acc;
        }, {});

        const prevalentReportType = Object.keys(reportByType).reduce((a, b) => reportByType[a] > reportByType[b] ? a : b);
        const prevalentReportCount = reportByType[prevalentReportType];

        if (prevalentReportType && prevalentReportCount) {
            reportSummary += `The most prevalent report type in ${monthNames[monthWithMostReports]} is "${prevalentReportType}" with a total of ${prevalentReportCount} reports. `;
        }

        // Add suggestive narratives based on the prevalent report type
        const suggestiveNarrative = getSuggestionBasedOnType(prevalentReportType);
        reportSummary += suggestiveNarrative;

        setReportSummary(reportSummary || "No significant trends detected.");
    };

    // Function to get suggestive narratives based on the most prevalent report type
    const getSuggestionBasedOnType = (reportType) => {
        switch (reportType) {
            case 'Fire':
                return 'Consider enhancing fire safety protocols, ensuring that fire extinguishers are accessible and up to date, and conducting fire drills for staff and residents. ';
            case 'Police':
                return 'Review security protocols and increase surveillance in areas with a high crime rate. Work with local law enforcement to increase patrols and community safety initiatives. ';
            case 'Hazard':
                return 'Conduct safety inspections and mitigate potential hazards in public areas. Ensure that any identified hazards are clearly marked or removed to prevent accidents. ';
            case 'Medical':
                return 'Ensure that first-aid kits are fully stocked and accessible. Provide first-aid training to staff and ensure that emergency contact information is readily available. ';
            case 'Assistance':
                return 'Ensure that resources are allocated efficiently to assist those in need. Consider setting up an efficient communication system to respond to assistance requests promptly. ';
            default:
                return 'No specific actions recommended for the prevalent report type. Continue monitoring the situation closely. ';
        }
    };

    return (
        <div className='desc-reportmonth-container'>
            <div className='desc-reportmonth-title'>
                <label className='desc-reportmonth-title-text'>
                    Report Descriptive Summary 
                </label>
            </div>

            <div className='desc-reportmonth-content-box'>
                {loading ? (
                    <p>Loading trends...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <div className='desc-reportmonth-trends-box'>
                        <p>{reportSummary}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportMonth;
