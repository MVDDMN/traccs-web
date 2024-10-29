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
        reportDescription += `a total of ${totalRequests} requests were recorded across barangays. `;

        // Identify the barangay with the highest and lowest requests
        const mostRequestedBarangay = data.reduce((prev, current) => (prev.totalRequests > current.totalRequests ? prev : current), {});
        const leastRequestedBarangay = data.reduce((prev, current) => (prev.totalRequests < current.totalRequests ? prev : current), {});

        reportDescription += `Barangay ${mostRequestedBarangay._id} recorded the highest number of requests (${mostRequestedBarangay.totalRequests}), while Barangay ${leastRequestedBarangay._id} had the lowest (${leastRequestedBarangay.totalRequests}). `;

        // Highlight any significant gaps in request volume
        const requestGapThreshold = 20;
        if (mostRequestedBarangay.totalRequests - leastRequestedBarangay.totalRequests > requestGapThreshold) {
            reportDescription += `The request volume varied significantly between barangays, suggesting unequal demand levels across the area. `;
        }

        // Detail the barangay with the highest items requested
        const mostItemsRequestedBarangay = data.reduce((prev, current) => (prev.totalQuantity > current.totalQuantity ? prev : current), {});
        reportDescription += `Barangay ${mostItemsRequestedBarangay._id} requested the highest number of items, totaling ${mostItemsRequestedBarangay.totalQuantity} items. `;

        // Include type breakdown for each barangay
        data.forEach((barangay) => {
            reportDescription += `\nIn Barangay ${barangay._id}, the breakdown by request type includes: `;

            barangay.requestTypes.forEach((typeDetail) => {
                reportDescription += `${typeDetail.type} (${typeDetail.requestCount} requests); `;
            });
        });

        // Recommendations based on overall volume
        if (totalRequests > 100) {
            reportDescription += `The high request volume indicates a need for additional resources in barangays with greater demand, such as Barangay ${mostRequestedBarangay._id}. Further analysis is recommended to identify specific high-demand items. `;
        } else {
            reportDescription += `With a moderate request volume, this period presents an opportunity to assess resource distribution to ensure all barangays are adequately supplied, especially those with lower request volumes like Barangay ${leastRequestedBarangay._id}. `;
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
