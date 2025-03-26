const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./controller/db'); 

dotenv.config();
connectDB();

const app = express();
app.use(express.json()); 
app.use(cors());

// Register routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/shops', require('./routes/shopRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

app.get('/', (req, res) => res.send('API Running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//Route testings
console.log(" Listing All Registered Routes:");
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(`Registered Route: ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
        const routeBase = middleware.regexp.source.replace(/[^a-zA-Z0-9/]/g, ''); // Fix formatting
        middleware.handle.stack.forEach((nestedRoute) => {
            if (nestedRoute.route) {
                console.log(`Registered Nested Route: ${routeBase}${nestedRoute.route.path}`);
            }
        });
    }
});


