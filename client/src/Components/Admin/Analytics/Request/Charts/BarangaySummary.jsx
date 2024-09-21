import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './BarangaySummary.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const BarangaySummary = ({ dateFrom, dateTo }) => { // Accept dateFrom and dateTo as props
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

  useEffect(() => {
    const fetchBarangaySummary = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/analytics/barangay-summary`, {
          params: { dateFrom, dateTo } // Pass the date range as query parameters
        });
        const data = response.data;

        if (data && data.length > 0) {
          const barangays = data.map(item => item._id);
          const totalRequests = data.map(item => item.totalRequests);
          const totalQuantity = data.map(item => item.totalQuantity);

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

    if (dateFrom && dateTo) { // Fetch data only when both dates are set
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
            maintainAspectRatio: false 
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
