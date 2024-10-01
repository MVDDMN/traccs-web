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
                    generateReportDescription(data, dateFrom, dateTo);  // Call the auto-generative report logic after data is fetched
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

    // Function to format the date as "Month Day, Year"
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Function to generate the unified report description based on the data
    const generateReportDescription = (data, dateFrom, dateTo) => {
        let reportDescription = `Between ${formatDate(dateFrom)} and ${formatDate(dateTo)}, `;

        const totalRequests = data.reduce((sum, barangay) => sum + barangay.totalRequests, 0);

        // Ensure we don't divide by zero
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
            percentage: (barangay.totalRequests / totalRequests * 100).toFixed(2)
        }));

        // Group barangays by the same percentage
        const percentageGroups = barangayPercentages.reduce((acc, curr) => {
            acc[curr.percentage] = acc[curr.percentage] ? [...acc[curr.percentage], curr._id] : [curr._id];
            return acc;
        }, {});

        // Add narrative for each percentage group, with "and" or "while" for the last group
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
        const gapThreshold = 10;  // Adjust this value to reflect what a "significant gap" means

        if (mostRequestedPercentage - leastRequestedPercentage > gapThreshold) {
            reportDescription += `There was a significant gap in requests, with the highest percentage accounting for ${mostRequestedPercentage}% and the lowest for ${leastRequestedPercentage}%. `;
        }

        // Suggestive narrative outcomes based on the data trends
        if (totalRequests > 100) {
            reportDescription += `Given the high number of requests, it may be necessary to allocate more resources to the barangays with higher demand. Further analysis can identify which specific items are in demand. `;
        } else {
            reportDescription += `With a lower number of requests, it would be beneficial to review the distribution of resources and ensure that barangays with fewer requests, such as Barangay ${leastRequestedBarangay._id}, are sufficiently supplied. `;
        }

        if (mostRequestedPercentage - leastRequestedPercentage > gapThreshold) {
            reportDescription += `The significant gap between the highest and lowest requested barangays suggests a need for further investigation into why certain areas have more needs than others. Community outreach may be required in areas with lower request volumes. `;
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
