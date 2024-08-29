import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import './ReportTime.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportTime = () => {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(`${apiBaseUrl}/api/analytics/report-frequency-by-hour`);
            const { labels, data, reportTypes } = response.data;

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
        };

        fetchData();
    }, []);

    return (
        <div className="chart-container">
            <div className="chart-header">
                <a className="chart-title">Report Frequency by Hour</a>
            </div>
            <div className="chart">
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
                                            `Types: ${reportTypes.join(', ')}`
                                        ];
                                    },
                                },
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default ReportTime;
