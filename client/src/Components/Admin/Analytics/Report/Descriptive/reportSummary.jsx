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

        // Generate percentage breakdown for each report type
        data.forEach(report => {
            const percentage = ((report.totalReports / totalReports) * 100).toFixed(2);
            reportDescription += `${percentage}% of the reports were related to ${report._id.toLowerCase()} incidents. `;
        });

        // Determine the most common type of report and apply its narrative
        const mostCommonType = data.reduce((prev, current) => (prev.totalReports > current.totalReports) ? prev : current, {});
        if (mostCommonType) {
            const narratives = {
                "Accident": [
                    "The majority of reports involved vehicular accidents, indicating a strong need for enhanced road safety awareness and preventive measures.",
                    "Vehicular accidents emerged as the most common type of incident, suggesting that road safety initiatives might be beneficial to reduce these occurrences."
                ],
                "Medical": [
                    "A significant number of medical incidents were reported, highlighting the need for accessible healthcare services and community health education.",
                    "Medical-related reports were prevalent, indicating an ongoing requirement for efficient healthcare response systems and increased medical aid availability."
                ],
                "Fire": [
                    "Fire-related incidents were frequently reported, emphasizing the importance of fire safety protocols and better community preparedness.",
                    "Reports involving fire hazards were common, pointing to the necessity for widespread fire prevention measures and safety awareness campaigns."
                ],
                "Police": [
                    "Police-related incidents were notably low, which may indicate either effective crime deterrence or a need for improved public trust and engagement with law enforcement.",
                    "The low frequency of police-related reports suggests either a relatively peaceful period or underreporting of such incidents, warranting further community outreach."
                ],
                "Assistance": [
                    "Reports related to assistance underscore the strong sense of community support, highlighting the importance of collaborative efforts during emergencies.",
                    "Community assistance requests were notable, showcasing the reliance on communal support systems to address local needs effectively."
                ],
                "Hazard": [
                    "Hazard reports were common, drawing attention to the importance of identifying and mitigating potential environmental risks.",
                    "Environmental hazards were frequently reported, emphasizing the need for ongoing risk assessments and mitigation strategies in the community."
                ]
            };

            const selectedNarrative = narratives[mostCommonType._id]?.[Math.floor(Math.random() * narratives[mostCommonType._id].length)] || "No significant trend emerged for any particular report type.";
            reportDescription += `${selectedNarrative} `;
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
