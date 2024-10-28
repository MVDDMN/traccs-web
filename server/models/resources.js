const mongoose = require ("mongoose")

const resourcesSchema = new mongoose.Schema({
    username: String,
    itemname: String,
    barangay: String,
    type: String,
    description: String,
    updates: String,
    resource_status: String,
    quantity: Number
}, { timestamps: true })

const resourcesModel = mongoose.model("resources", resourcesSchema)

module.exports = resourcesModel