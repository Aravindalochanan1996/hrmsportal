const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5 // Max 5 attempts
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Auto delete after expiration
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Auto delete after 10 minutes
  }
});

module.exports = mongoose.model('OTP', otpSchema);
