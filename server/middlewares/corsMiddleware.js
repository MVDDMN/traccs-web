const cors = require("cors");
require('dotenv').config();

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.PROD_BASE_URL]
    : [process.env.DEV_BASE_URL, process.env.DEV_ALT_URL];

const corsMiddleware = cors({
    origin: allowedOrigins,
    credentials: true,
});

module.exports = corsMiddleware;
