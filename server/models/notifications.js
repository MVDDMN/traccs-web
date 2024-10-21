// models/notifications.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    message: String,
    timestamp: {
        type: Date,
        default: Date.now
    },
    userId: String,
    isCleared: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Notification", notificationSchema);
