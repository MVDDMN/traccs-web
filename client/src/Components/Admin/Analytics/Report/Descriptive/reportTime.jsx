import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './reportTime.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportTime = ({ dateFrom, dateTo }) => {
    const [reportData, setReportData] = useState([]);
    const [positiveTrends, setPositiveTrends] = useState("");
    const [negativeTrends, setNegativeTrends] = useState("");
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false); // Track if no data is available

    useEffect(() => {
        const fetchReportFrequency = async () => {
            setLoading(true);
            setNoData(false); // Reset no data state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-frequency-by-hour`, {
                    params: { dateFrom, dateTo }
                });

                const { data } = response; // Assuming data is the main response
                if (data && data.data && data.data.length > 0 && data.data.some(count => count > 0)) {
                    setReportData(data);
                    generateReportDescription(data); // Call the auto-generative report logic after data is fetched
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

    // Function to generate descriptive report based on trends
    const generateReportDescription = (data) => {
        let positiveDescription = "";
        let negativeDescription = "";

        const totalReports = data.data.reduce((sum, count) => sum + count, 0);

        // Check if there were significant reports overall
        if (totalReports > 100) {
            positiveDescription += `There has been a high volume of reports, with over ${totalReports} incidents recorded across the selected date range. `;
        } else {
            negativeDescription += `The number of reports was relatively low, with only ${totalReports} incidents recorded. `;
        }

        // Find the most active hour and the least active hour
        const mostActiveHour = data.data.reduce((prev, count, index) => (count > prev.count ? { count, hour: index } : prev), { count: 0 });
        const leastActiveHour = data.data.reduce((prev, count, index) => (count < prev.count && count > 0 ? { count, hour: index } : prev), { count: Infinity });

        if (mostActiveHour.count > 0) {
            positiveDescription += `The hour with the most reports was ${formatHour12(mostActiveHour.hour)}, with ${mostActiveHour.count} reports recorded. `;
        }

        if (leastActiveHour.count > 0 && leastActiveHour.count !== Infinity) {
            negativeDescription += `The hour with the least reports was ${formatHour12(leastActiveHour.hour)}, with only ${leastActiveHour.count} reports. `;
        } else {
            negativeDescription += "Some hours had no reports, indicating periods of inactivity. ";
        }

        // Check for trends in peak hours
        const morningReports = data.data.slice(6, 12).reduce((sum, count) => sum + count, 0);
        const afternoonReports = data.data.slice(12, 18).reduce((sum, count) => sum + count, 0);
        const eveningReports = data.data.slice(18, 24).reduce((sum, count) => sum + count, 0);

        if (morningReports > afternoonReports && morningReports > eveningReports) {
            positiveDescription += "Most of the reports occurred in the morning, indicating higher activity during the early hours. ";
        } else if (eveningReports > morningReports && eveningReports > afternoonReports) {
            positiveDescription += "Most of the reports occurred in the evening, indicating higher activity later in the day. ";
        } else if (afternoonReports > morningReports && afternoonReports > eveningReports) {
            positiveDescription += "Afternoon was the most active time period, with the highest number of reports during midday. ";
        }

        setPositiveTrends(positiveDescription || "There were no significant positive trends in the data.");
        setNegativeTrends(negativeDescription || "There were no significant negative trends in the data.");
    };

    return (
        <div className='desc-reporttime-container'>
            <div className='desc-reporttime-title'>
                <label className='desc-reporttime-title-text'>
                    Descriptive Summary of Report Frequency by Hour
                </label>
            </div>

            <div className='desc-reporttime-content-box'>
                {loading ? (
                    <p>Loading trends...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <>
                        <div className='desc-reporttime-positives-box'>
                            <h2>Positive Report Trends</h2>
                            <p>{positiveTrends}</p>
                        </div>
                        <div className='desc-reporttime-negatives-box'>
                            <h2>Negative Report Trends</h2>
                            <p>{negativeTrends}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportTime;
