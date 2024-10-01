import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './barangaySummary.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const BarangaySummary = ({ dateFrom, dateTo }) => {
    const [reportSummary, setReportSummary] = useState("");
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
                    generateReportDescription(data, dateFrom, dateTo);
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

    // Function to format the date as "Month Day, Year"
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Function to generate the unified report description based on trends
    const generateReportDescription = (data, dateFrom, dateTo) => {
        let reportDescription = `Between ${formatDate(dateFrom)} and ${formatDate(dateTo)}, `;

        const totalRequests = data.reduce((sum, barangay) => sum + barangay.totalRequests, 0);

        if (totalRequests > 100) {
            reportDescription += `there was a high volume of requests with over ${totalRequests} total requests made across various barangays. `;
        } else {
            reportDescription += `the total number of requests made and completed is almost ${totalRequests} requests recorded during this period. `;
        }

        // Find the barangay with the most and least requests
        const mostRequestedBarangay = data.reduce((prev, current) => (prev.totalRequests > current.totalRequests ? prev : current), {});
        const leastRequestedBarangay = data.reduce((prev, current) => (prev.totalRequests < current.totalRequests ? prev : current), {});

        if (mostRequestedBarangay) {
            reportDescription += `Where Barangay ${mostRequestedBarangay._id} had the highest number of requests, with a total of ${mostRequestedBarangay.totalRequests} requests. `;
        }

        if (leastRequestedBarangay && leastRequestedBarangay.totalRequests > 0) {
            reportDescription += `On the other hand, Barangay ${leastRequestedBarangay._id} had the lowest number of requests, recording only ${leastRequestedBarangay.totalRequests} requests. `;
        }

        // Analyze gaps in request distribution
        const requestGapThreshold = 20;
        if (mostRequestedBarangay.totalRequests - leastRequestedBarangay.totalRequests > requestGapThreshold) {
            reportDescription += `There was a significant gap in requests between Barangay ${mostRequestedBarangay._id} and Barangay ${leastRequestedBarangay._id}, indicating an unequal distribution of requests across the barangays. `;
        }

        // Check if certain barangays requested a lot of items
        const mostItemsRequestedBarangay = data.reduce((prev, current) => (prev.totalQuantity > current.totalQuantity ? prev : current), {});
        if (mostItemsRequestedBarangay) {
            reportDescription += `Barangay ${mostItemsRequestedBarangay._id} also requested the highest number of items, totaling ${mostItemsRequestedBarangay.totalQuantity} items. `;
        }

        // Suggestive narrative outcomes based on the data trends
        if (totalRequests > 100) {
            reportDescription += `Given the high volume of requests, it is recommended that additional resources be allocated to the barangays with the highest demand, such as Barangay ${mostRequestedBarangay._id}. Further analysis could help identify the specific types of items in high demand. `;
        } else {
            reportDescription += `Since the number of requests is relatively low, it may be a good opportunity to assess the current resource allocation and ensure that all barangays are adequately supplied. Special attention should be given to Barangay ${leastRequestedBarangay._id} to understand whether their low request volume is due to a lack of need or other factors. `;
        }

        if (mostRequestedBarangay.totalRequests - leastRequestedBarangay.totalRequests > requestGapThreshold) {
            reportDescription += `The significant gap in requests between barangays suggests that further investigation is needed to understand why certain areas have higher needs. It may be necessary to conduct community outreach or targeted interventions in barangays with lower request volumes. `;
        }

        setReportSummary(reportDescription || "No significant trends to report during this period.");
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
                    <div className='desc-barangaysummary-trends-box'>
                        <p>{reportSummary}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BarangaySummary;
