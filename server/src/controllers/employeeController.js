const User = require('../models/User');

// @desc    Get all employees with filters
// @route   GET /api/employees
// @access  Private (HR / Manager)
exports.getAllEmployees = async (req, res, next) => {
  try {
    const { department, status, search, role } = req.query;
    let query = {};

    // If Manager, default to viewing their department employees or direct reports unless HR
    if (req.user.role === 'manager') {
      query.$or = [{ department: req.user.department }, { managerId: req.user._id }];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { position: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const employees = await User.find(query)
      .populate('managerId', 'name email position')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee details
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id).populate('managerId', 'name email position department');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Role check: HR can see anyone; Manager can see their department; Employee can see themselves
    if (
      req.user.role === 'employee' &&
      req.user._id.toString() !== employee._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this record' });
    }

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (HR only)
exports.createEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      position,
      phone,
      address,
      salary,
      managerId,
      emergencyContact,
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An employee with this email already exists' });
    }

    const employee = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'password123',
      role: role || 'employee',
      department: department || 'Engineering',
      position: position || 'Staff Member',
      phone: phone || '+1 (555) 000-0000',
      address: address || '123 Tech Boulevard',
      salary: salary || 70000,
      managerId: managerId || null,
      emergencyContact: emergencyContact || { name: 'Parent/Guardian', relationship: 'Family', phone: '+1 555-1234' },
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    res.status(201).json({
      success: true,
      message: 'Employee onboarded successfully',
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (HR only)
exports.updateEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      role,
      department,
      position,
      phone,
      address,
      salary,
      status,
      managerId,
      leaveBalances,
    } = req.body;

    let employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (name) employee.name = name;
    if (email) employee.email = email.toLowerCase();
    if (role) employee.role = role;
    if (department) employee.department = department;
    if (position) employee.position = position;
    if (phone) employee.phone = phone;
    if (address) employee.address = address;
    if (salary !== undefined) employee.salary = Number(salary);
    if (status) employee.status = status;
    if (managerId !== undefined) employee.managerId = managerId || null;
    if (leaveBalances) {
      employee.leaveBalances = {
        annual: leaveBalances.annual ?? employee.leaveBalances.annual,
        sick: leaveBalances.sick ?? employee.leaveBalances.sick,
        casual: leaveBalances.casual ?? employee.leaveBalances.casual,
      };
    }

    await employee.save();

    res.json({
      success: true,
      message: 'Employee record updated successfully',
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (HR only)
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Protect self-deletion
    if (employee._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Employee removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of managers/supervisors
// @route   GET /api/employees/supervisors
// @access  Private
exports.getManagers = async (req, res, next) => {
  try {
    const managers = await User.find({ role: { $in: ['manager', 'hr'] } })
      .select('name email department position role')
      .sort({ name: 1 });

    res.json({
      success: true,
      managers,
    });
  } catch (error) {
    next(error);
  }
};

