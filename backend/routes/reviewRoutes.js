const express = require('express');
const Review = require('../backend/models/Review');

const router = express.Router();

// Create a review
router.post('/', async (req, res) => {
    try {
        const newReview = new Review(req.body);
        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ message: 'Error creating review' });
    }
});

// Get all reviews
router.get('/', async (req, res) => {
    const reviews = await Review.find().populate('shopID userID');
    res.json(reviews);
});

module.exports = router;
