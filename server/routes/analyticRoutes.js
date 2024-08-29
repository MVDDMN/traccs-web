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
        const reportSummary = await reportsModel.aggregate([
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
                        month: { $month: { $dateFromString: { dateString: "$report_date_time" } } },
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

// Analytics Module - Report Stats
router.get('/analytics/report-stats', async (req, res) => {
    try {
        const totalReports = await reportsModel.countDocuments();

        const reports = await reportsModel.find({});

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDate = today.getDate();

        let reportsThisMonth = 0;
        let reportsToday = 0;

        reports.forEach(report => {
            const reportDate = new Date(report.report_date_time);

            if (reportDate.getFullYear() === currentYear && reportDate.getMonth() + 1 === currentMonth) {
                reportsThisMonth++;
            }

            if (reportDate.getFullYear() === currentYear && reportDate.getMonth() + 1 === currentMonth && reportDate.getDate() === currentDate) {
                reportsToday++;
            }
        });

        res.json({
            totalReports,
            reportsThisMonth,
            reportsToday
        });
    } catch (error) {
        console.error('Error fetching report stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Analytics Module - Report frequency per hour
router.get('/analytics/report-frequency-by-hour', async (req, res) => {
    try {
        // Fetch the report date and type from the database
        const reports = await historyModel.find({}, 'report_date_time type');

        const hourFrequency = Array(24).fill(0);
        const reportTypesByHour = Array(24).fill().map(() => []);

        reports.forEach(report => {
            const reportDate = new Date(report.report_date_time);
            const hour = reportDate.getHours();
            hourFrequency[hour]++;

            // Collect unique report types for each hour
            if (!reportTypesByHour[hour].includes(report.type)) {
                reportTypesByHour[hour].push(report.type);
            }
        });

        // Create labels in 12-hour format
        const labels = hourFrequency.map((_, index) => {
            const hour12 = index % 12 || 12; // Convert to 12-hour format
            const period = index < 12 ? 'AM' : 'PM'; // AM/PM period
            return `${hour12}:00 ${period}`;
        });

        const data = hourFrequency;

        // Respond with labels, data, and report types
        res.json({ labels, data, reportTypes: reportTypesByHour });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Analytics Module - Report frequency for Peak hours
router.get('/analytics/report-frequency-by-peak', async (req, res) => {
    try {
        const reports = await historyModel.find({}, 'report_date_time');

        const hourFrequency = Array(24).fill(0);

        reports.forEach(report => {
            const reportDate = new Date(report.report_date_time);
            const hour = reportDate.getHours();
            hourFrequency[hour]++;
        });

        // Find the maximum frequency and corresponding hours
        const maxFrequency = Math.max(...hourFrequency);
        const peakHours = hourFrequency
            .map((frequency, index) => frequency === maxFrequency ? index : null)
            .filter(index => index !== null);

        // Convert peak hours to 12-hour format
        const peakHourLabels = peakHours.map(hour => {
            const hour12 = hour % 12 || 12; // Convert to 12-hour format
            const period = hour < 12 ? 'AM' : 'PM'; // AM/PM period
            return `${hour12}:00 ${period}`;
        });

        res.json({ peakHourLabels, maxFrequency });
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