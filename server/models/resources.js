const mongoose = require ("mongoose")

const resourcesSchema = new mongoose.Schema({
    username: String,
    itemname: String,
    barangay: String,
    type: String,
    description: String,
    quantity: Number
})

const resourcesModel = mongoose.model("resources", resourcesSchema)

module.exports = resourcesModel