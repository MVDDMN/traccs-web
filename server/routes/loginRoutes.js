const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const adminModel = require('../models/admin');
const OtpModel = require('../models/otp');
const rateLimit = require('express-rate-limit');
const router = express.Router();
require('dotenv').config();

// Nodemailer transporter setup using Gmail with environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' for Gmail
    auth: {
        user: process.env.GMAIL_USER, // Email from .env
        pass: process.env.GMAIL_PASS  // App Password from .env
    }
});

// Route to check if "root" admin exists
router.get('/check-admin-root', async (req, res) => {
    try {
        const rootAdmin = await adminModel.findOne({ name: 'root' });
        if (rootAdmin) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error("Error checking root admin:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Limit requests to the send-otp route to 3 per minute per IP
const otpLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 3, // limit each IP to 3 requests per window
    message: 'Too many OTP requests from this IP, please try again after a minute',
});

// Send OTP Route using Gmail
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP via email
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. Please do not share this code with anyone.`,
    };

    try {
        // Store OTP in MongoDB
        await OtpModel.create({ email, otp });

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'OTP sent to your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    }
});

// Create Admin Route
router.post('/create-admin', async (req, res) => {
    const { email, password, contact, otp } = req.body;

    try {
        // Retrieve OTP from MongoDB
        const otpRecord = await OtpModel.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'OTP not found or expired.' });
        }

        // Validate OTP
        if (otp !== otpRecord.otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }

        // Proceed with creating the root admin if the OTP is correct
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new adminModel({
            name: 'root',
            username: 'root',
            email,
            contact: `+63${contact}`,
            password: hashedPassword,
            type: 'MDRRMO',
            barangay: 'MDRRMO',
        });

        await newAdmin.save();

        // Delete OTP after successful validation
        await OtpModel.deleteOne({ _id: otpRecord._id });

        res.json({ success: true, message: 'Admin account created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create account.' });
    }
});

router.post('/send-forgot-otp', async (req, res) => {
    const { email } = req.body;

    try {
        // Verify if the email is valid
        const user = await adminModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User with this email not found.' });
        }

        // Generate OTP and send email as before
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const mailOptions = {
            from: process.env.OUTLOOK_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. Please do not share this code with anyone.`,
        };

        // Store OTP in the database and send it via email
        await OtpModel.create({ email, otp });
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'OTP sent to your email.' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    }
});


// Route to verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const otpRecord = await OtpModel.findOne({ email }).sort({ createdAt: -1 });
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error verifying OTP.' });
    }
});

//Forget Password
router.post('/reset-password', async (req, res) => {
    const { email, password, otp } = req.body;

    try {
        // Step 1: Verify that the OTP is valid and has not expired
        const otpRecord = await OtpModel.findOne({ email }).sort({ createdAt: -1 });
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        // Step 2: Find the user by email
        const user = await adminModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found.' });
        }

        // Step 3: Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 4: Update the user's password field
        user.password = hashedPassword;
        await user.save();

        // Step 5: Clear the OTP after successful password reset
        await OtpModel.deleteOne({ _id: otpRecord._id });

        // Step 6: Send success response
        res.json({ success: true, message: 'Password reset successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ success: false, message: 'Error resetting password.' });
    }
});

// Login Module - Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await adminModel.findOne({ username });
        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                req.session.user = user;  // Set the user session
                res.json({ message: "Success", userId: user._id }); // Send user ID
            } else {
                res.status(401).json("Invalid username or password");
            }
        } else {
            res.status(401).json("Invalid username or password");
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json("Internal server error");
    }
});

// Login Module - Fetch user data
router.get("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await adminModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            name: user.name,
            barangay: user.barangay,
            type: user.type,
            username: user.username
        });
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Login Module - Logout
router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json("Failed to log out");
        }
        res.clearCookie('connect.sid');
        res.json("Logged out successfully");
    });
});

module.exports = router;