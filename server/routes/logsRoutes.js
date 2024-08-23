const express = require("express");
const logsModel = require('../models/logs');
const router = express.Router();

// Logs Module - Show logs
router.get("/logs", async (req, res) => {
    try {
        const logs = await logsModel.find();
        res.json(logs);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

// Logs Module - Logs route
router.post('/logs', async (req, res) => {
    try {
        const log = new logsModel(req.body);
        await log.save();
        res.status(201).send({ message: 'Log entry saved successfully.' });
    } catch (error) {
        res.status(500).send({ message: 'Error saving log entry.' });
    }
});


module.exports = router;