import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import './ReportFrequency.css';

// Register components for Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ReportFrequency = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        let isMounted = true;
        const fetchReportFrequency = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/analytics/report-frequency');
                if (isMounted) {
                    const data = response.data;

                    if (!data || data.length === 0) {
                        throw new Error('No data fetched');
                    }

                    const monthNames = [
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                    ];

                    const types = [...new Set(data.map(item => item.type))];

                    const datasets = types.map((type, index) => {
                        const dataValues = Array.from({ length: 12 }, () => 0);

                        data.forEach(item => {
                            if (item.type === type && item.month) { 
                                const monthIndex = parseInt(item.month) - 1;
                                dataValues[monthIndex] += item.count;
                            }
                        });

                        const vibrantColors = [
                            '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
                            '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
                        ];

                        const colorIndex = index % vibrantColors.length;

                        return {
                            label: type || 'Unknown',
                            data: dataValues,
                            backgroundColor: vibrantColors[colorIndex],
                            borderColor: vibrantColors[colorIndex],
                            borderWidth: 1,
                        };
                    });

                    setChartData({
                        labels: monthNames,
                        datasets: datasets,
                    });
                }
            } catch (error) {
                console.error('Error fetching the report frequency data:', error);
            }
        };

        fetchReportFrequency();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="report-frequency-container">
            <div className='report-frequency-title-box'>

                <a className='report-frequency-title'>Report Type Frequency per Month</a>

            </div>
            
            <div className="report-frequency-chart-container">
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                            },
                            legend: {
                                position: 'top',
                                align: 'center',
                            },
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Months',
                                },
                                stacked: true,
                                ticks: {
                                    beginAtZero: true,
                                    precision: 0,
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Number of Reports',
                                },
                                stacked: true,
                                beginAtZero: true,
                                ticks: {
                                    precision: 0,
                                },
                            },
                        },
                        layout: {
                            padding: {
                                top: 20,
                                right: 20,
                                bottom: 20,
                                left: 20,
                            },
                        },
                    }}
                    className="custom-report-frequency-chart"
                />
            </div>
        </div>
    );
};

export default ReportFrequency;
