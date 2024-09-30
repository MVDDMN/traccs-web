import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import './ReportSummary.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportSummary = ({ dateFrom, dateTo }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Total Reports',
                data: [],
                backgroundColor: [],
                borderColor: '#fff',
                borderWidth: 1,
            }
        ],
    });
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false); // Track if no data is available

    useEffect(() => {
        const fetchReportSummary = async () => {
            setLoading(true);
            setNoData(false); // Reset noData state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-summary`, {
                    params: { dateFrom, dateTo } // Pass the date range as query parameters
                });
                const data = response.data.reportSummary;

                if (data && data.length > 0) {
                    const types = data.map(item => item._id);
                    const totalReports = data.map(item => item.totalReports);

                    // Use predefined contrasting colors for better visibility
                    const colors = [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8DFF57', '#FF6384', '#36A2EB', '#FFCE56'
                    ];

                    setChartData({
                        labels: types,
                        datasets: [
                            {
                                label: 'Total Reports',
                                data: totalReports,
                                backgroundColor: colors.slice(0, types.length),
                                borderColor: '#fff',
                                borderWidth: 1,
                            }
                        ],
                    });
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

    return (
        <div className="report-summary-container">
            <div className='report-summary-title-box'>
                <a className='report-summary-title'>Report Summary by Type</a>
            </div>

            {loading ? (
                <p>Loading chart...</p>
            ) : noData ? (
                <p>No data available for the selected date range.</p>
            ) : (
                <Pie
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                // Remove mode as default 'nearest' works best for Pie charts
                                intersect: false,
                            },
                            legend: {
                                position: 'top',
                            },
                        },
                    }}
                    className="report-summary-pie-chart-canvas"
                />
            )}
        </div>
    );
};

export default ReportSummary;
