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
                    generateReportDescription(data, dateFrom, dateTo);  // Include date range
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

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Function to generate unified report trends based on the data
    const generateReportDescription = (data, dateFrom, dateTo) => {
        let reportDescription = `Between ${formatDate(dateFrom)} and ${formatDate(dateTo)}, `;

        const totalRequests = data.reduce((sum, type) => sum + type.totalRequests, 0);
        const totalItemsRequested = data.reduce((sum, type) => sum + type.totalQuantity, 0);

        if (totalRequests > 100) {
            reportDescription += `there has been a significant volume of requests, with over ${totalRequests} total requests recorded. `;
        } else {
            reportDescription += `a relatively low number of requests were recorded, with only ${totalRequests} requests during this period. `;
        }

        if (totalItemsRequested > 500) {
            reportDescription += `A substantial amount of items were requested, totaling ${totalItemsRequested} across all types. `;
        } else {
            reportDescription += `A lower volume of items were requested, with only ${totalItemsRequested} items requested during this time. `;
        }

        // Most requested type narrative with continuous sentence flow
        const mostRequestedType = data.reduce((prev, current) => (prev.totalRequests > current.totalRequests) ? prev : current, {});
        if (mostRequestedType) {
            reportDescription += `The most requested item type is "${mostRequestedType._id}". `;

            switch (mostRequestedType._id) {
                case 'Food':
                    reportDescription += `Indicating that this period shows a significant demand for food items. `;
                    break;
                case 'Non-Food':
                    reportDescription += `Indicating that Non-food items are highly requested in this time frame. `;
                    break;
                case 'Beverage':
                    reportDescription += `Indicating that there has been a frequent request for beverages. `;
                    break;
                case 'Essentials':
                    reportDescription += `Indicating that Essential items, such as toiletries, were in demand during this period, indicating a need for common supplies. `;
                    break;
                case 'Medical':
                    reportDescription += `Indicating that Medical supplies have been urgently requested, signaling a resupply need in barangays. `;
                    break;
                case 'Hygiene':
                    reportDescription += `Indicating that Hygiene products were highly requested during this period and should be monitored closely. `;
                    break;
                case 'Shelter':
                    reportDescription += `Indicating that there were several requests for shelter materials, indicating a need for resources. `;
                    break;
                case 'Power':
                    reportDescription += `Indicating that Power-related resources have been requested multiple times. `;
                    break;
                case 'Assistance':
                    reportDescription += `Indicating that there were significant requests for assistance during this time frame. `;
                    break;
                case 'Others':
                    reportDescription += `Indicating that other miscellaneous items have also been requested in this period. Further investigate what other items have been investigated by viewing the request history. `;
                    break;
                default:
                    reportDescription += `It would seem that various types of items were requested and are currently scattered to determine which is prevalent. `;
            }
        }

        setReportSummary(reportDescription || "There are no significant trends to report for this period.");
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
