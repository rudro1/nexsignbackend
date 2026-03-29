const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized: No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      const msg = err.name === 'TokenExpiredError' 
        ? 'Session expired. Please log in again.' 
        : 'Invalid token. Please log in again.';
      return res.status(401).json({ success: false, message: msg });
    }
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

module.exports = auth;
