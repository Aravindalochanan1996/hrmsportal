# OTP Functionality Testing Guide

## Prerequisites
- Node.js installed
- MongoDB running locally (mongodb://localhost:27017/hrms)

## Step 1: Start the Backend Server

```bash
cd c:\Users\aravinalochanan\Projects\hrmsportal\backend
npm install
npm run dev
```

Expected output:
```
MongoDB connected
Server running on port 5000
```

## Step 2: Start the Frontend Development Server

In a new terminal:
```bash
cd c:\Users\aravinalochanan\Projects\hrmsportal\frontend
npm install
npm run dev
```

Expected output:
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

## Step 3: Test OTP in Registration Flow

1. Open browser: `http://localhost:3000`
2. Click "Register" or go to `/register`
3. Fill in registration form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: Test@123
   - Confirm Password: Test@123
4. Click "Register"
5. You should see the registration form with note about OTP verification
6. After clicking "Register" you can proceed to `/verify-otp` to test OTP

## Step 4: Test OTP Verification Page

1. Go to `http://localhost:3000/verify-otp`
2. Enter phone number with country code: `+1 5551234567`
3. Click "Send OTP"
4. **Check Backend Console** - You'll see the generated OTP logged like:
   ```
   [OTP Service] Sending OTP 123456 to +1 5551234567
   ```
5. Copy the OTP from console
6. Enter OTP in the form (6 digits)
7. Click "Verify OTP"
8. Success message should appear

## Step 5: Test OTP in Profile Update

1. Login first with an existing account or register new one
2. Go to `/profile`
3. Add or change your phone number in the "Phone" field
4. Click "Save Changes"
5. OTP verification modal should appear
6. Follow same steps as Step 4
7. After verification, profile updates automatically

## Troubleshooting

### Issue: OTP page shows but nothing happens when clicking buttons

**Solution**: Check browser console for errors (F12 > Console tab)

Common issues:
- Backend not running (check port 5000)
- MongoDB not connected
- API endpoint not accessible

### Issue: "Failed to send OTP" error

Check:
1. Backend server is running: `http://localhost:5000/api/otp/request` should respond
2. MongoDB is running
3. Check backend console for errors

### Issue: Phone number shows as "undefined" in OTP page

This is normal for standalone OTP page. The field should be empty and ready for input.

### Issue: After OTP verification, nothing happens

Check browser console for errors. The page might be trying to redirect but the route doesn't exist.

## Debug Mode

To see detailed logs:

**Backend**: Already logs OTP to console
- Look for: `[OTP Service] Sending OTP XXX to ...`

**Frontend**: Open DevTools (F12)
- Network tab: Check API calls to /api/otp/*
- Console tab: Check for JavaScript errors

## Production Setup (Important!)

When ready for production, replace the mock OTP service with real SMS provider:

In `backend/services/otpService.js`, update `sendOTPViaSMS()` function with:

```javascript
// Example using Twilio
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
await client.messages.create({
  body: `Your HRMS Portal verification code is: ${otp}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phoneNumber
});
```

Environment variables needed:
```
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890
```

## Expected Behavior Summary

✅ Registration → User enters info → Receives OTP → Verifies → Account created
✅ Profile Update → User changes phone → OTP required → Verifies → Profile updated
✅ Standalone OTP page → User can request and verify any phone number
✅ OTP expires after 10 minutes
✅ Max 5 failed attempts before reset required
