import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import './ReportTime.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportTime = ({ dateFrom, dateTo }) => {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noData, setNoData] = useState(false);  // Add a state to track if no data is available

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setNoData(false);  // Reset noData state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-frequency-by-hour`, {
                    params: { dateFrom, dateTo } // Pass the date range to the backend
                });

                const { labels, data, reportTypes } = response.data;

                // Check if there's data to display
                if (data && data.length > 0 && data.some(count => count > 0)) {  // Ensure that there is data greater than 0
                    setChartData({
                        labels,
                        datasets: [
                            {
                                label: 'Number of Reports',
                                data,
                                backgroundColor: '#0E267C',
                                borderColor: '#0E267C',
                                borderWidth: 1,
                                reportTypes, // Include report types in the dataset
                            },
                        ],
                    });
                } else {
                    setNoData(true);  // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching report frequency by hour data:', error);
                setError('Error loading chart data');
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchData();  // Fetch data only when both dateFrom and dateTo are set
        }
    }, [dateFrom, dateTo]);  // Re-fetch data when dateFrom or dateTo changes

    return (
        <div className="report-time-chart-container">
            <div className="report-time-chart-header">
                <a className="report-time-chart-title">Report Frequency by Hour</a>
            </div>
            <div className="report-time-chart">
                {loading ? (
                    <p>Loading chart...</p>
                ) : error ? (
                    <p className="report-time-error-message">{error}</p>
                ) : noData ? (  // If no data is available
                    <p className="report-time-no-data-message">No data available for the selected date range.</p>
                ) : (
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Hour of the Day',
                                    },
                                },
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Number of Reports',
                                    },
                                    ticks: {
                                        precision: 0,
                                    },
                                },
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function (tooltipItem) {
                                            const reportTypes = tooltipItem.dataset.reportTypes[tooltipItem.dataIndex];
                                            return [
                                                `Reports: ${tooltipItem.raw}`,
                                                `Types: ${reportTypes.join(', ')}`,
                                            ];
                                        },
                                    },
                                },
                            },
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ReportTime;
