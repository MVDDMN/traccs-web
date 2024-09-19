const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // OTP expires after 5 minutes
});

// Create an index to automatically delete the document after 5 minutes
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const Otp = mongoose.model('Otp', otpSchema);
module.exports = Otp;
