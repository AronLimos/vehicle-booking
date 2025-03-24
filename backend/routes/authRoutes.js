const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, adminKey, ownerKey } = req.body;

        //  Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        //  Prevent unauthorized registration for sensitive roles
        if (
            (role === "admin" && adminKey !== process.env.ADMIN_SECRET) ||
            (role === "owner" && ownerKey !== process.env.OWNER_SECRET)
        ) {
            return res.status(403).json({ message: "Unauthorized to register as admin or owner" });
        }

        //  Create new user with hashed password
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role
        });

        //  Save to database
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(" Login attempt for:", email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log(" User not found!");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log(" User found, checking password...");
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log(" Password does not match!");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log(" Login successful!");
        
        //Generate a JWT Token
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

         //Used for Debugging login roles//
        res.json({ token, role: user.role }); 
    } catch (error) {
        console.error(" Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
