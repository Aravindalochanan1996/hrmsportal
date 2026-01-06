import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceService, userService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTodayStatus();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await attendanceService.getTodayStatus();
      setTodayStatus(response.data);
      setCheckedIn(response.data.checkedIn);
      setCheckedOut(response.data.checkedOut);
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    try {
      await attendanceService.checkIn();
      setCheckedIn(true);
      fetchTodayStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');
    try {
      await attendanceService.checkOut();
      setCheckedOut(true);
      fetchTodayStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.firstName}! 👋</h1>
          <p>Current Time: {formatTime(currentTime)}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="attendance-card">
        <h2>Today's Attendance</h2>
        <div className="attendance-grid">
          <div className="time-display">
            <div className="time-label">Check-In Time</div>
            <div className="time-value">
              {todayStatus?.attendance?.checkIn ? (
                new Date(todayStatus.attendance.checkIn).toLocaleTimeString()
              ) : (
                <span className="not-checked">Not Checked In</span>
              )}
            </div>
          </div>

          <div className="time-display">
            <div className="time-label">Check-Out Time</div>
            <div className="time-value">
              {todayStatus?.attendance?.checkOut ? (
                new Date(todayStatus.attendance.checkOut).toLocaleTimeString()
              ) : (
                <span className="not-checked">Not Checked Out</span>
              )}
            </div>
          </div>

          {todayStatus?.attendance?.workingHours > 0 && (
            <div className="time-display">
              <div className="time-label">Working Hours</div>
              <div className="time-value">{todayStatus.attendance.workingHours.toFixed(2)} hrs</div>
            </div>
          )}

          {todayStatus?.attendance?.status && (
            <div className="time-display">
              <div className="time-label">Status</div>
              <div className={`status-badge ${todayStatus.attendance.status.toLowerCase()}`}>
                {todayStatus.attendance.status}
              </div>
            </div>
          )}
        </div>

        <div className="button-group">
          <button
            onClick={handleCheckIn}
            disabled={checkedIn || loading}
            className={`btn btn-primary ${checkedIn ? 'disabled' : ''}`}
          >
            {loading ? 'Processing...' : checkedIn ? '✓ Checked In' : 'Check In'}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!checkedIn || checkedOut || loading}
            className={`btn btn-danger ${(!checkedIn || checkedOut) ? 'disabled' : ''}`}
          >
            {loading ? 'Processing...' : checkedOut ? '✓ Checked Out' : 'Check Out'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Department</div>
            <div className="stat-value">{user?.department || 'N/A'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <div className="stat-label">Designation</div>
            <div className="stat-value">{user?.designation || 'N/A'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📧</div>
          <div className="stat-content">
            <div className="stat-label">Email</div>
            <div className="stat-value" style={{ fontSize: '0.85rem' }}>{user?.email}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-label">Joining Date</div>
            <div className="stat-value">{new Date(user?.joiningDate).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
