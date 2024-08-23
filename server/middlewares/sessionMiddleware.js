const session = require("express-session");

const sessionMiddleware = session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        secure: false,
        maxAge: 10000 // Session timeout period (in milliseconds)
    }
});

module.exports = sessionMiddleware;
