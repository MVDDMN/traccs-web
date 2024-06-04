const mongoose = require ("mongoose")

const requestsSchema = new mongoose.Schema({
    username: String,
    responder: String,
    barangay: String,
    itemname: String,
    type: String,
    description: String,
    quantity: Number
})

const requestsModel = mongoose.model("requests", requestsSchema)

module.exports = requestsModel