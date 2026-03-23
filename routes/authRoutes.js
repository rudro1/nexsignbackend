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
  // skip: (req) => req.method === 'OPTIONS', // OPTIONS রিকোয়েস্ট স্কিপ করা নিরাপদ
});

// Routes
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.post('/google', authLimiter, googleAuth);

module.exports = router;