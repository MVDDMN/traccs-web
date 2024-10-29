import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './TypeSummary.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_PROD_API_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;

const TypeSummary = ({ dateFrom, dateTo }) => {  // Accept dateFrom and dateTo as props
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
  const [loading, setLoading] = useState(true);   // Loading state
  const [noData, setNoData] = useState(false);    // No data state

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setNoData(false);  // Reset noData state before fetching
      try {
        const response = await axios.get(`${apiBaseUrl}/api/analytics/summary`, {
          params: { dateFrom, dateTo },  // Send date range as query parameters
        });
        const data = response.data;

        if (data && data.length > 0) {
          const types = data.map(item => item._id);
          const totalRequests = data.map(item => item.totalRequests);
          const totalQuantity = data.map(item => item.totalQuantity);

          setChartData({
            labels: types,
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
          setNoData(true);  // Set noData to true if no results
        }
      } catch (error) {
        console.error('Error fetching the summary', error);
      } finally {
        setLoading(false);  // Set loading to false once the fetch completes
      }
    };

    if (dateFrom && dateTo) {
      fetchSummary();  // Fetch data only when date range is selected
    }
  }, [dateFrom, dateTo]);  // Re-fetch data when dateFrom or dateTo changes

  return (
    <div className="requests-type-chart-container">
      <div className='requests-type-title-box'>
        <a className="requests-type-title">Request Summary by Type</a>
      </div>

      {loading ? (
        <p>Loading...</p>  // Display loading message
      ) : noData ? (
        <p>No data available for the selected date range.</p>  // Display no data message
      ) : (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                ticks: {
                  stepSize: 1,
                  callback: (value) => Number.isInteger(value) ? value : null  // Ensure only integers display
                }
              }
            }
          }}
          className="requests-type-canvas"
        />

      )}
    </div>
  );
};

export default TypeSummary;
