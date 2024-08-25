import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './TypeSummary.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const TypeSummary = () => {
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
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/analytics/summary`);
        const data = response.data;

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
      } catch (error) {
        console.error('Error fetching the summary', error);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="requests-type-chart-container">
      <div className='requests-type-title-box'>
        <a className="requests-type-title">Request Summary by Type</a>
      </div>
      <Bar 
        data={chartData} 
        options={{ 
          responsive: true, 
          maintainAspectRatio: false 
        }} 
        className="requests-type-canvas"
      />
      
    </div>
  );
};

export default TypeSummary;
