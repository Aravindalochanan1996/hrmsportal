import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OTPVerification.css';

const OTPVerification = ({ phoneNumber: initialPhoneNumber, countryCode: initialCountryCode, isProfileUpdate = false, onSuccess, onCancel }) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');
  const [countryCode, setCountryCode] = useState(initialCountryCode || '+1');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(initialPhoneNumber ? 'otp' : 'phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    // Combine country code and phone number
    const fullPhoneNumber = countryCode + ' ' + phoneNumber;

    setLoading(true);
    try {
      const response = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhoneNumber })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setSuccess(`OTP sent to ${fullPhoneNumber}. Check your phone.`);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      // Combine country code and phone number
      const fullPhoneNumber = countryCode + ' ' + phoneNumber;
      const token = localStorage.getItem('token');
      const endpoint = user ? '/api/otp/verify-and-update' : '/api/otp/verify';
      const headers = {
        'Content-Type': 'application/json'
      };

      if (user && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ phoneNumber: fullPhoneNumber, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        setAttemptsLeft(data.attemptsLeft || 5);
        throw new Error(data.message || 'Failed to verify OTP');
      }

      setSuccess('Phone number verified successfully!');
      
      // Handle success based on context
      setTimeout(() => {
        if (isProfileUpdate && onSuccess) {
          onSuccess();
        } else if (user) {
          navigate('/profile');
        } else {
          navigate('/register');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setOtp('');
    setLoading(true);

    // Combine country code and phone number
    const fullPhoneNumber = countryCode + ' ' + phoneNumber;

    try {
      const response = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhoneNumber })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setSuccess('OTP resent successfully. Check your phone.');
      setAttemptsLeft(5);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="otp-header">
          <h1>Phone Verification</h1>
          <p>Verify your phone number with OTP</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {step === 'phone' ? (
          <form onSubmit={handleRequestOTP} className="otp-form">
            <div className="form-group">
              <label htmlFor="countryCode">Country Code</label>
              <input
                id="countryCode"
                type="text"
                placeholder="+1"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                disabled={loading}
                maxLength="5"
                required
              />
              <small>Enter country code (e.g., +1, +44, +91)</small>
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                required
              />
              <small>Enter your phone number without country code</small>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="otp-form">
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
                maxLength="6"
                required
              />
              <small>A 6-digit code was sent to {countryCode} {phoneNumber}</small>
            </div>

            <div className="otp-info">
              <p className="attempts-left">
                {attemptsLeft > 0 
                  ? `Attempts left: ${attemptsLeft}`
                  : 'Maximum attempts exceeded'}
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading || attemptsLeft <= 0}
              className="btn btn-primary"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button 
              type="button" 
              onClick={handleResendOTP}
              disabled={loading}
              className="btn btn-secondary"
            >
              Resend OTP
            </button>

            <button 
              type="button" 
              onClick={() => {
                if (isProfileUpdate && onCancel) {
                  onCancel();
                } else {
                  setStep('phone');
                  setOtp('');
                  setError('');
                  setSuccess('');
                }
              }}
              className="btn btn-text"
            >
              {isProfileUpdate ? 'Cancel' : 'Change Phone Number'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;
