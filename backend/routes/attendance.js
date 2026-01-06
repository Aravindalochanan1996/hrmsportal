const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { checkIn, checkOut, getTodayStatus, getAttendanceHistory } = require('../controllers/attendanceController');

router.post('/check-in', auth, checkIn);
router.post('/check-out', auth, checkOut);
router.get('/today', auth, getTodayStatus);
router.get('/history', auth, getAttendanceHistory);

// Manager and Admin can view all attendance
router.get('/all', auth, authorize('admin', 'manager'), getAttendanceHistory);

module.exports = router;
