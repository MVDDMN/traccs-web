const express = require("express");
const router = express.Router();
const reportsModel = require("../models/reports"); // Assuming you have a reports model
const Notification = require("../models/notifications"); // Notification model

// Create Notification for New Report
router.post('/notifications', async (req, res) => {
    const { message, userId } = req.body;

    if (!message || !userId) {
        return res.status(400).json({ error: 'Message and userId are required' });
    }

    try {
        const newNotification = new Notification({ message, userId });
        await newNotification.save();
        return res.status(201).json(newNotification);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create notification' });
    }
});

// Fetch Notifications
router.get('/notifications', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Fetch only non-cleared notifications for the user
        const notifications = await Notification.find({ userId, isCleared: false }).sort({ timestamp: -1 }).exec();
        return res.status(200).json(notifications);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Delete (Clear) Notifications
router.delete('/notifications', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Mark notifications as cleared
        await Notification.updateMany({ userId, isCleared: false }, { $set: { isCleared: true } });
        return res.status(204).end();
    } catch (error) {
        return res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

// Create a New Report and Trigger Notification
router.post('/reports', async (req, res) => {
    try {
        const newReport = new reportsModel(req.body);
        await newReport.save();

        // Avoid duplicate notifications by checking if it already exists
        const existingNotification = await Notification.findOne({
            message: `New report received from ${newReport.name} for ${newReport.type}`,
            userId: req.body.userId
        });

        if (!existingNotification) {
            // Create a notification for the new report
            const newNotification = new Notification({
                message: `New report received from ${newReport.name} for ${newReport.type}`,
                userId: req.body.userId
            });
            await newNotification.save();
        }

        return res.status(201).json(newReport);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create report' });
    }
});

// Fetch All Reports with Query Optimization
router.get('/reports', async (req, res) => {
    try {
        const { fromDate, toDate, type } = req.query;
        const query = {};

        // Add date range filtering if provided
        if (fromDate && toDate) {
            query.timestamp = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            };
        }

        // Add report type filtering if provided
        if (type) {
            query.type = type;
        }

        // Use index on 'timestamp' and 'type' fields for efficient querying
        const reports = await reportsModel.find(query).sort({ timestamp: -1 }).exec();
        return res.status(200).json(reports);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

module.exports = router;
