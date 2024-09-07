const mongoose = require ("mongoose")

const donateSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    contactNumber: String,
    donationType: String,
    type: String,
    donationAmount: String,
    description: String,
    updateDescription: String,
    status: String,
    selectedBarangay: String,
    image: String,
})

const donateModel = mongoose.model("donations", donateSchema)

module.exports = donateModel