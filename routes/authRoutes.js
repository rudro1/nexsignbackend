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

// ১. এখানে সব কন্ট্রোলার ফাংশন একবারই ইমপোর্ট করুন (Duplicate সরানো হয়েছে)
const { 
  login, 
  register, 
  googleAuth, 
  syncPassword 
} = require('../controllers/authController');

// Rate Limiter কনফিগারেশন
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: {
    success: false,
    message: "Too many attempts, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ২. Routes
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.post('/google', authLimiter, googleAuth);

// পাসওয়ার্ড সিংক্রোনাইজ করার জন্য
router.post('/sync-password', syncPassword);

module.exports = router;




// const express = require('express');
// const router = express.Router();
// const rateLimit = require('express-rate-limit');

// // ✅ Controllers
// const { 
//   login, 
//   register, 
//   googleAuth, 
//   syncPassword 
// } = require('../controllers/authController');

// // ✅ Rate Limiters
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 20, 
//   message: {
//     success: false,
//     message: "Too many attempts, please try again after 15 minutes."
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // ✅ EXTRA: Brute Force Protection (Login Only)
// const loginBruteForce = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 5, // 5 wrong passwords/hour
//   message: { success: false, message: "Account locked for 1 hour" },
//   keyGenerator: (req) => req.body.email?.toLowerCase() || req.ip
// });

// // ✅ Routes (Production Optimized)
// router.post('/login', [authLimiter, loginBruteForce], login);
// router.post('/register', authLimiter, register);
// router.post('/google', authLimiter, googleAuth);
// router.post('/sync-password', syncPassword); // No limit (internal)

// // ✅ Health Check
// router.get('/health', (req, res) => {
//   res.json({ status: 'Auth OK', timestamp: Date.now() });
// });

// module.exports = router;