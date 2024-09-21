import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './requestStats.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const RequestStats = ({ dateFrom, dateTo }) => {
    const [stats, setStats] = useState({ totalRequests: 0, requestsThisMonth: 0, requestsToday: 0 });
    const [positiveTrends, setPositiveTrends] = useState('');
    const [negativeTrends, setNegativeTrends] = useState('');
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false); // Track if no data is available

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setNoData(false); // Reset noData state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/requests-stats`, {
                    params: { dateFrom, dateTo }
                });
                const data = response.data;

                // Check if the data contains any stats or if it's empty
                if (data && (data.totalRequests > 0 || data.requestsThisMonth > 0 || data.requestsToday > 0)) {
                    setStats(data);
                    generateReportDescription(data); // Generate descriptive report
                } else {
                    setNoData(true); // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching request stats:', error);
                setNoData(true); // Handle error by setting no data
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchStats(); // Fetch data only when both dateFrom and dateTo are set
        }
    }, [dateFrom, dateTo]);

    const generateReportDescription = (data) => {
        let positiveDescription = '';
        let negativeDescription = '';

        const { totalRequests, requestsThisMonth, requestsToday } = data;

        // Ensure we only generate trends if there's meaningful data
        if (totalRequests > 0 || requestsThisMonth > 0 || requestsToday > 0) {
            // Check overall total requests
            if (totalRequests > 100) {
                positiveDescription += `A significant number of requests have been recorded with over ${totalRequests} requests in total. `;
            }

            // Negative Trend: Very low total requests
            if (totalRequests < 10) {
                negativeDescription += `The total number of requests is alarmingly low, with only ${totalRequests} requests recorded so far. `;
            }

            // Compare this month's requests with the average per month
            if (requestsThisMonth > totalRequests / 12) {
                positiveDescription += `This month has seen above-average activity with ${requestsThisMonth} requests, indicating a possible trend in higher monthly requests. `;
            } else if (requestsThisMonth < totalRequests / 12) {
                negativeDescription += `This month has seen below-average activity, with only ${requestsThisMonth} requests compared to the typical monthly average. `;
            }

            // Negative Trend: No requests today
            if (requestsToday === 0) {
                negativeDescription += `No new requests have been made today, which could indicate a drop in user engagement. `;
            }

            // Negative Trend: Significant drop in requests compared to previous day/week
            if (requestsToday < (requestsThisMonth / 30)) {
                negativeDescription += `Today's request volume is below the expected daily average, indicating a drop in user activity. `;
            }

            // Negative Trend: Few requests this month (Less than expected monthly activity)
            if (requestsThisMonth < 5) {
                negativeDescription += `The number of requests this month is very low, which may signal a decline in user interest or system use. `;
            }

            // No data fallback check
            setNoData(!(positiveDescription || negativeDescription));

            // Set positive and negative trends based on the generated descriptions
            setPositiveTrends(positiveDescription);
            setNegativeTrends(negativeDescription);
        } else {
            // If no meaningful data, make sure to show no trends
            setNoData(true);
            setPositiveTrends('');
            setNegativeTrends('');
        }
    };

    return (
        <div className='desc-requeststats-container'>
            <div className='desc-requeststats-title'>
                <label className='desc-requeststats-title-text'>
                    Request Descriptive Summary
                </label>
            </div>

            <div className='desc-requeststats-content-box'>
                {loading ? (
                    <p>Loading report trends...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <>
                        {positiveTrends && (
                            <div className='desc-requeststats-positives-box'>
                                <h2>Positive Trends</h2>
                                <p>{positiveTrends}</p>
                            </div>
                        )}
                        {negativeTrends && (
                            <div className='desc-requeststats-negatives-box'>
                                <h2>Negative Trends</h2>
                                <p>{negativeTrends}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RequestStats;
