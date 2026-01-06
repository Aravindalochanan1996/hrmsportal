const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkIn, checkOut, getTodayStatus, getAttendanceHistory } = require('../controllers/attendanceController');

router.post('/check-in', auth, checkIn);
router.post('/check-out', auth, checkOut);
router.get('/today', auth, getTodayStatus);
router.get('/history', auth, getAttendanceHistory);

module.exports = router;
