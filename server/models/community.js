const mongoose = require ("mongoose")

const communitySchema = new mongoose.Schema({
    name: String,
    barangay: String,
    itemname: String,
    type: String,
    description: String,
    quantity: Number,
    date_time: { type: Date }
})

const communityModel = mongoose.model("communities", communitySchema)

module.exports = communityModel