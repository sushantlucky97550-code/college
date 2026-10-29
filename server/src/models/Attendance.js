const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD for fast query and single entry per user per day
      required: true,
      index: true,
    },
    clockIn: {
      type: Date,
      required: true,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    workDuration: {
      type: Number, // In hours (e.g., 8.5)
      default: 0,
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half-day', 'Absent'],
      default: 'Present',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index to guarantee 1 attendance record per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

