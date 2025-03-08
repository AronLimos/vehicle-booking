const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },
    password: String,
    role: { type: String, enum: ['customer', 'owner', 'admin'], default: 'customer' }
});

module.exports = mongoose.model('User', UserSchema);
