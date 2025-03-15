const express = require('express');
const Shop = require('../models/Shop');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

//  Ensure only owners or admins can create shops
router.post('/', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const { name, location, serviceOffered } = req.body;
        const shop = new Shop({ name, location, serviceOffered, ownerID: req.user.userId });

        await shop.save();
        res.status(201).json({ message: 'Mechanic shop created successfully', shop });
    } catch (error) {
        res.status(500).json({ message: 'Error creating shop' });
    }
});

// Get all shops
router.get('/', async (req, res) => {
    const shops = await Shop.find();
    res.json(shops);
});
// Get a single shop by ID
router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        res.json(shop);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving shop" });
    }
});

// Update an existing shop
router.put('/:id', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        // 🔹 If shop doesn't exist, return error
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        // 🔹 Ensure only the owner or admin can update the shop
        if (req.user.role !== 'admin' && shop.ownerID.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Forbidden: You can't edit this shop" });
        }

        // 🔹 Update the shop details
        const updatedShop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.json({ message: "Shop updated successfully", shop: updatedShop });
    } catch (error) {
        res.status(500).json({ message: "Error updating shop" });
    }
});

//Delete a shop (Admin only)
router.delete('/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        // 🔹 If shop doesn't exist, return error
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        // 🔹 Delete the shop
        await Shop.findByIdAndDelete(req.params.id);

        res.json({ message: "Mechanic shop deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting shop" });
    }
});

module.exports = router;
