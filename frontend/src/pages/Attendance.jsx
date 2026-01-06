import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/api';
import './Attendance.css';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getHistory(month, year);
      setAttendanceRecords(response.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    return status ? status.toLowerCase().replace('-', '-') : 'absent';
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <h1>Attendance History</h1>
        <div className="filter-group">
          <select value={month} onChange={handleMonthChange} className="filter-select">
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select value={year} onChange={handleYearChange} className="filter-select">
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading attendance records...</div>
      ) : attendanceRecords.length === 0 ? (
        <div className="no-records">
          <p>No attendance records found for the selected month.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Shifts</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record._id}>
                  <td>{formatDate(record.date)}</td>
                  <td>
                    <div className="shifts-column">
                      {record.shifts && record.shifts.length > 0 ? (
                        record.shifts.map((shift, index) => (
                          <div key={index} className="shift-item">
                            <span className="shift-number">Shift {index + 1}:</span>
                            <span className="shift-time">
                              {formatTime(shift.checkIn)} - {shift.checkOut ? formatTime(shift.checkOut) : 'Active'}
                            </span>
                            <span className="shift-duration">
                              {shift.duration ? `(${shift.duration.toFixed(2)}h)` : '(ongoing)'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span>N/A</span>
                      )}
                    </div>
                  </td>
                  <td>{record.workingHours ? record.workingHours.toFixed(2) : '0.00'} hrs</td>
                  <td>
                    <span className={`status ${getStatusClass(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="stats-summary">
        <h2>Summary</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-value">{attendanceRecords.filter(r => r.status === 'Present').length}</div>
            <div className="summary-label">Present Days</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{attendanceRecords.filter(r => r.status === 'Absent').length}</div>
            <div className="summary-label">Absent Days</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{attendanceRecords.filter(r => r.status === 'Half-Day').length}</div>
            <div className="summary-label">Half Days</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">
              {(attendanceRecords.reduce((sum, r) => sum + (r.workingHours || 0), 0)).toFixed(1)}
            </div>
            <div className="summary-label">Total Hours</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
