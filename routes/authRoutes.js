const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController'); 

// লগইন রাউট
router.post('/login', login);

// রেজিস্ট্রেশন রাউট (এই লাইনটি আপনার কোডে মিসিং ছিল)
router.post('/register', register);

module.exports = router;