const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        //  Ensure password is hashed before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword, //  Always store the hashed password
            role
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user" });
    }
});

// ✅ Fix: Ensure `userId` is Used in Token Instead of `id`
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("🔍 Login attempt for:", email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User not found!");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("✅ User found, checking password...");
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("❌ Password does not match!");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("🎉 Login successful!");
        
        // ✅ Fix: Use `userId` instead of `id`
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    } catch (error) {
        console.error(" Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
