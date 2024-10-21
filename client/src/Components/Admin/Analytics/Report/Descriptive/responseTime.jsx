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
                    const transformedData = data.map(item => ({
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

        const totalReports = data.length;

        if (totalReports === 0) {
            setReportSummary("No data available for analysis.");
            return;
        }

        const avgResponseTime = data.reduce((sum, report) => sum + report.averageResponseTime, 0) / totalReports;
        const avgMinutes = Math.floor(avgResponseTime / (1000 * 60));
        const avgSeconds = Math.floor((avgResponseTime % (1000 * 60)) / 1000);
        reportDescription += `Between ${formatDate(dateFrom)} and ${formatDate(dateTo)}, the general average response time across all barangays is ${avgMinutes} minutes and ${avgSeconds} seconds. `;

        const fastestBarangay = data.reduce((prev, curr) => (curr.averageResponseTime < prev.averageResponseTime ? curr : prev), data[0]);
        const slowestBarangay = data.reduce((prev, curr) => (curr.averageResponseTime > prev.averageResponseTime ? curr : prev), data[0]);

        if (fastestBarangay) {
            const fastestAvgMinutes = Math.floor(fastestBarangay.averageResponseTime / (1000 * 60));
            const fastestAvgSeconds = Math.floor((fastestBarangay.averageResponseTime % (1000 * 60)) / 1000);
            const percentageFastest = ((fastestBarangay.averageResponseTime / avgResponseTime) * 100).toFixed(2);
            reportDescription += `The fastest average response time was from Barangay ${fastestBarangay.responder} at ${fastestAvgMinutes} minutes and ${fastestAvgSeconds} seconds, which is ${percentageFastest}% of the overall average. `;
        }

        if (slowestBarangay && slowestBarangay.responder !== fastestBarangay.responder) {
            const slowestAvgMinutes = Math.floor(slowestBarangay.averageResponseTime / (1000 * 60));
            const slowestAvgSeconds = Math.floor((slowestBarangay.averageResponseTime % (1000 * 60)) / 1000);
            reportDescription += `Barangay ${slowestBarangay.responder} had the slowest response time, averaging ${slowestAvgMinutes} minutes and ${slowestAvgSeconds} seconds in ${getMonthName(slowestBarangay.month)}. `;
        }

        // Add more comparisons if data includes multiple months for responders
        const respondersWithMultipleMonths = data.reduce((acc, curr) => {
            if (!acc[curr.responder]) {
                acc[curr.responder] = [];
            }
            acc[curr.responder].push(curr);
            return acc;
        }, {});

        Object.keys(respondersWithMultipleMonths).forEach(responder => {
            if (respondersWithMultipleMonths[responder].length > 1) {
                respondersWithMultipleMonths[responder].sort((a, b) => a.month - b.month);
                reportDescription += `Responder ${responder} has data for multiple months: `;
                const responseTimes = respondersWithMultipleMonths[responder];

                let fastestMonth = responseTimes[0];
                let slowestMonth = responseTimes[0];

                responseTimes.forEach(monthData => {
                    if (monthData.averageResponseTime < fastestMonth.averageResponseTime) {
                        fastestMonth = monthData;
                    }
                    if (monthData.averageResponseTime > slowestMonth.averageResponseTime) {
                        slowestMonth = monthData;
                    }
                });

                const avgMinutesFastest = Math.floor(fastestMonth.averageResponseTime / (1000 * 60));
                const avgSecondsFastest = Math.floor((fastestMonth.averageResponseTime % (1000 * 60)) / 1000);
                const avgMinutesSlowest = Math.floor(slowestMonth.averageResponseTime / (1000 * 60));
                const avgSecondsSlowest = Math.floor((slowestMonth.averageResponseTime % (1000 * 60)) / 1000);
                const percentageDifference = (((slowestMonth.averageResponseTime - fastestMonth.averageResponseTime) / fastestMonth.averageResponseTime) * 100).toFixed(2);

                reportDescription += `For responder ${responder}, the fastest response time was in ${getMonthName(fastestMonth.month)} at ${avgMinutesFastest} minutes and ${avgSecondsFastest} seconds, while the slowest was in ${getMonthName(slowestMonth.month)} at ${avgMinutesSlowest} minutes and ${avgSecondsSlowest} seconds, indicating a ${percentageDifference}% difference. `;

                if (percentageDifference > 20) {
                    const increaseNarratives = [
                        `This shows a significant increase in response time, suggesting potential challenges during ${getMonthName(slowestMonth.month)}. Addressing these challenges might help bring response times down.`,
                        `The response time increased notably in ${getMonthName(slowestMonth.month)}, which could indicate operational issues or resource constraints. Focusing on these areas might lead to improvements.`,
                        `The significant increase in response time during ${getMonthName(slowestMonth.month)} highlights potential disruptions. Reviewing operational procedures during this period could provide valuable insights for improvement.`
                    ];
                    reportDescription += increaseNarratives[Math.floor(Math.random() * increaseNarratives.length)] + " ";
                } else if (percentageDifference < -20) {
                    const decreaseNarratives = [
                        `This significant decrease in response time highlights effective changes implemented in ${getMonthName(fastestMonth.month)}. Continuing these efforts could further enhance responsiveness.`,
                        `A considerable decrease in response time during ${getMonthName(fastestMonth.month)} indicates positive operational changes. Maintaining these practices could help ensure continued efficiency.`,
                        `The drop in response time during ${getMonthName(fastestMonth.month)} is indicative of successful interventions. Evaluating what worked well can help replicate these successes elsewhere.`
                    ];
                    reportDescription += decreaseNarratives[Math.floor(Math.random() * decreaseNarratives.length)] + " ";
                } else {
                    const moderateDifferenceNarratives = [
                        `The difference between the fastest and slowest months is moderate, indicating consistent performance with minor variations. Monitoring ongoing factors could help maintain this stability.`,
                        `The response times between the fastest and slowest months were relatively stable, suggesting good operational consistency. Keeping an eye on small fluctuations can help in preventing larger issues.`,
                        `Moderate variation between the fastest and slowest response times indicates stable performance. Ensuring continuous monitoring can help sustain this consistency.`
                    ];
                    reportDescription += moderateDifferenceNarratives[Math.floor(Math.random() * moderateDifferenceNarratives.length)] + " ";
                }

                responseTimes.forEach(monthData => {
                    const avgMinutes = Math.floor(monthData.averageResponseTime / (1000 * 60));
                    const avgSeconds = Math.floor((monthData.averageResponseTime % (1000 * 60)) / 1000);
                    reportDescription += `${getMonthName(monthData.month)}: ${avgMinutes} minutes and ${avgSeconds} seconds. `;
                });
            }
        });

        const suggestiveEndings = [
            "To enhance response efforts, consider analyzing the factors contributing to the faster response times and applying those lessons to areas needing improvement.",
            "Implementing targeted training for responders in barangays with slower response times could help reduce response delays.",
            "Monitoring the effectiveness of response times over the next few months may provide insight into whether the improvements are effective.",
            "Encouraging community involvement and reporting can help in identifying and resolving issues that lead to delayed response times."
        ];

        const randomEnding = suggestiveEndings[Math.floor(Math.random() * suggestiveEndings.length)];
        reportDescription += randomEnding;

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