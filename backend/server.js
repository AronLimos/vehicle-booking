const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Import MongoDB connection

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/users', require('../routes/userRoutes'));
app.use('/api/shops', require('../routes/shopRoutes'));
app.use('/api/bookings', require('../routes/bookingRoutes'));
app.use('/api/reviews', require('../routes/reviewRoutes'));

app.get('/', (req, res) => res.send('API Running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
