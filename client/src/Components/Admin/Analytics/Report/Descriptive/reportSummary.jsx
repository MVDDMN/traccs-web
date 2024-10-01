import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './reportSummary.css';

const apiBaseUrl = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const ReportSummary = ({ dateFrom, dateTo }) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportSummary, setReportSummary] = useState(""); // Single state for unified trends
    const [noData, setNoData] = useState(false); // Track if no data is available

    useEffect(() => {
        const fetchReportSummary = async () => {
            setLoading(true);
            setNoData(false); // Reset noData state
            try {
                const response = await axios.get(`${apiBaseUrl}/api/analytics/report-summary`, {
                    params: { dateFrom, dateTo }
                });
                const data = response.data.reportSummary;

                if (data && data.length > 0) {
                    setChartData(data);
                    generateReportDescription(data); // Call the auto-generative report logic after data is fetched
                } else {
                    setNoData(true); // No data available for the selected date range
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const generateReportDescription = (data) => {
        let reportDescription = "";

        const totalReports = data.reduce((sum, report) => sum + report.totalReports, 0);

        reportDescription += `Between ${formatDate(dateFrom)} and ${formatDate(dateTo)}, a total of ${totalReports} reports were submitted. `;

        // Mapping report types to descriptions
        const reportTypes = {
            "Fire": "fire-related",
            "Police": "police-related",
            "Accident": "vehicular accident-related",
            "Medical": "medical-related",
            "Hazard": "hazard-related",
            "Assistance": "assistance-related"
        };

        // Filter out report types with zero counts
        const nonZeroReportTypes = Object.keys(reportTypes).filter(type => {
            const count = data.find(report => report._id === type)?.totalReports || 0;
            return count > 0;
        });

        // Generate detailed breakdown for non-zero report types
        if (nonZeroReportTypes.length > 0) {
            reportDescription += `Within this period, there were ${totalReports} reports: `;
            reportDescription += nonZeroReportTypes.map(type => {
                const count = data.find(report => report._id === type)?.totalReports || 0;
                return `${count} ${reportTypes[type]} reports`;
            }).join(", ") + ". ";
        }

        // Determine the most common type of report and apply its narrative
        const mostCommonType = data.reduce((prev, current) => (prev.totalReports > current.totalReports) ? prev : current, {});
        if (mostCommonType) {
            switch (mostCommonType._id) {
                case "Accident":
                    reportDescription += "The most frequently submitted reports pertain to vehicular accidents, highlighting the urgent need for increased awareness and safety measures. ";
                    break;
                case "Medical":
                    reportDescription += "A substantial number of medical reports document health-related incidents, underscoring the importance of timely medical assistance and ongoing health education. ";
                    break;
                case "Fire":
                    reportDescription += "Reports related to fire incidents emphasize the critical need for fire safety protocols and community preparedness. ";
                    break;
                case "Police":
                    reportDescription += "The low frequency of police reports indicates a need for greater community engagement and awareness regarding law enforcement issues. ";
                    break;
                case "Assistance":
                    reportDescription += "Reports concerning community assistance showcase the support available to residents, highlighting the significance of collaboration in addressing community needs. ";
                    break;
                case "Hazard":
                    reportDescription += "Hazard reports identify potential environmental risks, emphasizing the importance of hazard recognition and mitigation efforts. ";
                    break;
                default:
                    reportDescription += "There is no significant trend for any specific report type. ";
                    break;
            }
        }

        // Suggestive ending narratives
        const suggestiveEndings = [
            "Moving forward, addressing the identified trends and ensuring timely responses can enhance community safety and resilience during future incidents.",
            "It is crucial to consider implementing proactive measures based on the trends observed in this report to improve community response efforts.",
            "Given the data, barangays should prioritize strategies that mitigate the risks identified in the reports to foster a safer environment.",
            "To further enhance community safety, increased collaboration and communication among responders is recommended, particularly concerning the identified report types."
        ];

        // Randomly select a suggestive ending
        const randomEnding = suggestiveEndings[Math.floor(Math.random() * suggestiveEndings.length)];
        reportDescription += randomEnding;

        setReportSummary(reportDescription || "There are no significant trends to report at the moment.");
    };

    return (
        <div className='desc-reportsummary-container'>
            <div className='desc-reportsummary-title'>
                <label className='desc-reportsummary-title-text'>
                    Report Descriptive Summary 
                </label>
            </div>

            <div className='desc-reportsummary-content-box'>
                {loading ? (
                    <p>Loading report trends...</p>
                ) : noData ? (
                    <p>No data available for the selected date range.</p>
                ) : (
                    <div className='desc-reportsummary-trends-box'>
                        <p>{reportSummary}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportSummary;
