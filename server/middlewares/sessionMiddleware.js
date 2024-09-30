require('dotenv').config();
const session = require("express-session");

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET, // Use an environment variable for the secret
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Set cookie security based on environment
        maxAge: 1800000, // 30 minutes
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        httpOnly: true,
    },
});

module.exports = sessionMiddleware;
