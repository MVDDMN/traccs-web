import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './reportStats.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportStats = ({ dateFrom, dateTo }) => {
    const [stats, setStats] = useState({ totalReports: 0, reportsPendingPeriod: 0, reportsToday: 0, resolvedReports: 0, deniedReports: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noData, setNoData] = useState(false);  // Track if no data is available

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            setNoData(false); // Reset noData state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-stats`, {
                    params: { dateFrom, dateTo } // Send dateFrom and dateTo as query parameters
                });

                // If response contains data but totalReports is 0, set noData to true
                if (response.data && response.data.totalReports === 0) {
                    setNoData(true);
                } else if (response.data) {
                    setStats(response.data);
                } else {
                    setNoData(true);  // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching report stats:', error);
                setError('Error fetching report data.');
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchStats();
        }
    }, [dateFrom, dateTo]);

    // Function to format date to "Month Day Year"
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Function to generate unified report description
    const generateUnifiedReportDescription = () => {
        if (loading || !stats) {
            return "Loading report analysis...";
        }

        if (noData || stats.totalReports === 0) {  // Check if no data or totalReports is 0
            return "No data available for the selected date range."; 
        }

        let reportDescription = `Between ${formatDate(dateFrom)} and ${formatDate(dateTo)}, a total of ${stats.totalReports} reports were submitted. Of these, ${stats.resolvedReports} have been resolved, and ${stats.deniedReports} were denied due to valid reasons. `;

        // Pending reports narrative
        reportDescription += `During this period, there are ${stats.reportsPendingPeriod} reports pending resolution. `;

        // Reports today narrative
        if (stats.reportsToday > 0) {
            reportDescription += `Today, ${stats.reportsToday} reports have been submitted. `;
        }

        // Narrative for the day with the highest reports
        if (stats.highestReportDate && stats.highestReportCount > 0) {
            const highestReportDate = new Date(stats.highestReportDate);
            const formattedDate = highestReportDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            reportDescription += `Notably, on ${formattedDate}, there was a peak with ${stats.highestReportCount} reports. `;
        }

        // Add the highest responder in today's reports
        if (stats.highestResponder) {
            reportDescription += `The highest number of responses today came from ${stats.highestResponder}. `;
        }

        // Summary of report types and their counts
        if (stats.reportTypesSummary) {
            const typesSummary = Object.entries(stats.reportTypesSummary)
                .map(([type, count]) => `${type}: ${count}`)
                .join(', ');

            reportDescription += `In summary, the report types included: ${typesSummary}. `;
        }

        // Suggestive ending narrative
        reportDescription += `Moving forward, it may be beneficial to focus on addressing the pending reports to ensure timely resolution and improve response efforts in the community. `;

        return reportDescription;
    };

    return (
        <div className='desc-reportstats-container'>
            <div className='desc-reportstats-title'>
                <label className='desc-reportstats-title-text'>
                    Report Descriptive Summary
                </label>
            </div>

            <div className='desc-reportstats-content-box'>
                {loading ? (
                    <p>Loading report trends...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <div className='desc-reportstats-trends-box'>
                        <p>{generateUnifiedReportDescription()}</p>
                    </div>
                )}
            </div>

            {error && <p className="desc-reportstats-error-message">{error}</p>}
        </div>
    );
};

export default ReportStats;
