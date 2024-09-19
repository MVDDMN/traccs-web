const session = require("express-session");

const sessionMiddleware = session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1800000,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        httpOnly: true,
    },
});

module.exports = sessionMiddleware;
