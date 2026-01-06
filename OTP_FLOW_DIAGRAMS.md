# OTP Flow Diagrams & Architecture

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    HRMS Portal - OTP System                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Frontend App   │
│  (React/Vite)   │
└────────┬────────┘
         │
    ┌────▼────────────────────────────────────────────┐
    │                                                 │
    │  ┌──────────────┐  ┌──────────────────────┐    │
    │  │  Register    │  │  Profile             │    │
    │  │  Component   │  │  Component           │    │
    │  └──────┬───────┘  └────────┬─────────────┘    │
    │         │                   │                  │
    │         └──────┬────────────┘                  │
    │                │                              │
    │         ┌──────▼──────────────┐               │
    │         │  OTPVerification    │               │
    │         │  Component          │               │
    │         │  (Separated CC+Phone)               │
    │         └──────┬──────────────┘               │
    │                │                              │
    └────────────────┼──────────────────────────────┘
                     │
                ┌────▼───────────────────────────┐
                │                                │
                │  API Calls                     │
                │  ├─ POST /api/otp/request      │
                │  ├─ POST /api/otp/verify       │
                │  └─ POST /api/otp/verify-and-update
                │                                │
                └────┬───────────────────────────┘
                     │
         ┌───────────▼──────────────┐
         │                          │
         │  Backend Node.js Server  │
         │                          │
         │  ┌─────────────────────┐ │
         │  │  OTP Controller     │ │
         │  │  & Services         │ │
         │  └──────────┬──────────┘ │
         │             │            │
         │  ┌──────────▼──────────┐ │
         │  │  MongoDB Database   │ │
         │  │  ├─ Users Collection│ │
         │  │  └─ OTP Collection  │ │
         │  └─────────────────────┘ │
         │                          │
         └──────────────────────────┘
```

---

## Registration Flow with OTP

```
┌─────────────────────────────────────────────────────────────────┐
│                   REGISTRATION FLOW                             │
└─────────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌─────────────────────────────┐
│ User fills Registration Form│
│ • First Name                │
│ • Last Name                 │
│ • Email                     │
│ • Password                  │
│ • Confirm Password          │
└──────────────┬──────────────┘
               │
               ▼
        ┌──────────────┐
        │ Click Register│
        └───────┬──────┘
                │
                ▼
    ┌──────────────────────────┐
    │ OTP Modal Appears        │
    │ "Verify Phone Number"    │
    └───────┬──────────────────┘
            │
            ▼
    ┌──────────────────────────────┐
    │ USER ENTERS PHONE DATA        │
    │ ┌──────────────────────────┐  │
    │ │ Country Code: +1         │  │
    │ │ Phone Number: 5551234567 │  │
    │ │ Button: Send OTP         │  │
    │ └──────────────────────────┘  │
    └───────┬──────────────────────┘
            │
            ▼
    ┌──────────────────────────────┐
    │ FULL PHONE: "+1 5551234567"  │
    │ SEND TO: /api/otp/request    │
    └───────┬──────────────────────┘
            │
            ▼
    ┌──────────────────────────────┐
    │ Backend Generates OTP        │
    │ (Logged in console)          │
    │ Example: 123456             │
    │ Expires: 10 minutes         │
    │ Max Attempts: 5             │
    └───────┬──────────────────────┘
            │
            ▼
    ┌──────────────────────────────┐
    │ USER ENTERS 6-DIGIT OTP      │
    │ ┌──────────────────────────┐  │
    │ │ OTP: [  1  2  3  4  5  6]  │
    │ │ Button: Verify OTP       │  │
    │ └──────────────────────────┘  │
    └───────┬──────────────────────┘
            │
            ▼
    ┌──────────────────────────────┐
    │ VERIFY OTP: /api/otp/verify  │
    │ Body: {                      │
    │   phoneNumber: "+1 555...",  │
    │   otp: "123456"              │
    │ }                            │
    └───────┬──────────────────────┘
            │
        ┌───┴────────────────┐
        │                    │
    [VALID]            [INVALID]
        │                    │
        ▼                    ▼
   SUCCESS           ┌──────────────┐
        │            │ Show Error   │
        │            │ Attempts: 4/5│
        │            │ Retry or     │
        │            │ Change Phone │
        │            └──────────────┘
        │                    │
        │                    └──────┐
        ▼                           │
┌──────────────────────────────┐  │
│ CREATE USER ACCOUNT          │  │
│ POST /auth/register {        │  │
│   firstName: "John",         │  │
│   lastName: "Doe",           │  │
│   email: "john@...",         │  │
│   password: "hash...",       │  │
│   phone: "+1 555...",  ◄─────┼──┤
│   phoneVerified: true  ◄─────┘  │
│ }                            │  │
└──────────────┬───────────────┘  │
               │                  │
               ▼                  │
    ┌──────────────────┐          │
    │ User Created ✓   │          │
    │ JWT Token Gen    │          │
    │ Login User       │          │
    └────────┬─────────┘          │
             │                    │
             ▼                    │
    ┌──────────────────┐          │
    │ Redirect to      │          │
    │ Dashboard        │          │
    │ ✓ Phone: Verified           │
    └──────────────────┘          │
                                  │
                                  ▼
                            ┌──────────────┐
                            │ Max Attempts │
                            │ Exceeded?    │
                            │ Redirect to  │
                            │ Login Page   │
                            └──────────────┘
                                  │
                                  ▼
                                 END
```

---

## Profile Update with OTP Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              PROFILE UPDATE WITH PHONE CHANGE                   │
└─────────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌──────────────────────────────────┐
│ User on Profile Page             │
│ Current Phone: "+1 5551112222"   │
│ Status: ✓ Verified               │
└───────────┬──────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│ USER UPDATES PHONE               │
│ Country Code Dropdown: +44 ◄─NEW │
│ Phone Field: 2071838750    ◄─NEW │
│ Button: Save Changes       │
└───────────┬──────────────────────┘
            │
            ▼
        ┌──────────────────────┐
        │ Form Validation      │
        │ • First Name OK      │
        │ • Last Name OK       │
        │ • Department OK      │
        │ • Phone CHANGED! ◄───┤
        └───────┬──────────────┘
                │
        ┌───────▼────────┐
        │ Phone Changed? │
        └───┬────────┬───┘
       YES │        │ NO
          │        │
    ┌─────▼──┐  ┌──▼────────────┐
    │ Show   │  │ Update Profile │
    │ OTP    │  │ (Normal Update)│
    │ Modal  │  └────────────────┘
    └────┬───┘
         │
         ▼
    ┌────────────────────────────────┐
    │ OTP VERIFICATION MODAL         │
    │                                │
    │ Pre-filled Data:               │
    │ ┌──────────────────────────┐   │
    │ │ Country Code: +44  ◄─PRE │   │
    │ │ Phone: 2071838750  ◄─PRE │   │
    │ │ Button: Send OTP         │   │
    │ └──────────────────────────┘   │
    └────┬─────────────────────────────┘
         │
         ▼
    ┌───────────────────────────────┐
    │ SEND OTP REQUEST              │
    │ Combine: "+44 2071838750"     │
    │ POST /api/otp/request         │
    └────┬────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────┐
    │ Backend Generates OTP        │
    │ (Logged in console)          │
    │ Stored in DB with 10min TTL  │
    └────┬─────────────────────────┘
         │
         ▼
    ┌──────────────────────────────┐
    │ USER ENTERS OTP              │
    │ ┌──────────────────────────┐  │
    │ │ OTP: [  1  2  3  4  5  6]  │
    │ │ Display: "+44 2071838750"  │
    │ │ Btn: Verify OTP          │  │
    │ └──────────────────────────┘  │
    └────┬─────────────────────────┘
         │
         ▼
    ┌──────────────────────────────┐
    │ POST /api/otp/verify-and-update │
    │ Headers: Authorization: Bearer   │
    │ Body: {                          │
    │   phoneNumber: "+44 207...",     │
    │   otp: "123456"                  │
    │ }                                │
    └────┬─────────────────────────────┘
         │
     ┌───┴──────────────┐
     │                  │
  [VALID]           [INVALID]
     │                  │
     ▼                  ▼
┌─────────────────┐ ┌──────────────┐
│ Update User:    │ │ Show Error   │
│ • phone: "+44.."│ │ Attempts: 4/5│
│ • phoneVerified:│ │ Resend OTP   │
│   true   ◄─NEW  │ │ Change Number│
│ Return updated  │ └──────────────┘
│ user object     │        │
└────┬────────────┘        │
     │                     │
     ▼                     │
┌──────────────────────┐  │
│ UPDATE PROFILE       │  │
│ • firstName, lastname│  │
│ • department, etc    │  │
│ • phone: "+44 207.." │  │
│ • phoneVerified: true│  │
└────┬─────────────────┘  │
     │                    │
     ▼                    │
┌──────────────────────┐  │
│ SUCCESS MESSAGE      │  │
│ "Profile Updated"    │  │
│                      │  │
│ Status Badge shows:  │  │
│ ✓ Verified (Green)   │  │
│                      │  │
│ Original Phone:      │  │
│ ⏳ Awaiting Verif...  │  │
└────┬─────────────────┘  │
     │                    │
     ▼                    │
┌──────────────────────┐  │
│ User redirected to   │  │
│ Profile page         │  │
│ Shows all updates    │  │
│ New phone verified   │  │
│ badge displays       │  │
└──────────────────────┘  │
                          ▼
                    ┌──────────────┐
                    │ Max Attempts │
                    │ Exceeded     │
                    │ Modal closes │
                    │ Changes lost │
                    └──────────────┘
```

---

## Phone Verification State Machine

```
                    ┌──────────────────┐
                    │   NO PHONE SET   │
                    └────────┬─────────┘
                             │
                    ┌────────▼────────┐
                    │ User Enters     │
                    │ Phone Number    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   VERIFICATION  │
                    │   IN PROGRESS   │
                    │                 │
                    │ Waiting for OTP │
                    │ Max 5 attempts  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        │              OTP Verified         OTP Failed
        │                    │           (5 attempts)
        │                    │                    │
        ▼                    ▼                    ▼
    ┌────────┐        ┌─────────────┐     ┌──────────────┐
    │VERIFIED│        │   VERIFIED  │     │   REJECTED   │
    │        │        │   & SAVED   │     │   Try Again  │
    │✓ Green │        │   (Update   │     │   ⏳ Try Later│
    │Badge   │        │   Complete) │     │   Amber Badge│
    │        │        │             │     │              │
    └────────┘        └─────────────┘     └──────────────┘
         ▲                  ▲                     │
         │                  │                     │
         └──────────────────┴─────────────────────┘
                    │
                    ▼
            ┌───────────────┐
            │ State Persists│
            │ In Database   │
            │ & Auth Context│
            └───────────────┘
```

---

## Component Prop Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  COMPONENT PROP STRUCTURE                       │
└─────────────────────────────────────────────────────────────────┘

Register.jsx
│
└─► OTPVerification.jsx
    Props: {
      phoneNumber: undefined,          (user enters)
      countryCode: undefined,          (user enters)
      isProfileUpdate: false,
      onSuccess: handleVerifyOTP,
      onCancel: handleCloseModal
    }
    States: {
      step: 'phone' ─────► 'otp'
      phoneNumber: "",
      countryCode: "+1",
      otp: "",
      loading: false,
      error: "",
      success: ""
    }


Profile.jsx
│
└─► OTPVerification.jsx
    Props: {
      phoneNumber: "+1 5551234567",    (pre-filled)
      countryCode: "+1",               (pre-filled)
      isProfileUpdate: true,           ◄─ Key difference
      onSuccess: handleOTPVerificationSuccess,
      onCancel: handleCancel
    }
    States: {
      step: 'otp'                      (starts at OTP since phone provided)
      phoneNumber: "5551234567",
      countryCode: "+1",
      otp: "",
      loading: false,
      error: "",
      success: ""
    }
```

---

## Data Format Examples

```
PHONE NUMBER FORMATS:
═══════════════════

Input Fields (Separate):
├─ Country Code: "+1"
├─ Phone Number: "5551234567"
└─ Combined for API: "+1 5551234567"

Stored in Database:
├─ User.phone: "+1 5551234567"
├─ User.phoneVerified: true
└─ OTP.phoneNumber: "+1 5551234567"

API Requests:
├─ POST /api/otp/request
│  └─ { phoneNumber: "+1 5551234567" }
├─ POST /api/otp/verify
│  └─ { phoneNumber: "+1 5551234567", otp: "123456" }
└─ POST /api/otp/verify-and-update
   └─ { phoneNumber: "+1 5551234567", otp: "123456" }

Response Examples:
├─ Success: { message: "...", phoneNumber: "67", verified: true }
├─ Error: { message: "Invalid OTP", attemptsLeft: 2 }
└─ Update: { message: "...", user: { phone: "+1 555...", phoneVerified: true } }
```

---

## Status Badge Display Logic

```
Profile Page Phone Section:

┌──────────────────────────────────────────┐
│ Phone                                    │
│                                          │
│ Condition: user.phoneVerified === true   │
│ Badge: ✓ Verified                        │
│ Style: .phone-status.verified            │
│ Color: Green (#dcfce7 bg, #166534 text)  │
│                                          │
├──────────────────────────────────────────┤
│ Phone                                    │
│                                          │
│ Condition: user.phoneVerified === false  │
│ Badge: ⏳ Awaiting Verification           │
│ Style: .phone-status.pending             │
│ Color: Amber (#fef3c7 bg, #b45309 text)  │
│                                          │
├──────────────────────────────────────────┤
│ Phone                                    │
│                                          │
│ Condition: originalPhone === "" (empty)  │
│ Badge: (Hidden - no badge shown)         │
│ Display: Just label and input field      │
│                                          │
└──────────────────────────────────────────┘
```

---

**Last Updated:** January 6, 2026
**Status:** ✅ Complete & Documented
