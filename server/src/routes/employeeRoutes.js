const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getManagers,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/supervisors', protect, getManagers);
router.get('/', protect, authorize('hr', 'manager'), getAllEmployees);
router.get('/:id', protect, getEmployeeById);
router.post('/', protect, authorize('hr'), createEmployee);
router.put('/:id', protect, authorize('hr'), updateEmployee);
router.delete('/:id', protect, authorize('hr'), deleteEmployee);

module.exports = router;

