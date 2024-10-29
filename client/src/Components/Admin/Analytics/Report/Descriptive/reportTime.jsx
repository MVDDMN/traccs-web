import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './reportTime.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportTime = ({ dateFrom, dateTo }) => {
    const [reportData, setReportData] = useState([]);
    const [reportSummary, setReportSummary] = useState(""); // Unified state for trends
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false); // Track if no data is available
    const [error, setError] = useState(null); // Track if there is an error in the date range

    useEffect(() => {
        const fetchReportFrequency = async () => {
            setLoading(true);
            setNoData(false); // Reset no data state
            setError(null);  // Reset error state

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
                    params: { dateFrom, dateTo }
                });

                const { data } = response; // Assuming data is the main response
                if (data && data.data && data.data.length > 0 && data.data.some(count => count > 0)) {
                    setReportData(data);
                    generateReportDescription(data); // Generate unified report description
                } else {
                    setNoData(true); // No data available for the selected date range
                }
            } catch (error) {
                console.error('Error fetching report frequency by hour:', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateFrom && dateTo) {
            fetchReportFrequency();  // Fetch data when both dateFrom and dateTo are set
        }
    }, [dateFrom, dateTo]);

    // Helper function to convert 24-hour time to 12-hour format
    const formatHour12 = (hour) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12; // Convert 0 to 12 for AM
        return `${hour12}:00 ${period}`;
    };

    // Helper function to format the date
    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    // Function to generate unified report description based on trends and the new narrative
    const generateReportDescription = (data) => {
        let reportDescription = "";
    
        const totalReports = data.data.reduce((sum, count) => sum + count, 0);
        const formattedDate = formatDate(dateFrom);
    
        // Initial statement with date and total number of reports
        reportDescription += `On ${formattedDate}, there were a total of ${totalReports} incidents reported. `;
    
        if (totalReports > 100) {
            reportDescription += `This indicates a high volume of activity within a single day, suggesting increased awareness and response capacity. `;
        } else if (totalReports > 0) {
            reportDescription += `The report volume appears moderate, offering insights into the day's community activities and needs. `;
        } else {
            reportDescription += `There were no significant reports recorded on this date, indicating a period of low activity or incident-free hours. `;
        }
    
        // Check if all non-zero counts are equal
        const nonZeroCounts = data.data.filter(count => count > 0);
        const allEqual = nonZeroCounts.every(count => count === nonZeroCounts[0]);
    
        if (allEqual && nonZeroCounts.length > 1) {
            reportDescription += "Reports were evenly distributed across active hours, with each hour showing the same number of incidents. This pattern suggests a steady, predictable reporting rate throughout the day, possibly due to consistent monitoring or a lack of specific peak periods. ";
        } else {
            // Find the most active and least active hour if distribution is not even
            const mostActiveHour = data.data.reduce((prev, count, index) => (count > prev.count ? { count, hour: index } : prev), { count: 0 });
            const leastActiveHour = data.data.reduce((prev, count, index) => (count < prev.count && count > 0 ? { count, hour: index } : prev), { count: Infinity });
    
            // Narrative for the most active hour
            if (mostActiveHour.count > 0) {
                const prevalentHour = formatHour12(mostActiveHour.hour);
                const breakdown = data.breakdownByHour[mostActiveHour.hour];
                const highestType = Object.keys(breakdown).reduce((a, b) => (breakdown[a] > breakdown[b] ? a : b));
                reportDescription += `The peak reporting time was at ${prevalentHour}, with '${highestType}' incidents being the most frequently reported, totaling ${breakdown[highestType]} occurrences. `;
            }
    
            // Narrative for the least active hour
            if (leastActiveHour.count > 0 && leastActiveHour.count !== Infinity) {
                const lowActivityHour = formatHour12(leastActiveHour.hour);
                reportDescription += `The time with the least activity was at ${lowActivityHour}, with only ${leastActiveHour.count} reports, suggesting this period might be optimal for maintenance or administrative activities. `;
            }
        }
    
        // Check for distribution across different times of the day
        const morningReports = data.data.slice(6, 12).reduce((sum, count) => sum + count, 0);
        const afternoonReports = data.data.slice(12, 18).reduce((sum, count) => sum + count, 0);
        const eveningReports = data.data.slice(18, 24).reduce((sum, count) => sum + count, 0);
    
        if (morningReports > afternoonReports && morningReports > eveningReports) {
            reportDescription += "The morning hours experienced the highest activity, suggesting a trend of increased incidents during early hours. ";
        } else if (afternoonReports > morningReports && afternoonReports > eveningReports) {
            reportDescription += "Most incidents were reported during the afternoon, pointing to heightened activity around midday. ";
        } else if (eveningReports > morningReports && eveningReports > afternoonReports) {
            reportDescription += "The evening hours showed the highest level of activity, indicating a trend of increased incidents later in the day. ";
        } else {
            reportDescription += "Incident reports were relatively evenly distributed throughout the day, with no single period showing significantly higher activity. ";
        }
    
        // Concluding suggestions
        const suggestiveEndings = [
            "To enhance response efforts, consider allocating resources during identified peak hours.",
            "It may be advantageous to focus preventive measures during high-activity periods to reduce incident frequency.",
            "To improve community safety, ongoing monitoring and prompt interventions during peak hours are recommended.",
            "Encouraging community awareness and education during peak times can help reduce incident occurrences and improve safety."
        ];
    
        const randomEnding = suggestiveEndings[Math.floor(Math.random() * suggestiveEndings.length)];
        reportDescription += randomEnding;
    
        setReportSummary(reportDescription || "There were no significant trends in the data.");
    };        

    return (
        <div className='desc-reporttime-container'>
            <div className='desc-reporttime-title'>
                <label className='desc-reporttime-title-text'>
                    Report Descriptive Summary
                </label>
            </div>

            <div className='desc-reporttime-content-box'>
                {loading ? (
                    <p>Loading trends...</p>
                ) : error ? (
                    <p className="report-time-error-message">{error}</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <div className='desc-reporttime-trends-box'>
                        <p>{reportSummary}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportTime;
