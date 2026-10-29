const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get dashboard metrics tailored to role
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const role = req.user.role;

    if (role === 'hr') {
      const [
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        pendingLeaves,
        todayAttendance,
        trainings,
        deptDistribution,
        recentLeaves,
        recentAnnouncements,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: 'Active' }),
        User.countDocuments({ status: 'On Leave' }),
        Leave.countDocuments({ status: 'Pending' }),
        Attendance.find({ date: today }),
        Training.countDocuments(),
        User.aggregate([
          { $group: { _id: '$department', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Leave.find().populate('user', 'name department avatar').sort({ createdAt: -1 }).limit(5),
        Announcement.find().populate('author', 'name position').sort({ createdAt: -1 }).limit(4),
      ]);

      const presentCount = todayAttendance.filter((a) => a.status === 'Present').length;
      const lateCount = todayAttendance.filter((a) => a.status === 'Late').length;
      const totalLoggedToday = todayAttendance.length;
      const attendanceRate = totalEmployees > 0 ? Math.round((totalLoggedToday / totalEmployees) * 100) : 0;

      return res.json({
        success: true,
        role: 'hr',
        stats: {
          totalEmployees,
          activeEmployees,
          onLeaveEmployees,
          pendingLeaves,
          todayPresent: presentCount + lateCount,
          todayLate: lateCount,
          attendanceRate,
          totalTrainings: trainings,
          deptDistribution,
          recentLeaves,
          recentAnnouncements,
        },
      });
    }

    if (role === 'manager') {
      const managerDept = req.user.department;
      const teamMembers = await User.find({
        $or: [{ department: managerDept }, { managerId: req.user._id }],
      }).select('_id');

      const teamMemberIds = teamMembers.map((m) => m._id);

      const [teamTodayAttendance, pendingTeamLeaves, recentTeamLeaves, announcements] =
        await Promise.all([
          Attendance.find({ user: { $in: teamMemberIds }, date: today }),
          Leave.countDocuments({ user: { $in: teamMemberIds }, status: 'Pending' }),
          Leave.find({ user: { $in: teamMemberIds } })
            .populate('user', 'name avatar department')
            .sort({ createdAt: -1 })
            .limit(5),
          Announcement.find({
            $or: [{ targetDepartment: 'All' }, { targetDepartment: managerDept }],
          })
            .populate('author', 'name position')
            .sort({ createdAt: -1 })
            .limit(4),
        ]);

      return res.json({
        success: true,
        role: 'manager',
        stats: {
          teamSize: teamMembers.length,
          department: managerDept,
          teamPresentToday: teamTodayAttendance.length,
          pendingTeamLeaves,
          recentTeamLeaves,
          recentAnnouncements: announcements,
        },
      });
    }

    // Role: Employee
    const [todayAttendance, myLeaves, myTrainings, announcements, userDetails] =
      await Promise.all([
        Attendance.findOne({ user: req.user._id, date: today }),
        Leave.find({ user: req.user._id }).sort({ appliedAt: -1 }).limit(5),
        Training.find({ 'assignments.user': req.user._id }),
        Announcement.find({
          $or: [{ targetDepartment: 'All' }, { targetDepartment: req.user.department }],
        })
          .populate('author', 'name position')
          .sort({ createdAt: -1 })
          .limit(4),
        User.findById(req.user._id).select('leaveBalances'),
      ]);

    const completedTrainings = myTrainings.filter((t) => {
      const a = t.assignments.find((x) => x.user.toString() === req.user._id.toString());
      return a && a.status === 'Completed';
    }).length;

    return res.json({
      success: true,
      role: 'employee',
      stats: {
        todayAttendance: todayAttendance || null,
        isClockedIn: !!todayAttendance,
        isClockedOut: !!(todayAttendance && todayAttendance.clockOut),
        leaveBalances: userDetails.leaveBalances,
        myRecentLeaves: myLeaves,
        trainingsCount: myTrainings.length,
        completedTrainings,
        recentAnnouncements: announcements,
      },
    });
  } catch (error) {
    next(error);
  }
};

