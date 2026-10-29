const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide an employee name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['hr', 'manager', 'employee'],
      default: 'employee',
    },
    department: {
      type: String,
      enum: ['Engineering', 'Human Resources', 'Marketing', 'Sales', 'Design', 'Finance', 'Operations'],
      default: 'Engineering',
    },
    position: {
      type: String,
      default: 'Staff Member',
    },
    phone: {
      type: String,
      default: '+1 (555) 019-2834',
    },
    address: {
      type: String,
      default: '123 Innovation Way, Tech City, CA',
    },
    emergencyContact: {
      name: { type: String, default: 'Not specified' },
      relationship: { type: String, default: 'Family' },
      phone: { type: String, default: '+1 (555) 000-0000' },
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 75000,
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Terminated'],
      default: 'Active',
    },
    avatar: {
      type: String,
      default: '',
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    leaveBalances: {
      annual: { type: Number, default: 15 },
      sick: { type: Number, default: 10 },
      casual: { type: Number, default: 8 },
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
