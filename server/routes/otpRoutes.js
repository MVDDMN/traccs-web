const express = require('express');
const textlink = require('textlink-sms');
const adminModel = require('../models/admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const router = express.Router();

// Initialize the Textlink API with the provided key
textlink.useKey(process.env.TEXTLINKSMS_API_KEY);

// Route for sending OTP via SMS (Forgot password)
router.post('/sms-forgot-password', async (req, res) => {
    const { phoneNumber, email } = req.body;

    if (!phoneNumber) {
        console.error("Mobile number is missing in the request body.");
        return res.status(400).json({ message: 'Mobile number is required' });
    }

    if (!email) {
        console.error("Email is missing in the request body.");
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Find the admin using the provided phoneNumber and email
        const foundAdmin = await adminModel.findOne({ contact: phoneNumber, email: email }).exec();

        if (!foundAdmin) {
            console.error(`Admin not found with phoneNumber: ${phoneNumber} and email: ${email}`);
            return res.status(400).json({ message: 'Admin with provided phoneNumber and email not found' });
        }

        // Set expiration time (e.g., 10 minutes)
        const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Set options for SMS service
        const verificationOptions = {
            service_name: 'TRACCS',
            expiration_time: 10 * 60 * 1000, // 10 minutes expiration time
            source_country: 'PH',
        };

        // Send OTP via Textlink SMS service
        const result = await textlink.sendVerificationSMS(phoneNumber, verificationOptions);

        // Check the result from the SMS service
        if (!result.ok) {
            console.error(`Failed to send verification SMS to ${phoneNumber}:`, result);
            return res.status(400).json({ message: 'Code unable to be sent to phoneNumber' });
        }

        res.status(200).json({ message: 'Code sent to phoneNumber' });

    } catch (error) {
        console.error("Error in smsForgotPassword:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Route for verifying OTP
router.post('/verify-sms-forgot-password', async (req, res) => {
    const { mobile, code } = req.body;

    if (!mobile || !code) {
        return res.status(400).json({ message: 'Mobile number and code are required' });
    }

    try {
        // Find the admin by mobile number
        const foundAdmin = await adminModel.findOne({ contact: mobile }).exec();

        if (!foundAdmin) {
            return res.status(400).json({ message: 'Admin not found' });
        }

        // Verify the OTP using the external service (Textlink)
        const result = await textlink.verifyCode(mobile, code);

        if (!result.ok) {
            return res.status(400).json({ message: 'Unsuccessful Verification' });
        }

        // OTP verified successfully, proceed with returning the userId
        res.status(200).json({
            message: 'OTP verified successfully!',
            userId: foundAdmin._id,  // Return the userId in the response
        });
    } catch (error) {
        console.error('Error in OTP verification:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Route to verify if phone number and email exist in the database
router.post('/verify-phone-and-email', async (req, res) => {
    const { phoneNumber, email } = req.body;

    // Validate phone number format (should start with +63 and be followed by 9 digits)
    const phoneRegex = /^\+63\d{10}$/;

    if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ message: 'Invalid phone number format. It should start with +63 and contain only numbers.' });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA0-9]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    try {
        // Query to check if both phone number and email exist in the database
        const user = await adminModel.findOne({ contact: phoneNumber, email });

        if (user) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(404).json({
                exists: false,
                message: 'Neither the phone number nor the email matches any account.'
            });
        }
    } catch (error) {
        console.error('Error verifying phone number and email:', error);
        return res.status(500).json({ message: 'Error verifying phone number and email.' });
    }
});

// Endpoint to change password
router.post('/change-password', async (req, res) => {
    const { contact, newPassword } = req.body;

    // Validate the input
    if (!contact || !newPassword) {
        return res.status(400).json({ message: 'Phone number and new password are required.' });
    }

    try {
        // Find the admin by contact (mobile number)
        const admin = await adminModel.findOne({ contact });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the admin's password
        admin.password = hashedPassword;

        // Save the updated admin record
        await admin.save();

        // Send success response
        return res.status(200).json({ message: 'Password changed successfully!' });
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ message: 'An error occurred while changing the password.' });
    }
});

router.post("/change-password-new", async (req, res) => {
    const { userId, newPassword } = req.body;

    try {
        // Validate the new password (optional, e.g., minimum length check)
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json("Password must be at least 6 characters long.");
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password and set status to "Ok"
        const user = await adminModel.findByIdAndUpdate(userId, {
            password: hashedPassword,
            status: "Ok"  // Set status to "Ok" after successful password change
        }, { new: true });

        if (!user) {
            return res.status(404).json("User not found.");
        }

        res.json({ message: "Password updated successfully and status set to 'Ok'." });
    } catch (err) {
        console.error("Error updating password:", err);
        res.status(500).json("Internal server error");
    }
});


module.exports = router;
