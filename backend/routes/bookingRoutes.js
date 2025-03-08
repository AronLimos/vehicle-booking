const express = require('express');
const Booking = require('../backend/models/Booking');

const router = express.Router();

// Create a new booking
router.post('/', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking' });
    }
});

// Get all bookings
router.get('/', async (req, res) => {
    const bookings = await Booking.find().populate('userID shopID');
    res.json(bookings);
});

module.exports = router;
