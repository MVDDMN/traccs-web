import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './pieSummary.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const PieSummary = ({ dateFrom, dateTo }) => {
    const [reportSummary, setReportSummary] = useState("");
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false);

    useEffect(() => {
        const fetchPieSummary = async () => {
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
                    setNoData(true);
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

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const generateReportDescription = (data, dateFrom, dateTo) => {
        let reportDescription = `Between ${formatDate(dateFrom)} and ${formatDate(dateTo)}, `;

        const totalRequests = data.reduce((sum, barangay) => sum + barangay.totalRequests, 0);

        if (totalRequests === 0) {
            setReportSummary("There are no requests to report for this period.");
            return;
        }

        if (totalRequests > 100) {
            reportDescription += `there was a significant number of requests, with over ${totalRequests} total requests recorded across all barangays. `;
        } else {
            reportDescription += `the total number of requests was relatively low, with only ${totalRequests} requests recorded during this period. `;
        }

        // Calculate percentage for each barangay
        const barangayPercentages = data.map(barangay => ({
            _id: barangay._id,
            totalRequests: barangay.totalRequests,
            percentage: (barangay.totalRequests / totalRequests * 100).toFixed(2)
        }));

        // Group barangays by the same percentage
        const percentageGroups = barangayPercentages.reduce((acc, curr) => {
            acc[curr.percentage] = acc[curr.percentage] ? [...acc[curr.percentage], curr._id] : [curr._id];
            return acc;
        }, {});

        // Add narrative for each percentage group
        const percentageGroupEntries = Object.entries(percentageGroups);
        percentageGroupEntries.forEach((entry, index) => {
            const [percentage, barangays] = entry;
            const barangayList = barangays.join(", ");

            if (index === percentageGroupEntries.length - 1 && percentageGroupEntries.length > 1) {
                reportDescription += `and Barangay(s) ${barangayList} accounted for ${percentage}% of the total requests. `;
            } else if (index === percentageGroupEntries.length - 1) {
                reportDescription += `while Barangay(s) ${barangayList} accounted for ${percentage}% of the total requests. `;
            } else {
                reportDescription += `Barangay(s) ${barangayList} accounted for ${percentage}% of the total requests. `;
            }
        });

        // Analyze gaps in percentage between the most and least requested barangays
        const mostRequestedPercentage = Math.max(...barangayPercentages.map(b => parseFloat(b.percentage)));
        const leastRequestedPercentage = Math.min(...barangayPercentages.map(b => parseFloat(b.percentage)));
        const leastRequestedBarangay = barangayPercentages.find(b => parseFloat(b.percentage) === leastRequestedPercentage);
        const gapThreshold = 10;

        if (mostRequestedPercentage - leastRequestedPercentage > gapThreshold) {
            reportDescription += `There was a significant gap in requests, with the highest percentage accounting for ${mostRequestedPercentage}% and the lowest for ${leastRequestedPercentage}%. `;
        }

        // Suggestive narrative outcomes based on the data trends
        if (totalRequests > 100) {
            reportDescription += `Given the high number of requests, it is recommended to prioritize resource allocation to barangays with higher demand, as they are likely experiencing significant needs. Targeted support can help address these areas effectively. `;
        } else {
            reportDescription += `With a lower number of requests, barangays with fewer requests, such as Barangay ${leastRequestedBarangay._id}, may be considered lower priority for immediate resource allocation. `;
        }

        if (mostRequestedPercentage - leastRequestedPercentage > gapThreshold) {
            reportDescription += `The significant gap between the highest and lowest requested barangays suggests a need for further investigation into why certain areas have more needs than others.`;
        }

        // Identify barangays in need of supplies based on a high request threshold
        const highDemandBarangays = barangayPercentages
            .filter(b => parseFloat(b.percentage) > 20) // Consider >20% as high demand
            .map(b => b._id);

        if (highDemandBarangays.length > 0) {
            reportDescription += ` The following barangays showed a particularly high demand and may require additional supplies: ${highDemandBarangays.join(", ")}. `;
        }

        setReportSummary(reportDescription || "There are no significant trends to report for this period.");
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
