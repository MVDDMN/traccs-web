import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './ResponseTime.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const ResponseTime = ({ dateFrom, dateTo }) => {
    const [chartData, setChartData] = useState({
        labels: [], // X-axis labels for months
        datasets: [] // MDRRMO average response times
    });
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false);

    useEffect(() => {
        const fetchResponseTimeSummary = async () => {
            setLoading(true);
            setNoData(false);
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/response-time-summary`, {
                    params: { dateFrom, dateTo }
                });
                const data = response.data;

                if (data && data.length > 0) {
                    // Filter data specifically for "mdrrmo"
                    const mdrrmoData = data.filter(item => item._id.responder === 'MDRRMO');

                    if (mdrrmoData.length === 0) {
                        setNoData(true); // No data if mdrrmo is not found
                        return;
                    }

                    // Prepare labels and dataset for MDRRMO
                    const months = mdrrmoData.map(item => monthNames[item._id.month - 1]); // Convert month number to month name
                    const averageResponseTimes = mdrrmoData.map(item => item.averageResponseTime / 1000); // Convert ms to seconds

                    // Set chart data with MDRRMO data only
                    setChartData({
                        labels: months, // Use months as X-axis labels
                        datasets: [{
                            label: 'Average Response Time',
                            data: averageResponseTimes,
                            backgroundColor: '#0E267C',
                            borderColor: '#0E267C',
                            borderWidth: 1,
                        }]
                    });
                } else {
                    setNoData(true);
                }
            } catch (error) {
                console.error('Error fetching the response time summary', error);
                setNoData(true);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchResponseTimeSummary();
        }
    }, [dateFrom, dateTo]);

    return (
        <div className="response-time-summary-container">
            <div className='response-time-title-box'>
                <a className='response-time-title'>MDRRMO Average Time to Respond/Completion</a>
            </div>
            
            <div className="response-time-chart-container">
                {loading ? (
                    <p>Loading chart...</p>
                ) : noData ? (
                    <p className="no-data-message">No data available for the selected date range.</p>
                ) : (
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Month',
                                    },
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Time (seconds)',
                                    },
                                    ticks: {
                                        callback: function(value) {
                                            const minutes = Math.floor(value / 60);
                                            const seconds = Math.floor(value % 60);
                                            return `${minutes}m ${seconds}s`; // Format Y-axis ticks as Xm Ys
                                        }
                                    }
                                }
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const totalSeconds = context.dataset.data[context.dataIndex];
                                            const minutes = Math.floor(totalSeconds / 60);
                                            const seconds = Math.floor(totalSeconds % 60);
                                            return `${context.dataset.label}: ${minutes}m ${seconds}s`; // Format tooltip
                                        }
                                    }
                                }
                            }
                        }}
                        id="response-time-chart"
                    />
                )}
            </div>
        </div>
    );
};

export default ResponseTime;
