const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const Review = require('../models/Review');

const router = express.Router();

//  Create a review
router.post('/', verifyToken, async (req, res) => {
    try {
        const { shopID, rating } = req.body;

        // 🔹 Ensure required fields are provided
        if (!shopID || !rating) {
            return res.status(400).json({ message: "Shop ID and rating are required" });
        }

        // 🔹 Extract `userID` from JWT Token
        if (!req.user || !req.user.userId) {
            return res.status(403).json({ message: "Unauthorized: User ID missing from token" });
        }

        const newReview = new Review({
            shopID,
            userID: req.user.userId, // ✅ Assign userID correctly
            rating
        });

        await newReview.save();
        res.status(201).json({ message: "Review submitted successfully", review: newReview });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: 'Error creating review', error: error.message });
    }
});

//  Get all reviews
router.get('/', verifyToken, async (req, res) => {
    try {
        const reviews = await Review.find().populate('shopID userID');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving reviews" });
    }
});

//  Get reviews for a specific shop
router.get('/shop/:shopID', verifyToken, async (req, res) => {
    try {
        const reviews = await Review.find({ shopID: req.params.shopID }).populate('userID');

        if (reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found for this shop" });
        }

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving reviews for shop" });
    }
});

//  Delete a review (Only review owner or admin)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Ensure only the owner of the review or an admin can delete it
        if (req.user.role !== 'admin' && review.userID.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Forbidden: You can't delete this review" });
        }

        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting review" });
    }
});

module.exports = router;
