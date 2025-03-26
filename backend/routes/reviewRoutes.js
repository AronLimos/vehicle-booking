const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { verifyToken } = require('../middleware/authMiddleware');

//  Create a new review
router.post('/', verifyToken, async (req, res) => {
  try {
    const { shopId, rating, comment } = req.body;

    const review = new Review({
      userID: req.user.userId, // taken from token
      shopID: shopId,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ message: "Review creation failed" });
  }
});

//  Get all reviews (Admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }

    const reviews = await Review.find()
      .populate('userID', 'firstName lastName')
      .populate('shopID', 'name');

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Get all reviews by the logged-in user
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userReviews = await Review.find({ userID: req.user.userId })
      .populate('userID', 'firstName lastName')       
      .populate('shopID', 'name');      

    res.json(userReviews);
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    res.status(500).json({ message: 'Failed to fetch user reviews' });
  }
});


//  Get reviews for a specific shop (for modal display)
router.get('/:shopID', async (req, res) => {
  try {
    const reviews = await Review.find({ shopID: req.params.shopID })
      .populate('userID', 'firstName lastName');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

//  Delete review (Admin or user who posted it)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (req.user.role !== 'admin' && review.userID.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review' });
  }
});

// GET average rating for a specific shop
router.get('/average/:shopID', async (req, res) => {
  try {
    const shopID = req.params.shopID;
    const result = await Review.aggregate([
      { $match: { shopID: require('mongoose').Types.ObjectId(shopID) } },
      { $group: { _id: "$shopID", averageRating: { $avg: "$rating" } } }
    ]);

    const avg = result[0]?.averageRating || 0;
    res.json({ averageRating: avg });
  } catch (err) {
    console.error("Error calculating average rating:", err);
    res.status(500).json({ message: "Error getting average rating" });
  }
});

module.exports = router;
