const session = require("express-session");

const sessionMiddleware = session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10000,
        sameSite: 'None'
    }
});

module.exports = sessionMiddleware;
