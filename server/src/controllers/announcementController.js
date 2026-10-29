const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAllAnnouncements = async (req, res, next) => {
  try {
    const { category, priority } = req.query;
    let query = {};

    // Filter by category or priority if specified
    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;

    // Filter department relevance
    if (req.user.role !== 'hr') {
      query.$or = [{ targetDepartment: 'All' }, { targetDepartment: req.user.department }];
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'name email position role avatar')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (HR only)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority, category, targetDepartment, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || 'Medium',
      category: category || 'General',
      targetDepartment: targetDepartment || 'All',
      isPinned: isPinned || false,
      author: req.user._id,
    });

    const populated = await Announcement.findById(announcement._id).populate('author', 'name email position avatar');

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (HR only)
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const { title, content, priority, category, targetDepartment, isPinned } = req.body;
    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (priority) announcement.priority = priority;
    if (category) announcement.category = category;
    if (targetDepartment) announcement.targetDepartment = targetDepartment;
    if (isPinned !== undefined) announcement.isPinned = isPinned;

    await announcement.save();

    const populated = await Announcement.findById(announcement._id).populate('author', 'name email position avatar');

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (HR only)
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

