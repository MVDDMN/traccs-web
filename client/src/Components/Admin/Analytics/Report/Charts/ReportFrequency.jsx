import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './ReportFrequency.css';

// Register components for Chart.js
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportFrequency = ({ dateFrom, dateTo }) => {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false); // Track if no data is available
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReportFrequency = async () => {
            setLoading(true);
            setNoData(false);
            setError(null); // Reset states before fetching data
    
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-frequency`, {
                    params: { dateFrom, dateTo }
                });
    
                const data = response.data;
    
                if (data && data.length > 0 && data.some(item => item.count > 0)) {
                    const monthNames = [
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                    ];
    
                    // Define the report types and the color map
                    const typeColorMap = {
                        Fire: '#E74C3C',
                        Police: '#F1C40F',
                        Accident: '#3498DB',
                        Hazard: '#E67E22',
                        Medical: '#9B59B6',
                        Assistance: '#1ABC9C',
                    };
    
                    // Define the desired order for the legend
                    const legendOrder = ['Fire', 'Police', 'Accident', 'Hazard', 'Medical', 'Assistance'];
    
                    // Extract unique types and map the data
                    const types = [...new Set(data.map(item => item.type))];
    
                    // Generate datasets
                    let datasets = types.map((type) => {
                        const dataValues = Array.from({ length: 12 }, () => 0);
                        data.forEach(item => {
                            if (item.type === type && item.month) {
                                const monthIndex = parseInt(item.month) - 1;
                                dataValues[monthIndex] += item.count;
                            }
                        });
    
                        return {
                            label: type || 'Unknown',
                            data: dataValues,
                            backgroundColor: typeColorMap[type] || '#cccccc',  // Default to gray if type not found
                            borderColor: typeColorMap[type] || '#cccccc',
                            borderWidth: 1,
                        };
                    });
    
                    // Sort the datasets based on the desired order for the legend
                    datasets = datasets.sort((a, b) => {
                        return legendOrder.indexOf(a.label) - legendOrder.indexOf(b.label);
                    });
    
                    setChartData({ labels: monthNames, datasets });
                } else {
                    setNoData(true); // No data available for the selected range
                }
            } catch (error) {
                setError('An error occurred while fetching data.');
                console.error('Error fetching report frequency:', error);
            } finally {
                setLoading(false); // Loading completed
            }
        };
    
        if (dateFrom && dateTo) {
            fetchReportFrequency();
        }
    }, [dateFrom, dateTo]);

    return (
        <div className="report-frequency-container">
            <div className='report-frequency-title-box'>
                <a className='report-frequency-title'>Report Type Frequency per Month</a>
            </div>

            <div className="report-frequency-chart-container">
                {loading ? (
                    <p>Loading chart...</p>
                ) : error ? (
                    <p className='error-message'>{error}</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
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
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Number of Reports',
                                    },
                                    beginAtZero: true,
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
                )}
            </div>
        </div>
    );
};

export default ReportFrequency;