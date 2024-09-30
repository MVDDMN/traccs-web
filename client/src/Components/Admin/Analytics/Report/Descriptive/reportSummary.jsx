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

    const generateReportDescription = (data) => {
        let reportDescription = "";

        const totalReports = data.reduce((sum, report) => sum + report.totalReports, 0);

        if (totalReports > 100) {
            reportDescription += `There have been over ${totalReports} reports during the selected period. `;
        } else {
            reportDescription += `A total of ${totalReports} reports were submitted in the selected period. `;
        }

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
        let detailedBreakdown = `Within the selected dates, there are ${totalReports} reports: `;
        detailedBreakdown += nonZeroReportTypes.map(type => {
            const count = data.find(report => report._id === type)?.totalReports || 0;
            return `${count} ${reportTypes[type]} reports`;
        }).join(", ") + ".";

        reportDescription += detailedBreakdown + " ";

        // Determine the most common type of report and apply its narrative
        const mostCommonType = data.reduce((prev, current) => (prev.totalReports > current.totalReports) ? prev : current, {});
        if (mostCommonType) {
            switch (mostCommonType._id) {
                case "Accident":
                    reportDescription += "The most frequently submitted reports pertain to vehicular accidents. These reports highlight the urgent need for increased awareness and safety measures during the specified reporting period. ";
                    break;
                case "Medical":
                    reportDescription += "A substantial number of medical reports document health-related incidents. This underscores the importance of timely medical assistance and the necessity for ongoing health education throughout the reporting period. ";
                    break;
                case "Fire":
                    reportDescription += "Reports related to fire incidents emphasize the critical need for fire safety protocols and community preparedness in response to these emergencies during the reporting period. ";
                    break;
                case "Police":
                    reportDescription += "The low frequency of police reports indicates a need for greater community engagement and awareness regarding law enforcement issues during the specified timeframe. ";
                    break;
                case "Assistance":
                    reportDescription += "Reports concerning community assistance showcase the support available to residents. They highlight the significance of collaboration in addressing community needs during the reporting period. ";
                    break;
                case "Hazard":
                    reportDescription += "Hazard reports identify potential environmental risks, emphasizing the importance of hazard recognition and mitigation efforts during the specified reporting period. ";
                    break;
                default:
                    reportDescription += "There is no significant trend for any specific report type. ";
                    break;
            }
        }

        // Check each non-zero report type for exceeding 10 reports and append alarm messages
        //nonZeroReportTypes.forEach(type => {
        //    const count = data.find(report => report._id === type)?.totalReports || 0;
        //    if (count > 10) {
        //        switch (type) {
        //            case "Accident":
        //                reportDescription += `Alert: With ${count} vehicular accident reports, immediate implementation of traffic safety measures is recommended to mitigate further incidents. `;
        //                break;
        //            case "Medical":
        //                reportDescription += `Alert: The high number of medical reports (${count}) necessitates enhanced medical resources and rapid response teams to address health emergencies effectively. `;
        //                break;
        //            case "Fire":
        //               reportDescription += `Alert: ${count} fire-related reports indicate a pressing need for reinforced fire safety protocols and community training programs to prevent future occurrences. `;
        //                break;
        //            case "Police":
        //                reportDescription += `Alert: An increase to ${count} police reports suggests the necessity for heightened community policing efforts and public awareness campaigns to ensure law and order. `;
        //                break;
        //            case "Assistance":
        //                reportDescription += `Alert: With ${count} assistance reports, it's crucial to bolster community support systems and resource allocation to address residents' needs promptly. `;
        //               break;
        //            case "Hazard":
        //                reportDescription += `Alert: The ${count} hazard reports highlight urgent environmental risks that require immediate attention and mitigation strategies to ensure community safety. `;
        //                break;
        //            default:
        //                break;
        //        }
        //    }
        //});

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
