const OTP = require('../models/OTP');

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS (mock implementation - use Twilio, AWS SNS, or similar in production)
const sendOTPViaSMS = async (phoneNumber, otp) => {
  try {
    // Mock implementation - logs OTP for demo purposes
    // In production, integrate with Twilio, AWS SNS, or similar service
    console.log(`[OTP Service] Sending OTP ${otp} to ${phoneNumber}`);
    
    // Example using Twilio (uncomment and configure when ready):
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: `Your HRMS Portal verification code is: ${otp}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });
    
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

// Create and send OTP
const createAndSendOTP = async (phoneNumber) => {
  try {
    // Delete any existing OTP for this phone number
    await OTP.deleteMany({ phoneNumber });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    // Save OTP to database
    const otpRecord = new OTP({
      phoneNumber,
      otp,
      expiresAt
    });

    await otpRecord.save();

    // Send OTP via SMS
    const sent = await sendOTPViaSMS(phoneNumber, otp);
    
    if (!sent) {
      throw new Error('Failed to send OTP');
    }

    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error creating OTP:', error);
    throw error;
  }
};

// Verify OTP
const verifyOTP = async (phoneNumber, otp) => {
  try {
    const otpRecord = await OTP.findOne({ phoneNumber });

    if (!otpRecord) {
      return { success: false, message: 'OTP not found or expired' };
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return { success: false, message: 'OTP has expired' };
    }

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return { success: false, message: 'Maximum verification attempts exceeded' };
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return { success: false, message: 'Invalid OTP', attemptsLeft: 5 - otpRecord.attempts };
    }

    // OTP is correct
    otpRecord.isVerified = true;
    await otpRecord.save();

    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendOTPViaSMS,
  createAndSendOTP,
  verifyOTP
};
