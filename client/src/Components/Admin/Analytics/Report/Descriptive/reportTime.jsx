import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './reportTime.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportTime = ({ dateFrom, dateTo }) => {
    const [reportData, setReportData] = useState([]);
    const [reportSummary, setReportSummary] = useState(""); // Unified state for trends
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false); // Track if no data is available
    const [error, setError] = useState(null); // Track if there is an error in the date range

    useEffect(() => {
        const fetchReportFrequency = async () => {
            setLoading(true);
            setNoData(false); // Reset no data state
            setError(null);  // Reset error state

            // Check if the date range is within 24 hours
            const startDate = new Date(dateFrom);
            const endDate = new Date(dateTo);
            const timeDifference = endDate.getTime() - startDate.getTime();

            // If the difference is greater than 24 hours, show an error
            if (timeDifference > 24 * 60 * 60 * 1000) {
                setError('The selected date range must be within a single day (24 hours). For example: "1 September 2024 -> 2 September 2024".');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-frequency-by-hour`, {
                    params: { dateFrom, dateTo }
                });

                const { data } = response; // Assuming data is the main response
                if (data && data.data && data.data.length > 0 && data.data.some(count => count > 0)) {
                    setReportData(data);
                    generateReportDescription(data); // Generate unified report description
                } else {
                    setNoData(true); // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching report frequency by hour:', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchReportFrequency();  // Fetch data when both dateFrom and dateTo are set
        }
    }, [dateFrom, dateTo]);

    // Helper function to convert 24-hour time to 12-hour format
    const formatHour12 = (hour) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12; // Convert 0 to 12 for AM
        return `${hour12}:00 ${period}`;
    };

    // Helper function to format the date
    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    // Function to generate unified report description based on trends and the new narrative
    const generateReportDescription = (data) => {
        let reportDescription = "";

        const totalReports = data.data.reduce((sum, count) => sum + count, 0);

        // Check if there were significant reports overall
        if (totalReports > 100) {
            reportDescription += `There has been a high volume of reports, with over ${totalReports} incidents recorded across the selected date range. `;
        } else {
            reportDescription += `A total of ${totalReports} incidents were recorded within the selected period. `;
        }

        // Find the most active hour and the least active hour
        const mostActiveHour = data.data.reduce((prev, count, index) => (count > prev.count ? { count, hour: index } : prev), { count: 0 });
        const leastActiveHour = data.data.reduce((prev, count, index) => (count < prev.count && count > 0 ? { count, hour: index } : prev), { count: Infinity });

        // If the most active hour exists, show the most prevalent report type
        if (mostActiveHour.count > 0) {
            const breakdown = data.breakdownByHour[mostActiveHour.hour];  // Access the breakdown by hour
            const highestType = Object.keys(breakdown).reduce((a, b) => breakdown[a] > breakdown[b] ? a : b);
            reportDescription += `The prevalent time for reports was at ${formatHour12(mostActiveHour.hour)}, with '${highestType}' being the most common issue at ${breakdown[highestType]} occurrences. `;
        }

        // Check for trends in peak hours
        const morningReports = data.data.slice(6, 12).reduce((sum, count) => sum + count, 0);
        const afternoonReports = data.data.slice(12, 18).reduce((sum, count) => sum + count, 0);
        const eveningReports = data.data.slice(18, 24).reduce((sum, count) => sum + count, 0);

        if (morningReports > afternoonReports && morningReports > eveningReports) {
            reportDescription += "Most of the reports occurred in the morning, indicating higher activity during the early hours. ";
        } else if (eveningReports > morningReports && eveningReports > afternoonReports) {
            reportDescription += "Most of the reports occurred in the evening, indicating higher activity later in the day. ";
        } else if (afternoonReports > morningReports && afternoonReports > eveningReports) {
            reportDescription += "Afternoon was the most active time period, with the highest number of reports during midday. ";
        }

        if (leastActiveHour.count > 0 && leastActiveHour.count !== Infinity) {
            reportDescription += `The hour with the least reports was at ${formatHour12(leastActiveHour.hour)}, with only ${leastActiveHour.count} reports, suggesting this time could be utilized for maintenance activities. `;
        } else {
            reportDescription += "Some hours had no reports, indicating periods of inactivity. ";
        }

        // Suggestive ending narratives
        const suggestiveEndings = [
            "To enhance response efforts, consider focusing resources during peak reporting hours identified in this analysis.",
            "It may be beneficial to implement preventive measures during high activity times to mitigate incidents effectively.",
            "To ensure community safety, ongoing monitoring and timely interventions during reported peak hours are essential.",
            "Encouraging community awareness and education during identified peak times can further reduce incidents and improve safety."
        ];

        // Randomly select a suggestive ending
        const randomEnding = suggestiveEndings[Math.floor(Math.random() * suggestiveEndings.length)];
        reportDescription += randomEnding;

        setReportSummary(reportDescription || "There were no significant trends in the data.");
    };

    return (
        <div className='desc-reporttime-container'>
            <div className='desc-reporttime-title'>
                <label className='desc-reporttime-title-text'>
                    Report Descriptive Summary
                </label>
            </div>

            <div className='desc-reporttime-content-box'>
                {loading ? (
                    <p>Loading trends...</p>
                ) : error ? (
                    <p className="report-time-error-message">{error}</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <div className='desc-reporttime-trends-box'>
                        <p>{reportSummary}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportTime;
