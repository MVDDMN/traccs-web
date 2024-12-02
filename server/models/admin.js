const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    contact: String,
    email: { type: String, required: true },
    type: String,
    barangay: String,
    status: String,
}, { timestamps: true });

const adminModel = mongoose.model('admins', adminSchema);

module.exports = adminModel;