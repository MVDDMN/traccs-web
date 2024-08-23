const mongoose = require("mongoose");

const archiveSchema = new mongoose.Schema({
    name: String,
    responder: String,
    type: String,
    location: String,
    address: String,
    status: String,
    report_date_time: String,
    respond_date_time: String,
    completion_date_time: String,
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
        additional_description: String
    },
});

const archiveModel = mongoose.model("archives", archiveSchema);

module.exports = archiveModel;
