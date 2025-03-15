const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: 'Access Denied: No Token Provided' });
    }

    const token = authHeader.split(" ")[1]; // Extract the token
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid Token' });

        //  Accept both `userId` and `id` 
        req.user = { 
            userId: decoded.userId || decoded.id,  
            role: decoded.role 
        };

        if (!req.user.userId) {
            return res.status(403).json({ message: "Unauthorized: User ID missing from token" });
        }

        next();
    });
};

// Middleware to restrict access to specific roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };
