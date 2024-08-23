const mongoose = require ("mongoose")

const requestarchiveSchema = new mongoose.Schema({
    username: String,
    responder: String,
    barangay: String,
    itemname: String,
    type: String,
    description: String,
    quantity: Number,
    date_time: String
})

const requestarchiveModel = mongoose.model("requestarchives", requestarchiveSchema)

module.exports = requestarchiveModel