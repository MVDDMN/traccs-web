import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './ResponseTime.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ResponseTime = ({ dateFrom, dateTo }) => {  // Accept dateFrom and dateTo as props
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Average Completion Time (minutes)',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ],
    });
    const [averageResponseTimesInText, setAverageResponseTimesInText] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false); // Track if no data is available

    useEffect(() => {
        const fetchResponseTimeSummary = async () => {
            setLoading(true);
            setNoData(false); // Reset no data state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/response-time-summary`, {
                    params: { dateFrom, dateTo } // Pass the date range to the backend
                });
                const data = response.data;

                // Check if data exists
                if (data && data.length > 0) {
                    const responders = data.map(item => item._id);
                    const averageResponseTimes = data.map(item => {
                        const totalMinutes = item.averageResponseTime / (1000 * 60); // Convert ms to minutes
                        return `${Math.floor(totalMinutes)}m`;
                    });

                    setChartData({
                        labels: responders,
                        datasets: [
                            {
                                label: 'Average Completion Time (minutes)',
                                data: data.map(item => item.averageResponseTime / (1000 * 60)), // Convert ms to minutes
                                backgroundColor: '#0E267C',
                                borderColor: '#0E267C',
                                borderWidth: 1,
                            }
                        ],
                    });

                    setAverageResponseTimesInText(averageResponseTimes);
                } else {
                    setNoData(true); // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching the response time summary', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchResponseTimeSummary(); // Fetch data only when both dateFrom and dateTo are set
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
                                        text: 'Minutes',
                                    },
                                }
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            return ` ${averageResponseTimesInText[context.dataIndex]}`;
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
