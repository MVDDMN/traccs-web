const cors = require("cors");
require('dotenv').config();

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.PROD_BASE_URL].filter(Boolean)
    : [process.env.DEV_BASE_URL, process.env.DEV_ALT_URL].filter(Boolean);

const corsMiddleware = cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            console.error(msg, 'Origin:', origin);
            return callback(new Error(msg), false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browsers that return 204 for OPTIONS requests
});

// Add a middleware to handle preflight `OPTIONS` requests
function handlePreflightRequests(req, res, next) {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', allowedOrigins.includes(req.headers.origin) ? req.headers.origin : false);
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.sendStatus(200); // Respond to the preflight request with a 200 OK status
    } else {
        next(); // Pass to the next middleware or route handler
    }
}

module.exports = {
    corsMiddleware,
    handlePreflightRequests,
};