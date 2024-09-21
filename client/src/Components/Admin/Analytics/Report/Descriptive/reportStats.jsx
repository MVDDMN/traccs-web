import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './reportStats.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportStats = ({ dateFrom, dateTo }) => {
    const [stats, setStats] = useState({ totalReports: 0, reportsThisMonth: 0, reportsToday: 0 });
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

    // Function to generate a descriptive report for positive trends
    const generatePositiveReportDescription = () => {
        if (loading || !stats) {
            return "Loading report analysis...";
        }

        let reportDescription = "Analyzing the current trends, ";

        if (stats.reportsToday > 0) {
            reportDescription += `there have been ${stats.reportsToday} reports today. `;
        } else {
            reportDescription += "no reports have been filed today. ";
        }

        if (stats.reportsThisMonth > 0) {
            reportDescription += `This month has seen a total of ${stats.reportsThisMonth} reports so far. `;
        } else {
            reportDescription += "There have been no reports this month. ";
        }

        if (stats.totalReports > 0) {
            reportDescription += `Overall, the total number of reports for the selected period is ${stats.totalReports}. `;
        } else {
            reportDescription += "No reports have been filed for the selected period. ";
        }

        if (stats.reportsThisMonth > stats.totalReports / 12) {
            reportDescription += "The current month shows an above-average number of reports compared to previous months. ";
        } else {
            reportDescription += "The report activity this month is below the expected average. ";
        }

        return reportDescription;
    };

    const generateNegativeReportDescription = () => {
        if (loading || !stats) {
            return "Loading negative trends analysis...";
        }

        let negativeDescription = "";

        if (stats.reportsThisMonth < stats.totalReports / 12) {
            negativeDescription += "The number of reports this month is significantly lower than the average for previous months. ";
        }

        if (stats.reportsToday === 0) {
            negativeDescription += "No reports have been filed today, indicating a potential drop in user engagement. ";
        }

        if (!negativeDescription) {
            negativeDescription = "There are no significant negative trends in the data currently.";
        }

        return negativeDescription;
    };

    return (
        <div className='desc-reportstats-container'>
            <div className='desc-reportstats-title'>
                <label className='desc-reportstats-title-text'>
                    Descriptive Summary
                </label>
            </div>

            <div className='desc-reportstats-content-box'>
                {loading ? (
                    <p>Loading report trends...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <>
                        <div className='desc-reportstats-positives-box'>
                            <h2>Positive Report Trends</h2>
                            <p>{generatePositiveReportDescription()}</p>
                        </div>

                        <div className='desc-reportstats-negatives-box'>
                            <h2>Negative Report Trends</h2>
                            <p>{generateNegativeReportDescription()}</p>
                        </div>
                    </>
                )}
            </div>

            {error && <p className="desc-reportstats-error-message">{error}</p>}
        </div>
    );
};

export default ReportStats;
