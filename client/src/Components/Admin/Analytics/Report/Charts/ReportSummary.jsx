import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';  // Importing Line chart instead of Pie
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './ReportSummary.css';

// Register required Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportSummary = ({ dateFrom, dateTo }) => {
    const [chartData, setChartData] = useState({
        labels: [], // Dates or categories for the x-axis
        datasets: [
            {
                label: 'Total Reports',
                data: [],  // Data to be plotted on the y-axis
                borderColor: '#007bff',  // Line color
                backgroundColor: 'rgba(0, 123, 255, 0.1)', // Line fill color
                borderWidth: 2,
                tension: 0.4,  // Smooth line curve
                pointRadius: 5,  // Radius of points
                pointHoverRadius: 7, // Hover radius
            }
        ],
    });
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false);
    const [fireTypeDetails, setFireTypeDetails] = useState('');
    const [collisionTypeDetails, setCollisionTypeDetails] = useState('');
    const [medicalTypeDetails, setMedicalTypeDetails] = useState('');
    const [hazardTypeDetails, setHazardTypeDetails] = useState('');
    const [assistanceTypeDetails, setAssistanceTypeDetails] = useState('');

    useEffect(() => {
        const fetchReportSummary = async () => {
            setLoading(true);
            setNoData(false);
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-summary`, {
                    params: { dateFrom, dateTo }
                });
                const data = response.data.reportSummary;

                if (data && data.length > 0) {
                    const legendOrder = ['Fire', 'Police', 'Accident', 'Hazard', 'Medical', 'Assistance'];
                    const colors = {
                        'Fire': '#E74C3C',
                        'Accident': '#3498DB',
                        'Police': '#F1C40F',
                        'Medical': '#9B59B6',
                        'Assistance': '#1ABC9C',
                        'Hazard': '#E67E22',
                    };

                    const mainTypes = [];
                    const mainData = [];
                    const mainColors = [];
                    let fireDetails = '';
                    let collisionDetails = '';
                    let medicalDetails = '';
                    let hazardDetails = '';
                    let assistanceDetails = '';

                    data.forEach(item => {
                        if (item._id === 'Fire' && item.fireTypeSummary) {
                            fireDetails = Object.entries(item.fireTypeSummary)
                                .map(([fireType, count]) => `${fireType}: ${count}`)
                                .join(', ');
                            mainTypes.push('Fire');
                            mainData.push(item.totalReports);
                            mainColors.push(colors['Fire']);
                        } else if (item._id === 'Accident' && item.collisionTypeSummary) {
                            collisionDetails = Object.entries(item.collisionTypeSummary)
                                .map(([collisionType, count]) => `${collisionType}: ${count}`)
                                .join(', ');
                            mainTypes.push('Accident');
                            mainData.push(item.totalReports);
                            mainColors.push(colors['Accident']);
                        } else if (item._id === 'Medical' && item.medicalTypeSummary) {
                            medicalDetails = Object.entries(item.medicalTypeSummary)
                                .map(([medicalType, count]) => `${medicalType}: ${count}`)
                                .join(', ');
                            mainTypes.push('Medical');
                            mainData.push(item.totalReports);
                            mainColors.push(colors['Medical']);
                        } else if (item._id === 'Hazard' && item.hazardTypeSummary) {
                            hazardDetails = Object.entries(item.hazardTypeSummary)
                                .map(([hazardType, count]) => `${hazardType}: ${count}`)
                                .join(', ');
                            mainTypes.push('Hazard');
                            mainData.push(item.totalReports);
                            mainColors.push(colors['Hazard']);
                        } else if (item._id === 'Assistance' && item.assistanceTypeSummary) {
                            assistanceDetails = Object.entries(item.assistanceTypeSummary)
                                .map(([assistanceType, count]) => `${assistanceType}: ${count}`)
                                .join(', ');
                            mainTypes.push('Assistance');
                            mainData.push(item.totalReports);
                            mainColors.push(colors['Assistance']);
                        } else {
                            mainTypes.push(item._id);
                            mainData.push(item.totalReports);
                            mainColors.push(colors[item._id]);
                        }
                    });

                    setChartData({
                        labels: mainTypes,  // X-axis labels (types of reports)
                        datasets: [
                            {
                                label: 'Total Reports',
                                data: mainData,  // Y-axis data (total reports)
                                borderColor: mainColors,  // Line color per type
                                backgroundColor: 'rgba(0, 123, 255, 0.1)',  // Transparency for the area under the line
                                borderWidth: 2,
                                tension: 0.4,  // Smooth line
                                pointRadius: 5,  // Points on the line
                                pointHoverRadius: 7,  // Points on hover
                            }
                        ],
                    });

                    setFireTypeDetails(fireDetails);
                    setCollisionTypeDetails(collisionDetails);
                    setMedicalTypeDetails(medicalDetails);
                    setHazardTypeDetails(hazardDetails);
                    setAssistanceTypeDetails(assistanceDetails);
                } else {
                    setNoData(true);
                }
            } catch (error) {
                console.error('Error fetching the report summary', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchReportSummary();
        }
    }, [dateFrom, dateTo]);

    return (
        <div className="report-summary-container">
            <div className='report-summary-title-box'>
                <a className='report-summary-title'>Report Summary by Type</a>
            </div>

            {loading ? (
                <p>Loading chart...</p>
            ) : noData ? (
                <p>No data available for the selected date range.</p>
            ) : (
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        let label = context.label || '';
                                        let value = context.raw || 0;
                                        if (label === 'Fire' && fireTypeDetails) {
                                            return `${label}: ${value} (${fireTypeDetails})`;
                                        }
                                        if (label === 'Accident' && collisionTypeDetails) {
                                            return `${label}: ${value} (${collisionTypeDetails})`;
                                        }
                                        if (label === 'Medical' && medicalTypeDetails) {
                                            return `${label}: ${value} (${medicalTypeDetails})`;
                                        }
                                        if (label === 'Hazard' && hazardTypeDetails) {
                                            return `${label}: ${value} (${hazardTypeDetails})`;
                                        }
                                        if (label === 'Assistance' && assistanceTypeDetails) {
                                            return `${label}: ${value} (${assistanceTypeDetails})`;
                                        }
                                        return `${label}: ${value}`;
                                    }
                                }
                            },
                            legend: {
                                position: 'top',
                            },
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Report Type',  // X-axis label
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Number of Reports',  // Y-axis label
                                },
                                beginAtZero: true,  // Ensure the Y-axis starts at zero
                            },
                        },
                    }}
                    className="report-summary-line-chart-canvas"
                />
            )}
        </div>
    );
};

export default ReportSummary;