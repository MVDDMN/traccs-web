import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './typeSummary.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const TypeSummary = ({ dateFrom, dateTo }) => {
    const [reportSummary, setReportSummary] = useState("");  // Unified state for trends
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false);  // Track if no data is available

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            setNoData(false);  // Reset no data state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/summary`, {
                    params: { dateFrom, dateTo }
                });
                const data = response.data;

                if (data && data.length > 0) {
                    generateReportDescription(data);  // Call the auto-generative report logic after data is fetched
                } else {
                    setNoData(true);  // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching the summary', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchSummary();
        }
    }, [dateFrom, dateTo]);

    // Function to generate unified report trends based on the data
    const generateReportDescription = (data) => {
        let reportDescription = "";

        const totalRequests = data.reduce((sum, type) => sum + type.totalRequests, 0);
        const totalItemsRequested = data.reduce((sum, type) => sum + type.totalQuantity, 0);

        if (totalRequests > 100) {
            reportDescription += `There has been a significant volume of requests with over ${totalRequests} total requests recorded. `;
        } else {
            reportDescription += `The total number of requests is relatively low, with only ${totalRequests} requests recorded for the selected period. `;
        }

        if (totalItemsRequested > 500) {
            reportDescription += `A substantial amount of items were requested, totaling ${totalItemsRequested} across all types. `;
        } else {
            reportDescription += `A lower volume of items were requested, with only ${totalItemsRequested} items requested during this period. `;
        }

        // Find the type with the most and least requests
        const mostRequestedType = data.reduce((prev, current) => (prev.totalRequests > current.totalRequests) ? prev : current, {});
        const leastRequestedType = data.reduce((prev, current) => (prev.totalRequests < current.totalRequests) ? prev : current, {});

        if (mostRequestedType) {
            reportDescription += `The most requested type is "${mostRequestedType._id}" with ${mostRequestedType.totalRequests} requests. `;
        }

        if (leastRequestedType && leastRequestedType.totalRequests > 0) {
            reportDescription += `The least requested type is "${leastRequestedType._id}" with only ${leastRequestedType.totalRequests} requests. `;
        }

        // Find the type with the highest total quantity of items requested
        const typeWithMostItemsRequested = data.reduce((prev, current) => (prev.totalQuantity > current.totalQuantity) ? prev : current, {});
        if (typeWithMostItemsRequested && typeWithMostItemsRequested.totalQuantity > 100) {
            reportDescription += `A notable number of items (${typeWithMostItemsRequested.totalQuantity}) were requested for the type "${typeWithMostItemsRequested._id}". `;
        }

        // Analyze if there are significant gaps in the type distribution
        const gapThreshold = 10;  // Adjust this value to reflect what a "significant gap" means
        if (mostRequestedType.totalRequests - leastRequestedType.totalRequests > gapThreshold) {
            reportDescription += `There is a significant gap between the most and least requested types, indicating uneven distribution of requests across different types. `;
        }

        setReportSummary(reportDescription || "There are no significant trends to report.");
    };

    return (
        <div className='desc-typesummary-container'>
            <div className='desc-typesummary-title'>
                <label className='desc-typesummary-title-text'>
                    Request Descriptive Summary
                </label>
            </div>

            <div className='desc-typesummary-content-box'>
                {loading ? (
                    <p>Loading report trends...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <div className='desc-typesummary-trends-box'>
                        <p>{reportSummary}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TypeSummary;
