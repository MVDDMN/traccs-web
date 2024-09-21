import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './reportSummary.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportSummary = ({ dateFrom, dateTo }) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [positiveTrends, setPositiveTrends] = useState("");
    const [negativeTrends, setNegativeTrends] = useState("");
    const [noData, setNoData] = useState(false); // Track if no data is available

    useEffect(() => {
        const fetchReportSummary = async () => {
            setLoading(true);
            setNoData(false); // Reset noData state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-summary`, {
                    params: { dateFrom, dateTo }
                });
                const data = response.data.reportSummary;

                if (data && data.length > 0) {
                    setChartData(data);
                    generateReportDescription(data); // Call the auto-generative report logic after data is fetched
                } else {
                    setNoData(true); // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching the report summary', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchReportSummary();
        }
    }, [dateFrom, dateTo]);

    const generateReportDescription = (data) => {
        let positiveDescription = "";
        let negativeDescription = "";

        const totalReports = data.reduce((sum, report) => sum + report.totalReports, 0);

        if (totalReports > 100) {
            positiveDescription += `There has been a high volume of reports with over ${totalReports} incidents recorded. `;
        } else {
            negativeDescription += `The number of reported incidents is relatively low, with only ${totalReports} reports recorded. `;
        }

        const mostCommonType = data.reduce((prev, current) => (prev.totalReports > current.totalReports) ? prev : current, {});
        if (mostCommonType) {
            positiveDescription += `The most common type of report is "${mostCommonType._id}" with ${mostCommonType.totalReports} cases. `;
        }

        const leastCommonType = data.reduce((prev, current) => (prev.totalReports < current.totalReports) ? prev : current, {});
        if (leastCommonType) {
            negativeDescription += `Interestingly, the least common report type is "${leastCommonType._id}", with only ${leastCommonType.totalReports} cases. `;
        }

        setPositiveTrends(positiveDescription || "There are no major positive trends to report at the moment.");
        setNegativeTrends(negativeDescription || "There are no significant negative trends to highlight at the moment.");
    };

    return (
        <div className='desc-reportsummary-container'>
            <div className='desc-reportsummary-title'>
                <label className='desc-reportsummary-title-text'>
                    Descriptive Summary
                </label>
            </div>

            <div className='desc-reportsummary-content-box'>
                {loading ? (
                    <p>Loading report trends...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <>
                        <div className='desc-reportsummary-positives-box'>
                            <h2>Positive Report Trends</h2>
                            <p>{positiveTrends}</p>
                        </div>

                        <div className='desc-reportsummary-negatives-box'>
                            <h2>Negative Report Trends</h2>
                            <p>{negativeTrends}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportSummary;
