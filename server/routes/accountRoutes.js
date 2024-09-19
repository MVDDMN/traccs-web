const express = require("express");
const bcrypt = require("bcryptjs");
const adminModel = require('../models/admin');
const usersModel = require('../models/users');
const nodemailer = require("nodemailer");
const router = express.Router();

// Nodemailer transporter setup using Outlook with environment variables
const transporter = nodemailer.createTransport({
    service: 'hotmail', // Use 'hotmail' for Outlook
    auth: {
        user: process.env.OUTLOOK_USER, // Email from .env
        pass: process.env.OUTLOOK_PASS  // Password or App Password from .env
    }
});

// Account Module - Send verification email
router.post('/users/:id/send-verification-email', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await usersModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const mailOptions = {
            from: process.env.OUTLOOK_USER,
            to: user.email,
            subject: 'Account Status Update',
            text: req.body.message // Use the message from the request body
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: 'Error sending verification email', error });
    }
});

// Accounts Module - Show admins
router.get("/administrators", async (req, res) => {
    try {
        const admins = await adminModel.find();
        res.json(admins);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

// Accounts Module - Add admin
router.post('/administrators', async (req, res) => {
    try {
        const { name, email, username, password, barangay, type, contact } = req.body; // Include contact

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new adminModel({
            name,
            email,
            username,
            password: hashedPassword,
            barangay,
            type,
            contact // Save contact
        });

        await newAdmin.save();
        res.status(201).json(newAdmin);
    } catch (error) {
        console.error("Error adding administrator:", error); // Log the error
        res.status(500).json({ error: error.message });
    }
});

// Accounts Module - Update admin
router.put('/administrators/:id', async (req, res) => {
    const adminId = req.params.id;
    const { name, email, username, password, barangay, type, contact } = req.body; // Include contact

    try {
        const admin = await adminModel.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Only hash the password if it is being updated
        if (password) {
            admin.password = await bcrypt.hash(password, 10);
        }

        admin.name = name || admin.name;
        admin.email = email || admin.email;
        admin.username = username || admin.username;
        admin.barangay = barangay || admin.barangay;
        admin.type = type || admin.type;
        admin.contact = contact || admin.contact; // Correct the typo

        const updatedAdmin = await admin.save();

        res.json(updatedAdmin);
    } catch (err) {
        console.error("Error updating administrator:", err); // Log the error
        res.status(500).json({ error: err.message });
    }
});

// Account Module - Check Duplicates
router.post('/check-duplicate', async (req, res) => {
    const { username, email, contact } = req.body; // Include contact for potential duplication check

    try {
        // Check if either username, email, or contact exists
        const existingAdmin = await adminModel.findOne({
            $or: [{ username }, { email }, { contact }] // Check for duplicates
        });

        if (existingAdmin) {
            return res.status(400).json({ message: 'Username, email, or contact already exists' });
        }

        return res.status(200).json({ message: 'Available' });
    } catch (error) {
        console.error("Error checking duplicate:", error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Accounts Module - Delete admin
router.delete('/administrators/:id', async (req, res) => {
    const adminId = req.params.id;
    try {
        const deletedAdmin = await adminModel.findByIdAndDelete(adminId);
        if (!deletedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.json({ message: "Admin deleted successfully" });
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

// Accounts Module - Show users
router.get("/users", async (req, res) => {
    try {
        const users = await usersModel.find();
        res.json(users);
    } catch (err) {
        res.status(500).json("Internal server error");
    }
});

// Account Module - Update user status (verify/unverify)
router.put('/users/:id/status', async (req, res) => {
    try {
        const userId = req.params.id;
        const newStatus = req.body.status; // e.g., "Verified" or "Unverified"

        const updatedUser = await usersModel.findByIdAndUpdate(
            userId,
            { status: newStatus },
            { new: true }
        );

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user status', error });
    }
});

// Account Module - Delete user by ID
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await usersModel.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
});

module.exports = router;
