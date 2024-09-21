import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './reportMonth.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportMonth = ({ dateFrom, dateTo }) => {
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
        let positiveDescription = "";
        let negativeDescription = "";

        const totalReports = data.reduce((sum, report) => sum + report.count, 0);

        if (totalReports > 100) {
            positiveDescription += `There has been a significant number of reports, totaling ${totalReports} across the selected date range. `;
        } else {
            negativeDescription += `The total number of reports for this period is relatively low, with only ${totalReports} reports. `;
        }

        const mostCommonType = data.reduce((prev, current) => (prev.count > current.count) ? prev : current, {});
        if (mostCommonType) {
            positiveDescription += `The most reported type is "${mostCommonType.type}", which occurred ${mostCommonType.count} times. `;
        }

        const leastCommonType = data.reduce((prev, current) => (prev.count < current.count) ? prev : current, {});
        if (leastCommonType && leastCommonType.count > 0) {
            negativeDescription += `Interestingly, the least reported type is "${leastCommonType.type}" with only ${leastCommonType.count} occurrences. `;
        }

        const monthWithMostReports = data.reduce((acc, curr) => {
            const monthIndex = parseInt(curr.month) - 1;
            acc[monthIndex] = (acc[monthIndex] || 0) + curr.count;
            return acc;
        }, Array(12).fill(0)).indexOf(Math.max(...data.map(item => item.count)));

        if (monthWithMostReports >= 0) {
            positiveDescription += `The month with the most reports is ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][monthWithMostReports]}. `;
        }

        const monthWithLeastReports = data.reduce((acc, curr) => {
            const monthIndex = parseInt(curr.month) - 1;
            acc[monthIndex] = (acc[monthIndex] || 0) + curr.count;
            return acc;
        }, Array(12).fill(0)).indexOf(Math.min(...data.map(item => item.count)));

        if (monthWithLeastReports >= 0) {
            negativeDescription += `The month with the least reports is ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][monthWithLeastReports]}. `;
        }

        setPositiveTrends(positiveDescription || "No significant positive trends detected.");
        setNegativeTrends(negativeDescription || "No significant negative trends detected.");
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
                    <>
                        <div className='desc-reportmonth-positives-box'>
                            <h2>Positive Report Trends</h2>
                            <p>{positiveTrends}</p>
                        </div>

                        <div className='desc-reportmonth-negatives-box'>
                            <h2>Negative Report Trends</h2>
                            <p>{negativeTrends}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportMonth;
