import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './responseTime.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ResponseTime = ({ dateFrom, dateTo, previousMonthData }) => {
    const [responseData, setResponseData] = useState([]);
    const [reportSummary, setReportSummary] = useState("");
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false);

    useEffect(() => {
        const fetchResponseTimeSummary = async () => {
            setLoading(true);
            setNoData(false);
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/response-time-summary`, {
                    params: { dateFrom, dateTo }
                });
                const data = response.data;

                if (data && data.length > 0) {
                    // Filter to only MDRRMO data
                    const mdrrmoData = data.filter(item => item._id.responder === 'MDRRMO');
                    if (mdrrmoData.length === 0) {
                        setNoData(true);
                        return;
                    }

                    const transformedData = mdrrmoData.map(item => ({
                        responder: item._id.responder,
                        year: item._id.year,
                        month: item._id.month,
                        averageResponseTime: item.averageResponseTime,
                    }));
                    setResponseData(transformedData);
                    generateReportDescription(transformedData);
                } else {
                    setNoData(true);
                }
            } catch (error) {
                console.error('Error fetching response time data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchResponseTimeSummary();
        }
    }, [dateFrom, dateTo]);

    const generateReportDescription = (data) => {
        let reportDescription = "";
    
        if (data.length === 0) {
            setReportSummary("No data available for analysis.");
            return;
        }
    
        const avgResponseTime = data.reduce((sum, report) => sum + report.averageResponseTime, 0) / data.length;
        const avgMinutes = Math.floor(avgResponseTime / (1000 * 60));
        const avgSeconds = Math.floor((avgResponseTime % (1000 * 60)) / 1000);
        reportDescription += `Between ${formatDate(dateFrom)} and ${formatDate(dateTo)}, MDRRMO's overall average response time was ${avgMinutes} minutes and ${avgSeconds} seconds. `;
    
        // Sort data by month for chronological comparison
        const sortedData = data.sort((a, b) => a.month - b.month);
    
        // Month-over-month analysis
        sortedData.forEach((currentMonthData, index) => {
            const currentMonthName = getMonthName(currentMonthData.month);
            const currentAvgTime = currentMonthData.averageResponseTime;
            const currentMinutes = Math.floor(currentAvgTime / (1000 * 60));
            const currentSeconds = Math.floor((currentAvgTime % (1000 * 60)) / 1000);
    
            reportDescription += `In ${currentMonthName}, the average response time was ${currentMinutes} minutes and ${currentSeconds} seconds. `;
    
            if (index > 0) {
                const previousMonthData = sortedData[index - 1];
                const previousMonthName = getMonthName(previousMonthData.month);
                const previousAvgTime = previousMonthData.averageResponseTime;
                const percentageChange = (((currentAvgTime - previousAvgTime) / previousAvgTime) * 100).toFixed(2);
    
                if (currentAvgTime < previousAvgTime) {
                    reportDescription += `This marks a decrease of ${Math.abs(percentageChange)}% from ${previousMonthName}, indicating an improvement in response efficiency. `;
                } else if (currentAvgTime > previousAvgTime) {
                    reportDescription += `This is an increase of ${percentageChange}% from ${previousMonthName}, suggesting potential challenges or delays. Addressing factors that contributed to this increase could help in reducing response times. `;
                } else {
                    reportDescription += `Response time remained consistent with the previous month (${previousMonthName}). `;
                }
            }
        });
    
        setReportSummary(reportDescription || "There were no significant trends in the data.");
    };
    
    const getMonthName = (month) => {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return monthNames[month - 1];
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    return (
        <div className='desc-responsetime-container'>
            <div className='desc-responsetime-title'>
                <label className='desc-responsetime-title-text'>
                    MDRRMO Response Time Summary
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
