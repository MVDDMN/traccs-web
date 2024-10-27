import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './reportStats.css';

// Setting up the base URL for API requests based on environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportStats = ({ dateFrom, dateTo }) => {
    // State to hold statistical data fetched from the API
    const [stats, setStats] = useState({ totalReports: 0, reportsPendingPeriod: 0, reportsToday: 0, resolvedReports: 0, deniedReports: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noData, setNoData] = useState(false);  // State to track if no data is available for the provided date range

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            setNoData(false); // Reset the "no data" state before each API call
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-stats`, {
                    params: { dateFrom, dateTo } // Send dateFrom and dateTo as query parameters to the API
                });

                // Handling response: if totalReports is zero, flag as no data
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

    // Function to format a date to "Month Day, Year"
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Function to generate a unified, detailed report description with multiple alternative narratives
    const generateUnifiedReportDescription = () => {
        if (loading || !stats) {
            return "Loading report analysis...";
        }

        if (noData || stats.totalReports === 0) {  // Handle cases with no data
            return "No data available for the selected date range.";
        }

        let reportDescription = `Between ${formatDate(dateFrom)} and ${formatDate(dateTo)}, a total of ${stats.totalReports} reports were submitted.`;

        // Elaborate on resolved reports
        if (stats.resolvedReports > 0) {
            reportDescription += ` Out of these, ${stats.resolvedReports} reports have been resolved, showing progress in handling the submissions.`;
            reportDescription += ` This resolution rate indicates that the team is actively working on resolving reported issues.`;
            reportDescription += ` Resolving ${stats.resolvedReports} reports is a positive sign that actionable steps have been taken during the specified timeframe.`;
        } else {
            reportDescription += ` No reports were resolved during this period, which might indicate some delays or challenges in the resolution process.`;
            reportDescription += ` The lack of resolved reports could be a result of an increased workload or insufficient resources to address the submissions.`;
            reportDescription += ` Addressing this gap should be a priority to improve response times in the future.`;
        }

        // Elaborate on denied reports
        if (stats.deniedReports > 0) {
            reportDescription += ` Additionally, ${stats.deniedReports} reports were denied, possibly due to issues like invalid submissions or not meeting the required criteria.`;
            reportDescription += ` Denying ${stats.deniedReports} reports could indicate a robust filtering process to ensure only valid cases are addressed.`;
            reportDescription += ` The denied reports may also reflect stringent criteria that need to be met before reports proceed to resolution.`;
        } else {
            reportDescription += ` There were no reports denied during this period, which might reflect careful screening or fewer erroneous submissions.`;
            reportDescription += ` The absence of denied reports could imply that all submitted reports were valid and merited attention.`;
            reportDescription += ` Having no denied reports also suggests that users are well-informed about the criteria for valid submissions.`;
        }

        // Elaborate on pending reports
        if (stats.reportsPendingPeriod > 0) {
            reportDescription += ` There are currently ${stats.reportsPendingPeriod} reports pending resolution, suggesting the need for further attention to ensure timely completion.`;
            reportDescription += ` These pending reports indicate areas where further effort is needed to clear the backlog.`;
            reportDescription += ` The ${stats.reportsPendingPeriod} pending reports could benefit from prioritization strategies to improve response times.`;
        } else {
            reportDescription += ` There are no pending reports at this time, which could indicate efficient processing of all submitted cases.`;
            reportDescription += ` No pending reports mean that the team has been able to keep up with incoming submissions effectively.`;
            reportDescription += ` This lack of backlog is a good indicator of the team's current capacity to manage report volumes.`;
        }

        // Mention reports submitted today if applicable
        if (stats.reportsToday > 0) {
            reportDescription += ` Today, ${stats.reportsToday} new reports have been submitted, reflecting ongoing engagement from the community.`;
            reportDescription += ` The submission of ${stats.reportsToday} reports today suggests a consistent inflow of feedback or issues being reported.`;
            reportDescription += ` Today's submissions highlight the community's active participation and willingness to report concerns as they arise.`;
        }

        // Mention the day with the highest reports if data is available
        if (stats.highestReportDate && stats.highestReportCount > 0) {
            const formattedDate = formatDate(stats.highestReportDate);
            reportDescription += ` The highest volume of reports was observed on ${formattedDate}, with ${stats.highestReportCount} reports submitted on that day.`;
            reportDescription += ` This peak indicates a specific event or issue that led to increased reporting on ${formattedDate}.`;
            reportDescription += ` Understanding why ${formattedDate} saw a peak in reports could help in preparing for similar future surges.`;
        }

        // Mention the highest responder today if available
        if (stats.highestResponder) {
            reportDescription += ` The individual with the most responses today is ${stats.highestResponder}, highlighting their active contribution.`;
            reportDescription += ` ${stats.highestResponder} has demonstrated commendable effort in addressing reports today, showcasing their dedication.`;
            reportDescription += ` Recognizing the contribution of ${stats.highestResponder} helps in motivating continued active participation from the team.`;
        }

        // Summary of report types and their counts if available
        if (stats.reportTypesSummary && Object.keys(stats.reportTypesSummary).length > 0) {
            const typesSummary = Object.entries(stats.reportTypesSummary)
                .map(([type, count]) => `${type}: ${count}`)
                .join(', ');

            reportDescription += ` The breakdown of report types is as follows: ${typesSummary}.`;
            reportDescription += ` This summary of report types helps identify the most frequently reported issues.`;
            reportDescription += ` Understanding the distribution of report types can guide resource allocation for addressing specific categories.`;
        }

        // Conclusion with recommendations if there are pending reports
        if (stats.resolvedReports === 0 && stats.deniedReports === 0 && stats.reportsPendingPeriod === 0 && stats.reportsToday === 0) {
            reportDescription += ` Overall, there was minimal activity recorded during this period.`;
        } else if (stats.reportsPendingPeriod > 0) {
            reportDescription += ` To maintain a high level of community satisfaction, it is advised to focus on resolving the pending reports as soon as possible.`;
            reportDescription += ` Addressing the pending reports can help in reducing response times and improving user satisfaction.`;
            reportDescription += ` Proactive measures to tackle the pending reports can ensure that the backlog is cleared efficiently.`;
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
