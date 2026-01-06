const Attendance = require('../models/Attendance');
const moment = require('moment');

exports.checkIn = async (req, res) => {
  try {
    const userId = req.userId;
    const today = moment().startOf('day');

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      userId,
      date: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() }
    });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    if (!attendance) {
      attendance = new Attendance({
        userId,
        date: new Date(),
        checkIn: new Date()
      });
    } else {
      attendance.checkIn = new Date();
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

    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOut = new Date();
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
        checkedIn: false
      });
    }

    res.json({
      attendance,
      checkedIn: !!attendance.checkIn,
      checkedOut: !!attendance.checkOut
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
