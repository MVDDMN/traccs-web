const express = require("express");
const router = express.Router();

// Notification Module - Notifcations
let notifications = [];

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

// Notification Module - Update
router.get('/notifications', (req, res) => {
    return res.status(200).json(notifications);
});

// Notification Module - Delete
router.delete('/notifications', (req, res) => {
    notifications = [];
    return res.status(204).end();
});


module.exports = router;