const mongoose = require ("mongoose")

const communitySchema = new mongoose.Schema({
    name: String,
    barangay: String,
    itemname: String,
    type: String,
    description: String,
    quantity: Number
})

const communityModel = mongoose.model("communities", communitySchema)

module.exports = communityModel