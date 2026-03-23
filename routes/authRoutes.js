// const express = require('express');
// const router = express.Router();
// const { login, register } = require('../controllers/authController'); 

// // লগইন রাউট
// router.post('/login', login);

// // রেজিস্ট্রেশন রাউট (এই লাইনটি আপনার কোডে মিসিং ছিল)
// router.post('/register', register);

// //google auth
// import { googleAuth } from "../controllers/authController.js";
// router.post("/google", googleAuth);

// export default router;

// module.exports = router;


const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login, register, googleAuth } = require('../controllers/authController');

/**
 * 1. Security: Rate Limiting
 * Prevents automated scripts from brute-forcing passwords or spamming registration.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: {
    success: false,
    message: "Too many attempts from this IP, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 2. Routes
 */

// POST /api/auth/login
// We apply the limiter here specifically to protect against password guessing
router.post('/login', authLimiter, login);

// POST /api/auth/register
router.post('/register', authLimiter, register);

// POST /api/auth/google
// Google Auth is generally safer, but limiting prevents account creation spam
router.post('/google', authLimiter, googleAuth);

module.exports = router;