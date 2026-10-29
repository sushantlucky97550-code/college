const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getMyTodayStatus,
  getMyAttendance,
  getAllAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/today', protect, getMyTodayStatus);
router.get('/my', protect, getMyAttendance);
router.get('/all', protect, authorize('hr', 'manager'), getAllAttendance);

module.exports = router;

