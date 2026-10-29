const Leave = require('../models/Leave');
const User = require('../models/User');

// @desc    Apply for a leave
// @route   POST /api/leaves/apply
// @access  Private
exports.applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all required leave fields' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date' });
    }

    // Calculate days between start and end inclusive
    const timeDiff = end.getTime() - start.getTime();
    const daysCount = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Check employee balance
    const user = await User.findById(req.user._id);
    const balanceKey = leaveType.toLowerCase();

    if (user.leaveBalances && user.leaveBalances[balanceKey] !== undefined) {
      if (user.leaveBalances[balanceKey] < daysCount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} leave balance. Available: ${user.leaveBalances[balanceKey]} days, Requested: ${daysCount} days.`,
        });
      }
    }

    const leave = await Leave.create({
      user: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's leaves
// @route   GET /api/leaves/my
// @access  Private
exports.getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ user: req.user._id })
      .populate('reviewedBy', 'name email position')
      .sort({ appliedAt: -1 });

    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      leaveBalances: user.leaveBalances,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team or all leaves (HR / Manager)
// @route   GET /api/leaves
// @access  Private (HR / Manager)
exports.getAllLeaves = async (req, res, next) => {
  try {
    const { status, department } = req.query;

    let userQuery = {};
    if (req.user.role === 'manager') {
      userQuery.$or = [{ department: req.user.department }, { managerId: req.user._id }];
    } else if (department && department !== 'All') {
      userQuery.department = department;
    }

    const matchedUsers = await User.find(userQuery).select('_id');
    const userIds = matchedUsers.map((u) => u._id);

    let query = { user: { $in: userIds } };
    if (status && status !== 'All') {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('user', 'name email department position avatar leaveBalances')
      .populate('reviewedBy', 'name email position')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a leave request
// @route   PUT /api/leaves/:id/status
// @access  Private (HR / Manager)
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, reviewNote } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const leave = await Leave.findById(req.params.id).populate('user');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Permission check: Manager can only approve their own department or direct reports
    if (
      req.user.role === 'manager' &&
      leave.user.department !== req.user.department &&
      (!leave.user.managerId || leave.user.managerId.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only review leave requests for your department or team members',
      });
    }

    // Deduct leave balance if newly Approved
    if (status === 'Approved' && leave.status !== 'Approved') {
      const user = await User.findById(leave.user._id);
      const balanceKey = leave.leaveType.toLowerCase();
      if (user.leaveBalances && user.leaveBalances[balanceKey] !== undefined) {
        user.leaveBalances[balanceKey] = Math.max(0, user.leaveBalances[balanceKey] - leave.daysCount);
        await user.save();
      }
    }

    // Restore leave balance if previously Approved was flipped to Rejected
    if (status === 'Rejected' && leave.status === 'Approved') {
      const user = await User.findById(leave.user._id);
      const balanceKey = leave.leaveType.toLowerCase();
      if (user.leaveBalances && user.leaveBalances[balanceKey] !== undefined) {
        user.leaveBalances[balanceKey] = user.leaveBalances[balanceKey] + leave.daysCount;
        await user.save();
      }
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewNote = reviewNote || (status === 'Approved' ? 'Approved by supervisor' : 'Rejected');
    await leave.save();

    res.json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}`,
      leave,
    });
  } catch (error) {
    next(error);
  }
};

