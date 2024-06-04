const mongoose = require ("mongoose")

const reportsSchema = new mongoose.Schema({
    name: String,
    date: String,
    time: String,
    address: String,
    location: String,
    type: String,
    status: String,
    description: String,
    image: [String]
})

const reportsModel = mongoose.model("reports", reportsSchema)

module.exports = reportsModel