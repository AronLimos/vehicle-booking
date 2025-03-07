const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopID: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    service: String,
    dateTime: Date,
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'canceled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' }
});

module.exports = mongoose.model('Booking', BookingSchema);
