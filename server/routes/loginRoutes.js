const express = require("express");
const bcrypt = require("bcrypt");
const adminModel = require('../models/admin');
const router = express.Router();

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