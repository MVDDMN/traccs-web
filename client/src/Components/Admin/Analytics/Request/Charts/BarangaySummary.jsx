import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './BarangaySummary.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_PROD_API_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;

const BarangaySummary = ({ dateFrom, dateTo }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Total Requests',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Items Requested',
        data: [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  });

  const [barangayData, setBarangayData] = useState([]);

  useEffect(() => {
    const fetchBarangaySummary = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/analytics/barangay-summary`, {
          params: { dateFrom, dateTo }
        });
        let data = response.data;

        if (data && data.length > 0) {
          // Sort data in ascending order based on totalRequests
          data = data.sort((a, b) => a.totalRequests - b.totalRequests);

          // Extract labels and data for sorted barangays
          const barangays = data.map(item => item._id);
          const totalRequests = data.map(item => item.totalRequests);
          const totalQuantity = data.map(item => item.totalQuantity);

          setBarangayData(data);

          setChartData({
            labels: barangays,
            datasets: [
              {
                label: 'Total Requests',
                data: totalRequests,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
              {
                label: 'Items Requested',
                data: totalQuantity,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
              },
            ],
          });
        } else {
          setChartData({
            labels: [],
            datasets: [],
          });
        }
      } catch (error) {
        console.error('Error fetching the barangay summary', error);
      }
    };

    if (dateFrom && dateTo) {
      fetchBarangaySummary();
    }
  }, [dateFrom, dateTo]);

  return (
    <div className="barangay-summary-chart-container">
      <div className='barangay-summary-title-box'>
        <a className="barangay-summary-title">Request Summary by Barangay</a>
      </div>
      {chartData.labels.length > 0 ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: Math.ceil(Math.max(...chartData.datasets[1].data) / 10),
                  callback: (value) => Number.isInteger(value) ? value : null
                }
              },
              x: {
                grid: {
                  display: false,
                },
                barPercentage: 0.6,
                categoryPercentage: 0.8,
              }
            },
            plugins: {
              tooltip: {
                padding: 10,
                callbacks: {
                  afterLabel: (context) => {
                    const barangayName = context.label;
                    const datasetLabel = context.dataset.label;

                    // Find the barangay data for the hovered bar
                    const barangay = barangayData.find(item => item._id === barangayName);

                    if (barangay && barangay.requestTypes) {
                      if (datasetLabel === 'Total Requests') {
                        // Display breakdown of Total Requests
                        const requestBreakdown = barangay.requestTypes.map(
                          typeDetail => `${typeDetail.type}: ${typeDetail.requestCount}`
                        );
                        return `\nTotal Requests Breakdown:\n` + requestBreakdown.join('\n');
                      } else if (datasetLabel === 'Items Requested') {
                        // Display breakdown of Items Requested
                        const quantityBreakdown = barangay.requestTypes.map(
                          typeDetail => `${typeDetail.type}: ${typeDetail.quantityCount}`
                        );
                        return `\nItems Requested Breakdown:\n` + quantityBreakdown.join('\n');
                      }
                    }
                    return '';
                  }
                }
              }
            },
            barThickness: 30,
            maxBarThickness: 40,
          }}
          className='barangay-summary-canvas'
        />
      ) : (
        <p>No data available for the selected date range.</p>
      )}
    </div>
  );
};

export default BarangaySummary;
