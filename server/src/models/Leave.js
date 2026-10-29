const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['Annual', 'Sick', 'Casual', 'Unpaid'],
      required: [true, 'Please specify the type of leave'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please select a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please select an end date'],
    },
    daysCount: {
      type: Number,
      required: true,
      min: 0.5,
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the leave request'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNote: {
      type: String,
      default: '',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leave', leaveSchema);

