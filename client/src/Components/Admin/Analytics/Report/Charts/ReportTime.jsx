import React, { useState, useEffect } from 'react';
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

    // Predefined colors for report types
    const reportTypeColors = {
        'Fire': '#E74C3C',       // Fire
        'Accident': '#3498DB',   // Accident
        'Police': '#F1C40F',     // Police
        'Medical': '#9B59B6',    // Medical
        'Assistance': '#1ABC9C', // Assistance
        'Hazard': '#E67E22',     // Hazard
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setNoData(false);  // Reset noData state

            // Check if the date range is within 24 hours
            const startDate = new Date(dateFrom);
            const endDate = new Date(dateTo);
            const timeDifference = endDate.getTime() - startDate.getTime();

            // If the difference is greater than 24 hours, show an error
            if (timeDifference > 24 * 60 * 60 * 1000) {
                setError('The selected date range must be within a single day (24 hours). For example: "1 September 2024 -> 2 September 2024".');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-frequency-by-hour`, {
                    params: { dateFrom, dateTo } // Pass the date range to the backend
                });
    
                const { labels, breakdownByHour } = response.data;
    
                // Check if there's data to display
                if (breakdownByHour && breakdownByHour.length > 0) {  // Ensure that there is data
                    const datasets = [];
    
                    // Iterate over each hour and populate the datasets
                    breakdownByHour.forEach((breakdown, hour) => {
                        Object.keys(breakdown).forEach((reportType) => {
                            // Check if report type is already in datasets
                            const existingDataset = datasets.find(dataset => dataset.label === reportType);
    
                            if (existingDataset) {
                                // Add the report count for this hour
                                existingDataset.data[hour] = breakdown[reportType];
                            } else {
                                // Create a new dataset for this report type
                                datasets.push({
                                    label: reportType,
                                    data: Array(labels.length).fill(0).map((_, idx) => (idx === hour ? breakdown[reportType] : 0)),  // Only set the data for the current hour
                                    backgroundColor: reportTypeColors[reportType],  // Use predefined colors
                                    borderColor: reportTypeColors[reportType],
                                    borderWidth: 1,
                                });
                            }
                        });
                    });
    
                    // Define the desired order for the legend
                    const legendOrder = ['Fire', 'Police', 'Accident', 'Hazard', 'Medical', 'Assistance'];
    
                    // Sort the datasets based on the desired order for the legend
                    datasets.sort((a, b) => legendOrder.indexOf(a.label) - legendOrder.indexOf(b.label));
    
                    setChartData({
                        labels,
                        datasets,
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
                                    stacked: true,  // Enable stacking on the x-axis
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Hour of the Day',
                                    },
                                },
                                y: {
                                    stacked: true,  // Enable stacking on the y-axis
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
                                            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
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
