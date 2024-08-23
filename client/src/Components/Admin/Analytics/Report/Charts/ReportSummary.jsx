import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './ReportSummary.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportSummary = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Total Reports',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ],
    });

    useEffect(() => {
        const fetchReportSummary = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-summary`);
                const data = response.data;

                const types = data.map(item => item._id);
                const totalReports = data.map(item => item.totalReports);

                setChartData({
                    labels: types,
                    datasets: [
                        {
                            label: 'Total Reports',
                            data: totalReports,
                            backgroundColor: '#0E267C',
                            borderColor: '#0E267C',
                            borderWidth: 1,
                        }
                    ],
                });
            } catch (error) {
                console.error('Error fetching the report summary', error);
            }
        };

        fetchReportSummary();
    }, []);

    return (
        <div className="report-summary-container">
            <div className='report-summary-title-box'>
                <a className='report-summary-title'>Report Summary by Type</a>
            </div>
            <Bar
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Report Types',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Number of Reports',
                            },
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                            }
                        }
                        
                    },
                    plugins: {
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        },
                        legend: {
                            position: 'top',
                        },
                    },
                }}
                className="bar-chart-canvas"
            />
        </div>
    );
};

export default ReportSummary;
