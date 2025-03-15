const express = require('express');
const User = require('../models/User');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new user
router.post('/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Get all users
router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Admin-only route
router.get('/admin-dashboard', verifyToken, authorizeRoles('admin'), (req, res) => {
    res.json({ message: 'Welcome Admin' });
});

module.exports = router;
