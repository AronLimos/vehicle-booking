const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  serviceOffered: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true }
    }
  ],
  image: {
    type: String,
    default: ''
  },
  ownerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Shop', shopSchema);
