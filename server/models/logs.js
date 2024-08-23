const mongoose = require ("mongoose")

const logsSchema = new mongoose.Schema({
    username: String,
    type: String,
    date: String,
    time: String,
    description: String
})

const logsModel = mongoose.model("logs", logsSchema)

module.exports = logsModel