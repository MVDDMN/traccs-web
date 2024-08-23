import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './SummaryRequest.css';

// Determine the base URL based on the environment
const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const SummaryRequests = () => {
    const [requestSummary, setRequestSummary] = useState([]);
    const [barangaySummary, setBarangaySummary] = useState([]);

    useEffect(() => {
        const fetchRequestSummary = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/requests-summary`);
                setRequestSummary(response.data);
            } catch (error) {
                console.error('Error fetching request summary:', error);
            }
        };

        const fetchBarangaySummary = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/barangay-summary`);
                setBarangaySummary(response.data);
            } catch (error) {
                console.error('Error fetching barangay summary:', error);
            }
        };

        fetchRequestSummary();
        fetchBarangaySummary();
    }, []);

    const renderRequestSummary = () => {
        return requestSummary
            .map(request => `${request._id} has ${request.totalRequests} request${request.totalRequests > 1 ? 's' : ''}`)
            .join(', ');
    };

    const renderBarangaySummary = () => {
        return barangaySummary
            .map(barangay => `${barangay._id} has ${barangay.totalRequests} request${barangay.totalRequests > 1 ? 's' : ''}`)
            .join(', ');
    };

    const renderBarangayQuantitySummary = () => {
        return barangaySummary
            .map(barangay => `${barangay._id} has ${barangay.totalQuantity} item${barangay.totalQuantity > 1 ? 's' : ''}`)
            .join(', ');
    };

    return (
        <div className='summaryrequest-descriptive-box'>
            <a className='summaryrequest-title'>Requests Summary</a>
            <a className='summaryrequest-paragraph'>
                ⓘ As of now, requests have been categorized as follows: {renderRequestSummary()}.
            </a>
            <a className='summaryrequest-paragraph'>
                ⓘ Request activity by barangay is summarized as follows: {renderBarangaySummary()}.
            </a>
            <a className='summaryrequest-paragraph'>
                ⓘ The total quantity of items requested per barangay is as follows: {renderBarangayQuantitySummary()}.
            </a>
            <div className='summaryrequest-button-box'>
                <Link to="/admin/analytics/analyticsrequests"><button className='summaryrequest-button'>Requests Charts</button></Link>
            </div>
        </div>
    );
};

export default SummaryRequests;
