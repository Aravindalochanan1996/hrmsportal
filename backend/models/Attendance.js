const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0 // in hours
  }
}, { _id: true });

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  shifts: [shiftSchema],
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave', 'Half-Day'],
    default: 'Absent'
  },
  workingHours: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total working hours from all shifts
attendanceSchema.pre('save', function(next) {
  let totalHours = 0;
  
  this.shifts.forEach(shift => {
    if (shift.checkIn && shift.checkOut) {
      const diff = shift.checkOut - shift.checkIn;
      const hours = diff / (1000 * 60 * 60); // Convert to hours
      shift.duration = hours;
      totalHours += hours;
    }
  });
  
  this.workingHours = parseFloat(totalHours.toFixed(2));
  
  // Determine status based on total working hours
  if (this.shifts.length > 0) {
    this.status = this.workingHours >= 8 ? 'Present' : 'Half-Day';
  } else {
    this.status = 'Absent';
  }
  
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
