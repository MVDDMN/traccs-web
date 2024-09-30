import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './pieSummary.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const PieSummary = ({ dateFrom, dateTo }) => {
    const [reportSummary, setReportSummary] = useState("");
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false);  // Track if no data is available

    useEffect(() => {
        const fetchPieSummary = async () => {
            setLoading(true);
            setNoData(false);  // Reset no data state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/barangay-summary`, {
                    params: { dateFrom, dateTo }
                });
                const data = response.data;

                if (data && data.length > 0) {
                    generateReportDescription(data);  // Call the auto-generative report logic after data is fetched
                } else {
                    setNoData(true);  // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching the pie summary', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchPieSummary();
        }
    }, [dateFrom, dateTo]);

    // Function to generate the unified report description based on the data
    const generateReportDescription = (data) => {
        let reportDescription = "";

        const totalRequests = data.reduce((sum, barangay) => sum + barangay.totalRequests, 0);

        if (totalRequests > 100) {
            reportDescription += `There has been a significant number of requests, with over ${totalRequests} total requests recorded across all barangays. `;
        } else {
            reportDescription += `The total number of requests is relatively low, with only ${totalRequests} requests recorded for the selected period. `;
        }

        // Find the barangay with the most and least requests
        const mostRequestedBarangay = data.reduce((prev, current) => (prev.totalRequests > current.totalRequests) ? prev : current, {});
        const leastRequestedBarangay = data.reduce((prev, current) => (prev.totalRequests < current.totalRequests) ? prev : current, {});

        if (mostRequestedBarangay) {
            reportDescription += `The barangay with the highest number of requests is "${mostRequestedBarangay._id}" with ${mostRequestedBarangay.totalRequests} requests. `;
        }

        if (leastRequestedBarangay && leastRequestedBarangay.totalRequests > 0) {
            reportDescription += `The barangay with the lowest number of requests is "${leastRequestedBarangay._id}" with only ${leastRequestedBarangay.totalRequests} requests. `;
        }

        // Analyze if there are significant gaps in request distribution between barangays
        const gapThreshold = 10;  // Adjust this value to reflect what a "significant gap" means
        if (mostRequestedBarangay.totalRequests - leastRequestedBarangay.totalRequests > gapThreshold) {
            reportDescription += `There is a significant gap between the most requested barangay and the least requested barangay, indicating unequal distribution of requests. `;
        }

        setReportSummary(reportDescription || "There are no significant trends to report.");
    };

    return (
        <div className='desc-piesummary-container'>
            <div className='desc-piesummary-title'>
                <label className='desc-piesummary-title-text'>
                    Request Descriptive Summary
                </label>
            </div>

            <div className='desc-piesummary-content-box'>
                {loading ? (
                    <p>Loading report trends...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <div className='desc-piesummary-trends-box'>
                        <p>{reportSummary}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PieSummary;
