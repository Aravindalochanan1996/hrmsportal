const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requestOTP, verifyOTPAndUpdatePhone, verifyOTPOnly } = require('../controllers/otpController');

// Request OTP (no auth required)
router.post('/request', requestOTP);

// Verify OTP only (no auth required) - for registration flow
router.post('/verify', verifyOTPOnly);

// Verify OTP and update phone (authenticated) - for profile update
router.post('/verify-and-update', auth, verifyOTPAndUpdatePhone);

module.exports = router;
