const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.post('/apply', protect, applyLeave);
router.get('/my', protect, getMyLeaves);
router.get('/', protect, authorize('hr', 'manager'), getAllLeaves);
router.put('/:id/status', protect, authorize('hr', 'manager'), updateLeaveStatus);

module.exports = router;

