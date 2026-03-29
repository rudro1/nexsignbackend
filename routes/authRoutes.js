const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { 
  login, 
  register, 
  googleAuth, 
} = require('../controllers/authController');

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: "Too many attempts, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.post('/google', authLimiter, googleAuth);

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'Auth OK', timestamp: Date.now() });
});

module.exports = router;
