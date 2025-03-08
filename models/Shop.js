const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: String,
    serviceOffered: [String],
    ownerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Shop', ShopSchema);
