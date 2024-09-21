import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import './PieSummary.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const PieSummary = ({ dateFrom, dateTo }) => {  // Accept dateFrom and dateTo as props
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Total Requests',
                data: [],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 205, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    });
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false);  // Track if no data is available

    useEffect(() => {
        const fetchPieSummary = async () => {
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

                    setChartData({
                        labels: barangays,
                        datasets: [
                            {
                                label: 'Total Requests',
                                data: totalRequests,
                                backgroundColor: [
                                    'rgba(75, 192, 192, 0.6)',
                                    'rgba(153, 102, 255, 0.6)',
                                    'rgba(255, 159, 64, 0.6)',
                                    'rgba(54, 162, 235, 0.6)',
                                    'rgba(255, 99, 132, 0.6)',
                                    'rgba(153, 102, 255, 0.6)',
                                    'rgba(255, 205, 86, 0.6)',
                                    'rgba(75, 192, 192, 0.6)',
                                    'rgba(153, 102, 255, 0.6)',
                                    'rgba(255, 159, 64, 0.6)',
                                ],
                                borderColor: [
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(153, 102, 255, 1)',
                                    'rgba(255, 159, 64, 1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 99, 132, 1)',
                                    'rgba(153, 102, 255, 1)',
                                    'rgba(255, 205, 86, 1)',
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(153, 102, 255, 1)',
                                    'rgba(255, 159, 64, 1)',
                                ],
                                borderWidth: 1,
                            },
                        ],
                    });
                } else {
                    setNoData(true);  // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching the pie summary', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchPieSummary();  // Fetch data only if date range is provided
        }
    }, [dateFrom, dateTo]);  // Re-fetch when date range changes

    return (
        <div className="requests-pie-summary-container">
            <div className='requests-pie-title-box'>
                <a className="requests-pie-title">Number of Request by Barangay</a>
            </div>
            
            {loading ? (
                <p>Loading data...</p>
            ) : noData ? (
                <p>No data available for the selected date range.</p>
            ) : (
                <Pie
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        aspectRatio: 1,
                    }}
                    className="requests-pie-chart-canvas"
                />
            )}
        </div>
    );
};

export default PieSummary;
