const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  serviceOffered: [{ type: String }],
  ownerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, required: false } 
});

module.exports = mongoose.model('Shop', ShopSchema);
