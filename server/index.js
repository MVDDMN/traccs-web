const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");  // Add helmet for security headers
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

// Apply helmet middleware for security headers
app.use(helmet());

// Customize specific headers not covered by Helmet defaults
app.use(helmet.frameguard({ action: 'deny' }));  // X-Frame-Options
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));  // Referrer-Policy

// Apply Content-Security-Policy (CSP) rules
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: [
            "'self'",
            process.env.PROD_BASE_URL,
            process.env.PROD_ALT_URL
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
    },
}));

// Set Strict-Transport-Security (HSTS) policy
app.use(helmet.hsts({
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true
}));

// Body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));
app.use(express.text({ limit: '2mb' }));

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
