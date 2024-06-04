const mongoose = require ("mongoose")

const historySchema = new mongoose.Schema({
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

const historyModel = mongoose.model("histories", historySchema)

module.exports = historyModel