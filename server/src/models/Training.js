const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a training title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a training description'],
    },
    category: {
      type: String,
      enum: ['Technical', 'Leadership', 'Compliance', 'Soft Skills', 'Security'],
      default: 'Technical',
    },
    department: {
      type: String,
      default: 'All',
    },
    instructor: {
      type: String,
      default: 'Internal HR / Training Lead',
    },
    durationHours: {
      type: Number,
      default: 4,
    },
    deadline: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['Not Started', 'In Progress', 'Completed'],
          default: 'Not Started',
        },
        progressPercent: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        completedAt: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Training', trainingSchema);

