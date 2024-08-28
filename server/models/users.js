const mongoose = require ("mongoose")

const usersSchema = new mongoose.Schema({
    fullName: String,
    address: String,
    phone: String,
    email: String,
    password: String,
    status: String,
    IdImage: [String]
})

const usersModel = mongoose.model("users", usersSchema)

module.exports = usersModel