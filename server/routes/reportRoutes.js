const express = require("express");
const reportsModel = require('../models/reports');
const archiveModel = require('../models/archive');
const historyModel = require('../models/history');
const router = express.Router();

// Report Module - Show Dashboard Reports
router.get("/admin", async (req, res) => {
    try {
        const allReports = await reportsModel.find();
        res.json(allReports);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

// Report Module - Respond to report
router.post("/respondtoreport", async (req, res) => {
    const { reportId, responder } = req.body;
    try {
        const report = await reportsModel.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        // Manually adjust for UTC+8 (Manila) time
        const localDateTime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000); // Add 8 hours for UTC+8

        // Update the report details
        report.status = "Responded";
        report.responder = responder;
        report.respond_date_time = localDateTime.toISOString(); // Store the adjusted time in ISO format

        // Save the updated report
        await report.save();

        // Send response
        res.status(200).json({ message: "Report responded" });
    } catch (err) {
        console.error("Error responding to report:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Report Module - Send report to history
router.post("/archivereport", async (req, res) => {
    const { reportId } = req.body;
    try {
        const report = await reportsModel.findById(reportId);
        if (!report) {
            return res.status(404).json("Report not found");
        }

        // Manually adjust for UTC+8 (Manila) time
        const reportDateTime = new Date(report.report_date_time);
        const reportDateTimeLocal = new Date(reportDateTime.getTime() + 8 * 60 * 60 * 1000); // Add 8 hours for UTC+8

        const completionDateTimeUTC = new Date();
        const completionDateTimeLocal = new Date(completionDateTimeUTC.getTime() + 8 * 60 * 60 * 1000); // Add 8 hours for UTC+8

        // Move the report to the archive table with adjusted local time
        const archivedReport = new archiveModel({
            ...report.toObject(),
            report_date_time: reportDateTimeLocal.toISOString(), // Store the adjusted time in ISO format
            status: "Archived",
            completion_date_time: completionDateTimeLocal.toISOString(), // Store the adjusted time in ISO format
        });

        // Save the new entry
        await archivedReport.save();

        // Remove the report from the reports collection
        await reportsModel.findByIdAndDelete(reportId);

        // Send response
        res.json("Report archived and removed from reports");
    } catch (err) {
        console.error("Error archiving report:", err);
        res.status(500).json("Internal server error");
    }
});

// Report Module -  Deny report
router.post("/deny", async (req, res) => {
    const { reportId, responder } = req.body;
    try {
        const report = await reportsModel.findById(reportId);
        if (!report) {
            return res.status(404).json("Report not found");
        }

        // Update the report status to "Denied"
        report.status = "Denied";

        // Move the report to the archive table
        const archivedReport = new archiveModel({
            ...report.toObject(),
            status: "Denied",
            responder: responder,
            completion_date_time: new Date().toISOString(),
        });

        // Save the new entry
        await archivedReport.save();

        // Remove the report from the reports collection
        await reportsModel.findByIdAndDelete(reportId);

        // Send response
        res.json("Report denied, moved to archive, and removed from reports");
    } catch (err) {
        console.error("Error denying report:", err);
        res.status(500).json("Internal server error");
    }
});

// Report Module - Show history reports
router.get("/archives", async (req, res) => {
    try {
        const allArchives = await archiveModel.find();
        res.json(allArchives);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

// Report Module - Delete from history reports
router.post("/deleteArchive", async (req, res) => {
    const { archiveId } = req.body;
    try {
        await archiveModel.findByIdAndDelete(archiveId);
        res.json("Archive deleted successfully");
    } catch (err) {
        console.error("Error deleting archive:", err);
        res.status(500).json("Internal server error");
    }
});

// Report Module - Add to history map
router.post("/addToHistoryMap", async (req, res) => {
    const { archiveId } = req.body;
    try {
        // Find the archive by ID
        const archive = await archiveModel.findById(archiveId);
        if (!archive) {
            return res.status(404).json("Archive not found");
        }
        // Move the archive to the history table
        const historyEntry = new historyModel(archive.toObject());
        await historyEntry.save();
        // Remove the archive from the archive collection
        await archiveModel.findByIdAndDelete(archiveId);
        // Send response
        res.json("Archive added to history map and removed from archives");
    } catch (err) {
        console.error("Error adding archive to history map:", err);
        res.status(500).json("Internal server error");
    }
});

// Report Module - Show History map
router.get("/historymaps", async (req, res) => {
    try {
        const allHistory = await historyModel.find();
        res.json(allHistory);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

// Report Module - Add report to history
router.post("/addToArchive", async (req, res) => {
    const { historyId } = req.body;
    try {
        // Find the history entry by ID
        const historyEntry = await historyModel.findById(historyId);
        if (!historyEntry) {
            return res.status(404).json("History entry not found");
        }
        // Move the history entry to the archive table
        const archivedEntry = new archiveModel(historyEntry.toObject());
        await archivedEntry.save();
        // Remove the history entry from the history collection
        await historyModel.findByIdAndDelete(historyId);
        // Send response
        res.json("History entry moved to archive successfully");
    } catch (err) {
        console.error("Error moving to archive:", err);
        res.status(500).json("Internal server error");
    }
});


module.exports = router;