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

    // Helper function to format the date
    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    // Function to generate descriptive trends based on the data
    const generateReportDescription = (data) => {
        let reportSummary = "";

        const totalReports = data.reduce((sum, report) => sum + report.count, 0);

        reportSummary += `Between ${formatDate(dateFrom)} and ${formatDate(dateTo)}, a total of ${totalReports} reports were submitted. `;

        // Analyze monthly report data
        const reportByMonth = data.reduce((acc, curr) => {
            const monthIndex = curr.month - 1; // Convert to 0-based index for arrays
            acc[monthIndex] = (acc[monthIndex] || 0) + curr.count;
            return acc;
        }, Array(12).fill(0)); // Array to store monthly counts

        const monthsWithReports = reportByMonth.filter(count => count > 0);

        if (monthsWithReports.length > 1) {
            const monthWithMostReports = reportByMonth.indexOf(Math.max(...reportByMonth));
            const monthWithMostReportsCount = Math.max(...reportByMonth);
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            if (monthWithMostReports >= 0 && monthWithMostReportsCount > 0) {
                reportSummary += `The month with the most reports is ${monthNames[monthWithMostReports]}, totaling ${monthWithMostReportsCount} incidents. `;
            }
        }

        // Display message for all months that have data available
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        reportByMonth.forEach((count, index) => {
            if (count > 0) {
                reportSummary += `${monthNames[index]} had ${count} reports. `;
            }
        });

        // Calculate and compare the percentage change between consecutive months if applicable
        if (reportByMonth.some(count => count > 0)) {
            let previousMonthIndex = -1;
            for (let i = 0; i < reportByMonth.length; i++) {
                if (reportByMonth[i] > 0) {
                    if (previousMonthIndex >= 0) {
                        const currentMonthIndex = i;
                        const previousMonthCount = reportByMonth[previousMonthIndex];
                        const currentMonthCount = reportByMonth[currentMonthIndex];

                        if (previousMonthCount > 0 && currentMonthCount > 0) {
                            const percentageChange = (((currentMonthCount - previousMonthCount) / previousMonthCount) * 100).toFixed(2);
                            const changeDirection = currentMonthCount > previousMonthCount ? 'increased' : 'decreased';
                            reportSummary += `Compared to ${monthNames[previousMonthIndex]}, the number of reports in ${monthNames[currentMonthIndex]} ${changeDirection} by ${Math.abs(percentageChange)}%. `;
                        } else if (previousMonthCount > 0 && currentMonthCount === 0) {
                            reportSummary += `In ${monthNames[currentMonthIndex]}, there were no reports, representing a complete drop compared to ${previousMonthCount} reports in ${monthNames[previousMonthIndex]}. `;
                        }
                    }
                    previousMonthIndex = i;
                }
            }
        }

        // Find the most prevalent report type overall
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
            reportSummary += `The most prevalent report type overall was "${prevalentReportType}", with ${prevalentReportCount} incidents recorded. `;
        }

        // Add suggestive narratives based on the prevalent report type
        const suggestiveEndingNarratives = getSuggestionsForType(prevalentReportType);
        const randomEnding = suggestiveEndingNarratives[Math.floor(Math.random() * suggestiveEndingNarratives.length)];
        reportSummary += randomEnding;

        setReportSummary(reportSummary || "No significant trends detected.");
    };

    // Function to get suggestive narratives based on the most prevalent report type
    const getSuggestionsForType = (reportType) => {
        switch (reportType) {
            case 'Fire':
                return [
                    'Consider enhancing fire safety protocols, ensuring that fire extinguishers are accessible and up to date, and conducting fire drills for staff and residents.',
                    'Increasing community awareness about fire hazards and providing training on fire safety measures can help reduce incidents in the future.'
                ];
            case 'Police':
                return [
                    'Review security protocols and increase surveillance in areas with a high crime rate. Work with local law enforcement to increase patrols and community safety initiatives.',
                    'Engaging the community in discussions about safety and crime prevention strategies can foster a safer environment.'
                ];
            case 'Hazard':
                return [
                    'Conduct safety inspections and mitigate potential hazards in public areas. Ensure that any identified hazards are clearly marked or removed to prevent accidents.',
                    'Educating the community about hazard recognition and reporting can contribute to a safer environment.'
                ];
            case 'Medical':
                return [
                    'Ensure that first-aid kits are fully stocked and accessible. Provide first-aid training to staff and ensure that emergency contact information is readily available.',
                    'Promoting health awareness campaigns can help in addressing medical emergencies proactively.'
                ];
            case 'Assistance':
                return [
                    'Ensure that resources are allocated efficiently to assist those in need. Consider setting up an efficient communication system to respond to assistance requests promptly.',
                    'Fostering partnerships with local organizations can improve the community’s capacity to provide assistance.'
                ];
            default:
                return [
                    'No specific actions recommended for the prevalent report type. Continue monitoring the situation closely.',
                    'Maintaining open lines of communication with community members can help in understanding their needs better.'
                ];
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
