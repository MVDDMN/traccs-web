const mongoose = require ("mongoose")

const archiveSchema = new mongoose.Schema({
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

const archiveModel = mongoose.model("archives", archiveSchema)

module.exports = archiveModel