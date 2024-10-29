const express = require("express");
const requestarchiveModel = require('../models/requestarchive');
const archiveModel = require('../models/archive');
const requestsModel = require('../models/request');
const reportsModel = require('../models/reports');
const router = express.Router();

// Analytics Module - Summary of Request
router.get('/analytics/summary', async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;

        // Convert dateFrom and dateTo to Date objects for filtering
        const query = {};
        if (dateFrom && dateTo) {
            query.date_time = {
                $gte: new Date(dateFrom),
                $lte: new Date(dateTo)
            };
        }

        const summary = await requestarchiveModel.aggregate([
            {
                $match: query,  // Match documents within the date range
            },
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
        const { dateFrom, dateTo } = req.query;
        
        // Build a query object to filter by date range
        let dateQuery = {};
        if (dateFrom && dateTo) {
            dateQuery = {
                date_time: {
                    $gte: new Date(dateFrom),
                    $lte: new Date(dateTo)
                }
            };
        }

        // Fetch the summary grouped by barangay, filtered by the date range
        const barangaySummary = await requestarchiveModel.aggregate([
            {
                $match: dateQuery // Apply the date range filter
            },
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

// Analytics Module - Pie Chart Summary of Reports by Type with Year Filtering
router.get('/analytics/report-summary', async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        let reportsQuery = {};

        if (dateFrom && dateTo) {
            reportsQuery = {
                report_date_time: {
                    $gte: new Date(dateFrom),
                    $lte: new Date(dateTo)
                }
            };
        }

        const reportSummary = await archiveModel.aggregate([
            { $match: reportsQuery },
            {
                $group: {
                    _id: "$type",
                    totalReports: { $sum: 1 },
                    fireTypeCounts: {
                        $push: {
                            $cond: [
                                { $eq: ["$type", "Fire"] },
                                "$description.fire_type",
                                null
                            ]
                        }
                    },
                    collisionTypeCounts: {
                        $push: {
                            $cond: [
                                { $eq: ["$type", "Accident"] },
                                "$description.collision_type",
                                null
                            ]
                        }
                    },
                    medicalTypeCounts: {
                        $push: {
                            $cond: [
                                { $eq: ["$type", "Medical"] },
                                "$description.medical_emergency_type",
                                null
                            ]
                        }
                    },
                    hazardTypeCounts: {
                        $push: {
                            $cond: [
                                { $eq: ["$type", "Hazard"] },
                                "$description.hazard_type",
                                null
                            ]
                        }
                    },
                    assistanceTypeCounts: {
                        $push: {
                            $cond: [
                                { $eq: ["$type", "Assistance"] },
                                "$description.assistance_type",
                                null
                            ]
                        }
                    }
                }
            },
            {
                $sort: { totalReports: -1 }
            }
        ]);

        // Process subcategories for Fire, Accident, Medical, Hazard, and Assistance types
        reportSummary.forEach(summary => {
            if (summary._id === 'Fire') {
                const fireTypeCounts = summary.fireTypeCounts.filter(type => type !== null);
                summary.fireTypeSummary = fireTypeCounts.reduce((acc, type) => {
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {});
                delete summary.fireTypeCounts;
            } else if (summary._id === 'Accident') {
                const collisionTypeCounts = summary.collisionTypeCounts.filter(type => type !== null);
                summary.collisionTypeSummary = collisionTypeCounts.reduce((acc, type) => {
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {});
                delete summary.collisionTypeCounts;
            } else if (summary._id === 'Medical') {
                const medicalTypeCounts = summary.medicalTypeCounts.filter(type => type !== null);
                summary.medicalTypeSummary = medicalTypeCounts.reduce((acc, type) => {
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {});
                delete summary.medicalTypeCounts;
            } else if (summary._id === 'Hazard') {
                const hazardTypeCounts = summary.hazardTypeCounts.filter(type => type !== null);
                summary.hazardTypeSummary = hazardTypeCounts.reduce((acc, type) => {
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {});
                delete summary.hazardTypeCounts;
            } else if (summary._id === 'Assistance') {
                const assistanceTypeCounts = summary.assistanceTypeCounts.filter(type => type !== null);
                summary.assistanceTypeSummary = assistanceTypeCounts.reduce((acc, type) => {
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {});
                delete summary.assistanceTypeCounts;
            }
        });

        res.json({ reportSummary });
    } catch (err) {
        console.error('Error fetching report summary data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Analytics Module - Response Time per Responder with Date Range Filtering
router.get('/analytics/response-time-summary', async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;

        const dateFilter = {};
        if (dateFrom && dateTo) {
            dateFilter.report_date_time = {
                $gte: new Date(dateFrom),
                $lte: new Date(dateTo),
            };
        }

        const responseTimeSummary = await archiveModel.aggregate([
            {
                $match: {
                    ...dateFilter,
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
                    },
                    year: { $year: "$report_date_time" },
                    month: { $month: "$report_date_time" }
                }
            },
            {
                $group: {
                    _id: {
                        responder: "$responder",
                        year: "$year",
                        month: "$month"
                    },
                    averageResponseTime: { $avg: "$responseTime" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        res.json(responseTimeSummary);
    } catch (err) {
        console.error('Error fetching response time summary data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Analytics Module - Route to fetch report frequency data with date range filtering
router.get('/analytics/report-frequency', async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query; // Get the date range from query parameters
        let matchStage = {};

        // If both dateFrom and dateTo are provided, filter by date range
        if (dateFrom && dateTo) {
            matchStage = {
                report_date_time: {
                    $gte: new Date(dateFrom),
                    $lte: new Date(dateTo),
                }
            };
        }

        const reportFrequency = await archiveModel.aggregate([
            { 
                $match: matchStage
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$report_date_time" }, // Group by month
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
                    month: 1,
                    type: 1
                }
            }
        ]);

        res.json(reportFrequency);
    } catch (error) {
        console.error('Error fetching report frequency:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Analytics Module - Report Stats with Date Filtering from Two Models
router.get('/analytics/report-stats', async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        let reportsQuery = {};

        // Filter by date range if provided
        if (dateFrom && dateTo) {
            reportsQuery = {
                report_date_time: {
                    $gte: new Date(dateFrom),
                    $lte: new Date(dateTo)
                }
            };
        }

        // Aggregation pipeline for archiveModel to get total, resolved, and denied reports
        const archiveStats = await archiveModel.aggregate([
            { $match: reportsQuery },  // Match the date range
            {
                $group: {
                    _id: null,
                    totalReports: { $sum: 1 },  // Count total reports
                    resolvedReports: { $sum: { $cond: [{ $eq: ["$status", "Archived"] }, 1, 0] } },
                    deniedReports: { $sum: { $cond: [{ $eq: ["$status", "Denied"] }, 1, 0] } }
                }
            }
        ]);

        // Get pending reports and reports for today from reportPendingModel
        const today = new Date();
        const todayISO = today.toISOString().split('T')[0];

        // Query for pending reports within the period
        const reportsPendingPeriod = await reportsModel.countDocuments({
            report_date_time: { $gte: new Date(dateFrom), $lte: new Date(dateTo) },
            status: 'Pending'
        });

        // Query for reports today
        const reportsToday = await reportsModel.countDocuments({
            report_date_time: {
                $gte: new Date().setHours(0, 0, 0, 0), // Start of today
                $lte: new Date().setHours(23, 59, 59, 999) // End of today
            }
        });

        // Return the aggregated stats
        const totalReports = archiveStats[0]?.totalReports || 0;
        const resolvedReports = archiveStats[0]?.resolvedReports || 0;
        const deniedReports = archiveStats[0]?.deniedReports || 0;

        res.json({
            totalReports,  // From archiveModel
            reportsPendingPeriod,  // From reportPendingModel
            reportsToday,  // From reportPendingModel
            resolvedReports,  // From archiveModel
            deniedReports  // From archiveModel
        });
    } catch (error) {
        console.error('Error fetching report stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Analytics Module - Report frequency per hour with date range filtering
router.get('/analytics/report-frequency-by-hour', async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;

        // Validate the date range input
        if (!dateFrom || !dateTo) {
            return res.status(400).json({ error: 'dateFrom and dateTo are required' });
        }

        const from = new Date(dateFrom);
        const to = new Date(dateTo);

        // Ensure the dates are valid
        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        // Build the query object to filter by date range
        let reportsQuery = {
            report_date_time: {
                $gte: from,
                $lte: to
            }
        };

        // Use MongoDB aggregation to extract hours directly from the report_date_time field
        const reportFrequency = await archiveModel.aggregate([
            { $match: reportsQuery }, // Apply the date range filter
            {
                $group: {
                    _id: {
                        hour: { $hour: "$report_date_time" }, // Extract the hour of the report
                        type: "$type"  // Group by type of report
                    },
                    count: { $sum: 1 }  // Count the number of reports for each group
                }
            },
            {
                $project: {
                    _id: 0,
                    hour: "$_id.hour",  // Hour of the report
                    type: "$_id.type",  // Type of report
                    count: 1  // Number of reports
                }
            },
            {
                $sort: {
                    hour: 1  // Sort by hour (ascending)
                }
            }
        ]);

        // If no data is found, return early with empty arrays
        if (!reportFrequency.length) {
            return res.json({
                labels: [],
                data: [],
                reportTypes: []
            });
        }

        // Create labels for each hour (24-hour format converted to 12-hour format with AM/PM)
        const labels = Array.from({ length: 24 }, (_, index) => {
            const hour12 = index % 12 || 12; // Convert to 12-hour format (handles 0 as 12)
            const period = index < 12 ? 'AM' : 'PM'; // Determine AM or PM
            return `${hour12}:00 ${period}`;
        });

        // Initialize arrays to store the report counts and types per hour
        const hourFrequency = Array(24).fill(0);
        const reportTypesByHour = Array.from({ length: 24 }, () => []); // Holds types for each hour

        // NEW: Initialize an object to store the breakdown of each hour's reports by type and their counts
        const breakdownByHour = Array.from({ length: 24 }, () => ({})); 

        // Populate the hourFrequency and reportTypesByHour arrays based on the aggregation results
        reportFrequency.forEach(report => {
            const hour = report.hour;
            hourFrequency[hour] += report.count;  // Increment report count for the specific hour
            reportTypesByHour[hour].push(report.type);  // Store the report type for this hour

            // NEW: Populate the breakdownByHour object to track how many reports each type has per hour
            if (!breakdownByHour[hour][report.type]) {
                breakdownByHour[hour][report.type] = 0;
            }
            breakdownByHour[hour][report.type] += report.count; // Increment count for this type
        });

        // Send the response with labels, data (report counts per hour), report types, and the new breakdown
        res.json({
            labels,
            data: hourFrequency,  // Total reports per hour
            reportTypes: reportTypesByHour,  // Types of reports per hour
            breakdownByHour  // NEW: Detailed breakdown of how many reports of each type occurred per hour
        });
    } catch (err) {
        console.error('Error fetching report frequency by hour:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Analytics Module - Requests Stats
router.get('/analytics/requests-stats', async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const dateFilter = {};

        // Check if dateFrom and dateTo are provided and valid
        if (dateFrom && dateTo) {
            dateFilter.date_time = {
                $gte: new Date(dateFrom),
                $lte: new Date(dateTo),
            };
        }

        // Total Requests within the date range
        const totalRequests = await requestarchiveModel.countDocuments(dateFilter);

        // Requests Pending This Period
        const requestsThisMonth = await requestsModel.aggregate([
            {
                $addFields: {
                    month: { $month: "$date_time" },
                    year: { $year: "$date_time" }
                }
            },
            {
                $match: {
                    month: { $gte: new Date(dateFrom).getMonth() + 1, $lte: new Date(dateTo).getMonth() + 1 },
                    year: { $gte: new Date(dateFrom).getFullYear(), $lte: new Date(dateTo).getFullYear() },
                    ...dateFilter
                }
            },
            {
                $count: "requestsThisMonth"
            }
        ]);

        // Requests Today within the selected date range
        const requestsToday = await requestsModel.aggregate([
            {
                $addFields: {
                    day: { $dayOfMonth: "$date_time" },
                    month: { $month: "$date_time" },
                    year: { $year: "$date_time" }
                }
            },
            {
                $match: {
                    day: new Date().getDate(),
                    month: new Date(dateTo).getMonth() + 1,
                    year: new Date(dateTo).getFullYear(),
                    ...dateFilter
                }
            },
            {
                $count: "requestsToday"
            }
        ]);

        // Barangay with the most requests
        const majorityBarangay = await requestarchiveModel.aggregate([
            { $match: dateFilter },
            { $group: { _id: "$barangay", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        // Barangay responders and their request counts
        const barangayResponders = await requestarchiveModel.aggregate([
            { $match: dateFilter },
            { $group: { _id: "$responder", requestsCount: { $sum: 1 } } },
            { $sort: { requestsCount: -1 } }
        ]);

        res.json({
            totalRequests,
            requestsThisMonth: requestsThisMonth.length > 0 ? requestsThisMonth[0].requestsThisMonth : 0,
            requestsToday: requestsToday.length > 0 ? requestsToday[0].requestsToday : 0,
            majorityBarangay: majorityBarangay.length > 0 ? majorityBarangay[0] : null,
            barangayResponders // Send barangay responders data
        });
    } catch (error) {
        console.error('Error fetching requests stats:', error);
        res.status(500).send('Server error');
    }
});


// Analytics Module - Summary of reports status
router.get('/analytics/reports-summary-status', async (req, res) => {
    try {
        const totalReports = await reportsModel.countDocuments();
        const pendingReports = await reportsModel.countDocuments({ status: 'Pending' });
        const completedReports = await archiveModel.countDocuments({ status: 'Archived' });
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