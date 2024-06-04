const mongoose = require ("mongoose")

const donateSchema = new mongoose.Schema({
    name: String,
    itemname: String,
    barangay: String,
    contact: String,
    type: String,
    description: String,
    quantity: Number
})

const donateModel = mongoose.model("donations", donateSchema)

module.exports = donateModel