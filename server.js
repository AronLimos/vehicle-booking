const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Import MongoDB connection

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// Test Route
app.get('/', (req, res) => res.send('API Running...'));

// Set PORT from .env or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
