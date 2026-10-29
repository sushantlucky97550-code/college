const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync';
    await mongoose.connect(mongoUri);
    console.log('[StaffSync Seed] Connected to MongoDB');

    // Clear existing collections
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Announcement.deleteMany({});
    await Training.deleteMany({});
    console.log('[StaffSync Seed] Existing data cleared');

    // 1. Create Managers & HR First
    const hrUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'hr@staffsync.com',
      password: 'password123',
      role: 'hr',
      department: 'Human Resources',
      position: 'VP of Human Resources',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Springfield, CA',
      emergencyContact: {
        name: 'Robert Jenkins',
        relationship: 'Spouse',
        phone: '+1 (555) 234-9999',
      },
      salary: 125000,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      leaveBalances: { annual: 18, sick: 12, casual: 10 },
    });

    const engManager = await User.create({
      name: 'Marcus Vance',
      email: 'manager@staffsync.com',
      password: 'password123',
      role: 'manager',
      department: 'Engineering',
      position: 'Director of Engineering',
      phone: '+1 (555) 345-6789',
      address: '456 Silicon Ave, San Jose, CA',
      emergencyContact: {
        name: 'Clara Vance',
        relationship: 'Spouse',
        phone: '+1 (555) 345-1111',
      },
      salary: 140000,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      leaveBalances: { annual: 15, sick: 10, casual: 8 },
    });

    const mktManager = await User.create({
      name: 'Elena Rostova',
      email: 'marketing.lead@staffsync.com',
      password: 'password123',
      role: 'manager',
      department: 'Marketing',
      position: 'Head of Brand & Growth',
      phone: '+1 (555) 456-7890',
      address: '88 Design Street, San Francisco, CA',
      emergencyContact: {
        name: 'Mikhail Rostov',
        relationship: 'Brother',
        phone: '+1 (555) 456-2222',
      },
      salary: 110000,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      leaveBalances: { annual: 14, sick: 9, casual: 8 },
    });

    // 2. Create Employees
    const alexEmployee = await User.create({
      name: 'Alex Rivera',
      email: 'employee@staffsync.com',
      password: 'password123',
      role: 'employee',
      department: 'Engineering',
      position: 'Senior Frontend Developer',
      phone: '+1 (555) 567-8901',
      address: '101 Bayview Blvd, Oakland, CA',
      emergencyContact: {
        name: 'Maria Rivera',
        relationship: 'Mother',
        phone: '+1 (555) 567-3333',
      },
      salary: 95000,
      managerId: engManager._id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      leaveBalances: { annual: 12, sick: 8, casual: 6 },
    });

    const david = await User.create({
      name: 'David Kim',
      email: 'david.k@staffsync.com',
      password: 'password123',
      role: 'employee',
      department: 'Engineering',
      position: 'Backend Node.js Engineer',
      phone: '+1 (555) 678-9012',
      address: '220 Mission St, San Francisco, CA',
      emergencyContact: {
        name: 'Soo Kim',
        relationship: 'Sister',
        phone: '+1 (555) 678-4444',
      },
      salary: 92000,
      managerId: engManager._id,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      leaveBalances: { annual: 14, sick: 10, casual: 7 },
    });

    const priya = await User.create({
      name: 'Priya Sharma',
      email: 'priya.s@staffsync.com',
      password: 'password123',
      role: 'employee',
      department: 'Design',
      position: 'Lead Product Designer',
      phone: '+1 (555) 789-0123',
      address: '350 Market St, San Francisco, CA',
      emergencyContact: {
        name: 'Arjun Sharma',
        relationship: 'Father',
        phone: '+1 (555) 789-5555',
      },
      salary: 88000,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      leaveBalances: { annual: 10, sick: 7, casual: 5 },
    });

    const james = await User.create({
      name: 'James Wilson',
      email: 'james.w@staffsync.com',
      password: 'password123',
      role: 'employee',
      department: 'Human Resources',
      position: 'HR Talent Coordinator',
      phone: '+1 (555) 890-1234',
      address: '512 Pinecrest Road, Berkeley, CA',
      emergencyContact: {
        name: 'Emily Wilson',
        relationship: 'Spouse',
        phone: '+1 (555) 890-6666',
      },
      salary: 68000,
      managerId: hrUser._id,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      leaveBalances: { annual: 15, sick: 10, casual: 8 },
    });

    const lisa = await User.create({
      name: 'Lisa Miller',
      email: 'lisa.m@staffsync.com',
      password: 'password123',
      role: 'employee',
      department: 'Marketing',
      position: 'Digital Growth Specialist',
      phone: '+1 (555) 901-2345',
      address: '17 Grand Lake Ave, Oakland, CA',
      emergencyContact: {
        name: 'Daniel Miller',
        relationship: 'Father',
        phone: '+1 (555) 901-7777',
      },
      salary: 76000,
      managerId: mktManager._id,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      leaveBalances: { annual: 11, sick: 9, casual: 6 },
    });

    console.log('[StaffSync Seed] 8 Users seeded successfully');

    // 3. Seed Today & Recent Attendance
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const today9AM = new Date();
    today9AM.setHours(9, 5, 0, 0);

    const today945AM = new Date();
    today945AM.setHours(9, 45, 0, 0);

    const yesterdayIn = new Date(Date.now() - 24 * 60 * 60 * 1000);
    yesterdayIn.setHours(9, 2, 0, 0);
    const yesterdayOut = new Date(Date.now() - 24 * 60 * 60 * 1000);
    yesterdayOut.setHours(17, 35, 0, 0);

    await Attendance.create([
      {
        user: hrUser._id,
        date: todayStr,
        clockIn: today9AM,
        status: 'Present',
        notes: 'Executive check-in',
      },
      {
        user: engManager._id,
        date: todayStr,
        clockIn: today9AM,
        status: 'Present',
        notes: 'Sprint planning day',
      },
      {
        user: alexEmployee._id,
        date: todayStr,
        clockIn: today9AM,
        status: 'Present',
        notes: 'Frontend UI overhaul',
      },
      {
        user: david._id,
        date: todayStr,
        clockIn: today945AM,
        status: 'Late',
        notes: 'Traffic delay on Bay Bridge',
      },
      // Historical records for Alex
      {
        user: alexEmployee._id,
        date: yesterday,
        clockIn: yesterdayIn,
        clockOut: yesterdayOut,
        workDuration: 8.55,
        status: 'Present',
        notes: 'Normal shift',
      },
      {
        user: alexEmployee._id,
        date: twoDaysAgo,
        clockIn: yesterdayIn,
        clockOut: yesterdayOut,
        workDuration: 8.5,
        status: 'Present',
        notes: 'Feature deployment',
      },
    ]);
    console.log('[StaffSync Seed] Attendance seeded');

    // 4. Seed Leave Requests
    await Leave.create([
      {
        user: alexEmployee._id,
        leaveType: 'Annual',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        daysCount: 4,
        reason: 'Family vacation and personal downtime trip.',
        status: 'Pending',
      },
      {
        user: david._id,
        leaveType: 'Sick',
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        daysCount: 2,
        reason: 'Severe seasonal flu and medical consultation.',
        status: 'Approved',
        reviewedBy: engManager._id,
        reviewNote: 'Approved. Get well soon, David.',
      },
      {
        user: priya._id,
        leaveType: 'Casual',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        daysCount: 1,
        reason: 'Attending regional design conference in San Jose.',
        status: 'Approved',
        reviewedBy: hrUser._id,
        reviewNote: 'Approved. Enjoy the conference sessions!',
      },
      {
        user: lisa._id,
        leaveType: 'Casual',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        daysCount: 3,
        reason: 'Personal urgent relocation matters.',
        status: 'Pending',
      },
    ]);
    console.log('[StaffSync Seed] Leaves seeded');

    // 5. Seed Announcements
    await Announcement.create([
      {
        title: 'Q4 Annual Town Hall & Performance Reviews Kickoff',
        content:
          'Join us this Friday at 3:00 PM PST in the All-Hands room or via the livestream link. We will review our company milestones, share the product roadmap for next year, and discuss upcoming performance assessment timelines.',
        priority: 'High',
        category: 'Event',
        targetDepartment: 'All',
        author: hrUser._id,
        isPinned: true,
      },
      {
        title: 'Updated Health Insurance & Wellness Reimbursement Policy',
        content:
          'HR has updated the wellness benefit catalog for all full-time employees. You can now claim up to $50/month for gym memberships, mental health apps, or athletic equipment. Check the employee handbook for claim guidelines.',
        priority: 'Medium',
        category: 'Policy',
        targetDepartment: 'All',
        author: hrUser._id,
        isPinned: false,
      },
      {
        title: 'Scheduled Cloud Infrastructure Maintenance Notice',
        content:
          'Engineering and DevOps will conduct database and server optimization on Sunday from 1:00 AM to 4:00 AM UTC. Internal developer staging environments may experience intermittent disconnections during this window.',
        priority: 'Urgent',
        category: 'Maintenance',
        targetDepartment: 'Engineering',
        author: engManager._id,
        isPinned: false,
      },
      {
        title: 'Holiday Office Closure Schedule: Thanksgiving & Winter Recess',
        content:
          'StaffSync offices will be officially closed on the designated public holidays. Please ensure your project handoffs and client deliverables are submitted before departure.',
        priority: 'Low',
        category: 'Holiday',
        targetDepartment: 'All',
        author: hrUser._id,
        isPinned: false,
      },
    ]);
    console.log('[StaffSync Seed] Announcements seeded');

    // 6. Seed Trainings
    await Training.create([
      {
        title: 'SOC 2 Type II Security & Data Privacy Compliance 2026',
        description:
          'Essential annual training covering secure data handling, multi-factor authentication policies, phishing mitigation, and customer data encryption standards.',
        category: 'Compliance',
        department: 'All',
        instructor: 'CyberDefense Global',
        durationHours: 3,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        createdBy: hrUser._id,
        assignments: [
          { user: alexEmployee._id, status: 'Completed', progressPercent: 100, completedAt: new Date() },
          { user: david._id, status: 'In Progress', progressPercent: 65 },
          { user: priya._id, status: 'Not Started', progressPercent: 0 },
          { user: lisa._id, status: 'In Progress', progressPercent: 40 },
        ],
      },
      {
        title: 'Full-Stack Microservices Architecture & GraphQL Patterns',
        description:
          'Deep dive into asynchronous messaging queues, event-driven microservices, containerization best practices, and performant GraphQL schemas.',
        category: 'Technical',
        department: 'Engineering',
        instructor: 'Marcus Vance, Director of Eng',
        durationHours: 8,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        createdBy: engManager._id,
        assignments: [
          { user: alexEmployee._id, status: 'In Progress', progressPercent: 45 },
          { user: david._id, status: 'Completed', progressPercent: 100, completedAt: new Date() },
        ],
      },
      {
        title: 'High-Impact Empathetic Leadership & Team Mentorship',
        description:
          'Mastering active listening, conflict resolution, career pathing frameworks, and running effective weekly 1-on-1 coaching sessions.',
        category: 'Leadership',
        department: 'All',
        instructor: 'Sarah Jenkins, VP of HR',
        durationHours: 6,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: hrUser._id,
        assignments: [
          { user: engManager._id, status: 'Completed', progressPercent: 100, completedAt: new Date() },
          { user: mktManager._id, status: 'In Progress', progressPercent: 50 },
        ],
      },
    ]);
    console.log('[StaffSync Seed] Training programs seeded');

    console.log('\n=============================================');
    console.log('🎉 StaffSync Database Seeded Successfully!');
    console.log('=============================================');
    console.log('Demo Credentials:');
    console.log('1. HR Admin:   hr@staffsync.com / password123 (Sarah Jenkins)');
    console.log('2. Manager:    manager@staffsync.com / password123 (Marcus Vance)');
    console.log('3. Employee:   employee@staffsync.com / password123 (Alex Rivera)');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[StaffSync Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedData();

