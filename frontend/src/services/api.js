import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// User Services
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllUsers: () => api.get('/users/all')
};

// Attendance Services
export const attendanceService = {
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
  getTodayStatus: () => api.get('/attendance/today'),
  getHistory: (month, year) => api.get(`/attendance/history?month=${month}&year=${year}`)
};

// OTP Services
export const otpService = {
  requestOTP: (phoneNumber) => api.post('/otp/request', { phoneNumber }),
  verifyOTP: (phoneNumber, otp) => api.post('/otp/verify', { phoneNumber, otp }),
  verifyOTPAndUpdate: (phoneNumber, otp) => api.post('/otp/verify-and-update', { phoneNumber, otp })
};

export default api;
