import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './reportStats.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportStats = ({ dateFrom, dateTo }) => {
    const [stats, setStats] = useState({ totalReports: 0, reportsThisMonth: 0, reportsToday: 0, resolvedReports: 0, deniedReports: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noData, setNoData] = useState(false); // Track if no data is available

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            setNoData(false); // Reset noData state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-stats`, {
                    params: { dateFrom, dateTo } // Use dateFrom and dateTo as query parameters
                });

                if (response.data && response.data.totalReports > 0) {
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

    // Function to generate unified report description
    const generateUnifiedReportDescription = () => {
        if (loading || !stats) {
            return "Loading report analysis...";
        }

        if (noData) {
            return "No data available for the selected date range."; 
        }

        let reportDescription = `Within the selected dates, there are ${stats.totalReports} total reports. Of these, ${stats.resolvedReports} have been resolved, and ${stats.deniedReports} were denied due to valid reasons. `;

        // Narrative for the day with the highest reports
        if (stats.highestReportDate && stats.highestReportCount > 0) {
            const highestReportDate = new Date(stats.highestReportDate);
            const formattedDate = highestReportDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            reportDescription += `${formattedDate} saw the highest number of reports, with ${stats.highestReportCount} reports. `;
        }

        // Narrative if there are more than 10 reports today
        if (stats.reportsToday > 10) {
            reportDescription += `There has been an unusually high number of reports today, with more than ${stats.reportsToday} incidents reported.`;
        }

        // Add the highest responder in today's reports
        if (stats.highestResponder) {
            reportDescription += `The highest number of responses came from ${stats.highestResponder}. `;
        }

        // Summary of report types and their counts
        if (stats.reportTypesSummary) {
            const typesSummary = Object.entries(stats.reportTypesSummary)
                .map(([type, count]) => `${type}: ${count}`)
                .join(', ');

            reportDescription += `In complete summary, the report types involved were: ${typesSummary}, with a total of ${stats.totalReports} reports.`;
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
