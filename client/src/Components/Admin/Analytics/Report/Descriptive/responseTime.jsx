import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './responseTime.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ResponseTime = ({ dateFrom, dateTo }) => {
    const [responseData, setResponseData] = useState([]);
    const [positiveTrends, setPositiveTrends] = useState("");
    const [negativeTrends, setNegativeTrends] = useState("");
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
                    setResponseData(data);
                    generateReportDescription(data); // Generate the descriptive report
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
        let positiveDescription = "";
        let negativeDescription = "";

        const totalReports = data.length;

        // Check for overall trends in response time
        const avgResponseTime = data.reduce((sum, report) => sum + report.averageResponseTime, 0) / totalReports;

        if (avgResponseTime < 30 * 60 * 1000) { // Less than 30 minutes
            positiveDescription += `The average response time across all barangays was quick, at under 30 minutes. `;
        } else if (avgResponseTime > 60 * 60 * 1000) { // More than 60 minutes
            negativeDescription += `The average response time across all barangays exceeded 60 minutes, indicating potential delays in response. `;
        }

        // Find the barangay with the fastest and slowest response times
        const fastestBarangay = data.reduce((prev, curr) => (curr.averageResponseTime < prev.averageResponseTime ? curr : prev), data[0]);
        const slowestBarangay = data.reduce((prev, curr) => (curr.averageResponseTime > prev.averageResponseTime ? curr : prev), data[0]);

        if (fastestBarangay) {
            positiveDescription += `Barangay ${fastestBarangay._id} had the fastest response time, averaging ${(fastestBarangay.averageResponseTime / (1000 * 60)).toFixed(2)} minutes. `;
        }

        if (slowestBarangay && slowestBarangay._id !== fastestBarangay._id) {
            negativeDescription += `Barangay ${slowestBarangay._id} had the slowest response time, averaging ${(slowestBarangay.averageResponseTime / (1000 * 60)).toFixed(2)} minutes. `;
        }

        setPositiveTrends(positiveDescription || "There were no significant positive trends in the data.");
        setNegativeTrends(negativeDescription || "There were no significant negative trends in the data.");
    };

    return (
        <div className='desc-responsetime-container'>
            <div className='desc-responsetime-title'>
                <label className='desc-responsetime-title-text'>
                    Descriptive Summary of Response Time per Barangay
                </label>
            </div>

            <div className='desc-responsetime-content-box'>
                {loading ? (
                    <p>Loading trends...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <>
                        <div className='desc-responsetime-positives-box'>
                            <h2>Positive Response Time Trends</h2>
                            <p>{positiveTrends}</p>
                        </div>

                        <div className='desc-responsetime-negatives-box'>
                            <h2>Negative Response Time Trends</h2>
                            <p>{negativeTrends}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResponseTime;
