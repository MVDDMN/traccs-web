const mongoose = require ("mongoose")

const resourcearchiveSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    contactNumber: String,
    donationType: String,
    type: String,
    donationAmount: String,
    description: String,
    selectedBarangay: String,
    admin: String,
}, { timestamps: true });

const resourcearchiveModel = mongoose.model("resourcearchive", resourcearchiveSchema)

module.exports = resourcearchiveModel