const express = require("express");
const resourcesModel = require('../models/resources');
const donateModel = require('../models/donate');
const resourcearchiveModel = require('../models/resourcearchive');
const router = express.Router();

// Resource Module - Show resources
router.get("/resources", async (req, res) => {
    try {
        const resources = await resourcesModel.find();
        res.json(resources);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

// Resource Module - Add resources
router.post("/resources", async (req, res) => {
    const { itemname, type, quantity, description, username, barangay } = req.body;
    // Define valid resource types
    const validTypes = ["Food", "Non-Food", "Medical", "Hygiene", "Shelter", "Beverage", "Others", "Power", "Essentials"];
    try {
        // Validate resource type
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: "Invalid resource type" });
        }
        // Create a new resource document
        const newResource = new resourcesModel({
            itemname,
            type,
            quantity,
            description,
            username,
            barangay
        });
        // Save the new resource to the database
        await newResource.save();
        // Send a success response
        res.status(201).json({ message: "Resource added successfully" });
    } catch (err) {
        console.error("Error adding resource:", err);
        res.status(500).json("Internal server error");
    }
});

// Resource Module - Edit resources
router.put("/resources/:id", async (req, res) => {
    const resourceId = req.params.id;
    const updatedData = req.body;

    try {
        const resource = await resourcesModel.findByIdAndUpdate(resourceId, updatedData, { new: true });
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }
        res.json(resource);
    } catch (err) {
        console.error("Error updating resource:", err);
        res.status(500).json("Internal server error");
    }
});

// Resource Module - Delete resources
router.delete("/resources/:id", async (req, res) => {
    const resourceId = req.params.id;
    try {
        const deletedResource = await resourcesModel.findByIdAndDelete(resourceId);
        if (!deletedResource) {
            return res.status(404).json({ message: "Resource not found" });
        }
        res.json({ message: "Resource deleted successfully" });
    } catch (err) {
        console.error("Error deleting resource:", err);
        res.status(500).json("Internal server error");
    }
});

// Resource Module - Show donations
router.get("/donations", async (req, res) => {
    try {
        const donations = await donateModel.find();
        res.json(donations);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

// Resource Module - Update Donations
router.put('/donations/:id', async (req, res) => {
    const donationId = req.params.id;
    const updatedData = req.body;

    try {
        const donation = await donateModel.findByIdAndUpdate(donationId, updatedData, { new: true });
        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }
        res.json(donation);
    } catch (err) {
        console.error("Error updating donation:", err);
        res.status(500).json("Internal server error");
    }
});

// Archive a donation
router.post('/resourcearchive', async (req, res) => {
    try {
        // Create a new entry in the resourcearchive collection
        const archiveData = new resourcearchiveModel({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
            donationType: req.body.donationType,
            type: req.body.type,
            donationAmount: req.body.donationAmount,
            description: req.body.description,
            selectedBarangay: req.body.selectedBarangay,
            admin: req.body.admin,
        });

        await archiveData.save();

        res.status(200).json({ message: 'Donation archived successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to archive donation', error });
    }
});

// Delete a donation
router.delete('/donations/:id', async (req, res) => {
    try {
        const donationId = req.params.id;
        await donateModel.findByIdAndDelete(donationId);

        res.status(200).json({ message: 'Donation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete donation', error });
    }
});

router.get('/resourcehistory', async (req, res) => {
    try {
        const resources = await resourcearchiveModel.find(); // Fetch all records, sorted by date
        res.status(200).json(resources);
    } catch (error) {
        console.error("Error fetching resource history:", error);
        res.status(500).json({ message: 'Server error. Unable to retrieve resource history.' });
    }
});

module.exports = router;