'use strict';

const express    = require('express');
const rateLimit  = require('express-rate-limit');
const router     = express.Router();

const {
  login,
  register,
  googleAuth,
  getMe,
  updateProfile,
  changePassword,
  logout,
} = require('../controllers/authController');

const { auth } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════════
// RATE LIMITERS
// ═══════════════════════════════════════════════════════════════

// Strict — login / register / google (15 min, 15 attempts)
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             15,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator:    (req) =>
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip,
  message: {
    success: false,
    code:    'RATE_LIMITED',
    message: 'Too many attempts. Please try again after 15 minutes.',
  },
});

// Relaxed — profile updates (1 min, 30 attempts)
const updateLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             30,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    code:    'RATE_LIMITED',
    message: 'Too many requests. Please slow down.',
  },
});

// ═══════════════════════════════════════════════════════════════
// PUBLIC ROUTES (No auth required)
// ═══════════════════════════════════════════════════════════════

// POST /api/auth/register
router.post('/register', authLimiter, register);

// POST /api/auth/login
router.post('/login', authLimiter, login);

// POST /api/auth/google
router.post('/google', authLimiter, googleAuth);

// ═══════════════════════════════════════════════════════════════
// PROTECTED ROUTES (Auth required)
// ═══════════════════════════════════════════════════════════════

// GET /api/auth/me
router.get('/me', auth, getMe);

// PUT /api/auth/profile
router.put('/profile', auth, updateLimiter, updateProfile);

// PUT /api/auth/change-password
router.put('/change-password', auth, authLimiter, changePassword);

// POST /api/auth/logout
router.post('/logout', auth, logout);

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════
router.get('/health', (req, res) => {
  res.json({
    success:   true,
    status:    'Auth service OK',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;