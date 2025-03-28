const express = require('express');
const Shop = require('../models/Shop');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const Review = require('../models/Review');
const router = express.Router();

//  Create a new shop (Admin or Owner only)
router.post('/', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const { name, location, serviceOffered, image } = req.body; 

        const shop = new Shop({
            name,
            location,
            serviceOffered,
            image,                            
            ownerID: req.user.userId
        });

        await shop.save();
        res.status(201).json({ message: 'Mechanic shop created successfully', shop });
    } catch (error) {
        console.error('Shop creation error:', error);
        res.status(500).json({ message: 'Error creating shop' });
    }
});

//  Get a single shop by ID
router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: "Shop not found" });
        res.json(shop);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving shop" });
    }
});

//  Update a shop (Admin or Owner only)
router.put('/:id', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        if (req.user.role !== 'admin' && shop.ownerID.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Forbidden: You can't edit this shop" });
        }

        const updatedShop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Shop updated successfully", shop: updatedShop });
    } catch (error) {
        res.status(500).json({ message: "Error updating shop" });
    }
});

//  Delete a shop (Admin only)
router.delete('/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        await Shop.findByIdAndDelete(req.params.id);
        res.json({ message: "Mechanic shop deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting shop" });
    }
});

// Get all shops with average rating and reviews
router.get('/', async (req, res) => {
    try {
      const shops = await Shop.find();
  
      const shopData = await Promise.all(
        shops.map(async (shop) => {
          // Fetch reviews for each shop
          const reviews = await Review.find({ shopID: shop._id }).populate('userID', 'email');
          const avgRating =
            reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);
  
          return {
            ...shop.toObject(),
            reviews,
            avgRating: parseFloat(avgRating.toFixed(1)),
          };
        })
      );
  
      res.json(shopData);
    } catch (error) {
      console.error("Error fetching shops with reviews:", error);
      res.status(500).json({ message: "Error fetching shops" });
    }
  });  

module.exports = router;
