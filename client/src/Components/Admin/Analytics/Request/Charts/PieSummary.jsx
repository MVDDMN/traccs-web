import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import './PieSummary.css';

// Registering necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const PieSummary = ({ dateFrom, dateTo }) => {
    const [chartData, setChartData] = useState({
        labels: [],  // Barangay names will be the labels on the X-axis
        datasets: [  // Data to be plotted as lines
            {
                label: 'Total Requests',
                data: [],  // Data for each barangay
                backgroundColor: [],  // Background color for the line area (not needed for a line chart)
                borderColor: [],  // Border color for the lines
                borderWidth: 2,  // Thickness of the line
                fill: false,  // Don't fill the area under the line
            },
        ],
    });
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false);  // Track if no data is available

    useEffect(() => {
        const fetchLineSummary = async () => {
            setLoading(true);
            setNoData(false);  // Reset no data state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/barangay-summary`, {
                    params: { dateFrom, dateTo }  // Send date range as query parameters
                });
                const data = response.data;

                if (data && data.length > 0) {
                    const barangays = data.map(item => item._id);
                    const totalRequests = data.map(item => item.totalRequests);

                    // Define custom colors for each Barangay with color names in comments
                    const barangayColors = {
                        'MDRRMO': 'rgba(75, 192, 192, 1)', // Teal
                        'Dolores': 'rgba(153, 102, 255, 1)', // Purple
                        'Muzon': 'rgba(255, 159, 64, 1)', // Orange
                        'San Isidro': 'rgba(54, 162, 235, 1)', // Blue
                        'San Juan': 'rgba(255, 99, 132, 1)', // Red
                        'Santa Ana': 'rgba(255, 205, 86, 1)', // Yellow
                    };

                    // Use the colors for each barangay and set the dataset
                    const backgroundColor = barangays.map(barangay => barangayColors[barangay] || 'rgba(169, 169, 169, 1)');
                    const borderColor = barangays.map(barangay => barangayColors[barangay] || 'rgba(169, 169, 169, 1)');

                    setChartData({
                        labels: barangays,  // X-axis will display Barangay names
                        datasets: [
                            {
                                label: 'Total Requests',
                                data: totalRequests,
                                backgroundColor: backgroundColor,
                                borderColor: borderColor,
                                borderWidth: 2,
                                fill: false,  // Don't fill the area under the line
                            },
                        ],
                    });
                } else {
                    setNoData(true);  // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching the line summary', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchLineSummary();  // Fetch data only if date range is provided
        }
    }, [dateFrom, dateTo]);  // Re-fetch when date range changes

    return (
        <div className="requests-line-summary-container">
            <div className='requests-line-title-box'>
                <a className="requests-line-title">Number of Requests by Barangay</a>
            </div>
            
            {loading ? (
                <p>Loading data...</p>
            ) : noData ? (
                <p>No data available for the selected date range.</p>
            ) : (
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                enabled: true,
                                mode: 'index', // Show tooltip for all points at the same index (x-axis)
                                intersect: false, // Allow tooltip to be displayed even if it's not directly over the point
                                callbacks: {
                                    label: function(context) {
                                        // Customizing the tooltip label for better display
                                        const label = context.dataset.label || '';
                                        const value = context.raw || 0;
                                        return `${label}: ${value}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Barangay',
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Total Requests',
                                },
                                beginAtZero: true,
                            }
                        }
                    }}
                    className="requests-line-chart-canvas"
                />
            )}
        </div>
    );
};

export default PieSummary;