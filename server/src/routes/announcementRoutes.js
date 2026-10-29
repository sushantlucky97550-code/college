const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllAnnouncements);
router.post('/', protect, authorize('hr'), createAnnouncement);
router.put('/:id', protect, authorize('hr'), updateAnnouncement);
router.delete('/:id', protect, authorize('hr'), deleteAnnouncement);

module.exports = router;

