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
            return callback(new Error(msg), false);
        }
    },
    credentials: true,
});

module.exports = corsMiddleware;
