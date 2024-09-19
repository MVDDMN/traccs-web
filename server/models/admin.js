const mongoose = require ("mongoose")

const adminSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    contact: String,
    email: String,
    type: String,
    barangay: String,
}, { timestamps: true });

const adminModel = mongoose.model("admins", adminSchema)

module.exports = adminModel