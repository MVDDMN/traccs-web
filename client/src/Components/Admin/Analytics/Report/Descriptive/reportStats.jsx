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

        let reportDescription = `Between ${formatDate(dateFrom)} and ${formatDate(dateTo)}, a total of ${stats.totalReports} reports were submitted.`;

        // Add resolved reports if greater than 0
        if (stats.resolvedReports > 0) {
            reportDescription += ` Of these, ${stats.resolvedReports} have been resolved.`;
        } else {
            reportDescription += ` No reports have been resolved during this period.`;
        }

        // Add denied reports if greater than 0
        if (stats.deniedReports > 0) {
            reportDescription += ` ${stats.deniedReports} reports were denied due to valid reasons.`;
        } else {
            reportDescription += ` No reports have been denied.`;
        }

        // Pending reports narrative
        if (stats.reportsPendingPeriod > 0) {
            reportDescription += ` There are ${stats.reportsPendingPeriod} reports pending resolution.`;
        } else {
            reportDescription += ` No reports are pending resolution during this period.`;
        }

        // Reports today narrative if reportsToday > 0
        if (stats.reportsToday > 0) {
            reportDescription += ` Today, ${stats.reportsToday} reports have been submitted.`;
        }

        // Narrative for the day with the highest reports if any
        if (stats.highestReportDate && stats.highestReportCount > 0) {
            const highestReportDate = new Date(stats.highestReportDate);
            const formattedDate = highestReportDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            reportDescription += ` On ${formattedDate}, there was a peak with ${stats.highestReportCount} reports.`;
        }

        // Add the highest responder in today's reports if present
        if (stats.highestResponder) {
            reportDescription += ` The highest number of responses today came from ${stats.highestResponder}.`;
        }

        // Summary of report types and their counts if available
        if (stats.reportTypesSummary && Object.keys(stats.reportTypesSummary).length > 0) {
            const typesSummary = Object.entries(stats.reportTypesSummary)
                .map(([type, count]) => `${type}: ${count}`)
                .join(', ');

            reportDescription += ` Report types included: ${typesSummary}.`;
        }

        // Check if all main values are 0, if so do not add the ending narrative
        if (stats.resolvedReports === 0 && stats.deniedReports === 0 && stats.reportsPendingPeriod === 0 && stats.reportsToday === 0) {
            reportDescription += ` No significant activity was recorded during this period.`;
        } else if (stats.reportsPendingPeriod > 0) {
            // Suggestive ending narrative only if there are pending reports
            reportDescription += ` Moving forward, it may be beneficial to focus on addressing the pending reports to ensure timely resolution and improve response efforts in the community.`;
        }

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
