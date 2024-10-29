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

        // Define the total number of reports and date range
        const totalReports = data.reduce((sum, report) => sum + report.totalReports, 0);
        reportDescription += `From ${formatDate(dateFrom)} to ${formatDate(dateTo)}, a total of ${totalReports} reports were recorded, highlighting various incidents and community needs. `;

        // Provide a percentage breakdown for each main report type and details on subcategories
        data.forEach(report => {
            const typeLabel = report._id === 'Accident' ? 'vehicular incidents' : report._id.toLowerCase();
            const percentage = ((report.totalReports / totalReports) * 100).toFixed(2);
            reportDescription += `Approximately ${percentage}% of the reports were related to ${typeLabel}. `;

            // Detailed subcategory breakdowns for each report type with interpretative insight
            if (report._id === 'Fire' && report.fireTypeSummary) {
                const fireDetails = Object.entries(report.fireTypeSummary)
                    .map(([type, count]) => `${type.toLowerCase()}: ${count}`)
                    .join(', ');
                reportDescription += `Fire-related incidents included categories such as ${fireDetails}, indicating a need for tailored fire safety measures across various settings. `;
            } else if (report._id === 'Accident' && report.collisionTypeSummary) {
                const collisionDetails = Object.entries(report.collisionTypeSummary)
                    .map(([type, count]) => `${type.toLowerCase()}: ${count}`)
                    .join(', ');
                reportDescription += `Vehicular incidents occurred under various circumstances, with types such as ${collisionDetails}. These figures underscore the importance of comprehensive road safety measures to address different types of vehicular incidents. `;
            } else if (report._id === 'Medical' && report.medicalTypeSummary) {
                const medicalDetails = Object.entries(report.medicalTypeSummary)
                    .map(([type, count]) => `${type.toLowerCase()}: ${count}`)
                    .join(', ');
                reportDescription += `Medical emergencies included cases such as ${medicalDetails}, highlighting the need for preparedness in handling diverse health crises. `;
            } else if (report._id === 'Hazard' && report.hazardTypeSummary) {
                const hazardDetails = Object.entries(report.hazardTypeSummary)
                    .map(([type, count]) => `${type.toLowerCase()}: ${count}`)
                    .join(', ');
                reportDescription += `Environmental hazards reported included ${hazardDetails}. This data calls for ongoing community vigilance and proactive hazard mitigation. `;
            } else if (report._id === 'Assistance' && report.assistanceTypeSummary) {
                const assistanceDetails = Object.entries(report.assistanceTypeSummary)
                    .map(([type, count]) => `${type.toLowerCase()}: ${count}`)
                    .join(', ');
                reportDescription += `Assistance requests reflected diverse needs, such as ${assistanceDetails}. These findings suggest a reliance on community support networks during emergencies. `;
            }
        });

        // Identify the most common type and apply a specific narrative
        const mostCommonType = data.reduce((prev, current) => (prev.totalReports > current.totalReports) ? prev : current, {});
        if (mostCommonType) {
            const narratives = {
                "Accident": [
                    "Vehicular incidents were the most frequently reported, underscoring the need for increased road safety initiatives to prevent these occurrences.",
                    "Vehicular incidents were notably common, pointing to the need for comprehensive road safety measures within the community."
                ],
                "Medical": [
                    "A substantial portion of reports were related to medical incidents, highlighting the importance of accessible healthcare services and timely response systems.",
                    "Medical-related reports were prevalent, suggesting that enhanced healthcare support and awareness could improve emergency response."
                ],
                "Fire": [
                    "Fire incidents were prominent, emphasizing the critical importance of fire prevention programs and community preparedness.",
                    "The high number of fire-related reports indicates a need for ongoing fire safety education and preventive measures."
                ],
                "Police": [
                    "Police-related reports were relatively low, which may reflect effective crime deterrence or possibly underreporting. Improved community-police engagement may help address any reporting gaps.",
                    "The lower frequency of police incidents could indicate a peaceful period, but may also suggest underreporting. Strengthening community trust in law enforcement might ensure comprehensive reporting."
                ],
                "Assistance": [
                    "Requests for assistance were substantial, reflecting the community's reliance on support systems during emergencies.",
                    "Community assistance needs were significant, underscoring the value of collaborative and responsive support mechanisms in times of crisis."
                ],
                "Hazard": [
                    "Hazard reports were prevalent, highlighting the importance of identifying and addressing potential environmental risks.",
                    "The frequency of hazard reports calls for proactive risk assessments and environmental safety strategies."
                ]
            };

            const selectedNarrative = narratives[mostCommonType._id]?.[Math.floor(Math.random() * narratives[mostCommonType._id].length)] || "No dominant trend emerged among the report types.";
            reportDescription += `${selectedNarrative} `;
        }

        // Add a forward-looking statement to suggest next steps based on the trends
        const suggestiveEndings = [
            "Moving forward, addressing these trends and enhancing response efforts can strengthen community safety and resilience.",
            "To build a safer environment, proactive measures and community engagement should be prioritized based on these observations.",
            "This report highlights areas where safety measures and community response can be improved for future incident preparedness.",
            "Enhanced collaboration among responders, community leaders, and residents is recommended to address the identified needs and improve safety."
        ];

        // Randomly select a suggestive ending
        const randomEnding = suggestiveEndings[Math.floor(Math.random() * suggestiveEndings.length)];
        reportDescription += randomEnding;

        setReportSummary(reportDescription || "There are no significant trends to report at this time.");
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
