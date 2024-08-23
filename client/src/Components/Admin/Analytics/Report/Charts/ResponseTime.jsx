import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './ResponseTime.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ResponseTime = () => {
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

    useEffect(() => {
        const fetchResponseTimeSummary = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/response-time-summary`);
                const data = response.data;

                const responders = data.map(item => item._id);
                const averageResponseTimes = data.map(item => {
                    const totalMinutes = item.averageResponseTime / (1000 * 60);
                    return `${Math.floor(totalMinutes)}m`;
                });

                setChartData({
                    labels: responders,
                    datasets: [
                        {
                            label: 'Average Completion Time (minutes)',
                            data: data.map(item => item.averageResponseTime / (1000 * 60)),
                            backgroundColor: '#0E267C',
                            borderColor: '#0E267C',
                            borderWidth: 1,
                        }
                    ],
                });

                setAverageResponseTimesInText(averageResponseTimes);
            } catch (error) {
                console.error('Error fetching the response time summary', error);
            }
        };

        fetchResponseTimeSummary();
    }, []);

    const [averageResponseTimesInText, setAverageResponseTimesInText] = useState([]);

    return (
        <div className="response-time-summary-container">
            <div className='response-time-title-box'>
                <a className='response-time-title'>Average Time to Respond/Completion</a>
            </div>
            
            <div className="response-time-chart-container">
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
            </div>
        </div>
    );
};

export default ResponseTime;
