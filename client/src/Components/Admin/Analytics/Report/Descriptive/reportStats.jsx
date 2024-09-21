import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './reportStats.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportStats = () => {
    const [stats, setStats] = useState({ totalReports: 0, reportsThisMonth: 0, reportsToday: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('');
    const [availableYears, setAvailableYears] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAvailableYears = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-stats`);
                const years = response.data.availableYears || [];
                if (years.length > 0) {
                    setAvailableYears(years);
                    setSelectedYear(years[0]);
                }
            } catch (error) {
                setError('Error fetching available years');
                console.error('Error fetching available years:', error);
            }
        };

        fetchAvailableYears();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-stats`, {
                    params: { year: selectedYear }
                });
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching report stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (selectedYear) {
            fetchStats();
        }
    }, [selectedYear]);

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const generateReportDescription = () => {
        if (loading || !stats) {
            return "Loading report analysis...";
        }

        let reportDescription = "Analyzing the current trends, ";

        if (stats.reportsToday > 0) {
            reportDescription += `there have been ${stats.reportsToday} reports today. `;
        } else {
            reportDescription += "no reports have been filed today. ";
        }

        if (stats.reportsThisMonth > 0) {
            reportDescription += `This month has seen a total of ${stats.reportsThisMonth} reports so far. `;
        } else {
            reportDescription += "There have been no reports this month. ";
        }

        if (stats.totalReports > 0) {
            reportDescription += `Overall, the total number of reports for the year is ${stats.totalReports}. `;
        } else {
            reportDescription += "No reports have been filed for the year. ";
        }

        if (stats.reportsThisMonth > stats.totalReports / 12) {
            reportDescription += "The current month shows an above-average number of reports compared to previous months. ";
        } else {
            reportDescription += "The report activity this month is below the expected average. ";
        }

        return reportDescription;
    };

    return (
        <div className='desc-reportstats-container'>
            <div className='desc-reportstats-title'>
                <label className='desc-reportstats-title-text'>
                    Descriptive Summary ({selectedYear})
                </label>
                {/* Year Dropdown */}
                {availableYears.length > 0 && (
                    <div className='desc-reportstats-year-dropdown'>
                        <label>Filter by Year:</label>
                        <select value={selectedYear} onChange={handleYearChange}>
                            {availableYears.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className='desc-reportstats-content-box'>
                {/* Positive Trends */}
                <div className='desc-reportstats-positives-box'>
                    <h2>Positive Report Trends</h2>
                    <p>{generateReportDescription()}</p>
                </div>

                {/* Negative Trends */}
                <div className='desc-reportstats-negatives-box'>
                    <h2>Negative Report Trends</h2>
                    <p>{loading ? 'Loading...' : 'There are no significant negative trends in the data currently.'}</p>
                </div>
            </div>

            

            {error && <p className="desc-reportstats-error-message">{error}</p>}
        </div>
    );
};

export default ReportStats;
