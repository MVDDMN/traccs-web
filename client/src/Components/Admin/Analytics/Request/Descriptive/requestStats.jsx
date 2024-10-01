import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './requestStats.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const RequestStats = ({ dateFrom, dateTo }) => {
    const [stats, setStats] = useState({
        totalRequests: 0,
        requestsThisMonth: 0,
        requestsToday: 0,
        majorityBarangay: null,
        barangayResponders: [],
        itemTypeStats: []
    });
    const [reportSummary, setReportSummary] = useState(''); // Unified state for the report
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
        let reportDescription = '';

        const { totalRequests, requestsThisMonth, requestsToday, majorityBarangay, barangayResponders } = data;

        // Format dates for display in the narrative
        const formattedDateFrom = new Date(dateFrom).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedDateTo = new Date(dateTo).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Generate narrative based on available data within the selected date range
        if (totalRequests > 0 || requestsThisMonth > 0 || requestsToday > 0) {
            reportDescription += `From ${formattedDateFrom} to ${formattedDateTo}, a total of ${totalRequests} requests were made. `;

            // Handle the pending requests part
            if (requestsThisMonth > 0) {
                reportDescription += `Within this period, ${requestsThisMonth} requests are still pending`;
            }

            // Add today's requests if there are any, and adjust sentence flow accordingly
            if (requestsToday > 0) {
                if (requestsThisMonth > 0) {
                    reportDescription += `, and ${requestsToday} requests were made today. `;
                } else {
                    reportDescription += `In addition, ${requestsToday} requests were made today. `;
                }
            } else {
                // End the sentence properly if there are no requests today and pending requests exist
                if (requestsThisMonth > 0) {
                    reportDescription += `. `;
                }
            }

            // Majority barangay information
            if (majorityBarangay) {
                reportDescription += `Among the total requests, the majority are from ${majorityBarangay._id} with a total of ${majorityBarangay.count} requests. `;
            }

            // Barangay responders information
            if (barangayResponders && barangayResponders.length > 0) {
                reportDescription += `Breaking down by responders: `;
                barangayResponders.forEach((barangay, index) => {
                    reportDescription += `${barangay._id} responded to ${barangay.requestsCount} requests`;
                    if (index < barangayResponders.length - 1) {
                        reportDescription += ', ';
                    }
                });

                // Ending narrative if there are responders
                reportDescription += `. Overall, these barangays played a key role in responding to requests during this period, indicating cooperation among the community.`;
            } else {
                // Ending narrative if there are no responders
                reportDescription += `Unfortunately, no barangays have responded to requests during this period, indicating a lack of cooperation among the community.`;
            }

            setReportSummary(reportDescription || "No additional details to report for the selected period.");
        } else {
            setNoData(true);
            setReportSummary(`No data available for the period from ${formattedDateFrom} to ${formattedDateTo}.`);
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
                    <p>Loading report...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <div className='desc-requeststats-trends-box'>
                        <p>{reportSummary}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestStats;
