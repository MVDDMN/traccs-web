const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require('dotenv').config();

// Middlewares
const { corsMiddleware, handlePreflightRequests } = require("./middlewares/corsMiddleware");
const sessionMiddleware = require("./middlewares/sessionMiddleware");

// Routes
const loginRoutes = require("./routes/loginRoutes");
const reportRoutes = require("./routes/reportRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const requestRoutes = require("./routes/requestRoutes");
const logsRoutes = require("./routes/logsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const accountRoutes = require("./routes/accountRoutes");
const analyticRoutes = require("./routes/analyticRoutes");

const path = require('path');  // Import path module
const app = express();

// Handle preflight requests globally before any other middleware
app.use(handlePreflightRequests);

// Apply CORS middleware before any other middleware or routes
app.use(corsMiddleware);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.text({ limit: '10mb' }));

// Other middlewares
app.use(cookieParser());
app.use(sessionMiddleware);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("Failed to connect to MongoDB", err);
    });

// Use routes
app.use("/api", loginRoutes);
app.use("/api", reportRoutes);
app.use("/api", resourceRoutes);
app.use("/api", requestRoutes);
app.use("/api", logsRoutes);
app.use("/api", notificationRoutes);
app.use("/api", accountRoutes);
app.use("/api", analyticRoutes);

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all handler to serve Vite's index.html for any request that doesn't match an API route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(process.env.PORT || 3001, () => {
    console.log(`Server is running on port ${process.env.PORT || 3001}`);
});
