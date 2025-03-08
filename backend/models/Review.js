const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    shopID: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: Number,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
