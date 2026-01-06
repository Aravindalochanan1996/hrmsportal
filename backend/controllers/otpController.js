const User = require('../models/User');
const { createAndSendOTP, verifyOTP } = require('../services/otpService');

// Request OTP for phone verification
exports.requestOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !phoneNumber.trim()) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Create and send OTP
    await createAndSendOTP(phoneNumber);

    res.json({ 
      message: 'OTP sent successfully. Please check your phone.',
      phoneNumber: phoneNumber.slice(-4) // Return last 4 digits for confirmation
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// Verify OTP and update user
exports.verifyOTPAndUpdatePhone = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const userId = req.userId;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    // Verify OTP
    const otpResult = await verifyOTP(phoneNumber, otp);
    
    if (!otpResult.success) {
      return res.status(400).json({ 
        message: otpResult.message,
        attemptsLeft: otpResult.attemptsLeft 
      });
    }

    // Update user's phone and mark as verified
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        phone: phoneNumber, 
        phoneVerified: true,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Phone number verified successfully', 
      user 
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify OTP without updating user (for registration)
exports.verifyOTPOnly = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    // Verify OTP
    const otpResult = await verifyOTP(phoneNumber, otp);
    
    if (!otpResult.success) {
      return res.status(400).json({ 
        message: otpResult.message,
        attemptsLeft: otpResult.attemptsLeft 
      });
    }

    res.json({ 
      message: 'OTP verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
