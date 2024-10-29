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
    report_date_time: { type: Date, index: true },
    respond_date_time: { type: Date, index: true },
    completion_date_time: { type: Date, index: true },
    images: [String],
    description: {
        //Fire
        fire_type: String,
        severity: String,
        visible_flames: String,
        smoke: String,
        //Police
        in_progress: String,
        //Accident
        collision_type: String,
        blocked_road: String,
        number_of_people_involved: String,
        severity_of_accident: String,
        //Medical
        medical_emergency_type: String,
        consciousness: String,
        //hazard
        hazard_type: String,
        //Assistance
        assistance_type: String,
        urgency_level: String,
        //General
        additional_description: String,
        deny_description: String
    },
}, { timestamps: true });

const reportsModel = mongoose.model("reports", reportsSchema);

module.exports = reportsModel;
