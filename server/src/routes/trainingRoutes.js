const express = require('express');
const router = express.Router();
const {
  getAllTrainings,
  getMyTrainings,
  createTraining,
  updateProgress,
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('hr', 'manager'), getAllTrainings);
router.get('/my', protect, getMyTrainings);
router.post('/', protect, authorize('hr', 'manager'), createTraining);
router.put('/:id/progress', protect, updateProgress);

module.exports = router;

