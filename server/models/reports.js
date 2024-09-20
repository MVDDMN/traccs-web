const mongoose = require("mongoose");

const reportsSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    responder: String,
    type: String,
    location: String,
    address: String,
    status: String,
    report_date_time: { type: Date },
    respond_date_time: { type: Date },
    completion_date_time: { type: Date },
    images: [String],
    description: {
        fire_type: String,
        severity: String,
        visible_flames: String,
        smoke: String,
        crime_type: String,
        in_progress: String,
        collision_type: String,
        severity_of_accident: String,
        blocked_road: String,
        number_of_people_involved: String,
        medical_emergency_type: String,
        consciousness: String,
        hazard_type: String,
        assistance_type: String,
        urgency_level: String,
        additional_description: String,
        deny_description: String
    },
}, { timestamps: true });

const reportsModel = mongoose.model("reports", reportsSchema);

module.exports = reportsModel;
