import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './barangaySummary.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const BarangaySummary = ({ dateFrom, dateTo }) => {
    const [positiveTrends, setPositiveTrends] = useState("");
    const [negativeTrends, setNegativeTrends] = useState("");
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false);

    useEffect(() => {
        const fetchBarangaySummary = async () => {
            setLoading(true);
            setNoData(false);
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/barangay-summary`, {
                    params: { dateFrom, dateTo }
                });
                const data = response.data;

                if (data && data.length > 0) {
                    generateReportDescription(data);
                } else {
                    setNoData(true); // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching the barangay summary', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchBarangaySummary();
        }
    }, [dateFrom, dateTo]);

    // Function to generate the report description based on trends
    const generateReportDescription = (data) => {
        let positiveDescription = "";
        let negativeDescription = "";

        const totalRequests = data.reduce((sum, barangay) => sum + barangay.totalRequests, 0);

        if (totalRequests > 100) {
            positiveDescription += `There has been a high volume of requests with over ${totalRequests} total requests made across different barangays. `;
        } else {
            negativeDescription += `The total number of requests is relatively low, with only ${totalRequests} requests recorded for the selected date range. `;
        }

        // Find the barangay with the most and least requests
        const mostRequestedBarangay = data.reduce((prev, current) => (prev.totalRequests > current.totalRequests ? prev : current), {});
        const leastRequestedBarangay = data.reduce((prev, current) => (prev.totalRequests < current.totalRequests ? prev : current), {});

        if (mostRequestedBarangay) {
            positiveDescription += `Barangay ${mostRequestedBarangay._id} had the most requests with ${mostRequestedBarangay.totalRequests} requests. `;
        }

        if (leastRequestedBarangay && leastRequestedBarangay.totalRequests > 0) {
            negativeDescription += `Barangay ${leastRequestedBarangay._id} had the least requests, with only ${leastRequestedBarangay.totalRequests} requests. `;
        }

        // Analyze gaps in request distribution
        const requestGapThreshold = 20; // Define a threshold for significant gaps
        if (mostRequestedBarangay.totalRequests - leastRequestedBarangay.totalRequests > requestGapThreshold) {
            negativeDescription += `There is a significant gap in requests between Barangay ${mostRequestedBarangay._id} and Barangay ${leastRequestedBarangay._id}, indicating unequal distribution of requests across barangays. `;
        }

        // Check if certain barangays requested a lot of items
        const mostItemsRequestedBarangay = data.reduce((prev, current) => (prev.totalQuantity > current.totalQuantity ? prev : current), {});
        if (mostItemsRequestedBarangay) {
            positiveDescription += `Barangay ${mostItemsRequestedBarangay._id} also had the highest number of items requested, with a total of ${mostItemsRequestedBarangay.totalQuantity} items requested. `;
        }

        setPositiveTrends(positiveDescription || "No significant positive trends detected.");
        setNegativeTrends(negativeDescription || "No significant negative trends detected.");
    };

    return (
        <div className='desc-barangaysummary-container'>
            <div className='desc-barangaysummary-title'>
                <label className='desc-barangaysummary-title-text'>
                    Request Descriptive Summary
                </label>
            </div>

            <div className='desc-barangaysummary-content-box'>
                {loading ? (
                    <p>Loading report trends...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <>
                        <div className='desc-barangaysummary-positives-box'>
                            <h2>Positive Report Trends</h2>
                            <p>{positiveTrends}</p>
                        </div>

                        <div className='desc-barangaysummary-negatives-box'>
                            <h2>Negative Report Trends</h2>
                            <p>{negativeTrends}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BarangaySummary;
