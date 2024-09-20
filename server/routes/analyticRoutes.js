const express = require("express");
const historyModel = require('../models/history');
const requestarchiveModel = require('../models/requestarchive');
const requestsModel = require('../models/request');
const reportsModel = require('../models/reports');
const router = express.Router();

// Analytics Module - Summary of Request
router.get('/analytics/summary', async (req, res) => {
    try {
        const summary = await requestsModel.aggregate([
            {
                $group: {
                    _id: "$type",
                    totalRequests: { $sum: 1 },
                    totalQuantity: { $sum: "$quantity" }
                }
            },
            {
                $sort: { totalRequests: -1 }
            }
        ]);
        res.json(summary);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Analytics Module - Summary of Request by Barangay
router.get('/analytics/barangay-summary', async (req, res) => {
    try {
        const barangaySummary = await requestarchiveModel.aggregate([
            {
                $group: {
                    _id: "$barangay",
                    totalRequests: { $sum: 1 },
                    totalQuantity: { $sum: "$quantity" }
                }
            },
            {
                $sort: { totalRequests: -1 }
            }
        ]);
        res.json(barangaySummary);
    } catch (err) {
        console.error('Error fetching barangay summary data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Analytics Module - Summary of Reports by Type
router.get('/analytics/report-summary', async (req, res) => {
    try {
        const reportSummary = await historyModel.aggregate([
            {
                $group: {
                    _id: "$type",
                    totalReports: { $sum: 1 }
                }
            },
            {
                $sort: { totalReports: -1 }
            }
        ]);
        res.json(reportSummary);
    } catch (err) {
        console.error('Error fetching report summary data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Analytics Module - Response Time per Responder
router.get('/analytics/response-time-summary', async (req, res) => {
    try {
        const responseTimeSummary = await historyModel.aggregate([
            {
                $match: {
                    respond_date_time: { $exists: true },
                    completion_date_time: { $exists: true }
                }
            },
            {
                $project: {
                    responder: 1,
                    responseTime: {
                        $subtract: [
                            { $toDate: "$completion_date_time" },
                            { $toDate: "$respond_date_time" }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$responder",
                    averageResponseTime: { $avg: "$responseTime" }
                }
            }
        ]);

        res.json(responseTimeSummary);
    } catch (err) {
        console.error('Error fetching response time summary data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Analytics Module - Route to fetch report frequency data
router.get('/analytics/report-frequency', async (req, res) => {
    try {
        const reportFrequency = await historyModel.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: "$report_date_time" }, // No need for $dateFromString
                        type: "$type"
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    type: "$_id.type",
                    count: 1
                }
            },
            {
                $sort: {
                    month: 1
                }
            }
        ]);

        res.json(reportFrequency);
    } catch (error) {
        console.error('Error fetching report frequency:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Analytics Module - Report Stats with Year Filtering and Available Years
router.get('/analytics/report-stats', async (req, res) => {
    try {
        const { year } = req.query; // Fetch year from query params
        let reportsQuery = {}; // Initialize query object

        if (year) {
            // If a year is provided, filter by that year
            const yearStart = `${year}-01-01T00:00:00.000+00:00`;
            const yearEnd = `${year}-12-31T23:59:59.999+00:00`;
            reportsQuery = {
                report_date_time: {
                    $gte: yearStart,
                    $lte: yearEnd
                }
            };
        }

        // Fetch reports filtered by the year (if provided)
        const totalReports = await historyModel.countDocuments(reportsQuery);
        const reports = await historyModel.find(reportsQuery);

        const today = new Date();
        const todayISO = today.toISOString().split('T')[0]; // 'YYYY-MM-DD' format

        let reportsThisMonth = 0;
        let reportsToday = 0;

        reports.forEach(report => {
            const reportDate = new Date(report.report_date_time); // Convert the string date into a Date object
            const reportISO = reportDate.toISOString().split('T')[0]; // Normalize report date

            // Check if it's the same month as today
            if (
                reportDate.getFullYear() === today.getFullYear() &&
                reportDate.getMonth() === today.getMonth()
            ) {
                reportsThisMonth++;
            }

            // Check if it's the same day as today
            if (reportISO === todayISO) {
                reportsToday++;
            }
        });

        // Find all distinct years from the reports for year dropdown
        const availableYears = await historyModel.aggregate([
            {
                $addFields: {
                    year: { $substr: ['$report_date_time', 0, 4] } // Extract year from the string date
                }
            },
            {
                $group: {
                    _id: '$year'
                }
            },
            {
                $sort: { _id: -1 } // Sort in descending order to get the most recent years first
            }
        ]);

        const years = availableYears.map(yearData => yearData._id); // Map to get an array of years

        res.json({
            totalReports,
            reportsThisMonth,
            reportsToday,
            availableYears: years // Return available years
        });
    } catch (error) {
        console.error('Error fetching report stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Analytics Module - Report frequency per hour
router.get('/analytics/report-frequency-by-hour', async (req, res) => {
    try {
        // Use MongoDB aggregation to extract hours directly from the report_date_time field
        const reportFrequency = await historyModel.aggregate([
            {
                $group: {
                    _id: {
                        hour: { $hour: "$report_date_time" }, // Extract the hour directly
                        type: "$type"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    hour: "$_id.hour",
                    type: "$_id.type",
                    count: 1
                }
            },
            {
                $sort: {
                    hour: 1
                }
            }
        ]);

        // Create labels in 12-hour format for the raw time
        const labels = Array.from({ length: 24 }, (_, index) => {
            const hour12 = index % 12 || 12; // Convert to 12-hour format
            const period = index < 12 ? 'AM' : 'PM'; // AM/PM period
            return `${hour12}:00 ${period}`;
        });

        // Map the aggregated results into the hourly frequency array
        const hourFrequency = Array(24).fill(0);
        reportFrequency.forEach(report => {
            hourFrequency[report.hour] = report.count;
        });

        res.json({
            labels,
            data: hourFrequency,
            reportTypes: reportFrequency.map(r => r.type),
        });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Analytics Module - Requests Stats
router.get('/analytics/requests-stats', async (req, res) => {
    try {
        // Total Requests
        const totalRequests = await requestsModel.countDocuments();

        // Requests This Month
        const requestsThisMonth = await requestsModel.aggregate([
            {
                $addFields: {
                    month: { $month: { $dateFromString: { dateString: "$date_time" } } },
                    year: { $year: { $dateFromString: { dateString: "$date_time" } } }
                }
            },
            {
                $match: {
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear()
                }
            },
            {
                $count: "requestsThisMonth"
            }
        ]);

        // Requests Today
        const requestsToday = await requestsModel.aggregate([
            {
                $addFields: {
                    day: { $dayOfMonth: { $dateFromString: { dateString: "$date_time" } } },
                    month: { $month: { $dateFromString: { dateString: "$date_time" } } },
                    year: { $year: { $dateFromString: { dateString: "$date_time" } } }
                }
            },
            {
                $match: {
                    day: new Date().getDate(),
                    month: new Date().getMonth() + 1, // MongoDB months are 1-indexed
                    year: new Date().getFullYear()
                }
            },
            {
                $count: "requestsToday"
            }
        ]);

        res.json({
            totalRequests,
            requestsThisMonth: requestsThisMonth.length > 0 ? requestsThisMonth[0].requestsThisMonth : 0,
            requestsToday: requestsToday.length > 0 ? requestsToday[0].requestsToday : 0,
        });
    } catch (error) {
        console.error('Error fetching requests stats:', error); // Debugging log
        res.status(500).send('Server error');
    }
});

// Analytics Module - Summary of reports status
router.get('/analytics/reports-summary-status', async (req, res) => {
    try {
        const totalReports = await reportsModel.countDocuments();
        const pendingReports = await reportsModel.countDocuments({ status: 'Pending' });
        const completedReports = await historyModel.countDocuments({ status: 'Archived' });
        const inProgressReports = await reportsModel.countDocuments({ status: 'Responded' });

        res.json({
            totalReports,
            pendingReports,
            completedReports,
            inProgressReports
        });
    } catch (error) {
        console.error('Error fetching reports summary:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to get the summary of requests by type
router.get('/analytics/requests-summary', async (req, res) => {
    try {
        // Aggregate the requests by type and count them
        const requestSummary = await requestsModel.aggregate([
            {
                $group: {
                    _id: '$type',
                    totalRequests: { $sum: 1 }
                }
            }
        ]);

        res.json(requestSummary);
    } catch (error) {
        console.error('Error fetching request summary:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;