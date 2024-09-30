import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './ResponseTime.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ResponseTime = ({ dateFrom, dateTo }) => {
    const [chartData, setChartData] = useState({
        labels: [], // X-axis labels for responders
        datasets: [] // Each barangay will be its own dataset
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
                    // Prepare labels and datasets
                    const responders = data.map(item => item._id.responder);
                    const averageResponseTimes = data.map(item => item.averageResponseTime / 1000); // Convert ms to seconds

                    // Create datasets for each barangay
                    const datasets = responders.map((responder, index) => ({
                        label: responder,
                        data: [averageResponseTimes[index]], // Data point for the responder
                        backgroundColor: '#0E267C',
                        borderColor: '#0E267C',
                        borderWidth: 1,
                    }));

                    setChartData({
                        labels: ['Average Response Time'], // Single label for the X-axis
                        datasets: datasets, // Set each barangay as its own dataset
                    });
                } else {
                    setNoData(true);
                }
            } catch (error) {
                console.error('Error fetching the response time summary', error);
                setNoData(true); // Set no data to true if there's an error
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
                <a className='response-time-title'>Average Time to Respond/Completion</a>
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
                                        text: 'Responders',
                                    },
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Time (minutes and seconds)',
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
                                            const totalSeconds = context.dataset.data[0];
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
