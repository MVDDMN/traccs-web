import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './responseTime.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ResponseTime = ({ dateFrom, dateTo, previousMonthData }) => {
    const [responseData, setResponseData] = useState([]);
    const [reportSummary, setReportSummary] = useState(""); // Unified state for trends
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false); // To track if no data is available

    useEffect(() => {
        const fetchResponseTimeSummary = async () => {
            setLoading(true);
            setNoData(false); // Reset no data state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/response-time-summary`, {
                    params: { dateFrom, dateTo }
                });
                const data = response.data;

                if (data && data.length > 0) {
                    // Transform data into a more usable format
                    const transformedData = data.map(item => ({
                        responder: item._id.responder,
                        year: item._id.year,
                        month: item._id.month,
                        averageResponseTime: item.averageResponseTime,
                    }));
                    setResponseData(transformedData);
                    generateReportDescription(transformedData); // Generate the descriptive report
                } else {
                    setNoData(true); // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching response time data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchResponseTimeSummary(); // Fetch data only when both dateFrom and dateTo are set
        }
    }, [dateFrom, dateTo]);

    // Function to generate descriptive report based on trends
    const generateReportDescription = (data) => {
        let reportDescription = "";

        const totalReports = data.length;

        if (totalReports === 0) {
            setReportSummary("No data available for analysis.");
            return;
        }

        // Calculate average response time
        const avgResponseTime = data.reduce((sum, report) => sum + report.averageResponseTime, 0) / totalReports;

        // Convert average response time to minutes and seconds for the report
        const avgMinutes = Math.floor(avgResponseTime / (1000 * 60));
        const avgSeconds = Math.floor((avgResponseTime % (1000 * 60)) / 1000);
        reportDescription += `The general average response time across all barangays is at ${avgMinutes}m ${avgSeconds}s. `;

        // Fastest and slowest barangays
        const fastestBarangay = data.reduce((prev, curr) => (curr.averageResponseTime < prev.averageResponseTime ? curr : prev), data[0]);
        const slowestBarangay = data.reduce((prev, curr) => (curr.averageResponseTime > prev.averageResponseTime ? curr : prev), data[0]);

        if (fastestBarangay) {
            const fastestAvgMinutes = Math.floor(fastestBarangay.averageResponseTime / (1000 * 60));
            const fastestAvgSeconds = Math.floor((fastestBarangay.averageResponseTime % (1000 * 60)) / 1000);
            const percentageFastest = ((fastestBarangay.averageResponseTime / avgResponseTime) * 100).toFixed(2);
            reportDescription += `The fastest average response time was from Barangay ${fastestBarangay.responder} at ${fastestAvgMinutes}m ${fastestAvgSeconds}s, which is ${percentageFastest}% of the overall average. `;
        }

        if (slowestBarangay && slowestBarangay.responder !== fastestBarangay.responder) {
            const slowestAvgMinutes = Math.floor(slowestBarangay.averageResponseTime / (1000 * 60));
            const slowestAvgSeconds = Math.floor((slowestBarangay.averageResponseTime % (1000 * 60)) / 1000);
            reportDescription += `Barangay ${slowestBarangay.responder} had the slowest response time, averaging ${slowestAvgMinutes}m ${slowestAvgSeconds}s. `;
        }

        setReportSummary(reportDescription || "There were no significant trends in the data.");
    };

    return (
        <div className='desc-responsetime-container'>
            <div className='desc-responsetime-title'>
                <label className='desc-responsetime-title-text'>
                    Report Descriptive Summary 
                </label>
            </div>

            <div className='desc-responsetime-content-box'>
                {loading ? (
                    <p>Loading trends...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <div className='desc-responsetime-trends-box'>
                        <p>{reportSummary}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResponseTime;
