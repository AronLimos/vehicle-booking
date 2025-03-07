const express = require('express');
const Shop = require('../models/Shop');

const router = express.Router();

// Create a new shop
router.post('/', async (req, res) => {
    try {
        const newShop = new Shop(req.body);
        await newShop.save();
        res.status(201).json(newShop);
    } catch (error) {
        res.status(500).json({ message: 'Error creating shop' });
    }
});

// Get all shops
router.get('/', async (req, res) => {
    const shops = await Shop.find();
    res.json(shops);
});

module.exports = router;
