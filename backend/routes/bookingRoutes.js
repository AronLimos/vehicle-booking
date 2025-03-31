const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');

const router = express.Router();

// Create a new booking
router.post('/', verifyToken, async (req, res) => {
    try {
        const { userID, shopID, service, dateTime } = req.body;

        //Basic Validation
        if (!userID || !shopID || !service || !dateTime) {
            return res.status(400).json({ message: 'Missing required booking fields' });
        }

        const newBooking = new Booking({
            userID,
            shopID,
            service,
            dateTime,
            status: 'pending',
            paymentStatus: 'pending'
        });

        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        console.error('Booking Creation Error:', error);
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
});


//  Get all bookings
router.get('/', verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find().populate('userID shopID');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving bookings' });
    }
});

//  Update a booking (e.g., change status)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        // 🔹 If booking doesn't exist, return error
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // 🔹 Ensure only the owner of the booking or an admin can update it
        if (req.user.role !== 'admin' && booking.userID.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Forbidden: You can't modify this booking" });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.json({ message: "Booking updated successfully", booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ message: "Error updating booking" });
    }
});

// Cancel a booking (Customer, Admin, Owner)
// Cancel a booking (Customer, Admin, Owner)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow if user is admin, owner, or the one who made the booking
        if (
            req.user.role !== 'admin' &&
            req.user.role !== 'owner' &&
            booking.userID.toString() !== req.user.userId
        ) {
            return res.status(403).json({ message: 'Unauthorized to cancel this booking' });
        }

        // Delete the booking
        await booking.remove();

        res.json({ message: 'Booking canceled and deleted successfully' });
    } catch (error) {
        console.error('Cancel and Delete Booking Error:', error);
        res.status(500).json({ message: 'Error canceling and deleting booking' });
    }
});

module.exports = router;
