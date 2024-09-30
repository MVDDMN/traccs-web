import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './reportSummary.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportSummary = ({ dateFrom, dateTo }) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportSummary, setReportSummary] = useState(""); // Single state for unified trends
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
        let reportDescription = "";

        const totalReports = data.reduce((sum, report) => sum + report.totalReports, 0);

        if (totalReports > 100) {
            reportDescription += `There has been a high volume of reports with over ${totalReports} incidents recorded. `;
        } else {
            reportDescription += `The number of reported incidents is relatively low, with only ${totalReports} reports recorded. `;
        }

        const mostCommonType = data.reduce((prev, current) => (prev.totalReports > current.totalReports) ? prev : current, {});
        if (mostCommonType) {
            reportDescription += `The most common type of report is "${mostCommonType._id}" with ${mostCommonType.totalReports} cases. `;
        }

        const leastCommonType = data.reduce((prev, current) => (prev.totalReports < current.totalReports) ? prev : current, {});
        if (leastCommonType) {
            reportDescription += `Interestingly, the least common report type is "${leastCommonType._id}", with only ${leastCommonType.totalReports} cases. `;
        }

        setReportSummary(reportDescription || "There are no significant trends to report at the moment.");
    };

    return (
        <div className='desc-reportsummary-container'>
            <div className='desc-reportsummary-title'>
                <label className='desc-reportsummary-title-text'>
                    Report Descriptive Summary 
                </label>
            </div>

            <div className='desc-reportsummary-content-box'>
                {loading ? (
                    <p>Loading report trends...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <div className='desc-reportsummary-trends-box'>
                        <p>{reportSummary}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportSummary;
