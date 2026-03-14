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

const { login, register, googleAuth } = require('../controllers/authController');

// লগইন
router.post('/login', login);

// রেজিস্ট্রেশন
router.post('/register', register);

// Google Auth
router.post('/google', googleAuth);

module.exports = router;