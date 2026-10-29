const Attendance = require('../models/Attendance');
const User = require('../models/User');

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Clock In for today
// @route   POST /api/attendance/clock-in
// @access  Private
exports.clockIn = async (req, res, next) => {
  try {
    const today = getTodayDateString();

    const existingRecord = await Attendance.findOne({
      user: req.user._id,
      date: today,
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked in for today.',
        attendance: existingRecord,
      });
    }

    const now = new Date();
    // Consider 9:30 AM as on-time threshold
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hour > 9 || (hour === 9 && minutes > 30);

    const attendance = await Attendance.create({
      user: req.user._id,
      date: today,
      clockIn: now,
      status: isLate ? 'Late' : 'Present',
      notes: req.body.notes || (isLate ? 'Late arrival' : 'On-time arrival'),
    });

    res.status(201).json({
      success: true,
      message: `Clock-in recorded at ${now.toLocaleTimeString()}`,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clock Out for today
// @route   POST /api/attendance/clock-out
// @access  Private
exports.clockOut = async (req, res, next) => {
  try {
    const today = getTodayDateString();

    const record = await Attendance.findOne({
      user: req.user._id,
      date: today,
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'You have not clocked in yet today.',
      });
    }

    if (record.clockOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked out for today.',
        attendance: record,
      });
    }

    const clockOutTime = new Date();
    const durationMs = clockOutTime - new Date(record.clockIn);
    const hours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;

    record.clockOut = clockOutTime;
    record.workDuration = hours;

    if (hours < 4.5 && record.status !== 'Late') {
      record.status = 'Half-day';
    }

    await record.save();

    res.json({
      success: true,
      message: `Clock-out recorded at ${clockOutTime.toLocaleTimeString()}. Worked ${hours} hrs today.`,
      attendance: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's today status
// @route   GET /api/attendance/today
// @access  Private
exports.getMyTodayStatus = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const record = await Attendance.findOne({
      user: req.user._id,
      date: today,
    });

    res.json({
      success: true,
      today,
      record: record || null,
      isClockedIn: !!record,
      isClockedOut: !!(record && record.clockOut),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's attendance history
// @route   GET /api/attendance/my
// @access  Private
exports.getMyAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(60);

    // Summary calculations
    const totalPresent = records.filter((r) => r.status === 'Present').length;
    const totalLate = records.filter((r) => r.status === 'Late').length;
    const totalHalfDay = records.filter((r) => r.status === 'Half-day').length;
    const totalHours = records.reduce((acc, r) => acc + (r.workDuration || 0), 0);

    res.json({
      success: true,
      summary: {
        totalDays: records.length,
        totalPresent,
        totalLate,
        totalHalfDay,
        averageHours: records.length ? (totalHours / records.length).toFixed(1) : '0.0',
      },
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team or organizational attendance logs
// @route   GET /api/attendance/all
// @access  Private (HR / Manager)
exports.getAllAttendance = async (req, res, next) => {
  try {
    const { date, department, status } = req.query;
    let userQuery = {};

    if (req.user.role === 'manager') {
      userQuery.department = req.user.department;
    } else if (department && department !== 'All') {
      userQuery.department = department;
    }

    const matchedUsers = await User.find(userQuery).select('_id');
    const userIds = matchedUsers.map((u) => u._id);

    let attendanceQuery = { user: { $in: userIds } };

    if (date) {
      attendanceQuery.date = date;
    }

    if (status && status !== 'All') {
      attendanceQuery.status = status;
    }

    const records = await Attendance.find(attendanceQuery)
      .populate('user', 'name email department position avatar')
      .sort({ date: -1, clockIn: -1 })
      .limit(200);

    res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

