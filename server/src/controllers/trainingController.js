const Training = require('../models/Training');
const User = require('../models/User');

// @desc    Get all trainings (HR / Manager view)
// @route   GET /api/trainings
// @access  Private (HR / Manager)
exports.getAllTrainings = async (req, res, next) => {
  try {
    const { department, category } = req.query;
    let query = {};

    if (req.user.role === 'manager') {
      query.$or = [{ department: 'All' }, { department: req.user.department }];
    } else if (department && department !== 'All') {
      query.department = department;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const trainings = await Training.find(query)
      .populate('createdBy', 'name email position')
      .populate('assignments.user', 'name email department avatar position')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: trainings.length,
      trainings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trainings assigned to logged in user
// @route   GET /api/trainings/my
// @access  Private
exports.getMyTrainings = async (req, res, next) => {
  try {
    const trainings = await Training.find({
      'assignments.user': req.user._id,
    }).populate('createdBy', 'name email position');

    // Extract user-specific progress for convenient display
    const mapped = trainings.map((t) => {
      const myAssignment = t.assignments.find(
        (a) => a.user.toString() === req.user._id.toString()
      );
      return {
        _id: t._id,
        title: t.title,
        description: t.description,
        category: t.category,
        instructor: t.instructor,
        durationHours: t.durationHours,
        deadline: t.deadline,
        createdBy: t.createdBy,
        myStatus: myAssignment ? myAssignment.status : 'Not Started',
        myProgress: myAssignment ? myAssignment.progressPercent : 0,
        completedAt: myAssignment ? myAssignment.completedAt : null,
      };
    });

    res.json({
      success: true,
      count: mapped.length,
      trainings: mapped,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new training program
// @route   POST /api/trainings
// @access  Private (HR / Manager)
exports.createTraining = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      department,
      instructor,
      durationHours,
      deadline,
      assignedUserIds,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    let initialAssignments = [];

    // If specific users provided
    if (assignedUserIds && assignedUserIds.length > 0) {
      initialAssignments = assignedUserIds.map((userId) => ({
        user: userId,
        status: 'Not Started',
        progressPercent: 0,
      }));
    } else if (department && department !== 'All') {
      // Auto-assign all members of this department
      const deptMembers = await User.find({ department, status: 'Active' }).select('_id');
      initialAssignments = deptMembers.map((m) => ({
        user: m._id,
        status: 'Not Started',
        progressPercent: 0,
      }));
    } else {
      // Auto-assign all active employees
      const allMembers = await User.find({ status: 'Active' }).select('_id');
      initialAssignments = allMembers.map((m) => ({
        user: m._id,
        status: 'Not Started',
        progressPercent: 0,
      }));
    }

    const training = await Training.create({
      title,
      description,
      category: category || 'Technical',
      department: department || 'All',
      instructor: instructor || 'StaffSync Academy',
      durationHours: Number(durationHours) || 4,
      deadline: deadline || new Date(Date.now() + 30 * 24 * 3600 * 1000),
      createdBy: req.user._id,
      assignments: initialAssignments,
    });

    const populated = await Training.findById(training._id)
      .populate('createdBy', 'name email position')
      .populate('assignments.user', 'name email department avatar');

    res.status(201).json({
      success: true,
      message: 'Training program published and assigned successfully',
      training: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee progress in a training
// @route   PUT /api/trainings/:id/progress
// @access  Private
exports.updateProgress = async (req, res, next) => {
  try {
    const { progressPercent } = req.body;
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    let assignment = training.assignments.find(
      (a) => a.user.toString() === req.user._id.toString()
    );

    if (!assignment) {
      // Auto-enroll user if viewing and starting
      training.assignments.push({
        user: req.user._id,
        status: 'In Progress',
        progressPercent: Math.min(100, Math.max(0, Number(progressPercent) || 0)),
      });
      assignment = training.assignments[training.assignments.length - 1];
    } else {
      const p = Math.min(100, Math.max(0, Number(progressPercent) || 0));
      assignment.progressPercent = p;
      if (p === 100) {
        assignment.status = 'Completed';
        assignment.completedAt = new Date();
      } else if (p > 0) {
        assignment.status = 'In Progress';
      } else {
        assignment.status = 'Not Started';
      }
    }

    await training.save();

    res.json({
      success: true,
      message: 'Progress updated',
      assignment,
    });
  } catch (error) {
    next(error);
  }
};

