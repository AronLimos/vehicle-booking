const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');

const router = express.Router();

//  Create a new booking
router.post('/', verifyToken, async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking' });
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

//  Delete (Cancel) a booking
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // 🔹 Ensure only the owner of the booking or an admin can delete it
        if (req.user.role !== 'admin' && booking.userID.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Forbidden: You can't cancel this booking" });
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error cancelling booking" });
    }
});

module.exports = router;
