import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' or 'verify'
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(3);
  const [registrationData, setRegistrationData] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Store registration data and show OTP modal
    console.log('Showing OTP modal...');
    setRegistrationData(formData);
    setShowOTPModal(true);
    setPhoneNumber('');
    setOtp('');
    setOtpStep('phone');
    setOtpError('');
    setOtpAttempts(3);
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (!phoneNumber.trim()) {
      setOtpError('Please enter your phone number');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setOtpError('');
      setOtpStep('verify');
    } catch (err) {
      setOtpError(err.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (!otp.trim()) {
      setOtpError('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }

    setOtpLoading(true);
    try {
      // Verify OTP first
      const verifyResponse = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setOtpAttempts(verifyData.attemptsLeft || otpAttempts - 1);
        
        if (verifyData.attemptsLeft <= 0) {
          setOtpError('Maximum attempts exceeded. Please try again from login.');
          setTimeout(() => {
            setShowOTPModal(false);
            navigate('/login');
          }, 2000);
          return;
        }

        throw new Error(verifyData.message || 'Invalid OTP');
      }

      // OTP verified, now create account
      const registerResponse = await authService.register({
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        password: registrationData.password,
        phone: phoneNumber
      });

      // Login user
      login(registerResponse.data.user, registerResponse.data.token);
      setShowOTPModal(false);
      navigate('/dashboard');
    } catch (err) {
      setOtpError(err.message || 'Failed to verify OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowOTPModal(false);
    setPhoneNumber('');
    setOtp('');
    setOtpStep('phone');
    setOtpError('');
    setOtpAttempts(3);
    setRegistrationData(null);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">HRMS Portal</h1>
        <p className="auth-subtitle">Create your account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="John"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Verify Phone Number</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            {otpError && <div className="modal-error">{otpError}</div>}

            {otpStep === 'phone' ? (
              <form onSubmit={handleRequestOTP} className="modal-form">
                <div className="form-group">
                  <label htmlFor="phone">Enter Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={otpLoading}
                    required
                  />
                  <small>Include country code (e.g., +1 for USA)</small>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="modal-btn modal-btn-primary"
                >
                  {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="modal-form">
                <div className="form-group">
                  <label htmlFor="otp">Enter 6-Digit OTP</label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={otpLoading}
                    maxLength="6"
                    required
                  />
                  <small>OTP sent to {phoneNumber}</small>
                </div>

                <div className="modal-attempts">
                  <p className="attempts-text">
                    {otpAttempts > 0
                      ? `Attempts remaining: ${otpAttempts}`
                      : 'No attempts left'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otpAttempts <= 0}
                  className="modal-btn modal-btn-primary"
                >
                  {otpLoading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpStep('phone');
                    setOtp('');
                    setOtpError('');
                  }}
                  className="modal-btn modal-btn-secondary"
                >
                  Change Phone Number
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
