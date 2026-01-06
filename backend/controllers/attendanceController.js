const Attendance = require('../models/Attendance');
const moment = require('moment');

exports.checkIn = async (req, res) => {
  try {
    const userId = req.userId;
    const today = moment().startOf('day');

    // Find today's attendance record
    let attendance = await Attendance.findOne({
      userId,
      date: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() }
    });

    if (!attendance) {
      // Create new attendance record with first shift
      attendance = new Attendance({
        userId,
        date: new Date(),
        shifts: [{ checkIn: new Date() }]
      });
    } else {
      // Check if the last shift has a checkout (to determine if we need a new shift or update existing)
      const lastShift = attendance.shifts[attendance.shifts.length - 1];
      
      if (!lastShift.checkOut) {
        // Last shift doesn't have checkout, cannot check in again
        return res.status(400).json({ message: 'Please check out from the current shift before checking in again' });
      } else {
        // Last shift is complete, add a new shift
        attendance.shifts.push({ checkIn: new Date() });
      }
    }

    await attendance.save();

    res.json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const userId = req.userId;
    const today = moment().startOf('day');

    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() }
    });

    if (!attendance || attendance.shifts.length === 0) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }

    const lastShift = attendance.shifts[attendance.shifts.length - 1];
    
    if (!lastShift.checkIn) {
      return res.status(400).json({ message: 'No active check-in found' });
    }

    if (lastShift.checkOut) {
      return res.status(400).json({ message: 'Already checked out from the current shift. Please check in for a new shift' });
    }

    lastShift.checkOut = new Date();
    await attendance.save();

    res.json({ message: 'Checked out successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const today = moment().startOf('day');

    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() }
    });

    if (!attendance) {
      return res.json({ 
        message: 'No attendance record for today',
        attendance: null,
        checkedIn: false,
        shifts: []
      });
    }

    const lastShift = attendance.shifts.length > 0 ? attendance.shifts[attendance.shifts.length - 1] : null;
    const checkedIn = lastShift && lastShift.checkIn && !lastShift.checkOut;

    res.json({
      attendance,
      checkedIn,
      shifts: attendance.shifts,
      totalHours: attendance.workingHours
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { month, year } = req.query;

    const query = { userId };

    if (month && year) {
      const startDate = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
      const endDate = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').toDate();
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
