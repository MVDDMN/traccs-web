const express = require("express");
const router = express.Router();
const reportsModel = require("../models/reports");  // Assuming you have a reports model

// Notification Module - Notifications
let notifications = [];

// Notification Module - Create Notification for New Report
router.post('/notifications', (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const newNotification = {
        id: notifications.length + 1,
        message,
        timestamp: new Date().toISOString()
    };

    notifications.push(newNotification);

    return res.status(201).json(newNotification);
});

// Fetch Notifications
router.get('/notifications', (req, res) => {
    return res.status(200).json(notifications);
});

// Delete Notifications
router.delete('/notifications', (req, res) => {
    notifications = [];
    return res.status(204).end();
});

// Create a New Report and Trigger Notification
router.post('/reports', async (req, res) => {
    try {
        const newReport = new reportsModel(req.body);
        await newReport.save();

        // Create a notification for the new report
        const newNotification = {
            id: notifications.length + 1,
            message: `New report received from ${newReport.name}`,
            timestamp: new Date().toISOString()
        };

        notifications.push(newNotification);

        return res.status(201).json(newReport);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create report' });
    }
});

// Fetch All Reports
router.get('/reports', async (req, res) => {
    try {
        const reports = await reportsModel.find();
        return res.status(200).json(reports);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

module.exports = router;
