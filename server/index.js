const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const adminModel = require('./models/admin');
const reportsModel = require('./models/reports');
const archiveModel = require('./models/archive');
const historyModel = require('./models/history');
const resourcesModel = require('./models/resources');
const donateModel = require('./models/donate');
const requestsModel = require('./models/request');
const requestarchiveModel = require('./models/requestarchive');
const communityModel = require('./models/community');
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
}));
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        maxAge: 10000
    }
}));

mongoose.connect("mongodb+srv://traccs-admin:3gWRYQ98Y4ldLTNO@traccs.gqbq3ut.mongodb.net/traccs")
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("Failed to connect to MongoDB", err);
    });

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await adminModel.findOne({ username });
        if (user && user.password === password) {
            req.session.user = user;  // Set the user session
            res.json({ message: "Success", userId: user._id }); // Send user ID
        } else {
            res.status(401).json("Invalid username or password");
        }
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

app.get("/admin", async (req, res) => {
    try {
        const allReports = await reportsModel.find();
        res.json(allReports);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

app.get("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await adminModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            name: user.name,
            barangay: user.barangay,
            type: user.type,
            username: user.username
        });
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json("Failed to log out");
        }
        res.clearCookie('connect.sid');
        res.json("Logged out successfully");
    });
});

app.post("/respond", async (req, res) => {
    const { reportId } = req.body;
    try {
        // Find the report by ID
        const report = await reportsModel.findById(reportId);
        if (!report) {
            return res.status(404).json("Report not found");
        }
        // Update the report status to "Responded"
        report.status = "Responded";
        // Save the updated report
        await report.save();
        // Move the report to the archive table
        const archivedReport = new archiveModel(report.toObject());
        await archivedReport.save();
        // Remove the report from the reports collection
        await reportsModel.findByIdAndDelete(reportId);
        // Send response
        res.json("Report responded successfully, moved to archive, and removed from reports");
    } catch (err) {
        console.error("Error responding to report:", err);
        res.status(500).json("Internal server error");
    }
});

app.post("/deny", async (req, res) => {
    const { reportId } = req.body;
    try {
        // Find the report by ID
        const report = await reportsModel.findById(reportId);
        if (!report) {
            return res.status(404).json("Report not found");
        }
        // Update the report status to "Denied"
        report.status = "Denied";
        // Save the updated report
        await report.save();
        // Move the report to the archive table
        const archivedReport = new archiveModel(report.toObject());
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

app.get("/archives", async (req, res) => {
    try {
        const allArchives = await archiveModel.find();
        res.json(allArchives);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

app.post("/deleteArchive", async (req, res) => {
    const { archiveId } = req.body;
    try {
        await archiveModel.findByIdAndDelete(archiveId);
        res.json("Archive deleted successfully");
    } catch (err) {
        console.error("Error deleting archive:", err);
        res.status(500).json("Internal server error");
    }
});

app.post("/addToHistoryMap", async (req, res) => {
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

app.get("/historymaps", async (req, res) => {
    try {
        const allHistory = await historyModel.find();
        res.json(allHistory);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

app.post("/addToArchive", async (req, res) => {
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

app.get("/resources", async (req, res) => {
    try {
        const resources = await resourcesModel.find();
        res.json(resources);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

app.get("/donations", async (req, res) => {
    try {
        const donations = await donateModel.find();
        res.json(donations);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

app.get("/requests", async (req, res) => {
    try {
        const requests = await requestsModel.find();
        res.json(requests);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

app.get("/communities", async (req, res) => {
    try {
        const communities = await communityModel.find();
        res.json(communities);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

app.get("/requestarchives", async (req, res) => {
    try {
        const requestarchives = await requestarchiveModel.find();
        res.json(requestarchives);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
