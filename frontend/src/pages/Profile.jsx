import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { countryCodes } from '../utils/countryCodes';
import OTPVerification from './OTPVerification';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    countryCode: '+1',
    phone: '',
    department: '',
    designation: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [pendingPhoneData, setPendingPhoneData] = useState(null);
  const [originalPhone, setOriginalPhone] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      const phoneData = response.data.phone ? response.data.phone.split(' ') : ['', ''];
      const currentPhone = response.data.phone || '';
      setOriginalPhone(currentPhone);
      setFormData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        countryCode: phoneData[0] || '+1',
        phone: phoneData[1] || '',
        department: response.data.department,
        designation: response.data.designation,
        address: response.data.address,
        city: response.data.city,
        state: response.data.state,
        zipCode: response.data.zipCode
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const newPhone = formData.countryCode + ' ' + formData.phone;
    const phoneChanged = newPhone !== originalPhone;
    const phoneAdded = newPhone.trim() !== '' && originalPhone.trim() === '';

    // If phone is added or changed, require OTP verification
    if (phoneAdded || phoneChanged) {
      if (!formData.phone.trim()) {
        setError('Please enter a phone number');
        return;
      }
      
      // Store pending data and show OTP verification
      setPendingPhoneData({
        ...formData,
        phone: newPhone
      });
      setShowOTPVerification(true);
      return;
    }

    // If phone didn't change, proceed with normal update
    await updateProfile({
      ...formData,
      phone: newPhone
    });
  };

  const updateProfile = async (updateData) => {
    setSaving(true);
    try {
      const response = await userService.updateProfile(updateData);
      updateUser(response.data.user);
      setOriginalPhone(updateData.phone);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleOTPVerificationSuccess = async () => {
    // OTP verification successful, now update profile
    setShowOTPVerification(false);
    await updateProfile(pendingPhoneData);
    setPendingPhoneData(null);
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (showOTPVerification && pendingPhoneData) {
    return (
      <div className="profile-otp-wrapper">
        <OTPVerification 
          phoneNumber={pendingPhoneData.phone.split(' ')[1]} 
          isProfileUpdate={true}
          onSuccess={handleOTPVerificationSuccess}
          onCancel={() => {
            setShowOTPVerification(false);
            setPendingPhoneData(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Edit Profile</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="phone">Phone</label>
              <div className="phone-input-group">
                <div className="country-code-wrapper">
                  <select
                    id="countryCode"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="country-code-select"
                    title={countryCodes.find(c => c.code === formData.countryCode)?.name || 'Select Country'}
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} {country.code}
                      </option>
                    ))}
                  </select>
                  <span className="country-code-display">
                    {countryCodes.find(c => c.code === formData.countryCode)?.flag}
                  </span>
                  <span className="country-code-text">
                    {countryCodes.find(c => c.code === formData.countryCode)?.code}
                  </span>
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="phone-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email (Read-only)</label>
              <input
                type="email"
                id="email"
                value={user?.email}
                disabled
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Engineering"
              />
            </div>
            <div className="form-group">
              <label htmlFor="designation">Designation</label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g., Senior Developer"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
              />
            </div>
            <div className="form-group">
              <label htmlFor="zipCode">Zip Code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="12345"
              />
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
