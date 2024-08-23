const express = require("express");
const requestsModel = require('../models/request');
const requestarchiveModel = require('../models/requestarchive');
const communityModel = require('../models/community');
const router = express.Router();

// Request Module - Show Requests
router.get("/requests", async (req, res) => {
    try {
        const requests = await requestsModel.find();
        res.json(requests);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

// Request Module - Edit requests
router.put("/requests/:id", async (req, res) => {
    const requestId = req.params.id;
    const updatedRequestData = req.body;

    // Ensure date_time is updated with current timestamp and formatted
    updatedRequestData.date_time = formatDate(new Date());

    try {
        const request = await requestsModel.findByIdAndUpdate(requestId, updatedRequestData, { new: true });
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }
        res.json(request);
    } catch (err) {
        console.error("Error updating request:", err);
        res.status(500).json("Internal server error");
    }
});

const formatDate = (date) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
    let formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

    formattedDate = formattedDate.replace(" at", "");

    return formattedDate;
};

// Request Module - Add requests
router.post("/requests", async (req, res) => {
    const { itemname, type, quantity, description, username, barangay } = req.body;
    // Define valid request types
    const validTypes = ["Food", "Non-Food", "Medical", "Hygiene", "Shelter", "Beverage", "Others", "Power", "Essentials", "Assistance"];

    // Ensure date_time is set with current timestamp and formatted
    const date_time = formatDate(new Date());

    try {
        // Validate request type
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: "Invalid request type" });
        }
        // Create a new request document
        const newRequest = new requestsModel({
            itemname,
            type,
            quantity,
            description,
            username,
            barangay,
            responder: "pending",
            date_time,
        });
        // Save the new request to the database
        await newRequest.save();
        // Send a success response
        res.status(201).json({ message: "Request added successfully" });
    } catch (err) {
        console.error("Error adding request:", err);
        res.status(500).json("Internal server error");
    }
});

// Request Module - Delete request
router.delete('/requests/:id', async (req, res) => {
    try {
        const requestId = req.params.id;

        // Find the request by its ID and delete it
        await requestsModel.findByIdAndDelete(requestId);

        // Respond with success message
        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
        // Handle errors
        console.error('Error deleting request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Request Module - Show community requests
router.get("/communities", async (req, res) => {
    try {
        const communities = await communityModel.find();
        res.json(communities);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

// Request Module - Show history requests
router.get("/requestarchives", async (req, res) => {
    try {
        const requestarchives = await requestarchiveModel.find();
        res.json(requestarchives);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

// Request Module - Respond to requests
router.post("/respond", async (req, res) => {
    const { requestId, responder } = req.body;
    try {
        // Find the request by ID
        const request = await requestsModel.findById(requestId);
        if (!request) {
            return res.status(404).json("Request not found");
        }
        // Create a new archive entry
        const archiveEntry = new requestarchiveModel({
            username: request.username,
            responder: responder, // Update responder to current user's barangay
            barangay: request.barangay,
            itemname: request.itemname,
            type: request.type,
            description: request.description,
            quantity: request.quantity,
            date_time: request.date_time
        });
        // Save the archive entry
        await archiveEntry.save();
        // Remove the request from the requests model
        await requestsModel.findByIdAndDelete(requestId);
        // Send response
        res.json("Request responded successfully and moved to archive");
    } catch (err) {
        console.error("Error responding to request:", err);
        res.status(500).json("Internal server error");
    }
});


module.exports = router;